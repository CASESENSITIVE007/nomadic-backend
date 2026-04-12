import express from 'express';
import {
  getCurrent,
  getForecast,
  getBatchWeather,
  getTripWeather
} from '../controllers/weather.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/current', getCurrent);
router.get('/forecast', getForecast);
router.post('/batch', getBatchWeather);
router.post('/trip-weather', authenticate, getTripWeather);

export default router;
