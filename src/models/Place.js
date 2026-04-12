import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  photos: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a place name'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  location: {
    country: {
      type: String,
      required: true
    },
    state: String,
    city: {
      type: String,
      required: true
    },
    address: String,
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    placeId: String // Google Places ID
  },
  images: [{
    url: String,
    caption: String
  }],
  coverImage: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['city', 'hill_station', 'beach', 'heritage', 'wildlife', 'adventure', 'pilgrimage', 'other'],
    required: true
  },
  category: [{
    type: String,
    enum: ['popular', 'hidden_gem', 'family_friendly', 'romantic', 'solo_travel', 'backpacker', 'luxury']
  }],
  tags: [String],
  bestTimeToVisit: {
    months: [{
      type: String,
      enum: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    }],
    description: String
  },
  idealDuration: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      enum: ['hours', 'days'],
      default: 'days'
    }
  },
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  weather: {
    summer: {
      temp: String,
      description: String
    },
    winter: {
      temp: String,
      description: String
    },
    monsoon: {
      temp: String,
      description: String
    }
  },
  thingsToDo: [{
    name: String,
    description: String,
    image: String,
    cost: Number,
    duration: String,
    type: {
      type: String,
      enum: ['activity', 'sightseeing', 'food', 'shopping', 'adventure']
    }
  }],
  attractions: [{
    name: String,
    description: String,
    image: String,
    type: String,
    entryFee: Number,
    timings: String
  }],
  restaurants: [{
    name: String,
    cuisine: String,
    priceRange: {
      type: String,
      enum: ['budget', 'mid_range', 'luxury']
    },
    rating: Number
  }],
  accommodation: [{
    type: {
      type: String,
      enum: ['hotel', 'resort', 'hostel', 'homestay', 'camp', 'villa']
    },
    name: String,
    priceRange: {
      type: String,
      enum: ['budget', 'mid_range', 'luxury']
    },
    rating: Number
  }],
  howToReach: {
    byAir: String,
    byTrain: String,
    byRoad: String
  },
  nearbyPlaces: [{
    name: String,
    distance: String,
    description: String
  }],
  tips: [String],
  reviews: [reviewSchema],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Calculate average rating before saving
placeSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating.average = Math.round((total / this.reviews.length) * 10) / 10;
    this.rating.count = this.reviews.length;
  }
  next();
});

// Index for search
placeSchema.index({ name: 'text', description: 'text', 'location.city': 'text', 'location.state': 'text' });
placeSchema.index({ type: 1 });
placeSchema.index({ 'location.country': 1 });
placeSchema.index({ 'location.state': 1 });
placeSchema.index({ isPopular: 1 });
placeSchema.index({ isFeatured: 1 });

const Place = mongoose.model('Place', placeSchema);

export default Place;
