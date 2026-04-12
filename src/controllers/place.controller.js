import { Place, User } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all places
// @route   GET /api/places
// @access  Public
export const getPlaces = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, type, category, sort = 'popular' } = req.query;

  const query = {};
  if (type) query.type = type;
  if (category) query.category = { $in: [category] };

  let sortOption = {};
  switch (sort) {
    case 'popular':
      sortOption = { viewCount: -1 };
      break;
    case 'rating':
      sortOption = { 'rating.average': -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    default:
      sortOption = { viewCount: -1 };
  }

  const places = await Place.find(query)
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Place.countDocuments(query);

  res.json({
    success: true,
    data: places,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

// @desc    Get single place
// @route   GET /api/places/:id
// @access  Public/Private
export const getPlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id)
    .populate('reviews.user', 'name avatar');

  if (!place) {
    return res.status(404).json({
      success: false,
      message: 'Place not found'
    });
  }

  // Increment view count
  place.viewCount += 1;
  await place.save();

  // Check if user has saved this place
  let isSaved = false;
  if (req.user) {
    isSaved = place.savedBy.includes(req.user._id);
  }

  res.json({
    success: true,
    data: {
      ...place.toObject(),
      isSaved
    }
  });
});

// @desc    Create new place
// @route   POST /api/places
// @access  Private (Admin)
export const createPlace = asyncHandler(async (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can create places'
    });
  }

  const place = await Place.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Place created successfully',
    data: place
  });
});

// @desc    Update place
// @route   PUT /api/places/:id
// @access  Private (Admin)
export const updatePlace = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can update places'
    });
  }

  const place = await Place.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!place) {
    return res.status(404).json({
      success: false,
      message: 'Place not found'
    });
  }

  res.json({
    success: true,
    message: 'Place updated successfully',
    data: place
  });
});

// @desc    Delete place
// @route   DELETE /api/places/:id
// @access  Private (Admin)
export const deletePlace = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admins can delete places'
    });
  }

  const place = await Place.findByIdAndDelete(req.params.id);

  if (!place) {
    return res.status(404).json({
      success: false,
      message: 'Place not found'
    });
  }

  res.json({
    success: true,
    message: 'Place deleted successfully'
  });
});

// @desc    Get popular places
// @route   GET /api/places/popular
// @access  Public
export const getPopularPlaces = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const places = await Place.find({ isPopular: true })
    .sort({ viewCount: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: places
  });
});

// @desc    Get featured places
// @route   GET /api/places/featured
// @access  Public
export const getFeaturedPlaces = asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const places = await Place.find({ isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: places
  });
});

// @desc    Get places by type
// @route   GET /api/places/type/:type
// @access  Public
export const getPlacesByType = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;

  const places = await Place.find({ type: req.params.type })
    .sort({ viewCount: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Place.countDocuments({ type: req.params.type });

  res.json({
    success: true,
    data: places,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

// @desc    Get places by state
// @route   GET /api/places/state/:state
// @access  Public
export const getPlacesByState = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;

  const places = await Place.find({
    'location.state': { $regex: req.params.state, $options: 'i' }
  })
    .sort({ viewCount: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Place.countDocuments({
    'location.state': { $regex: req.params.state, $options: 'i' }
  });

  res.json({
    success: true,
    data: places,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    }
  });
});

// @desc    Search places
// @route   GET /api/places/search
// @access  Public
export const searchPlaces = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return res.json({
      success: true,
      data: []
    });
  }

  const places = await Place.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: places
  });
});

// @desc    Save place
// @route   POST /api/places/:id/save
// @access  Private
export const savePlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return res.status(404).json({
      success: false,
      message: 'Place not found'
    });
  }

  // Add to user's saved places
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { savedPlaces: place._id }
  });

  // Add user to place's savedBy
  place.savedBy.addToSet(req.user._id);
  await place.save();

  res.json({
    success: true,
    message: 'Place saved successfully'
  });
});

// @desc    Unsave place
// @route   DELETE /api/places/:id/save
// @access  Private
export const unsavePlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    return res.status(404).json({
      success: false,
      message: 'Place not found'
    });
  }

  // Remove from user's saved places
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { savedPlaces: place._id }
  });

  // Remove user from place's savedBy
  place.savedBy.pull(req.user._id);
  await place.save();

  res.json({
    success: true,
    message: 'Place removed from saved'
  });
});

// @desc    Get user's saved places
// @route   GET /api/places/user/saved
// @access  Private
export const getSavedPlaces = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('savedPlaces');

  res.json({
    success: true,
    data: user.savedPlaces
  });
});

// @desc    Add review
// @route   POST /api/places/:id/reviews
// @access  Private
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment, photos } = req.body;

  const place = await Place.findById(req.params.id);

  if (!place) {
    return res.status(404).json({
      success: false,
      message: 'Place not found'
    });
  }

  // Check if user already reviewed
  const alreadyReviewed = place.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this place'
    });
  }

  place.reviews.push({
    user: req.user._id,
    rating,
    comment,
    photos
  });

  await place.save();
  await place.populate('reviews.user', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: place.reviews
  });
});

// @desc    Get nearby places
// @route   GET /api/places/nearby
// @access  Public
export const getNearbyPlaces = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 50, limit = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }

  // Find places within radius using MongoDB geospatial query
  const places = await Place.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: radius * 1000 // Convert km to meters
      }
    }
  }).limit(parseInt(limit));

  res.json({
    success: true,
    data: places
  });
});
