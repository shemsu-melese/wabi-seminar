import bcrypt from 'bcrypt';
import meetingRepository from '../repositories/meetingRepository.js';
import participantRepository from '../repositories/participantRepository.js';
import wabifocusRepository from '../repositories/wabifocusRepository.js';
import { generateMeetingCode } from '../utils/generateMeetingCode.js';

class MeetingService {
    /**
     * Create a new meeting
     */
    async createMeeting(userId, meetingData) {
        // Generate unique meeting code
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

        // Hash password if provided
        let password_hash = null;
        if (meetingData.password) {
            const saltRounds = 10;
            password_hash = await bcrypt.hash(meetingData.password, saltRounds);
        }

        // Create meeting
        const meeting = await meetingRepository.create({
            code,
            title: meetingData.title,
            description: meetingData.description,
            created_by: userId,
            start_time: meetingData.start_time || null,
            end_time: meetingData.end_time || null,
            duration_minutes: meetingData.duration_minutes,
            meeting_type: meetingData.meeting_type || 'other',
            max_participants: meetingData.max_participants || 50,
            password_hash,
            is_locked: meetingData.is_locked || false,
            waiting_room_enabled: meetingData.waiting_room_enabled !== undefined ? meetingData.waiting_room_enabled : true,
            allow_screen_sharing: meetingData.allow_screen_sharing !== undefined ? meetingData.allow_screen_sharing : true,
            allow_chat: meetingData.allow_chat !== undefined ? meetingData.allow_chat : true,
            allow_reactions: meetingData.allow_reactions !== undefined ? meetingData.allow_reactions : true,
            allow_raise_hand: meetingData.allow_raise_hand !== undefined ? meetingData.allow_raise_hand : true,
            allow_file_sharing: meetingData.allow_file_sharing !== undefined ? meetingData.allow_file_sharing : true
        });

        // Add creator as host
        await participantRepository.addParticipant(meeting.id, userId, 'host');

        // Add WabiFocus items if provided
        if (meetingData.wabifocus) {
            const { goal, agenda, outcomes, action_items } = meetingData.wabifocus;
            
            if (goal) {
                await wabifocusRepository.create({
                    meeting_id: meeting.id,
                    user_id: userId,
                    type: 'goal',
                    title: goal,
                    priority: 'high'
                });
            }

            if (agenda && agenda.length > 0) {
                for (const item of agenda) {
                    await wabifocusRepository.create({
                        meeting_id: meeting.id,
                        user_id: userId,
                        type: 'agenda',
                        title: item,
                        priority: 'medium'
                    });
                }
            }

            if (outcomes) {
                await wabifocusRepository.create({
                    meeting_id: meeting.id,
                    user_id: userId,
                    type: 'outcome',
                    title: outcomes,
                    priority: 'medium'
                });
            }

            if (action_items && action_items.length > 0) {
                for (const item of action_items) {
                    await wabifocusRepository.create({
                        meeting_id: meeting.id,
                        user_id: userId,
                        type: 'action_item',
                        title: item.title,
                        description: item.description,
                        assigned_to: item.assigned_to || null,
                        due_date: item.due_date || null,
                        priority: item.priority || 'medium'
                    });
                }
            }
        }

        // Get meeting with WabiFocus items
        const meetingWithDetails = await this.getMeetingDetails(meeting.id, userId);

        return meetingWithDetails;
    }

    /**
     * Get meeting details with participants and WabiFocus
     */
    async getMeetingDetails(meetingId, userId = null) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check if user has access
        if (userId) {
            const isParticipant = await participantRepository.isParticipant(meetingId, userId);
            const isCreator = meeting.created_by === userId;
            if (!isParticipant && !isCreator) {
                throw new Error('You do not have access to this meeting');
            }
        }

        // Get participants
        const participants = await participantRepository.getMeetingParticipants(meetingId);

        // Get WabiFocus items
        const wabifocus = await wabifocusRepository.findByMeeting(meetingId);

        // Get attendance
        const attendance = await this.getAttendance(meetingId);

        // Get stats
        const participantCount = await participantRepository.getParticipantCount(meetingId);

        return {
            ...meeting,
            participant_count: participantCount,
            participants,
            wabifocus,
            attendance
        };
    }

    /**
     * Join a meeting
     */
    async joinMeeting(userId, meetingId, password = null) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check if meeting is active or scheduled
        if (meeting.status === 'ended') {
            throw new Error('Meeting has already ended');
        }
        if (meeting.status === 'cancelled') {
            throw new Error('Meeting has been cancelled');
        }

        // Check if meeting is locked
        if (meeting.is_locked) {
            throw new Error('Meeting is locked');
        }

        // Check password if required
        if (meeting.password_hash) {
            if (!password) {
                throw new Error('Password required');
            }
            const isValid = await bcrypt.compare(password, meeting.password_hash);
            if (!isValid) {
                throw new Error('Invalid password');
            }
        }

        // Check max participants
        const currentCount = await participantRepository.getParticipantCount(meetingId);
        if (meeting.max_participants && currentCount >= meeting.max_participants) {
            throw new Error('Meeting has reached maximum participants');
        }

        // Check if user is already a participant
        const isParticipant = await participantRepository.isParticipant(meetingId, userId);
        if (isParticipant) {
            // Update status to joined
            await participantRepository.updateStatus(meetingId, userId, 'joined');
            return this.getMeetingDetails(meetingId, userId);
        }

        // Add participant (waiting room or direct join)
        const status = meeting.waiting_room_enabled ? 'waiting' : 'joined';
        await participantRepository.addParticipant(meetingId, userId, 'participant');
        
        // If waiting room enabled, update status to waiting
        if (status === 'waiting') {
            await participantRepository.updateStatus(meetingId, userId, 'waiting');
        }

        return this.getMeetingDetails(meetingId, userId);
    }

    /**
     * Leave a meeting
     */
    async leaveMeeting(userId, meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const isParticipant = await participantRepository.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        // Update participant status
        await participantRepository.updateStatus(meetingId, userId, 'left');

        // Check if host is leaving
        const isHost = await participantRepository.isHost(meetingId, userId);
        if (isHost) {
            // If host leaves, assign new host or end meeting
            const participants = await participantRepository.getMeetingParticipants(meetingId);
            const activeParticipants = participants.filter(p => p.status === 'joined');
            
            if (activeParticipants.length > 0) {
                // Assign new host (first active participant)
                const newHost = activeParticipants[0];
                await participantRepository.updateRole(meetingId, newHost.user_id, 'host');
            } else {
                // No active participants, end meeting
                await meetingRepository.endMeeting(meetingId);
            }
        }

        return { message: 'Left meeting successfully' };
    }

    /**
     * Start a meeting
     */
    async startMeeting(userId, meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check if user is host
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

        const updatedMeeting = await meetingRepository.startMeeting(meetingId);
        return updatedMeeting;
    }

    /**
     * End a meeting
     */
    async endMeeting(userId, meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check if user is host
        const isHost = await participantRepository.isHost(meetingId, userId);
        if (!isHost) {
            throw new Error('Only the host can end the meeting');
        }

        if (meeting.status === 'ended') {
            throw new Error('Meeting has already ended');
        }

        const updatedMeeting = await meetingRepository.endMeeting(meetingId);
        return updatedMeeting;
    }

    /**
     * Get user's meetings
     */
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
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get upcoming meetings for a user
     */
    async getUpcomingMeetings(userId) {
        return await meetingRepository.getUpcomingMeetings(userId);
    }

    /**
     * Update meeting
     */
    async updateMeeting(userId, meetingId, data) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check if user is host
        const isHost = await participantRepository.isHost(meetingId, userId);
        if (!isHost) {
            throw new Error('Only the host can update the meeting');
        }

        if (meeting.status === 'ended') {
            throw new Error('Cannot update ended meeting');
        }

        const updatedMeeting = await meetingRepository.update(meetingId, data);
        return updatedMeeting;
    }

    /**
     * Delete meeting
     */
    async deleteMeeting(userId, meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check if user is host
        const isHost = await participantRepository.isHost(meetingId, userId);
        if (!isHost) {
            throw new Error('Only the host can delete the meeting');
        }

        await meetingRepository.delete(meetingId);
        return { message: 'Meeting deleted successfully' };
    }

    /**
     * Get meeting statistics
     */
    async getMeetingStats(userId = null) {
        return await meetingRepository.getStatistics(userId);
    }

    /**
     * Get meeting attendance
     */
    async getAttendance(meetingId) {
        // This will be implemented in attendance phase
        return [];
    }

    /**
     * Get active meetings
     */
    async getActiveMeetings() {
        return await meetingRepository.getActiveMeetings();
    }
}

export default new MeetingService();