import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: null
  },
  isPaid: {
    type: Boolean,
    default: false
  }
});

const expenseSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide an expense title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  category: {
    type: String,
    enum: ['transport', 'food', 'accommodation', 'activities', 'shopping', 'other'],
    default: 'other'
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  splitAmong: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  splitType: {
    type: String,
    enum: ['equal', 'percentage', 'custom'],
    default: 'equal'
  },
  splits: [splitSchema],
  date: {
    type: Date,
    default: Date.now
  },
  receipt: {
    type: String,
    default: null
  },
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isReimbursable: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Calculate splits before saving
expenseSchema.pre('save', function(next) {
  if (this.isModified('splits') || this.isModified('splitAmong') || this.isModified('amount')) {
    const splitCount = this.splitAmong.length;
    
    if (splitCount === 0) {
      this.splits = [];
      return next();
    }

    if (this.splitType === 'equal') {
      const equalAmount = this.amount / splitCount;
      this.splits = this.splitAmong.map(userId => ({
        user: userId,
        amount: Math.round(equalAmount * 100) / 100,
        percentage: 100 / splitCount
      }));
    }
  }
  next();
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
