import express from 'express';
import {
  generateItinerary,
  getRecommendations,
  getPackingList,
  getBudgetTips,
  chatWithAI
} from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(authenticate);
router.use(aiRateLimiter);

router.post('/itinerary', generateItinerary);
router.post('/recommendations', getRecommendations);
router.post('/packing-list', getPackingList);
router.post('/budget-tips', getBudgetTips);
router.post('/chat', chatWithAI);

export default router;
