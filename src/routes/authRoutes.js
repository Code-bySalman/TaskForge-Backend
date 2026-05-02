import express from 'express';
import { body } from 'express-validator';
import { signup, login, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/signup',
  [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  signup
);

router.post(
  '/login',
  [body('email', 'Invalid email').isEmail(), body('password', 'Password is required').notEmpty()],
  login
);

router.get('/profile', authenticate, getProfile);

export default router;
