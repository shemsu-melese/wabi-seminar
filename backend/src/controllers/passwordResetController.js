import passwordResetService from '../services/passwordResetService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class PasswordResetController {
    
    //   Request password reset
    //   POST /api/auth/forgot-password
     
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return errorResponse(res, 400, 'Email is required');
            }

            // Validate email format
            const { validateEmail } = await import('../utils/validators.js');
            if (!validateEmail(email)) {
                return errorResponse(res, 400, 'Invalid email format');
            }

            const result = await passwordResetService.requestReset(email, req);
            
            if (!result.success) {
                return errorResponse(res, 400, result.message);
            }

            return successResponse(res, 200, result.message);
        } catch (error) {
            console.error('Forgot password error:', error);
            // Return a user-friendly message
            return successResponse(res, 200, 'If an account exists with this email, a reset link will be sent');
        }
    }

    //   Validate reset token
    //   GET /api/auth/validate-reset-token?token=abc123
     
    async validateResetToken(req, res) {
        try {
            const { token } = req.query;

            if (!token) {
                return errorResponse(res, 400, 'Token is required');
            }

            const result = await passwordResetService.validateToken(token);
            return successResponse(res, 200, 'Token is valid', result);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    //   Reset password
    //   POST /api/auth/reset-password
     
    async resetPassword(req, res) {
        try {
            const { token, new_password, confirm_password } = req.body;

            if (!token) {
                return errorResponse(res, 400, 'Token is required');
            }

            if (!new_password) {
                return errorResponse(res, 400, 'New password is required');
            }

            if (new_password !== confirm_password) {
                return errorResponse(res, 400, 'Passwords do not match');
            }

            const result = await passwordResetService.resetPassword(token, new_password);
            return successResponse(res, 200, result.message);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    //   Check token validity (for frontend)
    //   GET /api/auth/check-reset-token?token=abc123
     
    async checkToken(req, res) {
        try {
            const { token } = req.query;

            if (!token) {
                return errorResponse(res, 400, 'Token is required');
            }

            const result = await passwordResetService.checkToken(token);
            return successResponse(res, 200, 'Token check completed', result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    //   Resend reset email
    //   POST /api/auth/resend-reset-email
    async resendResetEmail(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return errorResponse(res, 400, 'Email is required');
            }

            const result = await passwordResetService.resendResetEmail(email, req);
            
            if (!result.success) {
                return errorResponse(res, 400, result.message);
            }

            return successResponse(res, 200, result.message);
        } catch (error) {
            console.error('Resend reset email error:', error);
            return errorResponse(res, 500, 'An error occurred. Please try again.');
        }
    }
}

export default new PasswordResetController();