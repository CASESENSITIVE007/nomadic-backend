import express from 'express';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  getSettlements,
  markSplitAsPaid
} from '../controllers/expense.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', getExpenseSummary);
router.get('/settlements', getSettlements);
router.get('/', getExpenses);
router.post('/', createExpense);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);
router.patch('/:id/split/:userId/paid', markSplitAsPaid);

export default router;
