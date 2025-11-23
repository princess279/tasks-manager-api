// middleware/protectTaskOwnership.js
import Task from '../models/Task.js';

// Middleware: ensure users can only access their own tasks
export const protectTaskOwnership = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    // 1. Validate MongoDB ObjectId
    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    // 2. Find task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 3. Ensure logged-in user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to access this task' });
    }

    // 4. Attach task to request for controllers
    req.task = task;

    next();
  } catch (err) {
    console.error('Error in protectTaskOwnership:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};