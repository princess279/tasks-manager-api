// test/testTasks.js
import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';

const router = express.Router();

// GET all tasks for testing
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('user', 'name email timezone')
      .sort({ dueDate: 1 });

    if (!tasks.length) {
      return res.status(200).json({ message: 'No tasks found', tasks: [] });
    }

    res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error('Error fetching test tasks:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: err.message });
  }
});

export default router;