import express from 'express';
import {
  getPlaces,
  getPlace,
  createPlace,
  updatePlace,
  deletePlace,
  getPopularPlaces,
  getFeaturedPlaces,
  getPlacesByType,
  getPlacesByState,
  searchPlaces,
  savePlace,
  unsavePlace,
  getSavedPlaces,
  addReview,
  getNearbyPlaces
} from '../controllers/place.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/popular', getPopularPlaces);
router.get('/featured', getFeaturedPlaces);
router.get('/search', searchPlaces);
router.get('/type/:type', getPlacesByType);
router.get('/state/:state', getPlacesByState);
router.get('/nearby', getNearbyPlaces);
router.get('/', getPlaces);
router.get('/:id', optionalAuth, getPlace);

// Protected routes
router.use(authenticate);

router.post('/', createPlace);
router.put('/:id', updatePlace);
router.delete('/:id', deletePlace);
router.post('/:id/save', savePlace);
router.delete('/:id/save', unsavePlace);
router.get('/user/saved', getSavedPlaces);
router.post('/:id/reviews', addReview);

export default router;
