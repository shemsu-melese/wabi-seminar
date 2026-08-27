import rateLimit from 'express-rate-limit';
import config from '../config/environment.js';

const limiter = rateLimit({
    windowMs: config.rateLimit.window || 900000, // 15 minutes
    max: config.rateLimit.max || 100, // Default 100 requests per window
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // ✅ Skip rate limiting for authentication routes
    skip: (req) => {
        // List of auth paths to bypass
        const authPaths = [
            '/auth/register',
            '/auth/login',
            '/auth/forgot-password',
            '/auth/reset-password',
            '/auth/refresh-token'
        ];
        return authPaths.some(path => req.path.includes(path));
    }
});

export default limiter;