import { User } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('trips', 'name destination startDate endDate status coverImage')
    .populate('savedPlaces', 'name location images rating');

  res.json({
    success: true,
    data: user.getPublicProfile()
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, location, phone, preferences, socialLinks } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (location !== undefined) updateData.location = location;
  if (phone !== undefined) updateData.phone = phone;
  if (preferences) updateData.preferences = preferences;
  if (socialLinks) updateData.socialLinks = socialLinks;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user.getPublicProfile()
  });
});

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'nomadic-view/avatars',
      width: 300,
      height: 300,
      crop: 'fill'
    });

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
});

// @desc    Get user by ID (public profile)
// @route   GET /api/users/:id
// @access  Public
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('name avatar bio location preferences.socialLinks');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location
    }
  });
});

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: user.notifications.sort((a, b) => b.createdAt - a.createdAt)
  });
});

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:id/read
// @access  Private
export const markNotificationRead = asyncHandler(async (req, res) => {
  await User.updateOne(
    { _id: req.user._id, 'notifications._id': req.params.id },
    { $set: { 'notifications.$.read': true } }
  );

  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await User.updateOne(
    { _id: req.user._id },
    { $set: { 'notifications.$[].read': true } }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Get saved places
// @route   GET /api/users/saved-places
// @access  Private
export const getSavedPlaces = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('savedPlaces', 'name location images rating type thingsToDo');

  res.json({
    success: true,
    data: user.savedPlaces
  });
});

// @desc    Save a place
// @route   POST /api/users/saved-places
// @access  Private
export const savePlace = asyncHandler(async (req, res) => {
  const { placeId } = req.body;

  await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { savedPlaces: placeId } }
  );

  res.json({
    success: true,
    message: 'Place saved successfully'
  });
});

// @desc    Remove saved place
// @route   DELETE /api/users/saved-places/:placeId
// @access  Private
export const removeSavedPlace = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { savedPlaces: req.params.placeId } }
  );

  res.json({
    success: true,
    message: 'Place removed from saved'
  });
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
export const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 2 characters'
    });
  }

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ],
    _id: { $ne: req.user._id }
  })
    .select('name email avatar')
    .limit(10);

  res.json({
    success: true,
    data: users
  });
});

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserById,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getSavedPlaces,
  savePlace,
  removeSavedPlace,
  searchUsers
};
