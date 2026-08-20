import attendanceService from '../services/attendanceService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class AttendanceController {

    //   Record user joining meeting
    //   POST /api/attendance/:meetingId/join
     
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

    //   Record user leaving meeting
    //   POST /api/attendance/:meetingId/leave
     
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

    //   Get meeting attendance
    //   GET /api/attendance/:meetingId
     
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

    //   Get attendance report
    //   GET /api/attendance/:meetingId/report
     
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

    
    //   Export attendance report
    //  GET /api/attendance/:meetingId/export
     
    async exportReport(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;
            const format = req.query.format || 'csv';

            // Get report data
            const report = await attendanceService.getAttendanceReport(meetingId, userId);
            
            if (format === 'csv') {
                const csv = await attendanceService.exportMeetingReport(meetingId, userId, 'csv');
                
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${meetingId}.csv`);
                return res.send(csv);
            }

            return successResponse(res, 200, 'Report exported', report);
        } catch (error) {
            return errorResponse(res, 403, error.message);
        }
    }

    //   Get user attendance history
    //  GET /api/attendance/user/history
     
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

    //   Update attendance status
    //   PUT /api/attendance/:meetingId/:userId/status
     
    async updateStatus(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const targetUserId = parseInt(req.params.userId);
            const { status } = req.body;
            const requesterId = req.user.id;

            const attendance = await attendanceService.updateStatus(
                meetingId, 
                targetUserId, 
                status, 
                requesterId
            );

            return successResponse(res, 200, 'Status updated', attendance);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

export default new AttendanceController();