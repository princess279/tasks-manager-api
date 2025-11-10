import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
  name: {
    type: String,
    required: [true, 'Please provide your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  resetToken: String,
  resetTokenExpiry: Date,
}, { timestamps: true });

export default mongoose.model('User', userSchema);