import api from './api.js';

export const attendanceService = {
    recordJoin: async (meetingId) => {
        const response = await api.post(`/attendance/${meetingId}/join`);
        return response.data;
    },

    recordLeave: async (meetingId) => {
        const response = await api.post(`/attendance/${meetingId}/leave`);
        return response.data;
    },

    getMeetingAttendance: async (meetingId) => {
        const response = await api.get(`/attendance/${meetingId}`);
        return response.data;
    },

    getAttendanceReport: async (meetingId) => {
        const response = await api.get(`/attendance/${meetingId}/report`);
        return response.data;
    },

    updateAttendanceStatus: async (meetingId, userId, status) => {
        const response = await api.put(`/attendance/${meetingId}/${userId}/status`, { status });
        return response.data;
    },

    getUserAttendanceHistory: async (page = 1, limit = 20) => {
        const response = await api.get(`/attendance/user/history?page=${page}&limit=${limit}`);
        return response.data;
    }
};

export default attendanceService;