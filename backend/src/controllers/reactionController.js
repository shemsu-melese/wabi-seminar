import reactionService from '../services/reactionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class ReactionController {
    /**
     * Toggle reaction
     * POST /api/reactions/:meetingId
     */
    async toggleReaction(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;
            const { emoji, message_id } = req.body;

            if (!emoji) {
                return errorResponse(res, 400, 'Emoji is required');
            }

            const result = await reactionService.toggleReaction(
                meetingId,
                userId,
                emoji,
                message_id || null
            );

            const message = result.removed ? 'Reaction removed' : 'Reaction added';
            return successResponse(res, 200, message, result);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Get meeting reactions
     * GET /api/reactions/:meetingId
     */
    async getMeetingReactions(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const reactions = await reactionService.getMeetingReactions(meetingId, userId);

            return successResponse(res, 200, 'Reactions retrieved', reactions);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Get reaction counts
     * GET /api/reactions/:meetingId/counts
     */
    async getReactionCounts(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const counts = await reactionService.getReactionCounts(meetingId, userId);

            return successResponse(res, 200, 'Reaction counts retrieved', counts);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Remove reaction
     * DELETE /api/reactions/:reactionId
     */
    async removeReaction(req, res) {
        try {
            const reactionId = parseInt(req.params.reactionId);
            const userId = req.user.id;

            await reactionService.removeReaction(reactionId, userId);

            return successResponse(res, 200, 'Reaction removed');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

export default new ReactionController();