import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
    },
    resetToken: String,
    resetTokenExpiry: Date,

    // ---------- Daily reminders ----------
    dailyReminder: {
      type: Boolean,
      default: false, // optional, user must opt-in
    },
    reminderTime: {
      type: String, // store as "HH:MM" or ISO time string
      default: null, // optional, only used if dailyReminder is true
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);