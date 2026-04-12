import express from 'express';
import { register, login, logout, getMe, updateProfile, changePassword, forgotPassword, resetPassword, refreshToken } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { registerValidator, loginValidator } from '../middleware/validator.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', authRateLimiter, registerValidator, register);
router.post('/login', authRateLimiter, loginValidator, login);
router.post('/forgot-password', authRateLimiter, forgotPassword);
router.post('/reset-password', authRateLimiter, resetPassword);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/logout', authenticate, logout);

export default router;
