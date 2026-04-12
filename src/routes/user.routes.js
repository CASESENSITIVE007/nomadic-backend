import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getUserById,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getSavedPlaces,
  savePlace,
  removeSavedPlace,
  searchUsers
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/search', authenticate, searchUsers);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.get('/notifications', authenticate, getNotifications);
router.put('/notifications/read-all', authenticate, markAllNotificationsRead);
router.put('/notifications/:id/read', authenticate, markNotificationRead);
router.get('/saved-places', authenticate, getSavedPlaces);
router.post('/saved-places', authenticate, savePlace);
router.delete('/saved-places/:placeId', authenticate, removeSavedPlace);
router.get('/:id', getUserById);

export default router;
