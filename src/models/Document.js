import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a document name'],
    trim: true
  },
  type: {
    type: String,
    enum: ['ticket', 'hotel', 'passport', 'visa', 'insurance', 'id', 'booking', 'other'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    default: 0
  },
  cloudinaryId: {
    type: String,
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiryDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  isShared: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
