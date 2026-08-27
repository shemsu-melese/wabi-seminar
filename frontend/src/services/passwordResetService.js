import api from './api.js';

/**
 * Password Reset Service
 * Handles all password reset related API calls
 */
export const passwordResetService = {
    /**
     * Request password reset email
     * @param {string} email - User's email address
     * @returns {Promise} API response
     */
    requestReset: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Validate reset token
     * @param {string} token - Reset token from URL
     * @returns {Promise} API response
     */
    validateToken: async (token) => {
        const response = await api.get(`/auth/validate-reset-token?token=${token}`);
        return response.data;
    },

    /**
     * Check token validity (for frontend)
     * @param {string} token - Reset token from URL
     * @returns {Promise} API response
     */
    checkToken: async (token) => {
        const response = await api.get(`/auth/check-reset-token?token=${token}`);
        return response.data;
    },

    /**
     * Reset password using token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @param {string} confirmPassword - Confirmed password
     * @returns {Promise} API response
     */
    resetPassword: async (token, newPassword, confirmPassword) => {
        const response = await api.post('/auth/reset-password', {
            token,
            new_password: newPassword,
            confirm_password: confirmPassword
        });
        return response.data;
    },

    /**
     * Resend reset email
     * @param {string} email - User's email address
     * @returns {Promise} API response
     */
    resendResetEmail: async (email) => {
        const response = await api.post('/auth/resend-reset-email', { email });
        return response.data;
    }
};

export default passwordResetService;