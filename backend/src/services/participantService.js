import participantRepository from '../repositories/participantRepository.js';
import meetingRepository from '../repositories/meetingRepository.js';
import attendanceService from './attendanceService.js';

class ParticipantService {
    /**
     * Add participant to meeting
     */
    async addParticipant(meetingId, userId, role = 'participant') {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check if meeting is full
        const count = await participantRepository.getParticipantCount(meetingId);
        if (meeting.max_participants && count >= meeting.max_participants) {
            throw new Error('Meeting has reached maximum participants');
        }

        const participant = await participantRepository.addParticipant(meetingId, userId, role);
        
        // Record attendance
        await attendanceService.recordJoin(meetingId, userId);

        return participant;
    }

    /**
     * Remove participant from meeting
     */
    async removeParticipant(meetingId, userId, hostId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check if host is performing action
        const isHost = await participantRepository.isHost(meetingId, hostId);
        if (!isHost) {
            throw new Error('Only the host can remove participants');
        }

        // Don't allow removing host
        if (await participantRepository.isHost(meetingId, userId)) {
            throw new Error('Cannot remove the host');
        }

        await participantRepository.removeParticipant(meetingId, userId);
        
        // Record leave in attendance
        await attendanceService.recordLeave(meetingId, userId);

        return { message: 'Participant removed successfully' };
    }

    /**
     * Mute participant
     */
    async muteParticipant(meetingId, userId, hostId) {
        const isHost = await participantRepository.isHost(meetingId, hostId);
        if (!isHost) {
            throw new Error('Only the host can mute participants');
        }

        if (await participantRepository.isHost(meetingId, userId)) {
            throw new Error('Cannot mute the host');
        }

        return await participantRepository.muteParticipant(meetingId, userId);
    }

    /**
     * Unmute participant
     */
    async unmuteParticipant(meetingId, userId, hostId) {
        const isHost = await participantRepository.isHost(meetingId, hostId);
        if (!isHost) {
            throw new Error('Only the host can unmute participants');
        }

        return await participantRepository.unmuteParticipant(meetingId, userId);
    }

    /**
     * Mute all participants
     */
    async muteAll(meetingId, hostId) {
        const isHost = await participantRepository.isHost(meetingId, hostId);
        if (!isHost) {
            throw new Error('Only the host can mute all participants');
        }

        const participants = await participantRepository.getMeetingParticipants(meetingId);
        const results = [];
        
        for (const participant of participants) {
            if (participant.role !== 'host') {
                const result = await participantRepository.muteParticipant(meetingId, participant.user_id);
                results.push(result);
            }
        }

        return results;
    }

    /**
     * Get meeting participants with status
     */
    async getMeetingParticipants(meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const participants = await participantRepository.getMeetingParticipants(meetingId);
        const count = await participantRepository.getParticipantCount(meetingId);

        return {
            meeting_id: meetingId,
            total: count,
            participants
        };
    }

    /**
     * Get waiting room participants
     */
    async getWaitingParticipants(meetingId, hostId) {
        const isHost = await participantRepository.isHost(meetingId, hostId);
        if (!isHost) {
            throw new Error('Only the host can view waiting room');
        }

        return await participantRepository.getWaitingParticipants(meetingId);
    }

    /**
     * Admit participant from waiting room
     */
    async admitParticipant(meetingId, userId, hostId) {
        const isHost = await participantRepository.isHost(meetingId, hostId);
        if (!isHost) {
            throw new Error('Only the host can admit participants');
        }

        const participant = await participantRepository.admitParticipant(meetingId, userId);
        await attendanceService.recordJoin(meetingId, userId);

        return participant;
    }

    /**
     * Admit all waiting participants
     */
    async admitAll(meetingId, hostId) {
        const isHost = await participantRepository.isHost(meetingId, hostId);
        if (!isHost) {
            throw new Error('Only the host can admit participants');
        }

        const waiting = await participantRepository.getWaitingParticipants(meetingId);
        const results = [];
        
        for (const participant of waiting) {
            const result = await participantRepository.admitParticipant(meetingId, participant.user_id);
            await attendanceService.recordJoin(meetingId, participant.user_id);
            results.push(result);
        }

        return results;
    }

    /**
     * Update participant role
     */
    async updateRole(meetingId, userId, role, hostId) {
        const isHost = await participantRepository.isHost(meetingId, hostId);
        if (!isHost) {
            throw new Error('Only the host can update roles');
        }

        const validRoles = ['host', 'co-host', 'participant'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role');
        }

        return await participantRepository.updateRole(meetingId, userId, role);
    }

    /**
     * Get participant count
     */
    async getParticipantCount(meetingId) {
        return await participantRepository.getParticipantCount(meetingId);
    }

    /**
     * Check if user is participant
     */
    async isParticipant(meetingId, userId) {
        return await participantRepository.isParticipant(meetingId, userId);
    }

    /**
     * Check if user is host
     */
    async isHost(meetingId, userId) {
        return await participantRepository.isHost(meetingId, userId);
    }
}

export default new ParticipantService();