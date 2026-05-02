import express from 'express';
import { body } from 'express-validator';
import { createUser, getAllUsers, getUserById } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  roleCheck(['admin']),
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  createUser
);

router.get('/', authenticate, roleCheck(['admin']), getAllUsers);

router.get('/:userId', authenticate, roleCheck(['admin']), getUserById);

export default router;
