import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository.js';
import passwordResetRepository from '../repositories/passwordResetRepository.js';
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail } from '../utils/email.js';
import { validatePassword } from '../utils/validators.js';

class PasswordResetService {
    
    //  Request password reset
     
    async requestReset(email, req) {
        try {
            // Find user by email
            const user = await userRepository.findByEmail(email);
            
            // Security: Don't reveal if user exists
            if (!user) {
                return { 
                    success: true,
                    message: 'If an account exists with this email, a reset link will be sent' 
                };
            }

            // Check if user is active
            if (user.status !== 'active') {
                return {
                    success: false,
                    message: 'This account is not active. Please contact support.'
                };
            }

            // Generate token
            const token = passwordResetRepository.generateToken();
            const expiresAt = passwordResetRepository.getExpiryTime(1);

            // Store token in database
            await passwordResetRepository.create({
                user_id: user.id,
                token: token,
                expires_at: expiresAt
            });

            // Get client info for logging
            const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
            console.log(`🔐 Password reset requested for ${user.email} from ${ipAddress}`);

            // Send email with reset link (with error handling)
            try {
                await sendPasswordResetEmail(user.email, token, user.first_name);
            } catch (emailError) {
                console.error('Email error but continuing:', emailError.message);
                // Don't fail the request if email fails - token is still created
            }

            return {
                success: true,
                message: 'If an account exists with this email, a reset link will be sent'
            };
        } catch (error) {
            console.error('Password reset request error:', error);
            return {
                success: false,
                message: 'An error occurred processing your request. Please try again.'
            };
        }
    }

    //  Validate reset token
     
    async validateToken(token) {
        try {
            const isValid = await passwordResetRepository.isValid(token);
            if (!isValid) {
                throw new Error('Invalid or expired reset token');
            }

            const resetRecord = await passwordResetRepository.getTokenWithUser(token);
            if (!resetRecord) {
                throw new Error('Invalid reset token');
            }

            return {
                valid: true,
                email: resetRecord.email,
                user_id: resetRecord.user_id,
                first_name: resetRecord.first_name,
                expires_at: resetRecord.expires_at
            };
        } catch (error) {
            console.error('Token validation error:', error);
            throw error;
        }
    }

    //  Reset password using token
    async resetPassword(token, newPassword) {
        try {
            // Validate token
            const resetRecord = await passwordResetRepository.findByToken(token);
            if (!resetRecord) {
                throw new Error('Invalid reset token');
            }

            if (resetRecord.is_used) {
                throw new Error('This reset link has already been used');
            }

            if (new Date() > new Date(resetRecord.expires_at)) {
                throw new Error('This reset link has expired');
            }

            // Validate password strength
            if (!validatePassword(newPassword)) {
                throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
            }

            // Get user
            const user = await userRepository.findById(resetRecord.user_id);
            if (!user) {
                throw new Error('User not found');
            }

            // Check if user is active
            if (user.status !== 'active') {
                throw new Error('This account is not active. Please contact support.');
            }

            // Prevent using the same password
            const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
            if (isSamePassword) {
                throw new Error('New password must be different from your current password');
            }

            // Hash new password
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(newPassword, saltRounds);

            // Update user password
            await userRepository.updatePassword(resetRecord.user_id, password_hash);

            // Mark token as used
            await passwordResetRepository.markAsUsed(resetRecord.id);

            // Invalidate all other reset tokens for this user
            await passwordResetRepository.invalidateByUser(resetRecord.user_id);

            // Send confirmation email (don't fail if email fails)
            try {
                await sendPasswordResetSuccessEmail(user.email, user.first_name);
            } catch (emailError) {
                console.error('Success email error:', emailError.message);
            }

            return {
                success: true,
                message: 'Password reset successfully'
            };
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    }

    //   Check if token is still valid (for frontend validation)
     
    async checkToken(token) {
        try {
            await this.validateToken(token);
            return { 
                valid: true,
                message: 'Token is valid'
            };
        } catch (error) {
            return { 
                valid: false, 
                message: error.message 
            };
        }
    }

    //  Resend reset email
     
    async resendResetEmail(email, req) {
        try {
            const user = await userRepository.findByEmail(email);
            if (!user) {
                return {
                    success: false,
                    message: 'No account found with this email'
                };
            }

            // Generate new token
            const token = passwordResetRepository.generateToken();
            const expiresAt = passwordResetRepository.getExpiryTime(1);

            await passwordResetRepository.create({
                user_id: user.id,
                token: token,
                expires_at: expiresAt
            });

            try {
                await sendPasswordResetEmail(user.email, token, user.first_name);
            } catch (emailError) {
                console.error('Resend email error:', emailError.message);
            }

            return {
                success: true,
                message: 'Reset link resent successfully'
            };
        } catch (error) {
            console.error('Resend reset email error:', error);
            return {
                success: false,
                message: 'An error occurred. Please try again.'
            };
        }
    }

    //   Clean expired tokens 
     
    async cleanExpiredTokens() {
        try {
            const deletedCount = await passwordResetRepository.cleanExpired();
            console.log(`🧹 Cleaned ${deletedCount} expired password reset tokens`);
            return deletedCount;
        } catch (error) {
            console.error('Error cleaning expired tokens:', error);
            return 0;
        }
    }
}

export default new PasswordResetService();