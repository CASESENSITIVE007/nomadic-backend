import mongoose from 'mongoose';
import { Expense, Trip } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all expenses for a trip
// @route   GET /api/expenses
// @access  Private
export const getExpenses = asyncHandler(async (req, res) => {
  const { tripId, category, page = 1, limit = 20 } = req.query;

  const query = {};
  if (tripId) query.trip = tripId;
  if (category) query.category = category;

  const expenses = await Expense.find(query)
    .populate('paidBy', 'name avatar')
    .populate('splitAmong', 'name avatar')
    .populate('splits.user', 'name avatar')
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Expense.countDocuments(query);

  res.json({
    success: true,
    data: expenses,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
export const getExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
    .populate('paidBy', 'name avatar')
    .populate('splitAmong', 'name avatar')
    .populate('splits.user', 'name avatar');

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  res.json({
    success: true,
    data: expense
  });
});

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = asyncHandler(async (req, res) => {
  const {
    tripId,
    title,
    description,
    amount,
    currency,
    category,
    splitAmong,
    splitType,
    date,
    location,
    notes
  } = req.body;

  // Check trip exists and user has access
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  const hasAccess = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to add expenses to this trip'
    });
  }

  // Create expense
  const expense = await Expense.create({
    trip: tripId,
    title,
    description,
    amount,
    currency: currency || 'INR',
    category: category || 'other',
    paidBy: req.user._id,
    splitAmong: splitAmong || trip.collaborators.map(c => c.user),
    splitType: splitType || 'equal',
    date: date || new Date(),
    location,
    notes
  });

  // Update trip budget
  trip.budget.spent += amount;
  
  // Update category spending
  const catIndex = trip.budget.categories.findIndex(c => c.name === category);
  if (catIndex >= 0) {
    trip.budget.categories[catIndex].spent += amount;
  }
  
  trip.expenses.push(expense._id);
  await trip.save();

  await expense.populate('paidBy', 'name avatar');
  await expense.populate('splits.user', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Expense added successfully',
    data: expense
  });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  // Only payer or trip owner can update
  const trip = await Trip.findById(expense.trip);
  const isOwner = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString() && c.role === 'owner'
  );

  if (expense.paidBy.toString() !== req.user._id.toString() && !isOwner) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this expense'
    });
  }

  const oldAmount = expense.amount;
  const newAmount = req.body.amount || oldAmount;

  // Update expense
  Object.assign(expense, req.body);
  await expense.save();

  // Update trip budget if amount changed
  if (oldAmount !== newAmount) {
    trip.budget.spent = trip.budget.spent - oldAmount + newAmount;
    await trip.save();
  }

  res.json({
    success: true,
    message: 'Expense updated successfully',
    data: expense
  });
});

// @desc    Delete expense
// @route   DELETE /api/trips/:tripId/expenses/:id
// @access  Private
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  const trip = await Trip.findById(expense.trip);
  const isOwner = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString() && c.role === 'owner'
  );

  if (expense.paidBy.toString() !== req.user._id.toString() && !isOwner) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this expense'
    });
  }

  // Update trip budget
  trip.budget.spent -= expense.amount;
  trip.expenses.pull(expense._id);
  await trip.save();

  await expense.deleteOne();

  res.json({
    success: true,
    message: 'Expense deleted successfully'
  });
});

// @desc    Get expense summary for a trip
// @route   GET /api/expenses/summary
// @access  Private
export const getExpenseSummary = asyncHandler(async (req, res) => {
  const { tripId } = req.query;

  if (!tripId) {
    return res.status(400).json({
      success: false,
      message: 'Trip ID is required'
    });
  }

  const summary = await Expense.aggregate([
    { $match: { trip: new mongoose.Types.ObjectId(tripId) } },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        byCategory: {
          $push: {
            k: '$category',
            v: '$amount'
          }
        }
      }
    }
  ]);

  const byCategory = await Expense.aggregate([
    { $match: { trip: new mongoose.Types.ObjectId(tripId) } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      total: summary[0]?.total || 0,
      count: summary[0]?.count || 0,
      byCategory
    }
  });
});

// @desc    Get settlements for a trip
// @route   GET /api/expenses/settlements
// @access  Private
export const getSettlements = asyncHandler(async (req, res) => {
  const { tripId } = req.query;

  if (!tripId) {
    return res.status(400).json({
      success: false,
      message: 'Trip ID is required'
    });
  }

  const expenses = await Expense.find({ trip: tripId })
    .populate('paidBy', 'name')
    .populate('splits.user', 'name');

  // Calculate balances
  const balances = {};

  expenses.forEach(expense => {
    const payer = expense.paidBy._id.toString();
    
    if (!balances[payer]) {
      balances[payer] = { name: expense.paidBy.name, amount: 0 };
    }
    balances[payer].amount += expense.amount;

    expense.splits.forEach(split => {
      const user = split.user._id.toString();
      if (!balances[user]) {
        balances[user] = { name: split.user.name, amount: 0 };
      }
      balances[user].amount -= split.amount;
    });
  });

  // Calculate settlements
  const settlements = [];
  const debtors = Object.entries(balances)
    .filter(([, data]) => data.amount < 0)
    .sort((a, b) => a[1].amount - b[1].amount);

  const creditors = Object.entries(balances)
    .filter(([, data]) => data.amount > 0)
    .sort((a, b) => b[1].amount - a[1].amount);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const [debtorId, debtorData] = debtors[i];
    const [creditorId, creditorData] = creditors[j];

    const amount = Math.min(Math.abs(debtorData.amount), creditorData.amount);

    if (amount > 0) {
      settlements.push({
        from: { id: debtorId, name: debtorData.name },
        to: { id: creditorId, name: creditorData.name },
        amount: Math.round(amount * 100) / 100
      });
    }

    debtors[i][1].amount += amount;
    creditors[j][1].amount -= amount;

    if (Math.abs(debtors[i][1].amount) < 0.01) i++;
    if (Math.abs(creditors[j][1].amount) < 0.01) j++;
  }

  res.json({
    success: true,
    data: {
      balances,
      settlements
    }
  });
});

// @desc    Mark split as paid
// @route   PATCH /api/expenses/:id/split/:userId/paid
// @access  Private
export const markSplitAsPaid = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  const split = expense.splits.find(
    s => s.user.toString() === req.params.userId
  );

  if (!split) {
    return res.status(404).json({
      success: false,
      message: 'Split not found'
    });
  }

  split.isPaid = true;
  await expense.save();

  res.json({
    success: true,
    message: 'Split marked as paid',
    data: expense
  });
});
