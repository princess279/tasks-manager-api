// middleware/protectTaskOwnership.js
import mongoose from 'mongoose';
import Task from '../models/Task.js';

// Middleware: make sure users can only access their own tasks
export const protectTaskOwnership = async (req, res, next) => {
  try {
    const { id: taskId } = req.params;

    // 1. Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    // 2. Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 3. Verify task ownership
    // Ensure both are strings for comparison
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not allowed to access this task' });
    }

    // 4. Attach task to request object for controllers
    req.task = task;

    // 5. Everything is good, move on
    next();
  } catch (err) {
    console.error('Error in protectTaskOwnership:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};