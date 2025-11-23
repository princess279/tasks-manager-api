// routes/taskRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { protectTaskOwnership } from '../middleware/protectTaskOwnership.js';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

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

// UPDATE TASK
router.put(
  '/:id',
  protect,
  protectTaskOwnership,
  taskController.updateTask
);

// DELETE TASK
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

// DELETE ALL TASKS FOR LOGGED-IN USER
router.delete('/all', protect, async (req, res) => {
  try {
    const result = await taskController.deleteAllTasks(req.user.id);
    res.status(200).json({ message: `Deleted ${result.deletedCount} tasks` });
  } catch (err) {
    console.error('Error deleting all tasks:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;