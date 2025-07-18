
import express from 'express';
import { register, login, getProfile, refreshToken, changePassword, logout, updateProfile } from '../controllers/auth.controller.js';
import { verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validation.js';
import { registerSchema, loginSchema, changePasswordSchema, updateProfileSchema } from '../middleware/validation.schemas.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerificationEmail);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/profile', auth, getProfile);
router.post('/refresh-token', refreshToken);
router.post('/change-password', auth, validate(changePasswordSchema), changePassword);
router.post('/logout', auth, logout);
router.patch('/profile', auth, validate(updateProfileSchema), updateProfile);

export default router;
