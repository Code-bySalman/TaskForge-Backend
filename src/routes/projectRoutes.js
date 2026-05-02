import express from 'express';
import { body } from 'express-validator';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  roleCheck(['admin']),
  [body('name', 'Project name is required').notEmpty()],
  createProject
);

router.get('/', authenticate, getProjects);

router.get('/:projectId', authenticate, getProjectById);

router.put(
  '/:projectId',
  authenticate,
  roleCheck(['admin']),
  [body('name', 'Project name is required').notEmpty()],
  updateProject
);

router.delete('/:projectId', authenticate, roleCheck(['admin']), deleteProject);

router.post('/:projectId/members', authenticate, roleCheck(['admin']), addMember);

router.delete('/:projectId/members/:memberId', authenticate, roleCheck(['admin']), removeMember);

export default router;
