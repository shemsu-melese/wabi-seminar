import meetingService from '../services/meetingService.js';
import participantService from '../services/participantService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class MeetingControlsController {
    
    //   Lock meeting
    //   POST /api/meetings/:meetingId/lock
     
    async lockMeeting(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const isHost = await participantService.isHost(meetingId, userId);
            if (!isHost) {
                return errorResponse(res, 403, 'Only the host can lock the meeting');
            }

            const meeting = await meetingService.updateMeeting(userId, meetingId, { is_locked: true });
            return successResponse(res, 200, 'Meeting locked', meeting);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    //   Unlock meeting
    //   POST /api/meetings/:meetingId/unlock
     
    async unlockMeeting(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const isHost = await participantService.isHost(meetingId, userId);
            if (!isHost) {
                return errorResponse(res, 403, 'Only the host can unlock the meeting');
            }

            const meeting = await meetingService.updateMeeting(userId, meetingId, { is_locked: false });
            return successResponse(res, 200, 'Meeting unlocked', meeting);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    //  Enable waiting room
    //  POST /api/meetings/:meetingId/waiting-room/enable
     
    async enableWaitingRoom(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const isHost = await participantService.isHost(meetingId, userId);
            if (!isHost) {
                return errorResponse(res, 403, 'Only the host can manage waiting room');
            }

            const meeting = await meetingService.updateMeeting(userId, meetingId, { waiting_room_enabled: true });
            return successResponse(res, 200, 'Waiting room enabled', meeting);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    //  Disable waiting room
    //  POST /api/meetings/:meetingId/waiting-room/disable
    
    async disableWaitingRoom(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const userId = req.user.id;

            const isHost = await participantService.isHost(meetingId, userId);
            if (!isHost) {
                return errorResponse(res, 403, 'Only the host can manage waiting room');
            }

            const meeting = await meetingService.updateMeeting(userId, meetingId, { waiting_room_enabled: false });
            return successResponse(res, 200, 'Waiting room disabled', meeting);
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    //   Toggle participant camera
    //   POST /api/meetings/:meetingId/camera/:userId
    
    async toggleCamera(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const targetUserId = parseInt(req.params.userId);
            const { enabled } = req.body;
            const userId = req.user.id;

            // For now, just return success
            // Frontend handles actual camera toggle via WebRTC
            return successResponse(res, 200, 'Camera state toggled', { userId: targetUserId, cameraEnabled: enabled });
        } catch (error) {
            return errorResponse(res, 400, error.message);
        }
    }

    //   Get meeting status
    //   GET /api/meetings/:meetingId/status
     
    async getMeetingStatus(req, res) {
        try {
            const meetingId = parseInt(req.params.meetingId);
            const meeting = await meetingService.getMeetingDetails(meetingId, req.user.id);
            
            const count = await participantService.getParticipantCount(meetingId);
            
            return successResponse(res, 200, 'Meeting status', {
                status: meeting.status,
                participant_count: count,
                is_locked: meeting.is_locked,
                waiting_room_enabled: meeting.waiting_room_enabled
            });
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default new MeetingControlsController();