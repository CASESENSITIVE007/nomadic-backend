import { Trip, User } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateQRCode } from '../services/qr.service.js';
import crypto from 'crypto';

// @desc    Generate share link for trip
// @route   POST /api/share/trip/:tripId
// @access  Private
export const generateShareLink = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { permissions = 'view', expiresIn = 30 } = req.body;

  const trip = await Trip.findById(tripId);

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
      message: 'Not authorized to share this trip'
    });
  }

  // Generate unique share token
  const shareToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));

  // Add share link to trip
  if (!trip.shareLinks) trip.shareLinks = [];
  
  trip.shareLinks.push({
    token: shareToken,
    permissions,
    createdBy: req.user._id,
    expiresAt,
    isActive: true
  });

  await trip.save();

  // Generate QR code
  const shareUrl = `${process.env.CLIENT_URL}/trip/shared/${shareToken}`;
  const qrCode = await generateQRCode(shareUrl);

  res.json({
    success: true,
    data: {
      shareUrl,
      qrCode,
      permissions,
      expiresAt
    }
  });
});

// @desc    Get shared trip by token
// @route   GET /api/share/trip/:token
// @access  Public
export const getSharedTrip = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const trip = await Trip.findOne({
    'shareLinks.token': token,
    'shareLinks.isActive': true,
    'shareLinks.expiresAt': { $gt: new Date() }
  })
    .populate('collaborators.user', 'name avatar')
    .select('-shareLinks');

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Shared trip not found or link expired'
    });
  }

  res.json({
    success: true,
    data: trip
  });
});

// @desc    Revoke share link
// @route   DELETE /api/share/trip/:tripId/:token
// @access  Private
export const revokeShareLink = asyncHandler(async (req, res) => {
  const { tripId, token } = req.params;

  const trip = await Trip.findById(tripId);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is owner
  const collaborator = trip.collaborators.find(
    c => c.user.toString() === req.user._id.toString()
  );

  if (!collaborator || collaborator.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Only trip owner can revoke share links'
    });
  }

  // Remove share link
  trip.shareLinks = trip.shareLinks.filter(link => link.token !== token);
  await trip.save();

  res.json({
    success: true,
    message: 'Share link revoked successfully'
  });
});

// @desc    Get all share links for a trip
// @route   GET /api/share/trip/:tripId/links
// @access  Private
export const getShareLinks = asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  const trip = await Trip.findById(tripId)
    .populate('shareLinks.createdBy', 'name avatar');

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is collaborator
  const isCollaborator = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );

  if (!isCollaborator) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  const activeLinks = trip.shareLinks.filter(
    link => link.isActive && link.expiresAt > new Date()
  );

  res.json({
    success: true,
    data: activeLinks
  });
});

// @desc    Invite user to trip by email
// @route   POST /api/share/trip/:tripId/invite
// @access  Private
export const inviteUser = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const { email, role = 'viewer' } = req.body;

  const trip = await Trip.findById(tripId);

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
      message: 'Not authorized to invite users'
    });
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found with this email'
    });
  }

  // Check if already a collaborator
  const isAlreadyCollaborator = trip.collaborators.some(
    c => c.user.toString() === user._id.toString()
  );

  if (isAlreadyCollaborator) {
    return res.status(400).json({
      success: false,
      message: 'User is already a collaborator'
    });
  }

  // Add as collaborator
  trip.collaborators.push({
    user: user._id,
    role,
    joinedAt: new Date()
  });

  await trip.save();

  // Add trip to user's trips
  await User.findByIdAndUpdate(user._id, {
    $push: { trips: trip._id }
  });

  // Add notification
  await User.findByIdAndUpdate(user._id, {
    $push: {
      notifications: {
        type: 'trip_invite',
        message: `You've been invited to collaborate on "${trip.name}"`,
        read: false
      }
    }
  });

  res.json({
    success: true,
    message: 'User invited successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      role
    }
  });
});

// @desc    Update collaborator role
// @route   PUT /api/share/trip/:tripId/collaborator/:userId
// @access  Private
export const updateCollaboratorRole = asyncHandler(async (req, res) => {
  const { tripId, userId } = req.params;
  const { role } = req.body;

  const trip = await Trip.findById(tripId);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is owner
  const isOwner = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString() && c.role === 'owner'
  );

  if (!isOwner) {
    return res.status(403).json({
      success: false,
      message: 'Only trip owner can update roles'
    });
  }

  // Update role
  const collaboratorIndex = trip.collaborators.findIndex(
    c => c.user.toString() === userId
  );

  if (collaboratorIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Collaborator not found'
    });
  }

  trip.collaborators[collaboratorIndex].role = role;
  await trip.save();

  res.json({
    success: true,
    message: 'Collaborator role updated'
  });
});

// @desc    Remove collaborator
// @route   DELETE /api/share/trip/:tripId/collaborator/:userId
// @access  Private
export const removeCollaborator = asyncHandler(async (req, res) => {
  const { tripId, userId } = req.params;

  const trip = await Trip.findById(tripId);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is owner or removing themselves
  const isOwner = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString() && c.role === 'owner'
  );
  const isSelf = req.user._id.toString() === userId;

  if (!isOwner && !isSelf) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  // Remove collaborator
  trip.collaborators = trip.collaborators.filter(
    c => c.user.toString() !== userId
  );
  await trip.save();

  // Remove trip from user's trips
  await User.findByIdAndUpdate(userId, {
    $pull: { trips: trip._id }
  });

  res.json({
    success: true,
    message: 'Collaborator removed successfully'
  });
});

// @desc    Generate QR code for trip
// @route   GET /api/share/trip/:tripId/qr
// @access  Private
export const generateTripQR = asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  const trip = await Trip.findById(tripId);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  // Check if user is collaborator
  const isCollaborator = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );

  if (!isCollaborator && !trip.isPublic) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  const tripUrl = `${process.env.CLIENT_URL}/trip/${tripId}`;
  const qrCode = await generateQRCode(tripUrl);

  res.json({
    success: true,
    data: {
      qrCode,
      url: tripUrl
    }
  });
});

export default {
  generateShareLink,
  getSharedTrip,
  revokeShareLink,
  getShareLinks,
  inviteUser,
  updateCollaboratorRole,
  removeCollaborator,
  generateTripQR
};
