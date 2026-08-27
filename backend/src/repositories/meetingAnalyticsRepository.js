import { pool } from '../config/database.js';

class MeetingAnalyticsRepository {
    async getMeetingAnalytics(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.id,
                    m.title,
                    m.code,
                    m.status,
                    m.start_time,
                    m.end_time,
                    m.duration_minutes,
                    COUNT(DISTINCT mp.user_id) as total_participants,
                    COUNT(DISTINCT a.user_id) as attended_participants,
                    AVG(a.duration_seconds) as avg_duration_seconds,
                    SUM(a.duration_seconds) as total_duration_seconds,
                    (SELECT COUNT(*) FROM chat_messages WHERE meeting_id = m.id) as total_messages,
                    (SELECT COUNT(*) FROM reactions WHERE meeting_id = m.id) as total_reactions,
                    (SELECT COUNT(*) FROM hand_raises WHERE meeting_id = m.id) as total_hand_raises,
                    (SELECT COUNT(*) FROM meeting_files WHERE meeting_id = m.id) as total_files
                FROM meetings m
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                LEFT JOIN attendance a ON m.id = a.meeting_id
                WHERE m.id = ?
                GROUP BY m.id`,
                [meetingId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting meeting analytics:', error);
            throw error;
        }
    }
}

export default new MeetingAnalyticsRepository();