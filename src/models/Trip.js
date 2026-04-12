import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    name: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    placeId: String
  },
  type: {
    type: String,
    enum: ['sightseeing', 'food', 'transport', 'accommodation', 'activity', 'other'],
    default: 'other'
  },
  duration: {
    type: Number, // in hours
    default: 1
  },
  cost: {
    type: Number,
    default: 0
  },
  photos: [String],
  isCompleted: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
});

const daySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  dayNumber: {
    type: Number,
    required: true
  },
  activities: [activitySchema],
  notes: {
    type: String,
    default: ''
  }
});

const collaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'editor', 'viewer'],
    default: 'viewer'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const budgetCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  allocated: {
    type: Number,
    default: 0
  },
  spent: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#D7FF3B'
  }
});

const budgetSchema = new mongoose.Schema({
  total: {
    type: Number,
    default: 0
  },
  spent: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  categories: [budgetCategorySchema]
});

const packingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['essentials', 'clothing', 'toiletries', 'electronics', 'health', 'documents', 'misc'],
    default: 'misc'
  },
  isPacked: {
    type: Boolean,
    default: false
  },
  isEssential: {
    type: Boolean,
    default: false
  },
  quantity: {
    type: Number,
    default: 1
  },
  notes: {
    type: String,
    default: ''
  }
});

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  activityId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a trip name'],
    trim: true,
    maxlength: [100, 'Trip name cannot be more than 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  destination: {
    type: String,
    required: [true, 'Please provide a destination'],
    trim: true
  },
  destinationDetails: {
    country: String,
    state: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  coverImage: {
    type: String,
    default: null
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: [daySchema],
  collaborators: [collaboratorSchema],
  budget: {
    type: budgetSchema,
    default: () => ({
      total: 0,
      spent: 0,
      currency: 'INR',
      categories: []
    })
  },
  expenses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense'
  }],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  packingList: [packingItemSchema],
  comments: [commentSchema],
  qrCode: {
    type: String,
    default: null
  },
  shareLink: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['planning', 'ongoing', 'completed', 'cancelled'],
    default: 'planning'
  },
  travelStyle: {
    type: String,
    enum: ['adventure', 'relaxed', 'cultural', 'foodie', 'nature', 'mixed'],
    default: 'mixed'
  },
  tags: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual for trip duration
tripSchema.virtual('duration').get(function() {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
});

// Virtual for total activities
tripSchema.virtual('totalActivities').get(function() {
  return this.days.reduce((total, day) => total + day.activities.length, 0);
});

// Index for search
tripSchema.index({ name: 'text', destination: 'text', description: 'text' });
tripSchema.index({ destination: 1 });
tripSchema.index({ startDate: 1 });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
