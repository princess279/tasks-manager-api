import express from 'express';
const router = express.Router();

// Import all functions from authController
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe  // make sure getMe is exported from authController
} from '../controllers/authController.js';

// Import protect middleware
import { protect } from '../middleware/authMiddleware.js';

// Route to register a new user
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route to initiate password reset
router.post('/forgot-password', forgotPassword);

// Route to complete password reset using token
router.post('/reset-password/:token', resetPassword);

// **Route to get logged-in user info**
router.get('/me', protect, getMe);

export default router;