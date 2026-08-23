import attendanceRepository from '../repositories/attendanceRepository.js';
import participantRepository from '../repositories/participantRepository.js';
import meetingRepository from '../repositories/meetingRepository.js';

class AttendanceService {
    
    //   Record user joining meeting
     
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

        // Check if meeting is active
        if (meeting.status === 'ended') {
            throw new Error('Meeting has ended');
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

        // Update meeting analytics
        await this.updateMeetingAnalytics(meetingId);

        return attendance;
    }

    //   Record user leaving meeting
    
    async recordLeave(meetingId, userId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const attendance = await attendanceRepository.updateLeaveTime(meetingId, userId);
        if (!attendance) {
            throw new Error('No attendance record found');
        }

        // Update meeting analytics
        await this.updateMeetingAnalytics(meetingId);

        return attendance;
    }

    //   Get meeting attendance
     
    async getMeetingAttendance(meetingId, userId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check if user has access
        const isParticipant = await participantRepository.isParticipant(meetingId, userId);
        const isCreator = meeting.created_by === userId;
        if (!isParticipant && !isCreator) {
            throw new Error('You do not have access to this meeting');
        }

        const records = await attendanceRepository.findByMeeting(meetingId);
        const stats = await attendanceRepository.getAttendanceStats(meetingId);

        return {
            meeting: {
                id: meeting.id,
                title: meeting.title,
                code: meeting.code,
                start_time: meeting.start_time,
                end_time: meeting.end_time,
                status: meeting.status
            },
            statistics: {
                total_attendees: stats?.total_attendees || 0,
                present: stats?.present || 0,
                late: stats?.late || 0,
                absent: stats?.absent || 0,
                excused: stats?.excused || 0,
                avg_duration: stats?.avg_duration || 0,
                max_duration: stats?.max_duration || 0,
                min_duration: stats?.min_duration || 0,
                attendance_rate: stats?.total_attendees > 0 
                    ? ((stats.present + stats.late) / stats.total_attendees * 100).toFixed(2)
                    : 0
            },
            attendees: records
        };
    }

    //   Get attendance report
     
    async getAttendanceReport(meetingId, userId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Only host or admin can view report
        const isHost = await participantRepository.isHost(meetingId, userId);
        const isCreator = meeting.created_by === userId;
        if (!isHost && !isCreator) {
            throw new Error('Only hosts can view attendance report');
        }

        const report = await attendanceRepository.getAttendanceReport(meetingId);
        
        // Calculate summary
        const total = report.length;
        const present = report.filter(r => r.status === 'present').length;
        const late = report.filter(r => r.status === 'late').length;
        const absent = report.filter(r => r.status === 'absent' || !r.join_time).length;
        const excused = report.filter(r => r.status === 'excused').length;
        const onTime = report.filter(r => r.punctuality === 'On Time').length;
        
        // Calculate average duration in minutes
        const durations = report
            .filter(r => r.duration_seconds)
            .map(r => r.duration_seconds);
        const avgDurationMinutes = durations.length > 0 
            ? (durations.reduce((a, b) => a + b, 0) / durations.length / 60)
            : 0;

        return {
            meeting: {
                id: meeting.id,
                title: meeting.title,
                code: meeting.code,
                start_time: meeting.start_time,
                end_time: meeting.end_time,
                duration_minutes: meeting.duration_minutes
            },
            summary: {
                total,
                present,
                late,
                absent,
                excused,
                onTime,
                attendance_rate: total > 0 ? ((present + late) / total * 100).toFixed(2) : 0,
                average_duration_minutes: Math.round(avgDurationMinutes)
            },
            report
        };
    }

    //   Get user attendance history
     
    async getUserAttendance(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const history = await attendanceRepository.getUserAttendance(userId, limit, offset);
        
        // Get total count
        const allHistory = await attendanceRepository.getUserAttendance(userId, 999999, 0);
        const total = allHistory.length;

        return {
            history,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    //   Update attendance status
     
    async updateStatus(meetingId, userId, status, requesterId) {
        const validStatuses = ['present', 'late', 'absent', 'excused'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        // Check if requester is host
        const isHost = await participantRepository.isHost(meetingId, requesterId);
        if (!isHost) {
            throw new Error('Only hosts can update attendance status');
        }

        return await attendanceRepository.updateStatus(meetingId, userId, status);
    }

    //   Update meeting analytics
     
    async updateMeetingAnalytics(meetingId) {
        try {
            const analytics = await attendanceRepository.getMeetingAnalytics(meetingId);
            if (!analytics) return;

            // Calculate attendance rate
            const attendanceRate = analytics.total_participants > 0
                ? (analytics.attended_participants / analytics.total_participants * 100)
                : 0;

            // Calculate engagement score (simplified)
            const engagementScore = this.calculateEngagementScore(analytics);

            // Update meeting_analytics table (if exists)
            await pool.execute(
                `INSERT INTO meeting_analytics 
                (meeting_id, total_participants, total_duration_seconds, total_messages, 
                 total_reactions, total_hand_raises, total_files_shared, 
                 max_concurrent_participants, attendance_rate, engagement_score, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                    total_participants = VALUES(total_participants),
                    total_duration_seconds = VALUES(total_duration_seconds),
                    total_messages = VALUES(total_messages),
                    total_reactions = VALUES(total_reactions),
                    total_hand_raises = VALUES(total_hand_raises),
                    total_files_shared = VALUES(total_files_shared),
                    max_concurrent_participants = VALUES(max_concurrent_participants),
                    attendance_rate = VALUES(attendance_rate),
                    engagement_score = VALUES(engagement_score),
                    updated_at = NOW()`,
                [
                    meetingId,
                    analytics.total_participants || 0,
                    analytics.total_duration_seconds || 0,
                    analytics.total_messages || 0,
                    analytics.total_reactions || 0,
                    analytics.total_hand_raises || 0,
                    analytics.total_files || 0,
                    analytics.attended_participants || 0,
                    attendanceRate,
                    engagementScore
                ]
            );
        } catch (error) {
            console.error('Error updating meeting analytics:', error);
        }
    }

    //   Calculate engagement score
     
    calculateEngagementScore(analytics) {
        let score = 0;
        const maxScore = 100;

        // Participation (max 40 points)
        if (analytics.total_participants > 0) {
            const participationRate = analytics.attended_participants / analytics.total_participants;
            score += participationRate * 40;
        }

        // Chat activity (max 30 points)
        if (analytics.total_participants > 0) {
            const avgMessages = analytics.total_messages / analytics.total_participants;
            score += Math.min(avgMessages * 2, 30);
        }

        // Reactions (max 20 points)
        if (analytics.total_participants > 0) {
            const avgReactions = analytics.total_reactions / analytics.total_participants;
            score += Math.min(avgReactions * 4, 20);
        }

        // Hand raises (max 10 points)
        if (analytics.total_participants > 0) {
            const avgHandRaises = analytics.total_hand_raises / analytics.total_participants;
            score += Math.min(avgHandRaises * 3, 10);
        }

        return Math.round(Math.min(score, maxScore));
    }
}

export default new AttendanceService();