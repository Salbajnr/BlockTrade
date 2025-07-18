
import express from 'express';
import { body } from 'express-validator';
import { requestReset, resetPassword } from '../controllers/passwordReset.controller.js';
import { validate } from '../middleware/validation.middleware.js';

const router = express.Router();

// Request password reset
router.post(
  '/request',
  [
    body('email').isEmail().normalizeEmail(),
    validate
  ],
  requestReset
);

// Reset password with token
router.post(
  '/confirm',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 }),
    validate
  ],
  resetPassword
);

export default router;
