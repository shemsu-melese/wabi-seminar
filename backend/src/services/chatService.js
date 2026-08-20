import chatRepository from '../repositories/chatRepository.js';
import participantService from './participantService.js';
import meetingRepository from '../repositories/meetingRepository.js';

class ChatService {
    
    //   Send a message
     
    async sendMessage(meetingId, userId, content, messageType = 'text', parentMessageId = null) {
        // Check if user is participant
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        // Check if meeting is active
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        if (meeting.status === 'ended') {
            throw new Error('Meeting has ended');
        }

        return await chatRepository.saveMessage(meetingId, userId, content, messageType, parentMessageId);
    }

    //   Get meeting messages
     
    async getMeetingMessages(meetingId, userId, limit = 50, page = 1) {
        // Check if user is participant
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        const offset = (page - 1) * limit;
        const messages = await chatRepository.getMessages(meetingId, limit, offset);
        const total = await chatRepository.getMessageCount(meetingId);

        return {
            messages,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    //   Delete message
     
    async deleteMessage(messageId, userId) {
        return await chatRepository.deleteMessage(messageId, userId);
    }


    //   Pin message (only host or admin)
     
    async pinMessage(messageId, userId) {
        // Get message to find meeting
        const message = await chatRepository.getMessageById(messageId);
        if (!message) {
            throw new Error('Message not found');
        }

        // Check if user is host or admin
        const isHost = await participantService.isHost(message.meeting_id, userId);
        if (!isHost) {
            const meeting = await meetingRepository.findById(message.meeting_id);
            if (!meeting || meeting.created_by !== userId) {
                throw new Error('Only hosts can pin messages');
            }
        }

        return await chatRepository.pinMessage(messageId, userId);
    }

    //   Unpin message
     
    async unpinMessage(messageId) {
        return await chatRepository.unpinMessage(messageId);
    }

    //   Get pinned messages
     
    async getPinnedMessages(meetingId, userId) {
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        return await chatRepository.getPinnedMessages(meetingId);
    }
}

export default new ChatService();