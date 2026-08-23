import express from 'express';
import attendanceController from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Join meeting
router.post('/:meetingId/join', attendanceController.recordJoin);

// Leave meeting
router.post('/:meetingId/leave', attendanceController.recordLeave);

// Get meeting attendance
router.get('/:meetingId', attendanceController.getMeetingAttendance);

// Get attendance report
router.get('/:meetingId/report', attendanceController.getAttendanceReport);

// Export report (CSV)
router.get('/:meetingId/export', attendanceController.exportReport);

// Get user attendance history
router.get('/user/history', attendanceController.getUserAttendance);

// Update attendance status (host only)
router.put('/:meetingId/:userId/status', attendanceController.updateStatus);

export default router;