import meetingService from '../services/meetingService.js';

class MeetingController {
    async createMeeting(req, res) {
        try {
            const userId = req.user.id;
            const meetingData = req.body;
            const result = await meetingService.createMeeting(userId, meetingData);
            res.status(201).json({ success: true, data: result, message: 'Meeting created successfully' });
        } catch (error) {
            console.error('❌ createMeeting error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getUserMeetings(req, res) {
        try {
            const userId = req.user.id;
            const { status, page = 1, limit = 20 } = req.query;
            console.log(`📊 Fetching meetings for user ${userId}, page ${page}, limit ${limit}`);
            const result = await meetingService.getUserMeetings(userId, status, parseInt(page), parseInt(limit));
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('❌ getUserMeetings error:', error);
            console.error('Stack:', error.stack);
            res.status(400).json({ success: false, message: error.message || 'Failed to load meetings' });
        }
    }

    async getUpcomingMeetings(req, res) {
        try {
            const userId = req.user.id;
            const result = await meetingService.getUpcomingMeetings(userId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('❌ getUpcomingMeetings error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getActiveMeetings(req, res) {
        try {
            const result = await meetingService.getActiveMeetings();
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('❌ getActiveMeetings error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getStats(req, res) {
        try {
            const userId = req.user.id;
            const result = await meetingService.getMeetingStats(userId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('❌ getStats error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getMeetingByCode(req, res) {
        try {
            const { code } = req.params;
            const userId = req.user.id;
            const result = await meetingService.getMeetingByCode(code, userId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('❌ getMeetingByCode error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getMeeting(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await meetingService.getMeetingDetails(id, userId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            console.error('❌ getMeeting error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateMeeting(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;
            const result = await meetingService.updateMeeting(userId, id, updateData);
            res.status(200).json({ success: true, data: result, message: 'Meeting updated' });
        } catch (error) {
            console.error('❌ updateMeeting error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteMeeting(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            await meetingService.deleteMeeting(userId, id);
            res.status(200).json({ success: true, message: 'Meeting deleted' });
        } catch (error) {
            console.error('❌ deleteMeeting error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async joinMeeting(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const { password } = req.body;
            console.log(`🔵 User ${userId} attempting to join meeting ${id}`);
            const result = await meetingService.joinMeeting(userId, id, password);
            res.status(200).json({ success: true, data: result, message: 'Joined meeting successfully' });
        } catch (error) {
            console.error('❌ Join meeting error:', error);
            console.error('Stack:', error.stack);
            const status = error.message.includes('not found') || error.message.includes('required') ? 400 : 500;
            res.status(status).json({ success: false, message: error.message });
        }
    }

    async leaveMeeting(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await meetingService.leaveMeeting(userId, id);
            res.status(200).json({ success: true, data: result, message: 'Left meeting' });
        } catch (error) {
            console.error('❌ leaveMeeting error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async startMeeting(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await meetingService.startMeeting(userId, id);
            res.status(200).json({ success: true, data: result, message: 'Meeting started' });
        } catch (error) {
            console.error('❌ startMeeting error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async endMeeting(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const result = await meetingService.endMeeting(userId, id);
            res.status(200).json({ success: true, data: result, message: 'Meeting ended' });
        } catch (error) {
            console.error('❌ endMeeting error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async admitParticipant(req, res) {
        try {
            const { id: meetingId, userId } = req.params;
            const hostId = req.user.id;
            const result = await meetingService.admitParticipant(hostId, meetingId, userId);
            res.status(200).json({ success: true, data: result, message: 'Participant admitted' });
        } catch (error) {
            console.error('❌ admitParticipant error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async removeParticipant(req, res) {
        try {
            const { id: meetingId, userId } = req.params;
            const hostId = req.user.id;
            const result = await meetingService.removeParticipant(hostId, meetingId, userId);
            res.status(200).json({ success: true, data: result, message: 'Participant removed' });
        } catch (error) {
            console.error('❌ removeParticipant error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

export default new MeetingController();