import jwt from 'jsonwebtoken';
import userRepository from '../repositories/userRepository.js';
import config from '../config/environment.js';
import { errorResponse } from '../utils/response.js';

//   Authenticate user via JWT token

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

//   Authorize user by role

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

//   Optional authentication (doesn't require token)

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
                            first_name: user.first_name,
                            last_name: user.last_name
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