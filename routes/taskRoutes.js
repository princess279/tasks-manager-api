import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { protectTaskOwnership } from '../middleware/protectTaskOwnership.js';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

// -------------------- TASK ROUTES --------------------

// CREATE TASK
router.post(
  '/',
  protect,
  taskController.validateTask,
  taskController.checkValidation,
  taskController.createTask
);

// GET TASKS
router.get(
  '/',
  protect,
  taskController.validateFilters,
  taskController.checkValidation,
  taskController.getTasks
);

// DELETE ALL TASKS (must be ABOVE /:id)
router.delete(
  '/all',
  protect,
  taskController.deleteAllTasks
);

// UPDATE TASK (including reminder updates)
router.put(
  '/:id',
  protect,
  protectTaskOwnership,
  taskController.updateTask
);

// -------------------- REMINDER-SPECIFIC ROUTE --------------------
// Optional route to update just the reminder fields
router.put(
  '/:id/reminder',
  protect,
  protectTaskOwnership,
  async (req, res, next) => {
    // Only allow reminderTime and dailyReminder updates
    req.body = {
      dailyReminder: req.body.dailyReminder,
      reminderTime: req.body.reminderTime,
    };
    return taskController.updateTask(req, res, next);
  }
);

// DELETE ONE TASK
router.delete(
  '/:id',
  protect,
  protectTaskOwnership,
  taskController.deleteTask
);

// MARK TASK COMPLETE
router.patch(
  '/:id/complete',
  protect,
  protectTaskOwnership,
  taskController.markTaskComplete
);

export default router;