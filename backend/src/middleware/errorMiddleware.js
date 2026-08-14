import { errorResponse } from '../utils/response.js';

export const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err);
    
    // Database errors
    if (err.code === 'ER_DUP_ENTRY') {
        return errorResponse(res, 409, 'Duplicate entry');
    }
    if (err.code === 'ER_BAD_NULL_ERROR') {
        return errorResponse(res, 400, 'Required field is missing');
    }
    if (err.code === 'ER_NO_REFERENCED_ROW') {
        return errorResponse(res, 400, 'Referenced record does not exist');
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 401, 'Invalid token');
    }
    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token expired');
    }

    // Default error
    return errorResponse(res, 500, err.message || 'Internal server error');
};

export default errorMiddleware;