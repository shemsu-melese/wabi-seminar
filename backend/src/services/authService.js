import bcrypt from 'bcrypt';
import userRepository from '../repositories/userRepository.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';

class AuthService {
    /**
     * Register new user
     */
    async register(userData) {
        const { email, username, password, first_name, last_name, role } = userData;

        // Check if email exists
        const existingEmail = await userRepository.findByEmail(email);
        if (existingEmail) {
            throw new Error('Email already registered');
        }

        // Check if username exists
        const existingUsername = await userRepository.findByUsername(username);
        if (existingUsername) {
            throw new Error('Username already taken');
        }

        // Hash password (10 salt rounds)
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = await userRepository.create({
            email,
            username,
            password_hash,
            first_name,
            last_name,
            role: role || 'user'
        });

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        return {
            user,
            token,
            refreshToken
        };
    }

    /**
     * Login user
     */
    async login(email, password) {
        // Find user by email
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check if user is active
        if (user.status !== 'active') {
            throw new Error('Account is inactive. Please contact support.');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Update last login
        await userRepository.updateLastLogin(user.id);

        // Remove password from user object
        const { password_hash: _, ...userWithoutPassword } = user;

        // Generate tokens
        const token = generateToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        return {
            user: userWithoutPassword,
            token,
            refreshToken
        };
    }

    /**
     * Get user profile
     */
    async getProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, userData) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Check username uniqueness if changed
        if (userData.username && userData.username !== user.username) {
            const existingUser = await userRepository.findByUsername(userData.username);
            if (existingUser) {
                throw new Error('Username already taken');
            }
        }

        const updatedUser = await userRepository.update(userId, userData);
        return updatedUser;
    }

    /**
     * Change password
     */
    async changePassword(userId, currentPassword, newPassword) {
        // Get user with password
        const user = await userRepository.findByEmail(
            (await userRepository.findById(userId)).email
        );

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }

        // Prevent using same password
        const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
        if (isSamePassword) {
            throw new Error('New password must be different from current password');
        }

        // Hash new password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await userRepository.updatePassword(userId, password_hash);

        return { message: 'Password updated successfully' };
    }

    /**
     * Refresh token
     */
    async refreshToken(refreshToken) {
        try {
            const { verifyToken } = await import('../utils/generateToken.js');
            const decoded = verifyToken(refreshToken);
            
            if (!decoded) {
                throw new Error('Invalid refresh token');
            }

            const user = await userRepository.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }

            const newToken = generateToken(user.id);
            return { token: newToken };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    /**
     * Get user with stats
     */
    async getUserWithStats(userId) {
        const user = await this.getProfile(userId);
        const stats = await userRepository.getUserStats(userId);
        return { ...user, stats };
    }

    /**
     * Validate user credentials for login
     */
    async validateUser(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            return null;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return null;
        }

        return user;
    }

    /**
     * Get all users (admin only)
     */
    async getAllUsers(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const users = await userRepository.findAll(limit, offset);
        const total = await userRepository.count();
        
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Delete user (admin only)
     */
    async deleteUser(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await userRepository.delete(userId);
        return { message: 'User deleted successfully' };
    }
}

export default new AuthService();