import attendanceRepository from '../repositories/attendanceRepository.js';
import participantRepository from '../repositories/participantRepository.js';
import meetingRepository from '../repositories/meetingRepository.js';

class AttendanceService {
    /**
     * Record user joining meeting
     */
    async recordJoin(meetingId, userId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check if user is a participant
        const isParticipant = await participantRepository.isParticipant(meetingId, userId);
        if (!isParticipant) {
            throw new Error('User is not a participant in this meeting');
        }

        // Record attendance
        const attendance = await attendanceRepository.create(meetingId, userId);

        // Check if user is late (more than 5 minutes after start)
        if (meeting.start_time) {
            const joinTime = new Date();
            const startTime = new Date(meeting.start_time);
            const diffMinutes = (joinTime - startTime) / (1000 * 60);
            
            if (diffMinutes > 5) {
                await attendanceRepository.updateStatus(meetingId, userId, 'late');
            }
        }

        return attendance;
    }

    /**
     * Record user leaving meeting
     */
    async recordLeave(meetingId, userId) {
        const attendance = await attendanceRepository.updateLeaveTime(meetingId, userId);
        if (!attendance) {
            throw new Error('No attendance record found');
        }
        return attendance;
    }

    /**
     * Get meeting attendance
     */
    async getMeetingAttendance(meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const records = await attendanceRepository.findByMeeting(meetingId);
        const stats = await attendanceRepository.getAttendanceStats(meetingId);

        return {
            meeting: {
                id: meeting.id,
                title: meeting.title,
                start_time: meeting.start_time,
                end_time: meeting.end_time
            },
            statistics: stats,
            attendees: records
        };
    }

    /**
     * Get attendance report
     */
    async getAttendanceReport(meetingId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const report = await attendanceRepository.getAttendanceReport(meetingId);
        
        // Calculate summary
        const summary = {
            total: report.length,
            present: report.filter(r => r.status === 'present').length,
            late: report.filter(r => r.status === 'late').length,
            absent: report.filter(r => r.status === 'absent' || !r.join_time).length,
            onTime: report.filter(r => r.punctuality === 'On Time').length,
            averageDuration: report
                .filter(r => r.duration_seconds)
                .reduce((acc, r) => acc + (r.duration_seconds || 0), 0) / report.length || 0
        };

        return {
            meeting: {
                id: meeting.id,
                title: meeting.title,
                start_time: meeting.start_time,
                end_time: meeting.end_time
            },
            summary,
            report
        };
    }

    /**
     * Get user attendance history
     */
    async getUserAttendance(userId) {
        return await attendanceRepository.getUserAttendance(userId);
    }

    /**
     * Update attendance status
     */
    async updateStatus(meetingId, userId, status) {
        const validStatuses = ['present', 'late', 'absent', 'excused'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        return await attendanceRepository.updateStatus(meetingId, userId, status);
    }
}

export default new AttendanceService();