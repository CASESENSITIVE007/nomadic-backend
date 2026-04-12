import express from 'express';
import {
  geocode,
  reverseGeocodeLocation,
  placeDetails,
  nearbyPlaces,
  getRoute,
  distanceMatrix,
  autocomplete,
  getPhoto,
  emergencyServices,
  getTripRoute
} from '../controllers/map.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/geocode', geocode);
router.get('/reverse-geocode', reverseGeocodeLocation);
router.get('/place/:placeId', placeDetails);
router.get('/nearby', nearbyPlaces);
router.get('/directions', getRoute);
router.post('/distance-matrix', distanceMatrix);
router.get('/autocomplete', autocomplete);
router.get('/photo', getPhoto);
router.get('/emergency-services', emergencyServices);
router.post('/trip-route', authenticate, getTripRoute);

export default router;
