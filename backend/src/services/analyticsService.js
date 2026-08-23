import attendanceRepository from '../repositories/attendanceRepository.js';
import meetingRepository from '../repositories/meetingRepository.js';
import participantRepository from '../repositories/participantRepository.js';

class AnalyticsService {
   
    //   Get meeting analytics
     
    async getMeetingAnalytics(meetingId, userId) {
        const meeting = await meetingRepository.findById(meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Check access
        const isHost = await participantRepository.isHost(meetingId, userId);
        const isCreator = meeting.created_by === userId;
        if (!isHost && !isCreator) {
            throw new Error('Only hosts can view analytics');
        }

        const analytics = await attendanceRepository.getMeetingAnalytics(meetingId);
        const stats = await attendanceRepository.getAttendanceStats(meetingId);
        const participants = await participantRepository.getMeetingParticipants(meetingId);
        const messages = await attendanceRepository.getMeetingAnalytics(meetingId);

        // Get participant engagement
        const participantEngagement = participants.map(p => {
            return {
                user_id: p.user_id,
                name: `${p.first_name} ${p.last_name}`,
                email: p.email,
                role: p.role,
                status: p.status,
                joined_at: p.joined_at,
                left_at: p.left_at,
                is_muted: p.is_muted,
                is_video_on: p.is_video_on
            };
        });

        return {
            meeting: {
                id: meeting.id,
                title: meeting.title,
                code: meeting.code,
                status: meeting.status,
                start_time: meeting.start_time,
                end_time: meeting.end_time,
                duration_minutes: meeting.duration_minutes
            },
            statistics: {
                total_participants: analytics?.total_participants || 0,
                attended_participants: analytics?.attended_participants || 0,
                attendance_rate: analytics?.total_participants > 0 
                    ? ((analytics.attended_participants / analytics.total_participants) * 100).toFixed(2)
                    : 0,
                total_duration_minutes: Math.round((analytics?.total_duration_seconds || 0) / 60),
                average_duration_minutes: analytics?.attended_participants > 0
                    ? Math.round((analytics.total_duration_seconds / analytics.attended_participants) / 60)
                    : 0,
                total_messages: analytics?.total_messages || 0,
                total_reactions: analytics?.total_reactions || 0,
                total_hand_raises: analytics?.total_hand_raises || 0,
                total_files: analytics?.total_files || 0,
                engagement_score: analytics?.engagement_score || 0
            },
            participant_engagement: participantEngagement
        };
    }

    //   Get user analytics
     
    async getUserAnalytics(userId) {
        const analytics = await attendanceRepository.getUserAnalytics(userId);
        const recentMeetings = await meetingRepository.findByUser(userId, null, 5, 0);
        const upcomingMeetings = await meetingRepository.getUpcomingMeetings(userId);

        return {
            user: {
                id: userId,
                analytics: {
                    total_meetings: analytics?.total_meetings || 0,
                    hosted_meetings: analytics?.hosted_meetings || 0,
                    attended_meetings: analytics?.attended_meetings || 0,
                    total_minutes: Math.round((analytics?.total_minutes || 0) / 60),
                    average_meeting_duration: Math.round((analytics?.avg_meeting_duration || 0) / 60),
                    active_meetings: analytics?.active_meetings || 0,
                    upcoming_meetings: analytics?.upcoming_meetings || 0,
                    completed_meetings: analytics?.completed_meetings || 0,
                    total_messages: analytics?.total_messages || 0,
                    total_reactions: analytics?.total_reactions || 0
                }
            },
            recent_meetings: recentMeetings,
            upcoming_meetings: upcomingMeetings
        };
    }

    //  Get platform analytics (admin only)
     
    async getPlatformAnalytics(startDate = null, endDate = null) {
        const stats = await attendanceRepository.getPlatformAnalytics(startDate, endDate);
        const trends = await attendanceRepository.getMeetingTrends('monthly', 6);
        const activeMeetings = await meetingRepository.getActiveMeetings();

        return {
            overview: {
                total_meetings: stats?.total_meetings || 0,
                total_users: stats?.total_users || 0,
                total_participants: stats?.total_participants || 0,
                total_minutes: Math.round((stats?.total_minutes || 0) / 60),
                average_meeting_duration: Math.round(stats?.avg_meeting_duration || 0),
                active_meetings: stats?.active_meetings || 0,
                scheduled_meetings: stats?.scheduled_meetings || 0,
                completed_meetings: stats?.completed_meetings || 0,
                total_messages: stats?.total_messages || 0,
                total_reactions: stats?.total_reactions || 0
            },
            current_active_meetings: activeMeetings,
            trends: trends
        };
    }

    //   Export meeting report (CSV format)
     
    async exportMeetingReport(meetingId, userId, format = 'csv') {
        const reportData = await attendanceRepository.getAttendanceReport(meetingId);
        
        if (format === 'csv') {
            const csv = this.generateCSV(reportData);
            return csv;
        }

        return reportData;
    }

//  Generate CSV from report data
     
    generateCSV(data) {
        if (!data || data.length === 0) {
            return 'No data available';
        }

        const headers = ['Name', 'Email', 'Join Time', 'Leave Time', 'Duration (sec)', 'Status', 'Punctuality'];
        const rows = data.map(row => [
            `${row.first_name} ${row.last_name}`,
            row.email,
            row.join_time || 'N/A',
            row.leave_time || 'N/A',
            row.duration_seconds || '0',
            row.status || 'Not Joined',
            row.punctuality || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        return csvContent;
    }
}

export default new AnalyticsService();