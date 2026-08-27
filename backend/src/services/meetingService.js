import bcrypt from 'bcrypt';
import meetingRepository from '../repositories/meetingRepository.js';
import participantRepository from '../repositories/participantRepository.js';
import wabifocusRepository from '../repositories/wabifocusRepository.js';
import { generateMeetingCode } from '../utils/generateMeetingCode.js';
import { getIO } from '../socket.js';
import { pool } from '../config/database.js';

class MeetingService {
    // ============================================
    // CREATE MEETING
    // ============================================
    async createMeeting(userId, meetingData) {
        let code;
        let isUnique = false;
        let attempts = 0;
        const maxAttempts = 10;

        while (!isUnique && attempts < maxAttempts) {
            code = generateMeetingCode();
            isUnique = !(await meetingRepository.codeExists(code));
            attempts++;
        }

        if (!isUnique) {
            throw new Error('Unable to generate unique meeting code');
        }

        let password_hash = null;
        if (meetingData.password) {
            const saltRounds = 10;
            password_hash = await bcrypt.hash(meetingData.password, saltRounds);
        }

        const meetingPayload = {
            code,
            title: meetingData.title,
            description: meetingData.description || null,
            created_by: userId,
            start_time: meetingData.start_time || null,
            end_time: null,
            duration_minutes: meetingData.duration_minutes || 30,
            meeting_type: meetingData.meeting_type || 'other',
            max_participants: meetingData.max_participants || 50,
            password_hash: password_hash || null,
            is_locked: meetingData.is_locked || false,
            waiting_room_enabled: meetingData.waiting_room_enabled !== undefined ? meetingData.waiting_room_enabled : true,
            allow_screen_sharing: meetingData.allow_screen_sharing !== undefined ? meetingData.allow_screen_sharing : true,
            allow_chat: meetingData.allow_chat !== undefined ? meetingData.allow_chat : true,
            allow_reactions: meetingData.allow_reactions !== undefined ? meetingData.allow_reactions : true,
            allow_raise_hand: meetingData.allow_raise_hand !== undefined ? meetingData.allow_raise_hand : true,
        };

        Object.keys(meetingPayload).forEach((key) => {
            if (meetingPayload[key] === undefined) {
                meetingPayload[key] = null;
            }
        });

        const meeting = await meetingRepository.create(meetingPayload);
        await participantRepository.addParticipant(meeting.id, userId, 'host');

        if (meetingData.wabifocus) {
            const { goal, agenda } = meetingData.wabifocus;
            if (goal && goal.trim()) {
                await wabifocusRepository.create({
                    meeting_id: meeting.id,
                    user_id: userId,
                    type: 'goal',
                    title: goal.trim(),
                    priority: 'high',
                    order_index: 0,
                });
            }
            if (agenda && Array.isArray(agenda)) {
                const filtered = agenda.filter((item) => item && item.trim());
                for (let i = 0; i < filtered.length; i++) {
                    await wabifocusRepository.create({
                        meeting_id: meeting.id,
                        user_id: userId,
                        type: 'agenda',
                        title: filtered[i].trim(),
                        priority: 'medium',
                        order_index: i + 1,
                    });
                }
            }
        }

        return this.getMeetingDetails(meeting.id, userId);
    }

    // ============================================
    // GET MEETING DETAILS (no access check)
    // ============================================
    async getMeetingDetails(meetingId, userId = null) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const participants = await participantRepository.getMeetingParticipants(meetingId);
        const wabifocus = await wabifocusRepository.findByMeeting(meetingId);
        const participantCount = await participantRepository.getParticipantCount(meetingId);

        const result = {
            ...meeting,
            participant_count: participantCount,
            participants,
            wabifocus,
        };

        if (userId) {
            const isParticipant = await participantRepository.isParticipant(meetingId, userId);
            const isCreator = meeting.created_by === userId;
            result.userRole = isCreator ? 'host' : (isParticipant ? 'participant' : null);
            if (isParticipant) {
                const participant = await participantRepository.getParticipant(meetingId, userId);
                result.userStatus = participant?.status;
            }
        }

        return result;
    }

    // ============================================
    // GET MEETING BY CODE
    // ============================================
    async getMeetingByCode(code, userId) {
        const meeting = await meetingRepository.findByCode(code);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        return this.getMeetingDetails(meeting.id, userId);
    }

    // ============================================
    // JOIN MEETING – always respect waiting_room_enabled
    // ============================================
    async joinMeeting(userId, meetingId, password = null) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        if (meeting.status === 'ended') {
            throw new Error('Meeting has already ended');
        }
        if (meeting.status === 'cancelled') {
            throw new Error('Meeting has been cancelled');
        }

        if (meeting.is_locked) {
            throw new Error('Meeting is locked');
        }

        if (meeting.password_hash) {
            if (!password) {
                throw new Error('Password required');
            }
            const isValid = await bcrypt.compare(password, meeting.password_hash);
            if (!isValid) {
                throw new Error('Invalid password');
            }
        }

        const currentCount = await participantRepository.getParticipantCount(meetingId);
        if (meeting.max_participants && currentCount >= meeting.max_participants) {
            throw new Error('Meeting has reached maximum participants');
        }

        const isParticipant = await participantRepository.isParticipant(meetingId, userId);
        let status;

        if (isParticipant) {
            // Update existing participant status based on waiting_room_enabled
            status = meeting.waiting_room_enabled ? 'waiting' : 'joined';
            await participantRepository.updateStatus(meetingId, userId, status);
        } else {
            // New participant
            status = meeting.waiting_room_enabled ? 'waiting' : 'joined';
            await participantRepository.addParticipant(meetingId, userId, 'participant');
            if (status === 'waiting') {
                await participantRepository.updateStatus(meetingId, userId, 'waiting');
            }
        }

        // If waiting, emit socket event to host
        if (status === 'waiting') {
            await this._emitWaitingEvent(meeting, userId);
        }

        return this.getMeetingDetails(meetingId, userId);
    }

    // ============================================
    // Helper: emit waiting-participant event
    // ============================================
    async _emitWaitingEvent(meeting, userId) {
        try {
            const hostId = meeting.created_by;
            const [userRows] = await pool.execute('SELECT first_name, last_name FROM users WHERE id = ?', [userId]);
            const username = userRows[0] ? `${userRows[0].first_name} ${userRows[0].last_name}` : 'User';
            const io = getIO();
            io.to(`user-${hostId}`).emit('waiting-participant', {
                userId,
                username,
                meetingId: meeting.id
            });
            io.to(`meeting-${meeting.id}`).emit('waiting-participant', { userId, username });
            console.log(`📨 Emitted waiting-participant for ${username} to host ${hostId}`);
        } catch (err) {
            console.error('Failed to emit waiting event:', err);
        }
    }

    // ============================================
    // ADMIT PARTICIPANT
    // ============================================
    async admitParticipant(hostId, meetingId, userIdToAdmit) {
        const isHost = await participantRepository.isHost(meetingId, hostId);
        if (!isHost) {
            throw new Error('Only the host can admit participants');
        }

        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        if (meeting.status === 'ended') {
            throw new Error('Meeting has already ended');
        }

        await participantRepository.admitParticipant(meetingId, userIdToAdmit);

        try {
            const [userRows] = await pool.execute('SELECT first_name, last_name FROM users WHERE id = ?', [userIdToAdmit]);
            const username = userRows[0] ? `${userRows[0].first_name} ${userRows[0].last_name}` : 'User';
            const io = getIO();
            io.to(`user-${userIdToAdmit}`).emit('participant-admitted', {
                userId: userIdToAdmit,
                username,
                meetingId
            });
            io.to(`meeting-${meetingId}`).emit('participant-admitted', {
                userId: userIdToAdmit,
                username
            });
        } catch (err) {
            console.error('Failed to emit participant-admitted event:', err);
        }

        return this.getMeetingDetails(meetingId, hostId);
    }

    // ============================================
    // REMOVE PARTICIPANT
    // ============================================
    async removeParticipant(hostId, meetingId, userIdToRemove) {
        const isHost = await participantRepository.isHost(meetingId, hostId);
        if (!isHost) {
            throw new Error('Only the host can remove participants');
        }

        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        await participantRepository.removeParticipant(meetingId, userIdToRemove);
        return { message: 'Participant removed' };
    }

    // ============================================
    // LEAVE MEETING
    // ============================================
    async leaveMeeting(userId, meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const isParticipant = await participantRepository.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        await participantRepository.updateStatus(meetingId, userId, 'left');

        const isHost = await participantRepository.isHost(meetingId, userId);
        if (isHost) {
            const participants = await participantRepository.getMeetingParticipants(meetingId);
            const activeParticipants = participants.filter(p => p.status === 'joined');
            if (activeParticipants.length > 0) {
                const newHost = activeParticipants[0];
                await participantRepository.updateRole(meetingId, newHost.user_id, 'host');
            } else {
                await meetingRepository.endMeeting(meetingId);
            }
        }

        return { message: 'Left meeting successfully' };
    }

    // ============================================
    // START MEETING
    // ============================================
    async startMeeting(userId, meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const isHost = await participantRepository.isHost(meetingId, userId);
        if (!isHost) {
            throw new Error('Only the host can start the meeting');
        }

        if (meeting.status === 'ongoing') {
            throw new Error('Meeting is already ongoing');
        }

        if (meeting.status === 'ended') {
            throw new Error('Meeting has already ended');
        }

        return await meetingRepository.startMeeting(meetingId);
    }

    // ============================================
    // END MEETING
    // ============================================
    async endMeeting(userId, meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const isHost = await participantRepository.isHost(meetingId, userId);
        if (!isHost) {
            throw new Error('Only the host can end the meeting');
        }

        if (meeting.status === 'ended') {
            throw new Error('Meeting has already ended');
        }

        return await meetingRepository.endMeeting(meetingId);
    }

    // ============================================
    // GET USER MEETINGS
    // ============================================
    async getUserMeetings(userId, status = null, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const meetings = await meetingRepository.findByUser(userId, status, limit, offset);
        const total = await meetingRepository.countByUser(userId);

        return {
            meetings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // ============================================
    // GET UPCOMING MEETINGS
    // ============================================
    async getUpcomingMeetings(userId) {
        return await meetingRepository.getUpcomingMeetings(userId);
    }

    // ============================================
    // UPDATE MEETING
    // ============================================
    async updateMeeting(userId, meetingId, data) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const isHost = await participantRepository.isHost(meetingId, userId);
        if (!isHost) {
            throw new Error('Only the host can update the meeting');
        }

        if (meeting.status === 'ended') {
            throw new Error('Cannot update ended meeting');
        }

        return await meetingRepository.update(meetingId, data);
    }

    // ============================================
    // DELETE MEETING
    // ============================================
    async deleteMeeting(userId, meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const isHost = await participantRepository.isHost(meetingId, userId);
        if (!isHost) {
            throw new Error('Only the host can delete the meeting');
        }

        await meetingRepository.delete(meetingId);
        return { message: 'Meeting deleted successfully' };
    }

    // ============================================
    // GET MEETING STATS
    // ============================================
    async getMeetingStats(userId = null) {
        return await meetingRepository.getStatistics(userId);
    }

    // ============================================
    // GET ACTIVE MEETINGS
    // ============================================
    async getActiveMeetings() {
        return await meetingRepository.getActiveMeetings();
    }
}

export default new MeetingService();