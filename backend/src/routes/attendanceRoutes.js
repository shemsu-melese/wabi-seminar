import express from 'express';
import attendanceController from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/:meetingId/join', attendanceController.recordJoin);
router.post('/:meetingId/leave', attendanceController.recordLeave);
router.get('/:meetingId', attendanceController.getMeetingAttendance);
router.get('/:meetingId/report', attendanceController.getAttendanceReport);
router.put('/:meetingId/:userId/status', attendanceController.updateStatus);
router.get('/user/history', attendanceController.getUserAttendance);

export default router;