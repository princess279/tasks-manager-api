import Task from '../models/Task.js';

// Middleware: make sure users can only access their own tasks
export const protectTaskOwnership = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    // 1. Check if the task ID is valid (MongoDB ObjectId)
    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    // 2. Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 3. Make sure the logged-in user owns this task
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to access this task' });
    }

    // 4. Attach the task to the request object so controllers can use it
    req.task = task;

    // 5. Everything is good, move to the next middleware/controller
    next();
  } catch (err) {
    console.error('Error in protectTaskOwnership:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};