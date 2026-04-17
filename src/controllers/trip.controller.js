import { Trip, User } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateAIItinerary } from '../services/ai.service.js';
import { generateQRCode } from '../services/qr.service.js';
import { randomUUID } from 'crypto';

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
export const createTrip = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    destination,
    startDate,
    endDate,
    budget,
    travelStyle,
    travelers,
    preferences,
    days: providedDays
  } = req.body;

  // Generate days array based on duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const baseDays = Array.from({ length: duration }, (_, i) => {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    return {
      date,
      dayNumber: i + 1,
      activities: [],
      notes: ''
    };
  });

  const normalizedProvidedDays = Array.isArray(providedDays) ? providedDays : [];
  const days = baseDays.map((baseDay) => {
    const aiDay = normalizedProvidedDays.find((day) => Number(day.dayNumber) === baseDay.dayNumber);

    if (!aiDay) {
      return baseDay;
    }

    const activities = Array.isArray(aiDay.activities)
      ? aiDay.activities.map((activity, index) => ({
          id: activity.id || randomUUID(),
          time: activity.time || '09:00',
          title: activity.title || `Activity ${index + 1}`,
          description: activity.description || '',
          location: activity.location,
          type: activity.type || 'other',
          duration: activity.duration || 1,
          cost: activity.cost || 0,
          photos: activity.photos || [],
          isCompleted: activity.isCompleted ?? false,
          notes: activity.notes || '',
          order: activity.order ?? index,
        }))
      : [];

    return {
      ...baseDay,
      notes: aiDay.notes || baseDay.notes,
      activities,
    };
  });

  // Create trip
  const trip = await Trip.create({
    name,
    description,
    destination,
    startDate: start,
    endDate: end,
    days,
    budget: budget || { total: 0, spent: 0, currency: 'INR', categories: [] },
    travelers: travelers || 1,
    travelStyle: travelStyle || 'mixed',
    collaborators: [{
      user: req.user._id,
      role: 'owner'
    }]
  });

  // Add trip to user's trips
  await User.findByIdAndUpdate(req.user._id, {
    $push: { trips: trip._id }
  });

  // Generate QR code
  const qrCode = await generateQRCode(`${process.env.CLIENT_URL}/trip/${trip._id}`);
  trip.qrCode = qrCode;
  await trip.save();

  res.status(201).json({
    success: true,
    message: 'Trip created successfully',
    data: trip
  });
});

// @desc    Get all trips for user
// @route   GET /api/trips
// @access  Private
export const getTrips = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 10 } = req.query;

  const query = {
    $or: [
      { 'collaborators.user': req.user._id },
      { isPublic: true }
    ]
  };

  if (status) query.status = status;
  if (search) {
    query.$and = [
      {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { destination: { $regex: search, $options: 'i' } }
        ]
      }
    ];
  }

  const trips = await Trip.find(query)
    .populate('collaborators.user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Trip.countDocuments(query);

  res.json({
    success: true,
    data: trips,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
export const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate('collaborators.user', 'name avatar email')
    .populate('expenses')
    .populate('documents')
    .populate('comments.user', 'name avatar');

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user has access
  const hasAccess = trip.collaborators.some(
    c => c.user._id.toString() === req.user._id.toString()
  ) || trip.isPublic;

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this trip'
    });
  }

  // Increment view count
  trip.views += 1;
  await trip.save();

  res.json({
    success: true,
    data: trip
  });
});

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is owner or editor
  const collaborator = trip.collaborators.find(
    c => c.user.toString() === req.user._id.toString()
  );

  if (!collaborator || (collaborator.role !== 'owner' && collaborator.role !== 'editor')) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this trip'
    });
  }

  const allowedUpdates = [
    'name', 'description', 'destination', 'coverImage',
    'days', 'budget', 'packingList', 'isPublic', 'status', 'travelStyle', 'tags', 'travelers'
  ];

  const updates = {};
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedTrip = await Trip.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Trip updated successfully',
    data: updatedTrip
  });
});

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Only owner can delete
  const isOwner = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString() && c.role === 'owner'
  );

  if (!isOwner) {
    return res.status(403).json({
      success: false,
      message: 'Only owner can delete this trip'
    });
  }

  await Trip.findByIdAndDelete(req.params.id);

  // Remove from user's trips
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { trips: req.params.id }
  });

  res.json({
    success: true,
    message: 'Trip deleted successfully'
  });
});

// @desc    Add activity to a day
// @route   POST /api/trips/:id/activities
// @access  Private
export const addActivity = asyncHandler(async (req, res) => {
  const { dayNumber, activity } = req.body;

  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  const day = trip.days.find(d => d.dayNumber === dayNumber);
  if (!day) {
    return res.status(404).json({
      success: false,
      message: 'Day not found'
    });
  }

  day.activities.push(activity);
  day.activities.sort((a, b) => a.time.localeCompare(b.time));

  await trip.save();

  res.status(201).json({
    success: true,
    message: 'Activity added successfully',
    data: trip
  });
});

// @desc    Update activity
// @route   PUT /api/trips/:id/activities/:activityId
// @access  Private
export const updateActivity = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  let activityFound = false;
  trip.days.forEach(day => {
    const activity = day.activities.id(req.params.activityId);
    if (activity) {
      Object.assign(activity, req.body);
      activityFound = true;
    }
  });

  if (!activityFound) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  await trip.save();

  res.json({
    success: true,
    message: 'Activity updated successfully',
    data: trip
  });
});

// @desc    Delete activity
// @route   DELETE /api/trips/:id/activities/:activityId
// @access  Private
export const deleteActivity = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  let activityFound = false;
  trip.days.forEach(day => {
    const activity = day.activities.id(req.params.activityId);
    if (activity) {
      activity.deleteOne();
      activityFound = true;
    }
  });

  if (!activityFound) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  await trip.save();

  res.json({
    success: true,
    message: 'Activity deleted successfully',
    data: trip
  });
});

// @desc    Add collaborator
// @route   POST /api/trips/:id/collaborators
// @access  Private
export const addCollaborator = asyncHandler(async (req, res) => {
  const { email, role = 'viewer' } = req.body;

  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if already a collaborator
  const alreadyCollaborator = trip.collaborators.some(
    c => c.user.toString() === user._id.toString()
  );

  if (alreadyCollaborator) {
    return res.status(400).json({
      success: false,
      message: 'User is already a collaborator'
    });
  }

  trip.collaborators.push({
    user: user._id,
    role,
    invitedBy: req.user._id
  });

  await trip.save();

  // Add trip to user's trips
  await User.findByIdAndUpdate(user._id, {
    $push: { trips: trip._id }
  });

  res.json({
    success: true,
    message: 'Collaborator added successfully',
    data: trip
  });
});

// @desc    Remove collaborator
// @route   DELETE /api/trips/:id/collaborators/:userId
// @access  Private
export const removeCollaborator = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  trip.collaborators = trip.collaborators.filter(
    c => c.user.toString() !== req.params.userId
  );

  await trip.save();

  // Remove trip from user's trips
  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { trips: trip._id }
  });

  res.json({
    success: true,
    message: 'Collaborator removed successfully',
    data: trip
  });
});

// @desc    Get comments
// @route   GET /api/trips/:id/comments
// @access  Private
export const getComments = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id)
    .populate('comments.user', 'name avatar');

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  res.json({
    success: true,
    data: trip.comments
  });
});

// @desc    Add comment
// @route   POST /api/trips/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
  const { text, activityId } = req.body;

  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  trip.comments.push({
    user: req.user._id,
    text,
    activityId
  });

  await trip.save();

  await trip.populate('comments.user', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: trip.comments
  });
});

// @desc    Generate AI itinerary
// @route   POST /api/trips/:id/generate-itinerary
// @access  Private
export const generateItinerary = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  const { preferences, budget, travelers } = req.body;

  const itinerary = await generateAIItinerary({
    destination: trip.destination,
    duration: trip.days.length,
    budget: budget || trip.budget?.total || 15000,
    travelers: travelers || 2,
    preferences: preferences || [],
    travelStyle: trip.travelStyle || 'mixed'
  });

  // Update trip with generated itinerary
  trip.days = itinerary;
  await trip.save();

  res.json({
    success: true,
    message: 'Itinerary generated successfully',
    data: trip
  });
});

// @desc    Update packing list
// @route   PUT /api/trips/:id/packing-list
// @access  Private
export const updatePackingList = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  trip.packingList = req.body.packingList;
  await trip.save();

  res.json({
    success: true,
    message: 'Packing list updated successfully',
    data: trip.packingList
  });
});

// @desc    Toggle packing item
// @route   PATCH /api/trips/:id/packing-list/:itemId
// @access  Private
export const togglePackingItem = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  const item = trip.packingList.id(req.params.itemId);
  if (item) {
    item.isPacked = !item.isPacked;
    await trip.save();
  }

  res.json({
    success: true,
    data: trip.packingList
  });
});

// @desc    Get trip stats
// @route   GET /api/trips/stats
// @access  Private
export const getTripStats = asyncHandler(async (req, res) => {
  const stats = await Trip.aggregate([
    {
      $match: {
        'collaborators.user': req.user._id
      }
    },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        plannedTrips: {
          $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] }
        },
        ongoingTrips: {
          $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] }
        },
        completedTrips: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        totalSpent: { $sum: '$budget.spent' }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      totalTrips: 0,
      plannedTrips: 0,
      ongoingTrips: 0,
      completedTrips: 0,
      totalSpent: 0
    }
  });
});

// @desc    Duplicate trip
// @route   POST /api/trips/:id/duplicate
// @access  Private
export const duplicateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  const newTrip = await Trip.create({
    ...trip.toObject(),
    _id: undefined,
    name: `${trip.name} (Copy)`,
    collaborators: [{
      user: req.user._id,
      role: 'owner'
    }],
    expenses: [],
    documents: [],
    comments: [],
    qrCode: null,
    shareLink: null,
    views: 0,
    likes: [],
    createdAt: undefined,
    updatedAt: undefined
  });

  // Generate new QR code
  const qrCode = await generateQRCode(`${process.env.CLIENT_URL}/trip/${newTrip._id}`);
  newTrip.qrCode = qrCode;
  await newTrip.save();

  // Add to user's trips
  await User.findByIdAndUpdate(req.user._id, {
    $push: { trips: newTrip._id }
  });

  res.status(201).json({
    success: true,
    message: 'Trip duplicated successfully',
    data: newTrip
  });
});

// @desc    Archive trip
// @route   PUT /api/trips/:id/archive
// @access  Private
export const archiveTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  trip.isArchived = !trip.isArchived;
  await trip.save();

  res.json({
    success: true,
    message: trip.isArchived ? 'Trip archived' : 'Trip unarchived',
    data: trip
  });
});

// @desc    Search trips
// @route   GET /api/trips/search
// @access  Private
export const searchTrips = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.json({
      success: true,
      data: []
    });
  }

  const trips = await Trip.find({
    $and: [
      {
        $or: [
          { 'collaborators.user': req.user._id },
          { isPublic: true }
        ]
      },
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { destination: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } }
        ]
      }
    ]
  }).limit(10);

  res.json({
    success: true,
    data: trips
  });
});
