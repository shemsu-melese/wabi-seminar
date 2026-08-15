import meetingService from '../services/meetingService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class MeetingController {
    /**
     * Create a new meeting
     * POST /api/meetings
     */
    async createMeeting(req, res) {
        try {
            const userId = req.user.id;
            const meetingData = req.body;

            const meeting = await meetingService.createMeeting(userId, meetingData);

            return successResponse(res, 201, 'Meeting created successfully', meeting);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Get meeting details
     * GET /api/meetings/:id
     */
    async getMeeting(req, res) {
        try {
            const meetingId = parseInt(req.params.id);
            const userId = req.user.id;

            const meeting = await meetingService.getMeetingDetails(meetingId, userId);

            return successResponse(res, 200, 'Meeting details retrieved', meeting);
        } catch (error) {
            return errorResponse(res, 404, error.message);
        }
    }

    /**
     * Get meeting by code
     * GET /api/meetings/code/:code
     */
    async getMeetingByCode(req, res) {
        try {
            const { code } = req.params;
            const userId = req.user.id;

            // Find meeting by code
            const { default: meetingRepository } = await import('../repositories/meetingRepository.js');
            const meeting = await meetingRepository.findByCode(code);

            if (!meeting) {
                return errorResponse(res, 404, 'Meeting not found');
            }

            const meetingDetails = await meetingService.getMeetingDetails(meeting.id, userId);

            return successResponse(res, 200, 'Meeting details retrieved', meetingDetails);
        } catch (error) {
            return errorResponse(res, 404, error.message);
        }
    }

    /**
     * Join a meeting
     * POST /api/meetings/:id/join
     */
    async joinMeeting(req, res) {
        try {
            const userId = req.user.id;
            const meetingId = parseInt(req.params.id);
            const { password } = req.body;

            const meeting = await meetingService.joinMeeting(userId, meetingId, password);

            return successResponse(res, 200, 'Joined meeting successfully', meeting);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Leave a meeting
     * POST /api/meetings/:id/leave
     */
    async leaveMeeting(req, res) {
        try {
            const userId = req.user.id;
            const meetingId = parseInt(req.params.id);

            const result = await meetingService.leaveMeeting(userId, meetingId);

            return successResponse(res, 200, result.message);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Start a meeting
     * POST /api/meetings/:id/start
     */
    async startMeeting(req, res) {
        try {
            const userId = req.user.id;
            const meetingId = parseInt(req.params.id);

            const meeting = await meetingService.startMeeting(userId, meetingId);

            return successResponse(res, 200, 'Meeting started successfully', meeting);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * End a meeting
     * POST /api/meetings/:id/end
     */
    async endMeeting(req, res) {
        try {
            const userId = req.user.id;
            const meetingId = parseInt(req.params.id);

            const meeting = await meetingService.endMeeting(userId, meetingId);

            return successResponse(res, 200, 'Meeting ended successfully', meeting);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Get user's meetings
     * GET /api/meetings
     */
    async getUserMeetings(req, res) {
        try {
            const userId = req.user.id;
            const status = req.query.status || null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await meetingService.getUserMeetings(userId, status, page, limit);

            return successResponse(res, 200, 'Meetings retrieved successfully', result);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get upcoming meetings
     * GET /api/meetings/upcoming
     */
    async getUpcomingMeetings(req, res) {
        try {
            const userId = req.user.id;

            const meetings = await meetingService.getUpcomingMeetings(userId);

            return successResponse(res, 200, 'Upcoming meetings retrieved', meetings);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Update meeting
     * PUT /api/meetings/:id
     */
    async updateMeeting(req, res) {
        try {
            const userId = req.user.id;
            const meetingId = parseInt(req.params.id);
            const data = req.body;

            const meeting = await meetingService.updateMeeting(userId, meetingId, data);

            return successResponse(res, 200, 'Meeting updated successfully', meeting);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Delete meeting
     * DELETE /api/meetings/:id
     */
    async deleteMeeting(req, res) {
        try {
            const userId = req.user.id;
            const meetingId = parseInt(req.params.id);

            const result = await meetingService.deleteMeeting(userId, meetingId);

            return successResponse(res, 200, result.message);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Get meeting statistics
     * GET /api/meetings/stats
     */
    async getStats(req, res) {
        try {
            const userId = req.user.id;
            const stats = await meetingService.getMeetingStats(userId);

            return successResponse(res, 200, 'Statistics retrieved', stats);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get active meetings
     * GET /api/meetings/active
     */
    async getActiveMeetings(req, res) {
        try {
            const meetings = await meetingService.getActiveMeetings();

            return successResponse(res, 200, 'Active meetings retrieved', meetings);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default new MeetingController();