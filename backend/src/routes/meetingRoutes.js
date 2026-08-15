import express from 'express';
import meetingController from '../controllers/meetingController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { 
    validateCreateMeeting,
    validateJoinMeeting,
    validateUpdateMeeting
} from '../validators/meetingValidator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// MEETING CRUD OPERATIONS
// ============================================

/**
 * @route   POST /api/meetings
 * @desc    Create a new meeting
 * @access  Private
 */
router.post('/', validateCreateMeeting, meetingController.createMeeting);

/**
 * @route   GET /api/meetings
 * @desc    Get user's meetings
 * @access  Private
 */
router.get('/', meetingController.getUserMeetings);

/**
 * @route   GET /api/meetings/upcoming
 * @desc    Get upcoming meetings
 * @access  Private
 */
router.get('/upcoming', meetingController.getUpcomingMeetings);

/**
 * @route   GET /api/meetings/active
 * @desc    Get active meetings
 * @access  Private
 */
router.get('/active', meetingController.getActiveMeetings);

/**
 * @route   GET /api/meetings/stats
 * @desc    Get meeting statistics
 * @access  Private
 */
router.get('/stats', meetingController.getStats);

/**
 * @route   GET /api/meetings/code/:code
 * @desc    Get meeting by code
 * @access  Private
 */
router.get('/code/:code', meetingController.getMeetingByCode);

/**
 * @route   GET /api/meetings/:id
 * @desc    Get meeting details
 * @access  Private
 */
router.get('/:id', meetingController.getMeeting);

/**
 * @route   PUT /api/meetings/:id
 * @desc    Update meeting
 * @access  Private (Host only)
 */
router.put('/:id', validateUpdateMeeting, meetingController.updateMeeting);

/**
 * @route   DELETE /api/meetings/:id
 * @desc    Delete meeting
 * @access  Private (Host only)
 */
router.delete('/:id', meetingController.deleteMeeting);

// ============================================
// MEETING ACTIONS
// ============================================

/**
 * @route   POST /api/meetings/:id/join
 * @desc    Join a meeting
 * @access  Private
 */
router.post('/:id/join', validateJoinMeeting, meetingController.joinMeeting);

/**
 * @route   POST /api/meetings/:id/leave
 * @desc    Leave a meeting
 * @access  Private
 */
router.post('/:id/leave', meetingController.leaveMeeting);

/**
 * @route   POST /api/meetings/:id/start
 * @desc    Start a meeting
 * @access  Private (Host only)
 */
router.post('/:id/start', meetingController.startMeeting);

/**
 * @route   POST /api/meetings/:id/end
 * @desc    End a meeting
 * @access  Private (Host only)
 */
router.post('/:id/end', meetingController.endMeeting);

export default router;