import attendanceService from '../services/attendanceService.js';
import participantService from '../services/participantService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class AttendanceController {
    /**
     * Record user joining meeting
     * POST /api/attendance/:meetingId/join
     */
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

    /**
     * Record user leaving meeting
     * POST /api/attendance/:meetingId/leave
     */
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

    /**
     * Get meeting attendance
     * GET /api/attendance/:meetingId
     */
    async getMeetingAttendance(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            // Check access
            const isParticipant = await participantService.isParticipant(meetingId, userId);
            const isCreator = await this.isMeetingCreator(meetingId, userId);
            
            if (!isParticipant && !isCreator) {
                return errorResponse(res, 403, 'You do not have access to this meeting');
            }

            const attendance = await attendanceService.getMeetingAttendance(meetingId);
            return successResponse(res, 200, 'Attendance retrieved', attendance);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get attendance report
     * GET /api/attendance/:meetingId/report
     */
    async getAttendanceReport(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            // Only host or admin can view report
            const isHost = await participantService.isHost(meetingId, userId);
            const isCreator = await this.isMeetingCreator(meetingId, userId);
            
            if (!isHost && !isCreator && req.user.role !== 'admin') {
                return errorResponse(res, 403, 'Only hosts can view attendance report');
            }

            const report = await attendanceService.getAttendanceReport(meetingId);
            return successResponse(res, 200, 'Attendance report generated', report);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get user attendance history
     * GET /api/attendance/user
     */
    async getUserAttendance(req, res) {
        try {
            const userId = req.user.id;

            const history = await attendanceService.getUserAttendance(userId);
            return successResponse(res, 200, 'Attendance history retrieved', history);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Update attendance status
     * PUT /api/attendance/:meetingId/:userId/status
     */
    async updateStatus(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const targetUserId = parseInt(req.params.userId);
            const { status } = req.body;
            const userId = req.user.id;

            // Only host or admin can update status
            const isHost = await participantService.isHost(meetingId, userId);
            if (!isHost && req.user.role !== 'admin') {
                return errorResponse(res, 403, 'Only hosts can update attendance status');
            }

            const attendance = await attendanceService.updateStatus(meetingId, targetUserId, status);
            return successResponse(res, 200, 'Status updated', attendance);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Helper: Check if user is meeting creator
     */
    async isMeetingCreator(meetingId, userId) {
        const { default: meetingRepository } = await import('../repositories/meetingRepository.js');
        const meeting = await meetingRepository.findById(meetingId);
        return meeting && meeting.created_by === userId;
    }
}

export default new AttendanceController();