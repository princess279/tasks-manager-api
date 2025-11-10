import express from 'express';
const router = express.Router();

// Import all functions from authController
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

// Route to register a new user
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

// Route to initiate password reset
router.post('/forgot-password', forgotPassword);

// Route to complete password reset using token
router.post('/reset-password/:token', resetPassword);

// Correct ESM export
export default router;