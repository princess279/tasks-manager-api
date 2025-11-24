// models/Task.js
import mongoose from 'mongoose';

// Define the Task schema
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please enter a task title'],
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'archived'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: [true, 'Please set a due date for the task'],
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    autocompleted: {
      type:Boolean,
      default:false,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    reminderTime: {
      type: String, // Optional HH:mm string
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: make sure "completed" matches the status
taskSchema.pre('save', function (next) {
  this.completed = this.status === 'completed';
  next();
});

export default mongoose.model('Task', taskSchema);