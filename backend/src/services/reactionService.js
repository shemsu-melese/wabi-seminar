import reactionRepository from '../repositories/reactionRepository.js';
import participantService from './participantService.js';
import meetingRepository from '../repositories/meetingRepository.js';

class ReactionService {
    
    //   Add or remove reaction
    
    async toggleReaction(meetingId, userId, emoji, messageId = null) {
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

        // Validate emoji
        const validEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '👏', '🎉', '🔥', '💯', '🙌', '💪'];
        if (!validEmojis.includes(emoji)) {
            throw new Error('Invalid emoji');
        }

        return await reactionRepository.addReaction(meetingId, userId, emoji, messageId);
    }

    //   Get meeting reactions
     
    async getMeetingReactions(meetingId, userId) {
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        return await reactionRepository.getMeetingReactions(meetingId);
    }

    //  Get message reactions
    
    async getMessageReactions(messageId) {
        return await reactionRepository.getMessageReactions(messageId);
    }

    //   Get reaction counts
     
    async getReactionCounts(meetingId, userId) {
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        return await reactionRepository.getReactionCounts(meetingId);
    }

    //  Remove reaction
     
    async removeReaction(reactionId, userId) {
        return await reactionRepository.removeReaction(reactionId, userId);
    }
}

export default new ReactionService();