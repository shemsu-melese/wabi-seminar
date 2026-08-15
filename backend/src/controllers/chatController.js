import chatService from '../services/chatService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class ChatController {
    /**
     * Send message
     * POST /api/chat/:meetingId
     */
    async sendMessage(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;
            const { content, message_type, parent_message_id } = req.body;

            if (!content || content.trim() === '') {
                return errorResponse(res, 400, 'Message content is required');
            }

            const message = await chatService.sendMessage(
                meetingId,
                userId,
                content.trim(),
                message_type || 'text',
                parent_message_id || null
            );

            return successResponse(res, 201, 'Message sent', message);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Get meeting messages
     * GET /api/chat/:meetingId
     */
    async getMessages(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 50;
            const page = parseInt(req.query.page) || 1;

            const result = await chatService.getMeetingMessages(meetingId, userId, limit, page);

            return successResponse(res, 200, 'Messages retrieved', result);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Delete message
     * DELETE /api/chat/:messageId
     */
    async deleteMessage(req, res) {
        try {
            const messageId = parseInt(req.params.messageId);
            const userId = req.user.id;

            await chatService.deleteMessage(messageId, userId);

            return successResponse(res, 200, 'Message deleted');
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Pin message
     * POST /api/chat/:messageId/pin
     */
    async pinMessage(req, res) {
        try {
            const messageId = parseInt(req.params.messageId);
            const userId = req.user.id;

            const message = await chatService.pinMessage(messageId, userId);

            return successResponse(res, 200, 'Message pinned', message);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Unpin message
     * POST /api/chat/:messageId/unpin
     */
    async unpinMessage(req, res) {
        try {
            const messageId = parseInt(req.params.messageId);

            const message = await chatService.unpinMessage(messageId);

            return successResponse(res, 200, 'Message unpinned', message);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Get pinned messages
     * GET /api/chat/:meetingId/pinned
     */
    async getPinnedMessages(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const messages = await chatService.getPinnedMessages(meetingId, userId);

            return successResponse(res, 200, 'Pinned messages retrieved', messages);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }
}

export default new ChatController();