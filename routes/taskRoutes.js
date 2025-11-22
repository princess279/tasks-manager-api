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

export default router;