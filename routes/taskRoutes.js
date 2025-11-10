import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { protectTaskOwnership } from '../middleware/protectTaskOwnership.js';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

// CREATE TASK 
router.post(
  '/',
  authMiddleware,
  taskController.validateTask,
  taskController.checkValidation,
  taskController.createTask
);

// GET TASKS
router.get(
  '/',
  authMiddleware,
  taskController.validateFilters,
  taskController.checkValidation,
  taskController.getTasks
);

// UPDATE TASK 
router.put('/:id', authMiddleware, protectTaskOwnership, taskController.updateTask);

// DELETE TASK 
router.delete('/:id', authMiddleware, protectTaskOwnership, taskController.deleteTask);

// MARK TASK COMPLETE 
router.patch('/:id/complete', authMiddleware, protectTaskOwnership, taskController.markTaskComplete);

export default router;