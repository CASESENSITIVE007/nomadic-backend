import express from 'express';
import {
  generateShareLink,
  getSharedTrip,
  revokeShareLink,
  getShareLinks,
  inviteUser,
  updateCollaboratorRole,
  removeCollaborator,
  generateTripQR
} from '../controllers/share.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/trip/:token', getSharedTrip);
router.post('/trip/:tripId', authenticate, generateShareLink);
router.get('/trip/:tripId/links', authenticate, getShareLinks);
router.get('/trip/:tripId/qr', authenticate, generateTripQR);
router.delete('/trip/:tripId/:token', authenticate, revokeShareLink);
router.post('/trip/:tripId/invite', authenticate, inviteUser);
router.put('/trip/:tripId/collaborator/:userId', authenticate, updateCollaboratorRole);
router.delete('/trip/:tripId/collaborator/:userId', authenticate, removeCollaborator);

export default router;
