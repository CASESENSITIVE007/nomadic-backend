import express from 'express';
import {
  getTripDocuments,
  uploadDocument,
  deleteDocument,
  updateDocument,
  downloadDocument,
  getDocumentsByType
} from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/trip/:tripId', getTripDocuments);
router.get('/trip/:tripId/type/:type', getDocumentsByType);
router.post('/', upload.single('file'), uploadDocument);
router.get('/:id/download', downloadDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
