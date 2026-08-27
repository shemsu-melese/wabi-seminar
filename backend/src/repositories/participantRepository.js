import { pool } from '../config/database.js';

class ParticipantRepository {
    // ============================================
    // ADD PARTICIPANT – with safety guard
    // ============================================
    async addParticipant(meetingId, userId, role = 'participant') {
        try {
            if (!meetingId || !userId) {
                const errorMsg = `addParticipant: meetingId (${meetingId}) or userId (${userId}) is missing`;
                console.error('❌', errorMsg);
                throw new Error(errorMsg);
            }

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
            console.error('❌ Error adding participant:', error);
            throw error;
        }
    }

    // ============================================
    // GET PARTICIPANT
    // ============================================
    async getParticipant(meetingId, userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    mp.*,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM meeting_participants mp
                JOIN users u ON mp.user_id = u.id
                WHERE mp.meeting_id = ? AND mp.user_id = ?`,
                [meetingId, userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('❌ Error getting participant:', error);
            throw error;
        }
    }

    // ============================================
    // GET MEETING PARTICIPANTS
    // ============================================
    async getMeetingParticipants(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    mp.*,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM meeting_participants mp
                JOIN users u ON mp.user_id = u.id
                WHERE mp.meeting_id = ? AND mp.status != 'removed'
                ORDER BY mp.role DESC, mp.joined_at ASC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('❌ Error getting meeting participants:', error);
            throw error;
        }
    }

    // ============================================
    // GET USER MEETINGS
    // ============================================
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
            console.error('❌ Error getting user meetings:', error);
            throw error;
        }
    }

    // ============================================
    // UPDATE STATUS – FIXED: no extra comma
    // ============================================
    async updateStatus(meetingId, userId, status) {
        try {
            if (!meetingId || !userId) {
                const errorMsg = `updateStatus: meetingId (${meetingId}) or userId (${userId}) is missing`;
                console.error('❌', errorMsg);
                throw new Error(errorMsg);
            }

            // Build the SET clause dynamically
            let setClause = 'status = ?';
            const params = [status];
            if (status === 'joined') {
                setClause += ', joined_at = NOW()';
            } else if (status === 'left') {
                setClause += ', left_at = NOW()';
            }
            // For other statuses (e.g., 'waiting'), only update status

            params.push(meetingId, userId);
            await pool.execute(
                `UPDATE meeting_participants SET ${setClause} WHERE meeting_id = ? AND user_id = ?`,
                params
            );
            return this.getParticipant(meetingId, userId);
        } catch (error) {
            console.error('❌ Error updating participant status:', error);
            throw error;
        }
    }

    // ============================================
    // UPDATE ROLE
    // ============================================
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
            console.error('❌ Error updating participant role:', error);
            throw error;
        }
    }

    // ============================================
    // MUTE / UNMUTE
    // ============================================
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
            console.error('❌ Error muting participant:', error);
            throw error;
        }
    }

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
            console.error('❌ Error unmuting participant:', error);
            throw error;
        }
    }

    // ============================================
    // REMOVE PARTICIPANT
    // ============================================
    async removeParticipant(meetingId, userId) {
        try {
            await pool.execute(
                `UPDATE meeting_participants 
                SET status = 'removed', left_at = NOW() 
                WHERE meeting_id = ? AND user_id = ?`,
                [meetingId, userId]
            );
        } catch (error) {
            console.error('❌ Error removing participant:', error);
            throw error;
        }
    }

    // ============================================
    // CHECK PARTICIPANT / HOST
    // ============================================
    async isParticipant(meetingId, userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 1 FROM meeting_participants 
                WHERE meeting_id = ? AND user_id = ? AND status != 'removed'`,
                [meetingId, userId]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('❌ Error checking participant:', error);
            throw error;
        }
    }

    async isHost(meetingId, userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 1 FROM meeting_participants 
                WHERE meeting_id = ? AND user_id = ? AND role = 'host'`,
                [meetingId, userId]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('❌ Error checking host:', error);
            throw error;
        }
    }

    // ============================================
    // COUNTS & WAITING
    // ============================================
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
            console.error('❌ Error getting participant count:', error);
            throw error;
        }
    }

    async getWaitingParticipants(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    mp.*,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM meeting_participants mp
                JOIN users u ON mp.user_id = u.id
                WHERE mp.meeting_id = ? AND mp.status = 'waiting'
                ORDER BY mp.created_at ASC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('❌ Error getting waiting participants:', error);
            throw error;
        }
    }

    // ============================================
    // ADMIT PARTICIPANT – with safety guard
    // ============================================
    async admitParticipant(meetingId, userId) {
        try {
            if (!meetingId || !userId) {
                const errorMsg = `admitParticipant: meetingId (${meetingId}) or userId (${userId}) is missing`;
                console.error('❌', errorMsg);
                throw new Error(errorMsg);
            }

            await pool.execute(
                `UPDATE meeting_participants 
                SET status = 'joined', joined_at = NOW() 
                WHERE meeting_id = ? AND user_id = ? AND status = 'waiting'`,
                [meetingId, userId]
            );
            return this.getParticipant(meetingId, userId);
        } catch (error) {
            console.error('❌ Error admitting participant:', error);
            throw error;
        }
    }

    // ============================================
    // RAISE HAND – NEW
    // ============================================
    async raiseHand(meetingId, userId) {
        try {
            if (!meetingId || !userId) {
                const errorMsg = `raiseHand: meetingId (${meetingId}) or userId (${userId}) is missing`;
                console.error('❌', errorMsg);
                throw new Error(errorMsg);
            }

            await pool.execute(
                `UPDATE meeting_participants 
                 SET hand_raised_at = NOW() 
                 WHERE meeting_id = ? AND user_id = ?`,
                [meetingId, userId]
            );
            return this.getParticipant(meetingId, userId);
        } catch (error) {
            console.error('❌ Error raising hand:', error);
            throw error;
        }
    }

    // ============================================
    // LOWER HAND – NEW
    // ============================================
    async lowerHand(meetingId, userId) {
        try {
            if (!meetingId || !userId) {
                const errorMsg = `lowerHand: meetingId (${meetingId}) or userId (${userId}) is missing`;
                console.error('❌', errorMsg);
                throw new Error(errorMsg);
            }

            await pool.execute(
                `UPDATE meeting_participants 
                 SET hand_raised_at = NULL 
                 WHERE meeting_id = ? AND user_id = ?`,
                [meetingId, userId]
            );
            return this.getParticipant(meetingId, userId);
        } catch (error) {
            console.error('❌ Error lowering hand:', error);
            throw error;
        }
    }
}

export default new ParticipantRepository();