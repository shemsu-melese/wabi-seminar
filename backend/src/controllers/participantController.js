import participantService from '../services/participantService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class ParticipantController {
    /**
     * Get meeting participants
     * GET /api/participants/:meetingId
     */
    async getMeetingParticipants(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            // Check if user has access to this meeting
            const isParticipant = await participantService.isParticipant(meetingId, userId);
            const isCreator = await this.isMeetingCreator(meetingId, userId);
            
            if (!isParticipant && !isCreator) {
                return errorResponse(res, 403, 'You do not have access to this meeting');
            }

            const participants = await participantService.getMeetingParticipants(meetingId);
            return successResponse(res, 200, 'Participants retrieved', participants);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get waiting room participants
     * GET /api/participants/:meetingId/waiting
     */
    async getWaitingParticipants(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const waiting = await participantService.getWaitingParticipants(meetingId, userId);
            return successResponse(res, 200, 'Waiting participants retrieved', waiting);
        } catch (error) {
            return errorResponse(res, 403, error.message);
        }
    }

    /**
     * Admit participant from waiting room
     * POST /api/participants/:meetingId/admit/:userId
     */
    async admitParticipant(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const targetUserId = parseInt(req.params.userId);
            const hostId = req.user.id;

            const participant = await participantService.admitParticipant(meetingId, targetUserId, hostId);
            return successResponse(res, 200, 'Participant admitted', participant);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Admit all waiting participants
     * POST /api/participants/:meetingId/admit-all
     */
    async admitAll(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const hostId = req.user.id;

            const results = await participantService.admitAll(meetingId, hostId);
            return successResponse(res, 200, 'All participants admitted', results);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Remove participant
     * DELETE /api/participants/:meetingId/:userId
     */
    async removeParticipant(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const targetUserId = parseInt(req.params.userId);
            const hostId = req.user.id;

            const result = await participantService.removeParticipant(meetingId, targetUserId, hostId);
            return successResponse(res, 200, result.message);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Mute participant
     * POST /api/participants/:meetingId/mute/:userId
     */
    async muteParticipant(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const targetUserId = parseInt(req.params.userId);
            const hostId = req.user.id;

            const participant = await participantService.muteParticipant(meetingId, targetUserId, hostId);
            return successResponse(res, 200, 'Participant muted', participant);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Unmute participant
     * POST /api/participants/:meetingId/unmute/:userId
     */
    async unmuteParticipant(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const targetUserId = parseInt(req.params.userId);
            const hostId = req.user.id;

            const participant = await participantService.unmuteParticipant(meetingId, targetUserId, hostId);
            return successResponse(res, 200, 'Participant unmuted', participant);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Mute all participants
     * POST /api/participants/:meetingId/mute-all
     */
    async muteAll(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const hostId = req.user.id;

            const results = await participantService.muteAll(meetingId, hostId);
            return successResponse(res, 200, 'All participants muted', results);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Update participant role
     * PUT /api/participants/:meetingId/:userId/role
     */
    async updateRole(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const targetUserId = parseInt(req.params.userId);
            const { role } = req.body;
            const hostId = req.user.id;

            const participant = await participantService.updateRole(meetingId, targetUserId, role, hostId);
            return successResponse(res, 200, 'Role updated', participant);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    /**
     * Helper: Check if user is meeting creator
     */
    async isMeetingCreator(meetingId, userId) {
        const meeting = await meetingRepository.findById(meetingId);
        return meeting && meeting.created_by === userId;
    }
}

export default new ParticipantController();