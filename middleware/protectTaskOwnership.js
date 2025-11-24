// middleware/protectTaskOwnership.js
import Task from '../models/Task.js';

export const protectTaskOwnership = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Ensure the logged-in user owns this task
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this task' });
    }

    req.task = task; // attach for controller
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error validating task ownership' });
  }
};