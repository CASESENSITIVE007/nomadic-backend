import { Document, Trip } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get all documents for a trip
// @route   GET /api/documents/trip/:tripId
// @access  Private
export const getTripDocuments = asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  // Check if user is a collaborator
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  const isCollaborator = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );

  if (!isCollaborator && !trip.isPublic) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these documents'
    });
  }

  const documents = await Document.find({ trip: tripId })
    .populate('uploadedBy', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: documents
  });
});

// @desc    Upload a document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = asyncHandler(async (req, res) => {
  const { tripId, name, type, expiryDate, notes } = req.body;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file'
    });
  }

  // Check if user is a collaborator
  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  const isCollaborator = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );

  if (!isCollaborator) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to upload documents'
    });
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: `nomadic-view/documents/${tripId}`,
      resource_type: 'auto'
    });

    const document = await Document.create({
      trip: tripId,
      name: name || req.file.originalname,
      type: type || 'other',
      fileUrl: result.secure_url,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      cloudinaryId: result.public_id,
      uploadedBy: req.user._id,
      expiryDate: expiryDate || null,
      notes: notes || ''
    });

    await document.populate('uploadedBy', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
});

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check if user is the uploader or trip owner
  const trip = await Trip.findById(document.trip);
  const isOwner = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString() && c.role === 'owner'
  );

  if (document.uploadedBy.toString() !== req.user._id.toString() && !isOwner) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this document'
    });
  }

  // Delete from Cloudinary
  if (document.cloudinaryId) {
    try {
      await cloudinary.v2.uploader.destroy(document.cloudinaryId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
    }
  }

  await document.deleteOne();

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

// @desc    Update document details
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = asyncHandler(async (req, res) => {
  const { name, type, expiryDate, notes, isShared } = req.body;

  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check if user is the uploader or trip owner
  const trip = await Trip.findById(document.trip);
  const isOwner = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString() && c.role === 'owner'
  );

  if (document.uploadedBy.toString() !== req.user._id.toString() && !isOwner) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this document'
    });
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (type) updateData.type = type;
  if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
  if (notes !== undefined) updateData.notes = notes;
  if (isShared !== undefined) updateData.isShared = isShared;

  const updated = await Document.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  ).populate('uploadedBy', 'name avatar');

  res.json({
    success: true,
    message: 'Document updated successfully',
    data: updated
  });
});

// @desc    Download document (track download count)
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check if user is a collaborator
  const trip = await Trip.findById(document.trip);
  const isCollaborator = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );

  if (!isCollaborator && !document.isShared) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to download this document'
    });
  }

  // Increment download count
  document.downloadCount += 1;
  await document.save();

  res.json({
    success: true,
    data: {
      downloadUrl: document.fileUrl,
      fileName: document.name,
      fileType: document.fileType
    }
  });
});

// @desc    Get documents by type
// @route   GET /api/documents/trip/:tripId/type/:type
// @access  Private
export const getDocumentsByType = asyncHandler(async (req, res) => {
  const { tripId, type } = req.params;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  const isCollaborator = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );

  if (!isCollaborator && !trip.isPublic) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  const documents = await Document.find({ trip: tripId, type })
    .populate('uploadedBy', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: documents
  });
});

export default {
  getTripDocuments,
  uploadDocument,
  deleteDocument,
  updateDocument,
  downloadDocument,
  getDocumentsByType
};
