import authService from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';
class AuthController {
    // Register new user
    // POST /api/auth/register
     
    async register(req, res) {
        try {
            const { email, password, first_name, last_name, role } = req.body;
            
            const result = await authService.register({
                email,
                password,
                first_name,
                last_name,
                role
            });

            return successResponse(res, 201, 'User registered successfully', result);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    // Login user
    // POST /api/auth/login

    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            const result = await authService.login(email, password);

            return successResponse(res, 200, 'Login successful', result);
        } catch (error) {
            return errorResponse(res, 401, error.message);
        }
    }

    //  Get current user profile
    //  GET /api/auth/me
     
    async getMe(req, res) {
        try {
            const userId = req.user.id;
            const user = await authService.getProfile(userId);

            return successResponse(res, 200, 'User profile retrieved', user);
        } catch (error) {
            return errorResponse(res, 404, error.message);
        }
    }

    //  Get user profile with stats
    //  GET /api/auth/me/stats
     
    async getMeWithStats(req, res) {
        try {
            const userId = req.user.id;
            const userWithStats = await authService.getUserWithStats(userId);

            return successResponse(res, 200, 'User profile with stats retrieved', userWithStats);
        } catch (error) {
            return errorResponse(res, 404, error.message);
        }
    }

    //  Update user profile
    //  PUT /api/auth/profile
     
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { first_name, last_name } = req.body;

            const user = await authService.updateProfile(userId, {
                first_name,
                last_name
            });

            return successResponse(res, 200, 'Profile updated successfully', user);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    //  Change password
    //  PUT /api/auth/change-password
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { current_password, new_password } = req.body;

            const result = await authService.changePassword(
                userId, 
                current_password, 
                new_password
            );

            return successResponse(res, 200, result.message);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    //  Refresh token
    //  POST /api/auth/refresh-token
    async refreshToken(req, res) {
        try {
            const { refresh_token } = req.body;

            if (!refresh_token) {
                return errorResponse(res, 400, 'Refresh token is required');
            }

            const result = await authService.refreshToken(refresh_token);

            return successResponse(res, 200, 'Token refreshed successfully', result);
        } catch (error) {
            return errorResponse(res, 401, error.message);
        }
    }

    //   Logout
    //  POST /api/auth/logout
    async logout(req, res) {
        try {
            return successResponse(res, 200, 'Logout successful');
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    //  Check authentication status
    //  GET /api/auth/check
    async checkAuth(req, res) {
        try {
            const userId = req.user.id;
            const user = await authService.getProfile(userId);

            return successResponse(res, 200, 'Authenticated', { 
                isAuthenticated: true, 
                user 
            });
        } catch (error) {
            return errorResponse(res, 401, 'Not authenticated');
        }
    }

    //  Get all users (admin only)
    //  GET /api/auth/users
     
    async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await authService.getAllUsers(page, limit);

            return successResponse(res, 200, 'Users retrieved successfully', result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    //  Delete user (admin only)
    //  DELETE /api/auth/users/:id
    async deleteUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            
            if (userId === req.user.id) {
                return errorResponse(res, 400, 'You cannot delete your own account');
            }

            const result = await authService.deleteUser(userId);

            return successResponse(res, 200, result.message);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    //  Search users (admin only)
    //  GET /api/auth/users/search
    async searchUsers(req, res) {
        try {
            const { q } = req.query;
            
            if (!q || q.trim().length < 2) {
                return errorResponse(res, 400, 'Search term must be at least 2 characters');
            }

            const users = await authService.searchUsers(q);

            return successResponse(res, 200, 'Users found', users);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

export default new AuthController();