// controllers/authController.js
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import sendEmail from '../utils/email.js';

// -------------------- HELPERS --------------------

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h', // matches your .env
  });
};

// -------------------- CONTROLLERS --------------------

// Register a new user
export const registerUser = async (req, res) => {
  try {
    console.log('--- Register User Called ---');
    console.log('Request body:', req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log('Missing fields:', { name, email, password });
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailLower = email.toLowerCase();
    console.log('Lowercased email:', emailLower);

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    console.log('Existing user found:', existingUser);

    if (existingUser) {
      console.log('User already exists with this email');
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    // Create user
    const user = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
    });
    console.log('User saved in DB:', user);

    const token = generateToken(user._id);
    console.log('Generated JWT token:', token);

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    console.log('--- Login User Called ---');
    console.log('Request body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase();
    console.log('Lowercased email:', emailLower);

    const user = await User.findOne({ email: emailLower });
    console.log('User fetched from DB:', user);

    if (!user) {
      console.log('No user found with this email');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    console.log('Generated JWT token:', token);

    return res.status(200).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

// Get current logged-in user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ message: 'Failed to fetch user data', error: err.message });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });
    if (!user) return res.status(404).json({ message: 'No user found with that email' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click this link to reset your password: ${resetUrl}`;

    await sendEmail(user.email, 'Password Reset', message);

    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('ForgotPassword error:', err);
    return res.status(500).json({ message: 'Error sending reset email', error: err.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'Password is required' });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('ResetPassword error:', err);
    return res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
};