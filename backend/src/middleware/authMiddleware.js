import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';
import config from '../config/environment.js';
import { errorResponse } from '../utils/response.js';

/**
 * Authenticate user via JWT token
 */
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return errorResponse(res, 401, 'Authentication required. Please login.');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return errorResponse(res, 401, 'Invalid token format. Use: Bearer <token>');
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await userRepository.findById(decoded.userId);

        if (!user) {
            return errorResponse(res, 401, 'User not found');
        }

        if (user.status !== 'active') {
            return errorResponse(res, 401, 'Account is inactive. Please contact support.');
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 401, 'Invalid token');
        }
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 401, 'Token expired. Please login again.');
        }
        console.error('Auth middleware error:', error);
        return errorResponse(res, 500, 'Authentication error');
    }
};

/**
 * Authorize user by role
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, 'Unauthorized');
        }

        if (!roles.includes(req.user.role)) {
            return errorResponse(res, 403, 'Insufficient permissions. Required role: ' + roles.join(' or '));
        }

        next();
    };
};

/**
 * Check if user is host (meeting specific)
 */
export const isHost = async (req, res, next) => {
    try {
        const { meetingId } = req.params;
        const userId = req.user.id;
        const { pool } = await import('../config/database.js');

        const [rows] = await pool.execute(
            'SELECT * FROM meeting_participants WHERE meeting_id = ? AND user_id = ? AND role = "host"',
            [meetingId, userId]
        );

        if (rows.length === 0) {
            return errorResponse(res, 403, 'Only meeting hosts can perform this action');
        }

        req.isHost = true;
        next();
    } catch (error) {
        return errorResponse(res, 500, 'Error checking host status');
    }
};

/**
 * Optional authentication (doesn't require token)
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, config.jwt.secret);
                    const user = await userRepository.findById(decoded.userId);
                    if (user && user.status === 'active') {
                        req.user = {
                            id: user.id,
                            email: user.email,
                            role: user.role,
                            username: user.username
                        };
                    }
                } catch (error) {
                    // Token invalid, continue without user
                }
            }
        }
        
        next();
    } catch (error) {
        // Continue without user
        next();
    }
};