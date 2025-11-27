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
      default: false, // user must opt-in
    },
    reminderTime: {
      type: String, // HH:MM format or ISO string
      default: null, // used only if dailyReminder is true
    },
    timezone: {
      type: String,
      default: 'UTC', // fallback if user does not set their timezone
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);