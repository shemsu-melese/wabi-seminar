import analyticsService from '../services/analyticsService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class AnalyticsController {
    /**
     * Get meeting analytics
     * GET /api/analytics/meeting/:meetingId
     */
    async getMeetingAnalytics(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const analytics = await analyticsService.getMeetingAnalytics(meetingId, userId);
            return successResponse(res, 200, 'Meeting analytics retrieved', analytics);
        } catch (error) {
            return errorResponse(res, 403, error.message);
        }
    }

    /**
     * Get user analytics
     * GET /api/analytics/user
     */
    async getUserAnalytics(req, res) {
        try {
            const userId = req.user.id;

            const analytics = await analyticsService.getUserAnalytics(userId);
            return successResponse(res, 200, 'User analytics retrieved', analytics);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get platform analytics (admin only)
     * GET /api/analytics/platform
     */
    async getPlatformAnalytics(req, res) {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin') {
                return errorResponse(res, 403, 'Only admins can view platform analytics');
            }

            const { start_date, end_date } = req.query;
            const analytics = await analyticsService.getPlatformAnalytics(start_date, end_date);
            return successResponse(res, 200, 'Platform analytics retrieved', analytics);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get meeting trends
     * GET /api/analytics/trends
     */
    async getTrends(req, res) {
        try {
            const userId = req.user.id;
            const period = req.query.period || 'monthly';
            const limit = parseInt(req.query.limit) || 12;

            // Use the meeting trends from repository
            const { default: attendanceRepository } = await import('../repositories/attendanceRepository.js');
            const trends = await attendanceRepository.getMeetingTrends(period, limit);

            return successResponse(res, 200, 'Trends retrieved', trends);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get meeting statistics
     * GET /api/analytics/stats
     */
    async getStats(req, res) {
        try {
            const userId = req.user.id;
            
            // Get user's meeting stats
            const stats = await analyticsService.getUserAnalytics(userId);

            return successResponse(res, 200, 'Statistics retrieved', stats);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default new AnalyticsController();