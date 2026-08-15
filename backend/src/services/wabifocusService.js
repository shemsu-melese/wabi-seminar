import wabifocusRepository from '../repositories/wabifocusRepository.js';
import participantService from './participantService.js';
import meetingRepository from '../repositories/meetingRepository.js';

class WabiFocusService {
    /**
     * Create a WabiFocus item
     */
    async createItem(meetingId, userId, data) {
        // Check if user is participant
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        // Check if meeting is active or scheduled
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }
        if (meeting.status === 'ended') {
            throw new Error('Meeting has ended');
        }

        // Validate type
        const validTypes = ['goal', 'agenda', 'outcome', 'decision', 'action_item'];
        if (!validTypes.includes(data.type)) {
            throw new Error('Invalid item type');
        }

        // For action items, check if assigned user exists
        if (data.type === 'action_item' && data.assigned_to) {
            const { default: userRepository } = await import('../repositories/userRepository.js');
            const assignee = await userRepository.findById(data.assigned_to);
            if (!assignee) {
                throw new Error('Assigned user not found');
            }
        }

        return await wabifocusRepository.create({
            meeting_id: meetingId,
            user_id: userId,
            type: data.type,
            title: data.title,
            description: data.description || null,
            assigned_to: data.assigned_to || null,
            due_date: data.due_date || null,
            priority: data.priority || 'medium'
        });
    }

    /**
     * Get all WabiFocus items for a meeting
     */
    async getMeetingItems(meetingId, userId) {
        // Check if user has access
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        const meeting = await meetingRepository.findById(meetingId);
        if (!isParticipant && (!meeting || meeting.created_by !== userId)) {
            throw new Error('You do not have access to this meeting');
        }

        return await wabifocusRepository.findByMeeting(meetingId);
    }

    /**
     * Get items by type for a meeting
     */
    async getItemsByType(meetingId, userId, type) {
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        const validTypes = ['goal', 'agenda', 'outcome', 'decision', 'action_item'];
        if (!validTypes.includes(type)) {
            throw new Error('Invalid item type');
        }

        return await wabifocusRepository.findByMeetingAndType(meetingId, type);
    }

    /**
     * Get action items for a meeting
     */
    async getActionItems(meetingId, userId) {
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        return await wabifocusRepository.getActionItems(meetingId);
    }

    /**
     * Get user's assigned action items
     */
    async getMyActionItems(userId) {
        return await wabifocusRepository.getAssignedActionItems(userId);
    }

    /**
     * Update WabiFocus item
     */
    async updateItem(itemId, userId, data) {
        const item = await wabifocusRepository.findById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }

        // Check if user is the creator or host
        const isHost = await participantService.isHost(item.meeting_id, userId);
        if (item.user_id !== userId && !isHost) {
            throw new Error('You can only update your own items');
        }

        // If completing action item, validate
        if (data.is_completed !== undefined && item.type === 'action_item') {
            // Only assignee or host can complete action items
            if (item.assigned_to !== userId && !isHost) {
                throw new Error('Only the assignee or host can complete action items');
            }
        }

        // If changing assignment, validate user exists
        if (data.assigned_to) {
            const { default: userRepository } = await import('../repositories/userRepository.js');
            const assignee = await userRepository.findById(data.assigned_to);
            if (!assignee) {
                throw new Error('Assigned user not found');
            }
        }

        return await wabifocusRepository.update(itemId, data);
    }

    /**
     * Complete an action item
     */
    async completeActionItem(itemId, userId) {
        const item = await wabifocusRepository.findById(itemId);
        if (!item) {
            throw new Error('Item not found');
        }

        if (item.type !== 'action_item') {
            throw new Error('Only action items can be completed');
        }

        // Check if user is assignee or host
        const isHost = await participantService.isHost(item.meeting_id, userId);
        if (item.assigned_to !== userId && !isHost) {
            throw new Error('Only the assignee or host can complete this action item');
        }

        return await wabifocusRepository.update(itemId, { is_completed: true });
    }

    /**
     * Reorder items
     */
    async reorderItems(meetingId, userId, type, itemIds) {
        const isHost = await participantService.isHost(meetingId, userId);
        if (!isHost) {
            throw new Error('Only hosts can reorder items');
        }

        // Verify all items belong to this meeting
        for (const id of itemIds) {
            const item = await wabifocusRepository.findById(id);
            if (!item || item.meeting_id !== meetingId || item.type !== type) {
                throw new Error('Invalid item in reorder list');
            }
        }

        return await wabifocusRepository.reorder(meetingId, type, itemIds);
    }

    /**
     * Delete WabiFocus item
     */
    async deleteItem(itemId, userId) {
        return await wabifocusRepository.delete(itemId, userId);
    }

    /**
     * Get WabiFocus summary
     */
    async getSummary(meetingId, userId) {
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        return await wabifocusRepository.getSummary(meetingId);
    }

    /**
     * Get meeting outcome
     */
    async getMeetingOutcome(meetingId, userId) {
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        return await wabifocusRepository.getMeetingOutcome(meetingId);
    }

    /**
     * Get upcoming action items (for dashboard)
     */
    async getUpcomingActionItems(userId, days = 7) {
        return await wabifocusRepository.getUpcomingActionItems(days);
    }

    /**
     * Get complete meeting summary
     */
    async getMeetingSummary(meetingId, userId) {
        const isParticipant = await participantService.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('You are not a participant in this meeting');
        }

        const meeting = await meetingRepository.findById(meetingId);
        const items = await wabifocusRepository.findByMeeting(meetingId);
        const summary = await wabifocusRepository.getSummary(meetingId);
        const actionItems = await wabifocusRepository.getActionItems(meetingId);
        const completedActions = await wabifocusRepository.getCompletedActionItems(meetingId);

        // Group items by type
        const grouped = {
            goals: items.filter(i => i.type === 'goal'),
            agenda: items.filter(i => i.type === 'agenda'),
            decisions: items.filter(i => i.type === 'decision'),
            outcomes: items.filter(i => i.type === 'outcome'),
            actionItems: items.filter(i => i.type === 'action_item')
        };

        return {
            meeting: {
                id: meeting.id,
                title: meeting.title,
                code: meeting.code,
                status: meeting.status,
                start_time: meeting.start_time,
                end_time: meeting.end_time
            },
            summary: summary,
            items: grouped,
            pending_action_items: actionItems,
            completed_action_items: completedActions,
            progress: {
                total: items.length,
                completed: items.filter(i => i.is_completed).length,
                percentage: items.length > 0 
                    ? Math.round((items.filter(i => i.is_completed).length / items.length) * 100)
                    : 0
            }
        };
    }
}

export default new WabiFocusService();