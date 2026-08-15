import { pool } from '../config/database.js';

class ParticipantRepository {
    /**
     * Add participant to meeting
     */
    async addParticipant(meetingId, userId, role = 'participant') {
        try {
            const [result] = await pool.execute(
                `INSERT INTO meeting_participants 
                (meeting_id, user_id, role, status, joined_at) 
                VALUES (?, ?, ?, 'joined', NOW())
                ON DUPLICATE KEY UPDATE 
                    status = 'joined',
                    joined_at = NOW(),
                    left_at = NULL,
                    role = ?`,
                [meetingId, userId, role, role]
            );
            
            return this.getParticipant(meetingId, userId);
        } catch (error) {
            console.error('Error adding participant:', error);
            throw error;
        }
    }

    /**
     * Get participant details
     */
    async getParticipant(meetingId, userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    mp.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.avatar_url
                FROM meeting_participants mp
                JOIN users u ON mp.user_id = u.id
                WHERE mp.meeting_id = ? AND mp.user_id = ?`,
                [meetingId, userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting participant:', error);
            throw error;
        }
    }

    /**
     * Get all participants for a meeting
     */
    async getMeetingParticipants(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    mp.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.avatar_url
                FROM meeting_participants mp
                JOIN users u ON mp.user_id = u.id
                WHERE mp.meeting_id = ? AND mp.status != 'removed'
                ORDER BY mp.role DESC, mp.joined_at ASC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting meeting participants:', error);
            throw error;
        }
    }

    /**
     * Get all meetings for a participant
     */
    async getUserMeetings(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    mp.*,
                    m.title,
                    m.code,
                    m.start_time,
                    m.end_time,
                    m.status as meeting_status
                FROM meeting_participants mp
                JOIN meetings m ON mp.meeting_id = m.id
                WHERE mp.user_id = ? AND mp.status != 'removed'
                ORDER BY m.start_time DESC`,
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting user meetings:', error);
            throw error;
        }
    }

    /**
     * Update participant status
     */
    async updateStatus(meetingId, userId, status) {
        try {
            await pool.execute(
                `UPDATE meeting_participants 
                SET status = ?, 
                    ${status === 'joined' ? 'joined_at = NOW()' : ''}
                    ${status === 'left' ? 'left_at = NOW()' : ''}
                WHERE meeting_id = ? AND user_id = ?`,
                [status, meetingId, userId]
            );
            return this.getParticipant(meetingId, userId);
        } catch (error) {
            console.error('Error updating participant status:', error);
            throw error;
        }
    }

    /**
     * Update participant role
     */
    async updateRole(meetingId, userId, role) {
        try {
            await pool.execute(
                `UPDATE meeting_participants 
                SET role = ? 
                WHERE meeting_id = ? AND user_id = ?`,
                [role, meetingId, userId]
            );
            return this.getParticipant(meetingId, userId);
        } catch (error) {
            console.error('Error updating participant role:', error);
            throw error;
        }
    }

    /**
     * Mute participant
     */
    async muteParticipant(meetingId, userId) {
        try {
            await pool.execute(
                `UPDATE meeting_participants 
                SET is_muted = TRUE 
                WHERE meeting_id = ? AND user_id = ?`,
                [meetingId, userId]
            );
            return this.getParticipant(meetingId, userId);
        } catch (error) {
            console.error('Error muting participant:', error);
            throw error;
        }
    }

    /**
     * Unmute participant
     */
    async unmuteParticipant(meetingId, userId) {
        try {
            await pool.execute(
                `UPDATE meeting_participants 
                SET is_muted = FALSE 
                WHERE meeting_id = ? AND user_id = ?`,
                [meetingId, userId]
            );
            return this.getParticipant(meetingId, userId);
        } catch (error) {
            console.error('Error unmuting participant:', error);
            throw error;
        }
    }

    /**
     * Remove participant from meeting
     */
    async removeParticipant(meetingId, userId) {
        try {
            await pool.execute(
                `UPDATE meeting_participants 
                SET status = 'removed', left_at = NOW() 
                WHERE meeting_id = ? AND user_id = ?`,
                [meetingId, userId]
            );
        } catch (error) {
            console.error('Error removing participant:', error);
            throw error;
        }
    }

    /**
     * Check if user is participant in meeting
     */
    async isParticipant(meetingId, userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT id FROM meeting_participants 
                WHERE meeting_id = ? AND user_id = ? AND status != 'removed'`,
                [meetingId, userId]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking participant:', error);
            throw error;
        }
    }

    /**
     * Check if user is host of meeting
     */
    async isHost(meetingId, userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT id FROM meeting_participants 
                WHERE meeting_id = ? AND user_id = ? AND role = 'host'`,
                [meetingId, userId]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking host:', error);
            throw error;
        }
    }

    /**
     * Get participant count for meeting
     */
    async getParticipantCount(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT COUNT(*) as count 
                FROM meeting_participants 
                WHERE meeting_id = ? AND status = 'joined'`,
                [meetingId]
            );
            return rows[0].count;
        } catch (error) {
            console.error('Error getting participant count:', error);
            throw error;
        }
    }

    /**
     * Get waiting room participants
     */
    async getWaitingParticipants(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    mp.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.avatar_url
                FROM meeting_participants mp
                JOIN users u ON mp.user_id = u.id
                WHERE mp.meeting_id = ? AND mp.status = 'waiting'
                ORDER BY mp.created_at ASC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting waiting participants:', error);
            throw error;
        }
    }

    /**
     * Admit participant from waiting room
     */
    async admitParticipant(meetingId, userId) {
        try {
            await pool.execute(
                `UPDATE meeting_participants 
                SET status = 'joined', joined_at = NOW() 
                WHERE meeting_id = ? AND user_id = ? AND status = 'waiting'`,
                [meetingId, userId]
            );
            return this.getParticipant(meetingId, userId);
        } catch (error) {
            console.error('Error admitting participant:', error);
            throw error;
        }
    }
}

export default new ParticipantRepository();