import express from 'express';
import meetingController from '../controllers/meetingController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { 
    validateCreateMeeting,
    validateJoinMeeting,
    validateUpdateMeeting
} from '../validators/meetingValidator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// MEETING CRUD OPERATIONS

//  POST /api/meetings
//     Create a new meeting
//    Private
 
router.post('/', validateCreateMeeting, meetingController.createMeeting);

//  GET /api/meetings
//   Get user's meetings
//    Private
 
router.get('/', meetingController.getUserMeetings);

//  GET /api/meetings/upcoming
//  Get upcoming meetings
//   Private

router.get('/upcoming', meetingController.getUpcomingMeetings);

//  GET /api/meetings/active
//  Get active meetings
//  Private
 
router.get('/active', meetingController.getActiveMeetings);

// GET /api/meetings/stats
//   Get meeting statistics
//    Private
 
router.get('/stats', meetingController.getStats);

// GET /api/meetings/code/:code
//    Get meeting by code
//    Private
 
router.get('/code/:code', meetingController.getMeetingByCode);

//   GET /api/meetings/:id
//  Get meeting details
//   Private

router.get('/:id', meetingController.getMeeting);

//  PUT /api/meetings/:id
//  Update meeting
//  Private (Host only)
 
router.put('/:id', validateUpdateMeeting, meetingController.updateMeeting);

//  DELETE /api/meetings/:id
//   Delete meeting
// Private (Host only)
 
router.delete('/:id', meetingController.deleteMeeting);

// MEETING ACTIONS

//  POST /api/meetings/:id/join
//  Join a meeting
// Private
 
router.post('/:id/join', validateJoinMeeting, meetingController.joinMeeting);

//  POST /api/meetings/:id/leave
//   Leave a meeting
//  Private

router.post('/:id/leave', meetingController.leaveMeeting);

//  POST /api/meetings/:id/start
//  Start a meeting
//  Private (Host only)

router.post('/:id/start', meetingController.startMeeting);

//  POST /api/meetings/:id/end
//  End a meeting
//  Private (Host only)
 
router.post('/:id/end', meetingController.endMeeting);

export default router;