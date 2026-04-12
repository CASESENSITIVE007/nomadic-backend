import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { errorHandler } from './src/middleware/errorHandler.js';
import { rateLimiter } from './src/middleware/rateLimiter.js';

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import tripRoutes from './src/routes/trip.routes.js';
import placeRoutes from './src/routes/place.routes.js';
import expenseRoutes from './src/routes/expense.routes.js';
import documentRoutes from './src/routes/document.routes.js';
import aiRoutes from './src/routes/ai.routes.js';
import weatherRoutes from './src/routes/weather.routes.js';
import mapRoutes from './src/routes/map.routes.js';
import shareRoutes from './src/routes/share.routes.js';
import dns from 'dns';
dns.setServers(['1.1.1.1','8.8.8.8']);
dotenv.config();

const app = express();

const normalizeOrigin = (value = '') => value.replace(/\/$/, '');
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return configuredOrigins.includes(normalizeOrigin(origin));
};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use(rateLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/share', shareRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Nomadic View API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Nomadic View API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      trips: '/api/trips',
      places: '/api/places',
      expenses: '/api/expenses',
      documents: '/api/documents',
      ai: '/api/ai',
      weather: '/api/weather',
      maps: '/api/maps',
      share: '/api/share'
    }
  });
});

// Socket.io for real-time collaboration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-trip', (tripId) => {
    socket.join(`trip-${tripId}`);
    console.log(`User ${socket.id} joined trip ${tripId}`);
  });

  socket.on('leave-trip', (tripId) => {
    socket.leave(`trip-${tripId}`);
    console.log(`User ${socket.id} left trip ${tripId}`);
  });

  socket.on('trip-update', (data) => {
    socket.to(`trip-${data.tripId}`).emit('trip-updated', data);
  });

  socket.on('activity-added', (data) => {
    socket.to(`trip-${data.tripId}`).emit('activity-added', data);
  });

  socket.on('expense-added', (data) => {
    socket.to(`trip-${data.tripId}`).emit('expense-added', data);
  });

  socket.on('comment-added', (data) => {
    socket.to(`trip-${data.tripId}`).emit('comment-added', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

export { io };
