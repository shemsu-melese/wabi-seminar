import express from 'express';
import attendanceController from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// POST /api/attendance/:meetingId/join
router.post('/:meetingId/join', attendanceController.recordJoin);

// POST /api/attendance/:meetingId/leave
router.post('/:meetingId/leave', attendanceController.recordLeave);

// GET /api/attendance/:meetingId
router.get('/:meetingId', attendanceController.getMeetingAttendance);

// GET /api/attendance/:meetingId/report
router.get('/:meetingId/report', attendanceController.getAttendanceReport);

// GET /api/attendance/user
router.get('/user', attendanceController.getUserAttendance);

// PUT /api/attendance/:meetingId/:userId/status
router.put('/:meetingId/:userId/status', attendanceController.updateStatus);

export default router;