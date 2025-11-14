import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../middleware/error.js';
import {
  registerController,
  verifyEmailController,
  resendOtpController,
  loginController,
  logoutController,
  refreshController,
  meController,
  forgotPasswordController,
  resetPasswordController,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = Router();

const strictLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'พยายามมากเกินไป กรุณาลองใหม่อีกครั้งภายหลัง',
      code: 'RATE_LIMITED',
    },
  },
});

router.post('/register', strictLimiter, asyncHandler(registerController));
router.post('/verify-email', strictLimiter, asyncHandler(verifyEmailController));
router.post('/resend-otp', strictLimiter, asyncHandler(resendOtpController));
router.post('/login', strictLimiter, asyncHandler(loginController));
router.post('/logout', asyncHandler(logoutController));
router.post('/refresh', asyncHandler(refreshController));
router.get('/me', authenticate, asyncHandler(meController));
router.post('/forgot-password', strictLimiter, asyncHandler(forgotPasswordController));
router.post('/reset-password', strictLimiter, asyncHandler(resetPasswordController));

export default router;
