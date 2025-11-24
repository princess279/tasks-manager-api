// middleware/protectTaskOwnership.js
import Task from '../models/Task.js';

// Middleware to ensure the logged-in user owns the task
export const protectTaskOwnership = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    // 1. Validate ObjectId
    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    // 2. Fetch the task from DB
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 3. Check ownership
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to access this task' });
    }

    // 4. Attach task to req
    req.task = task;

    // 5. Pass to next middleware/controller
    next();
  } catch (err) {
    console.error('Error in protectTaskOwnership:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};