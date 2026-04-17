import { Document, Trip } from '../models/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadBuffer, deleteFile } from '../services/cloudinary.service.js';

// @desc    Get all documents for a trip
// @route   GET /api/documents/trip/:tripId
// @access  Private
export const getTripDocuments = asyncHandler(async (req, res) => {
  const { tripId } = req.params;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: 'Trip not found' });
  }

  const isCollaborator = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );
  if (!isCollaborator && !trip.isPublic) {
    return res.status(403).json({ success: false, message: 'Not authorized to view these documents' });
  }

  const documents = await Document.find({ trip: tripId })
    .populate('uploadedBy', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: documents });
});

// @desc    Upload a document
// @route   POST /api/documents
// @access  Private
export const uploadDocument = asyncHandler(async (req, res) => {
  const { tripId, name, type, expiryDate, notes } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: 'Trip not found' });
  }

  const isCollaborator = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );
  if (!isCollaborator) {
    return res.status(403).json({ success: false, message: 'Not authorized to upload documents' });
  }

  try {
    // Upload buffer directly to Cloudinary — no local disk needed
    const result = await uploadBuffer(req.file.buffer, {
      folder: `nomadic-view/documents/${tripId}`,
      resource_type: 'image',
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
      notes: notes || '',
    });

    // Link document to the trip
    await Trip.findByIdAndUpdate(tripId, { $push: { documents: document._id } });

    await document.populate('uploadedBy', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
});

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  const trip = await Trip.findById(document.trip);
  const isOwner = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString() && c.role === 'owner'
  );
  if (document.uploadedBy.toString() !== req.user._id.toString() && !isOwner) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this document' });
  }

  // Remove from Cloudinary
  if (document.cloudinaryId) {
    try {
      await deleteFile(document.cloudinaryId, { resource_type: 'image' });
    } catch (err) {
      console.error('Cloudinary delete error:', err);
    }
  }

  // Unlink from trip
  await Trip.findByIdAndUpdate(document.trip, { $pull: { documents: document._id } });

  await document.deleteOne();

  res.json({ success: true, message: 'Document deleted successfully' });
});

// @desc    Update document details
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = asyncHandler(async (req, res) => {
  const { name, type, expiryDate, notes, isShared } = req.body;

  const document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  const trip = await Trip.findById(document.trip);
  const isOwner = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString() && c.role === 'owner'
  );
  if (document.uploadedBy.toString() !== req.user._id.toString() && !isOwner) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this document' });
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (type) updateData.type = type;
  if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
  if (notes !== undefined) updateData.notes = notes;
  if (isShared !== undefined) updateData.isShared = isShared;

  const updated = await Document.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .populate('uploadedBy', 'name avatar');

  res.json({ success: true, message: 'Document updated successfully', data: updated });
});

// @desc    Download document (track download count)
// @route   GET /api/documents/:id/download
// @access  Private
export const downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ success: false, message: 'Document not found' });
  }

  const trip = await Trip.findById(document.trip);
  const isCollaborator = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );
  if (!isCollaborator && !document.isShared) {
    return res.status(403).json({ success: false, message: 'Not authorized to download this document' });
  }

  document.downloadCount += 1;
  await document.save();

  res.json({
    success: true,
    data: {
      downloadUrl: document.fileUrl,
      fileName: document.name,
      fileType: document.fileType,
    },
  });
});

// @desc    Get documents by type
// @route   GET /api/documents/trip/:tripId/type/:type
// @access  Private
export const getDocumentsByType = asyncHandler(async (req, res) => {
  const { tripId, type } = req.params;

  const trip = await Trip.findById(tripId);
  if (!trip) {
    return res.status(404).json({ success: false, message: 'Trip not found' });
  }

  const isCollaborator = trip.collaborators.some(
    c => c.user.toString() === req.user._id.toString()
  );
  if (!isCollaborator && !trip.isPublic) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const documents = await Document.find({ trip: tripId, type })
    .populate('uploadedBy', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: documents });
});
