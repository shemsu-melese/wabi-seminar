import api from './api.js';

export const meetingService = {
    // ============================================
    // CREATE
    // ============================================
    createMeeting: async (data) => {
        try {
            const response = await api.post('/meetings', data);
            return response.data;
        } catch (error) {
            console.error('❌ createMeeting error:', error);
            throw error;
        }
    },

    // ============================================
    // READ – List
    // ============================================
    getMeetings: async (status = null, page = 1, limit = 20) => {
        let url = `/meetings?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        const response = await api.get(url);
        return response.data;
    },

    getUpcomingMeetings: async () => {
        const response = await api.get('/meetings/upcoming');
        return response.data;
    },

    getActiveMeetings: async () => {
        const response = await api.get('/meetings/active');
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/meetings/stats');
        return response.data;
    },

    // ============================================
    // READ – Single
    // ============================================
    getMeeting: async (id) => {
        const response = await api.get(`/meetings/${id}`);
        return response.data;
    },

    getMeetingByCode: async (code) => {
        const response = await api.get(`/meetings/code/${code}`);
        return response.data;
    },

    // ============================================
    // UPDATE
    // ============================================
    updateMeeting: async (id, data) => {
        const response = await api.put(`/meetings/${id}`, data);
        return response.data;
    },

    // ============================================
    // DELETE
    // ============================================
    deleteMeeting: async (id) => {
        const response = await api.delete(`/meetings/${id}`);
        return response.data;
    },

    // ============================================
    // ACTIONS
    // ============================================
    joinMeeting: async (id, password = null) => {
        const response = await api.post(`/meetings/${id}/join`, { password });
        return response.data;
    },

    leaveMeeting: async (id) => {
        const response = await api.post(`/meetings/${id}/leave`);
        return response.data;
    },

    startMeeting: async (id) => {
        const response = await api.post(`/meetings/${id}/start`);
        return response.data;
    },

    endMeeting: async (id) => {
        const response = await api.post(`/meetings/${id}/end`);
        return response.data;
    },

    lockMeeting: async (id) => {
        const response = await api.post(`/meetings/${id}/lock`);
        return response.data;
    },

    unlockMeeting: async (id) => {
        const response = await api.post(`/meetings/${id}/unlock`);
        return response.data;
    },

    // ============================================
    // WAITING ROOM – Host actions
    // ============================================
    /**
     * Admit a participant from the waiting room into the meeting.
     * @param {number|string} meetingId - ID of the meeting.
     * @param {number|string} userId - ID of the participant to admit.
     */
    admitParticipant: async (meetingId, userId) => {
        try {
            const response = await api.put(`/meetings/${meetingId}/admit/${userId}`);
            return response.data;
        } catch (error) {
            console.error('❌ admitParticipant error:', error);
            throw error;
        }
    },

    /**
     * Remove a participant (deny from waiting room or kick from meeting).
     * @param {number|string} meetingId - ID of the meeting.
     * @param {number|string} userId - ID of the participant to remove.
     */
    removeParticipant: async (meetingId, userId) => {
        try {
            const response = await api.delete(`/meetings/${meetingId}/participants/${userId}`);
            return response.data;
        } catch (error) {
            console.error('❌ removeParticipant error:', error);
            throw error;
        }
    },
};

export default meetingService;