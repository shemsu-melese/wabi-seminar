import { pool } from '../config/database.js';

class AttendanceRepository {
    /**
     * Create attendance record when user joins
     */
    async create(meetingId, userId) {
        try {
            // Check if already exists
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

    /**
     * Update attendance when user leaves
     */
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

    /**
     * Find attendance by meeting and user
     */
    async findByMeetingAndUser(meetingId, userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM attendance WHERE meeting_id = ? AND user_id = ?',
                [meetingId, userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding attendance:', error);
            throw error;
        }
    }

    /**
     * Get all attendance for a meeting
     */
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

    /**
     * Get attendance statistics for a meeting
     */
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

    /**
     * Update attendance status (host only)
     */
    async updateStatus(meetingId, userId, status) {
        try {
            await pool.execute(
                'UPDATE attendance SET status = ? WHERE meeting_id = ? AND user_id = ?',
                [status, meetingId, userId]
            );
            return this.findByMeetingAndUser(meetingId, userId);
        } catch (error) {
            console.error('Error updating attendance status:', error);
            throw error;
        }
    }

    /**
     * Get user attendance history
     */
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

    /**
     * Get attendance report for meeting (with user details)
     */
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
}

export default new AttendanceRepository();