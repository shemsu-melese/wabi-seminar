import { successResponse, errorResponse } from '../utils/response.js';

class WebRTCController {
    /**
     * Get ICE servers configuration
     * GET /api/webrtc/ice-servers
     */
    async getIceServers(req, res) {
        try {
            // In production, you'd get TURN credentials from a service
            const iceServers = [
                {
                    urls: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302'
                    ]
                },
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                },
                {
                    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                }
            ];

            return successResponse(res, 200, 'ICE servers retrieved', { 
                iceServers,
                iceTransportPolicy: 'all'
            });
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Get TURN server credentials (for production)
     * POST /api/webrtc/turn-credentials
     */
    async getTurnCredentials(req, res) {
        try {
            // This would call a TURN service API in production
            // For now, return default TURN servers
            return successResponse(res, 200, 'TURN credentials retrieved', {
                username: 'openrelayproject',
                credential: 'openrelayproject',
                urls: [
                    'turn:openrelay.metered.ca:80',
                    'turn:openrelay.metered.ca:443',
                    'turn:openrelay.metered.ca:443?transport=tcp'
                ]
            });
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    /**
     * Generate a unique room ID
     * GET /api/webrtc/room-id
     */
    async generateRoomId(req, res) {
        try {
            const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
            return successResponse(res, 200, 'Room ID generated', { roomId });
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

export default new WebRTCController();