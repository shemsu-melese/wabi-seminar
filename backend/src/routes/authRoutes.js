import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { 
    validateRegister, 
    validateLogin, 
    validateChangePassword,
    validateRefreshToken,
    validateProfileUpdate
} from '../validators/authValidator.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Public
 */
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   GET /api/auth/me/stats
 * @desc    Get current user profile with statistics
 * @access  Private
 */
router.get('/me/stats', authenticate, authController.getMeWithStats);

/**
 * @route   GET /api/auth/check
 * @desc    Check authentication status
 * @access  Private
 */
router.get('/check', authenticate, authController.checkAuth);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, validateProfileUpdate, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, validateChangePassword, authController.changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

// ============================================
// ADMIN ROUTES (Admin only)
// ============================================

/**
 * @route   GET /api/auth/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/users', authenticate, authorize('admin'), authController.getAllUsers);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete a user
 * @access  Admin only
 */
router.delete('/users/:id', authenticate, authorize('admin'), authController.deleteUser);

export default router;