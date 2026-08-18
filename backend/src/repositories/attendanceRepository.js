import { pool } from '../config/database.js';
class AttendanceRepository {
    
    //  Create attendance record when user joins
     
    async create(meetingId, userId) {
        try {
            const existing = await this.findByMeetingAndUser(meetingId, userId);
            if (existing) {
                await pool.execute(
                    `UPDATE attendance 
                    SET join_time = NOW(), leave_time = NULL, status = 'present'
                    WHERE meeting_id = ? AND user_id = ?`,
                    [meetingId, userId]
                );
                return this.findByMeetingAndUser(meetingId, userId);
            }

            const [result] = await pool.execute(
                `INSERT INTO attendance (meeting_id, user_id, join_time, status)
                VALUES (?, ?, NOW(), 'present')`,
                [meetingId, userId]
            );

            return this.findByMeetingAndUser(meetingId, userId);
        } catch (error) {
            console.error('Error creating attendance:', error);
            throw error;
        }
    }

    //   Update attendance when user leaves
     
    async updateLeaveTime(meetingId, userId) {
        try {
            await pool.execute(
                `UPDATE attendance 
                SET leave_time = NOW(), 
                    duration_seconds = TIMESTAMPDIFF(SECOND, join_time, NOW())
                WHERE meeting_id = ? AND user_id = ? AND leave_time IS NULL`,
                [meetingId, userId]
            );
            return this.findByMeetingAndUser(meetingId, userId);
        } catch (error) {
            console.error('Error updating leave time:', error);
            throw error;
        }
    }

    //  Find attendance by meeting and user
     
    async findByMeetingAndUser(meetingId, userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT * FROM attendance 
                WHERE meeting_id = ? AND user_id = ?`,
                [meetingId, userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding attendance:', error);
            throw error;
        }
    }

    //  Get all attendance for a meeting
    async findByMeeting(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    a.*,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM attendance a
                JOIN users u ON a.user_id = u.id
                WHERE a.meeting_id = ?
                ORDER BY a.join_time ASC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting meeting attendance:', error);
            throw error;
        }
    }

    //  Get attendance with statistics
    async getAttendanceStats(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    COUNT(*) as total_attendees,
                    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                    SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
                    SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
                    SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused,
                    AVG(duration_seconds) as avg_duration,
                    MAX(duration_seconds) as max_duration,
                    MIN(duration_seconds) as min_duration
                FROM attendance
                WHERE meeting_id = ?`,
                [meetingId]
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting attendance stats:', error);
            throw error;
        }
    }

    //  Update attendance status
    async updateStatus(meetingId, userId, status) {
        try {
            await pool.execute(
                `UPDATE attendance 
                SET status = ?
                WHERE meeting_id = ? AND user_id = ?`,
                [status, meetingId, userId]
            );
            return this.findByMeetingAndUser(meetingId, userId);
        } catch (error) {
            console.error('Error updating attendance status:', error);
            throw error;
        }
    }

    //  Get user attendance history
     
    async getUserAttendance(userId, limit = 50, offset = 0) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    a.*,
                    m.title as meeting_title,
                    m.code as meeting_code,
                    m.status as meeting_status,
                    m.start_time as meeting_start_time,
                    u2.first_name as host_first_name,
                    u2.last_name as host_last_name
                FROM attendance a
                JOIN meetings m ON a.meeting_id = m.id
                JOIN users u2 ON m.created_by = u2.id
                WHERE a.user_id = ?
                ORDER BY a.join_time DESC
                LIMIT ? OFFSET ?`,
                [userId, limit, offset]
            );
            return rows;
        } catch (error) {
            console.error('Error getting user attendance:', error);
            throw error;
        }
    }

    //  Get attendance report for meeting
     
    async getAttendanceReport(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    u.id as user_id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    a.join_time,
                    a.leave_time,
                    a.duration_seconds,
                    a.status,
                    CASE 
                        WHEN a.join_time IS NULL THEN 'Not Joined'
                        WHEN a.join_time <= DATE_ADD(m.start_time, INTERVAL 5 MINUTE) THEN 'On Time'
                        ELSE 'Late'
                    END as punctuality,
                    m.title as meeting_title,
                    m.start_time as meeting_start_time,
                    m.end_time as meeting_end_time,
                    m.duration_minutes as planned_duration
                FROM meetings m
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                LEFT JOIN users u ON mp.user_id = u.id
                LEFT JOIN attendance a ON m.id = a.meeting_id AND u.id = a.user_id
                WHERE m.id = ?
                AND mp.status != 'removed'
                ORDER BY a.join_time ASC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting attendance report:', error);
            throw error;
        }
    }

    //  Get meeting analytics data
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

    //  Get platform-wide analytics
    async getPlatformAnalytics(startDate = null, endDate = null) {
        try {
            let dateFilter = '';
            const params = [];

            if (startDate && endDate) {
                dateFilter = 'WHERE created_at BETWEEN ? AND ?';
                params.push(startDate, endDate);
            }

            const [rows] = await pool.execute(
                `SELECT 
                    COUNT(DISTINCT m.id) as total_meetings,
                    COUNT(DISTINCT u.id) as total_users,
                    COUNT(DISTINCT mp.user_id) as total_participants,
                    SUM(m.duration_minutes) as total_minutes,
                    AVG(m.duration_minutes) as avg_meeting_duration,
                    SUM(CASE WHEN m.status = 'ongoing' THEN 1 ELSE 0 END) as active_meetings,
                    SUM(CASE WHEN m.status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_meetings,
                    SUM(CASE WHEN m.status = 'ended' THEN 1 ELSE 0 END) as completed_meetings,
                    (SELECT COUNT(*) FROM chat_messages) as total_messages,
                    (SELECT COUNT(*) FROM reactions) as total_reactions
                FROM meetings m
                LEFT JOIN users u ON m.created_by = u.id
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                ${dateFilter}`,
                params
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting platform analytics:', error);
            throw error;
        }
    }

    //   Get user-specific analytics
    
    async getUserAnalytics(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    COUNT(DISTINCT m.id) as total_meetings,
                    COUNT(DISTINCT CASE WHEN m.created_by = ? THEN m.id END) as hosted_meetings,
                    COUNT(DISTINCT a.meeting_id) as attended_meetings,
                    SUM(a.duration_seconds) as total_minutes,
                    AVG(a.duration_seconds) as avg_meeting_duration,
                    COUNT(DISTINCT CASE WHEN m.status = 'ongoing' THEN m.id END) as active_meetings,
                    COUNT(DISTINCT CASE WHEN m.status = 'scheduled' THEN m.id END) as upcoming_meetings,
                    COUNT(DISTINCT CASE WHEN m.status = 'ended' THEN m.id END) as completed_meetings,
                    (SELECT COUNT(*) FROM chat_messages WHERE user_id = ?) as total_messages,
                    (SELECT COUNT(*) FROM reactions WHERE user_id = ?) as total_reactions
                FROM meetings m
                LEFT JOIN attendance a ON m.id = a.meeting_id AND a.user_id = ?
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id AND mp.user_id = ?
                WHERE m.created_by = ? OR mp.user_id = ? OR a.user_id = ?`,
                [userId, userId, userId, userId, userId, userId, userId, userId]
            );
            return rows[0];
        } catch (error) {
            console.error('Error getting user analytics:', error);
            throw error;
        }
    }

    //   Get meeting trends (daily/weekly/monthly)
    async getMeetingTrends(period = 'monthly', limit = 12) {
        try {
            let groupBy;
            switch (period) {
                case 'daily':
                    groupBy = 'DATE(start_time)';
                    break;
                case 'weekly':
                    groupBy = 'YEARWEEK(start_time)';
                    break;
                case 'monthly':
                default:
                    groupBy = 'DATE_FORMAT(start_time, "%Y-%m")';
                    break;
            }

            const [rows] = await pool.execute(
                `SELECT 
                    ${groupBy} as period,
                    COUNT(*) as meeting_count,
                    COUNT(DISTINCT created_by) as unique_hosts,
                    SUM(duration_minutes) as total_minutes,
                    AVG(duration_minutes) as avg_duration
                FROM meetings
                WHERE status = 'ended' AND start_time IS NOT NULL
                GROUP BY period
                ORDER BY period DESC
                LIMIT ?`,
                [limit]
            );
            return rows;
        } catch (error) {
            console.error('Error getting meeting trends:', error);
            throw error;
        }
    }
}

export default new AttendanceRepository();