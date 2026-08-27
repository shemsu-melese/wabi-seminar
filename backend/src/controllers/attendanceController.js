import attendanceService from '../services/attendanceService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class AttendanceController {
    async recordJoin(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const attendance = await attendanceService.recordJoin(meetingId, userId);
            return successResponse(res, 200, 'Attendance recorded', attendance);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async recordLeave(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const attendance = await attendanceService.recordLeave(meetingId, userId);
            return successResponse(res, 200, 'Leave recorded', attendance);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getMeetingAttendance(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const attendance = await attendanceService.getMeetingAttendance(meetingId, userId);
            return successResponse(res, 200, 'Attendance retrieved', attendance);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getAttendanceReport(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const report = await attendanceService.getAttendanceReport(meetingId, userId);
            return successResponse(res, 200, 'Attendance report generated', report);
        } catch (error) {
            return errorResponse(res, 403, error.message);
        }
    }

    async updateStatus(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const targetUserId = parseInt(req.params.userId);
            const { status } = req.body;
            const requesterId = req.user.id;

            const attendance = await attendanceService.updateStatus(meetingId, targetUserId, status, requesterId);
            return successResponse(res, 200, 'Status updated', attendance);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    async getUserAttendance(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const history = await attendanceService.getUserAttendance(userId, page, limit);
            return successResponse(res, 200, 'Attendance history retrieved', history);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default new AttendanceController();