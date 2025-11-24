// controllers/taskController.js
import Task from '../models/Task.js';
import { validationResult, body, query } from 'express-validator';

// ------------------- VALIDATION -------------------

// Validation rules for creating/updating tasks
export const validateTask = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('dueDate').optional().isISO8601().toDate().withMessage('Invalid date format'),
];

// Validation for query filters
export const validateFilters = [
  query('status').optional().isString().withMessage('Status must be a string'),
  query('dueDate').optional().isISO8601().toDate().withMessage('dueDate must be a valid date'),
];

// Middleware to check validation results
export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ------------------- CONTROLLERS -------------------

// CREATE TASK
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, reminderTime } = req.body;
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      reminderTime: reminderTime || null,
      user: req.user.id,
      status: 'pending',
    });

    console.log(`Task created: ${task._id} by user: ${req.user.id}`);
    return res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    console.error('Error creating task:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET ALL TASKS
export const getTasks = async (req, res) => {
  try {
    const { status, dueDate } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    if (dueDate) {
      const start = new Date(dueDate);
      const end = new Date(dueDate);
      end.setDate(end.getDate() + 1);
      query.dueDate = { $gte: start, $lt: end };
    }

    const tasks = await Task.find(query).sort({ dueDate: 1 });
    return res.status(200).json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE TASK
export const updateTask = async (req, res) => {
  try {
    const task = req.task; // from protectTaskOwnership
    const { title, description, status, dueDate, priority, reminderTime } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (reminderTime !== undefined) task.reminderTime = reminderTime;

    await task.save();
    console.log(`Task updated: ${task._id} by user: ${req.user.id}`);
    return res.status(200).json({ message: 'Task updated successfully', task });
  } catch (err) {
    console.error('Error updating task:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE SINGLE TASK
export const deleteTask = async (req, res) => {
  try {
    const task = req.task; // from protectTaskOwnership
    await task.deleteOne();
    console.log(`Task deleted: ${task._id} by user: ${req.user.id}`);
    return res.status(200).json({ message: 'Task deleted successfully', task });
  } catch (err) {
    console.error('Error deleting task:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// MARK TASK AS COMPLETE
export const markTaskComplete = async (req, res) => {
  try {
    const task = req.task; // from protectTaskOwnership
    task.status = 'completed';
    await task.save();
    console.log(`Task marked complete: ${task._id} by user: ${req.user.id}`);
    return res.status(200).json({ message: 'Task marked complete', task });
  } catch (err) {
    console.error('Error marking task complete:', err.message);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE ALL TASKS FOR LOGGED-IN USER
export const deleteAllTasks = async (req, res) => {
  try {
    const userId = req.user.id; // current logged-in user
    const result = await Task.deleteMany({ user: userId });
    console.log(`All tasks deleted for user: ${userId}`);
    return res.status(200).json({ message: `Deleted ${result.deletedCount} tasks` });
  } catch (err) {
    console.error('Error deleting all tasks:', err.message);
    return res.status(500).json({
       message: 'Server error',
        error: err.message
     });
  }
};