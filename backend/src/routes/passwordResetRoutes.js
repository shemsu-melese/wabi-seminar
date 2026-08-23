import express from 'express';
import passwordResetController from '../controllers/passwordResetController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for password reset (prevents abuse)
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        success: false,
        message: 'Too many password reset requests. Please try again later.'
    }
});

// Public routes (no authentication required)
router.post('/forgot-password', resetLimiter, passwordResetController.forgotPassword);
router.get('/validate-reset-token', passwordResetController.validateResetToken);
router.post('/reset-password', passwordResetController.resetPassword);
router.get('/check-reset-token', passwordResetController.checkToken);
router.post('/resend-reset-email', resetLimiter, passwordResetController.resendResetEmail);

export default router;