import express from 'express';
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  addActivity,
  updateActivity,
  deleteActivity,
  addCollaborator,
  removeCollaborator,
  addComment,
  getComments,
  generateItinerary,
  updatePackingList,
  togglePackingItem,
  getTripStats,
  duplicateTrip,
  archiveTrip,
  searchTrips
} from '../controllers/trip.controller.js';
import { authenticate } from '../middleware/auth.js';
import { createTripValidator } from '../middleware/validator.js';

const router = express.Router();

// All routes are protected
router.use(authenticate);

// Trip CRUD
router.get('/search', searchTrips);
router.get('/stats', getTripStats);
router.get('/', getTrips);
router.post('/', createTripValidator, createTrip);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

// Trip actions
router.post('/:id/duplicate', duplicateTrip);
router.put('/:id/archive', archiveTrip);

// Activities
router.post('/:id/activities', addActivity);
router.put('/:id/activities/:activityId', updateActivity);
router.delete('/:id/activities/:activityId', deleteActivity);

// Collaborators
router.post('/:id/collaborators', addCollaborator);
router.delete('/:id/collaborators/:userId', removeCollaborator);

// Comments
router.get('/:id/comments', getComments);
router.post('/:id/comments', addComment);

// AI Itinerary
router.post('/:id/generate-itinerary', generateItinerary);

// Packing List
router.put('/:id/packing-list', updatePackingList);
router.patch('/:id/packing-list/:itemId', togglePackingItem);

export default router;
