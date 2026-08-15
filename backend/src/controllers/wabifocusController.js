import wabifocusService from '../services/wabifocusService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class WabiFocusController {
    /**
     * Create WabiFocus item
     * POST /api/wabifocus/:meetingId
     */
    async createItem(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;
            const { type, title, description, assigned_to, due_date, priority } = req.body;

            if (!type || !title) {
                return errorResponse(res, 400, 'Type and title are required');
            }

            const item = await wabifocusService.createItem(meetingId, userId, {
                type,
                title,
                description,
                assigned_to,
                due_date,
                priority
            });

            return successResponse(res, 201, 'WabiFocus item created', item);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Get meeting items
     * GET /api/wabifocus/:meetingId
     */
    async getMeetingItems(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const items = await wabifocusService.getMeetingItems(meetingId, userId);
            return successResponse(res, 200, 'WabiFocus items retrieved', items);
        } catch (error) {
            return errorResponse(res, 403, error.message);
        }
    }

    /**
     * Get items by type
     * GET /api/wabifocus/:meetingId/type/:type
     */
    async getItemsByType(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const { type } = req.params;
            const userId = req.user.id;

            const items = await wabifocusService.getItemsByType(meetingId, userId, type);
            return successResponse(res, 200, 'Items retrieved', items);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Get action items for meeting
     * GET /api/wabifocus/:meetingId/actions
     */
    async getActionItems(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const items = await wabifocusService.getActionItems(meetingId, userId);
            return successResponse(res, 200, 'Action items retrieved', items);
        } catch (error) {
            return errorResponse(res, 403, error.message);
        }
    }

    /**
     * Get my assigned action items
     * GET /api/wabifocus/my-actions
     */
    async getMyActionItems(req, res) {
        try {
            const userId = req.user.id;

            const items = await wabifocusService.getMyActionItems(userId);
            return successResponse(res, 200, 'Your action items retrieved', items);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get upcoming action items
     * GET /api/wabifocus/upcoming-actions
     */
    async getUpcomingActionItems(req, res) {
        try {
            const userId = req.user.id;
            const days = parseInt(req.query.days) || 7;

            const items = await wabifocusService.getUpcomingActionItems(userId, days);
            return successResponse(res, 200, 'Upcoming action items retrieved', items);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Update item
     * PUT /api/wabifocus/:itemId
     */
    async updateItem(req, res) {
        try {
            const itemId = parseInt(req.params.itemId);
            const userId = req.user.id;
            const { title, description, assigned_to, due_date, priority, is_completed } = req.body;

            const item = await wabifocusService.updateItem(itemId, userId, {
                title,
                description,
                assigned_to,
                due_date,
                priority,
                is_completed
            });

            return successResponse(res, 200, 'Item updated', item);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Complete action item
     * POST /api/wabifocus/:itemId/complete
     */
    async completeActionItem(req, res) {
        try {
            const itemId = parseInt(req.params.itemId);
            const userId = req.user.id;

            const item = await wabifocusService.completeActionItem(itemId, userId);
            return successResponse(res, 200, 'Action item completed', item);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Reorder items
     * PUT /api/wabifocus/:meetingId/reorder
     */
    async reorderItems(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;
            const { type, item_ids } = req.body;

            if (!type || !item_ids || !Array.isArray(item_ids)) {
                return errorResponse(res, 400, 'Type and item_ids array are required');
            }

            await wabifocusService.reorderItems(meetingId, userId, type, item_ids);
            return successResponse(res, 200, 'Items reordered successfully');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Delete item
     * DELETE /api/wabifocus/:itemId
     */
    async deleteItem(req, res) {
        try {
            const itemId = parseInt(req.params.itemId);
            const userId = req.user.id;

            await wabifocusService.deleteItem(itemId, userId);
            return successResponse(res, 200, 'Item deleted');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Get WabiFocus summary
     * GET /api/wabifocus/:meetingId/summary
     */
    async getSummary(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const summary = await wabifocusService.getSummary(meetingId, userId);
            return successResponse(res, 200, 'Summary retrieved', summary);
        } catch (error) {
            return errorResponse(res, 403, error.message);
        }
    }

    /**
     * Get meeting outcome
     * GET /api/wabifocus/:meetingId/outcome
     */
    async getMeetingOutcome(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const outcome = await wabifocusService.getMeetingOutcome(meetingId, userId);
            return successResponse(res, 200, 'Meeting outcome retrieved', outcome);
        } catch (error) {
            return errorResponse(res, 403, error.message);
        }
    }

    /**
     * Get complete meeting summary
     * GET /api/wabifocus/:meetingId/summary/full
     */
    async getFullSummary(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const summary = await wabifocusService.getMeetingSummary(meetingId, userId);
            return successResponse(res, 200, 'Full meeting summary retrieved', summary);
        } catch (error) {
            return errorResponse(res, 403, error.message);
        }
    }
}

export default new WabiFocusController();