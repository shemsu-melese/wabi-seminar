import rateLimit from 'express-rate-limit';
import config from '../config/environment.js';

const limiter = rateLimit({
    windowMs: config.rateLimit.window,
    max: config.rateLimit.max,
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export default limiter;