import api from './api.js';

export const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Login user
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    // Get current user profile
    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Update user profile
    updateProfile: async (data) => {
        const response = await api.put('/auth/profile', data);
        return response.data;
    },

    // Change password
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/change-password', {
            current_password: currentPassword,
            new_password: newPassword
        });
        return response.data;
    },

    // Logout
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    // Refresh token
    refreshToken: async (refreshToken) => {
        const response = await api.post('/auth/refresh-token', { refresh_token: refreshToken });
        return response.data;
    },

    // Check authentication status
    checkAuth: async () => {
        const response = await api.get('/auth/check');
        return response.data;
    }
};

export default authService;