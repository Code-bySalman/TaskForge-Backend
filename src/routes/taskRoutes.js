import express from 'express';
import { body } from 'express-validator';
import {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/projects/:projectId/tasks',
  authenticate,
  [body('title', 'Task title is required').notEmpty()],
  createTask
);

router.get('/projects/:projectId/tasks', authenticate, getProjectTasks);

router.put('/:taskId', authenticate, updateTask);

router.delete('/:taskId', authenticate, deleteTask);

router.get('/stats/dashboard', authenticate, getDashboardStats);

export default router;
