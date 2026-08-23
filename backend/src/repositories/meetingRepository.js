import { pool } from '../config/database.js';
class MeetingRepository {

    //   Create a new meeting
    
    async create(meetingData) {
        try {
            const {
                code,
                title,
                description,
                created_by,
                start_time,
                end_time,
                duration_minutes,
                meeting_type,
                max_participants,
                password_hash,
                is_locked,
                waiting_room_enabled,
                allow_screen_sharing,
                allow_chat,
                allow_reactions,
                allow_raise_hand
            } = meetingData;

            const [result] = await pool.execute(
                `INSERT INTO meetings (
                    code, title, description, created_by, start_time, end_time,
                    duration_minutes, meeting_type, max_participants, password_hash,
                    is_locked, waiting_room_enabled, allow_screen_sharing,
                    allow_chat, allow_reactions, allow_raise_hand
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    code, 
                    title, 
                    description, 
                    created_by, 
                    start_time, 
                    end_time,
                    duration_minutes, 
                    meeting_type, 
                    max_participants, 
                    password_hash,
                    is_locked || false, 
                    waiting_room_enabled !== undefined ? waiting_room_enabled : true,
                    allow_screen_sharing !== undefined ? allow_screen_sharing : true,
                    allow_chat !== undefined ? allow_chat : true,
                    allow_reactions !== undefined ? allow_reactions : true,
                    allow_raise_hand !== undefined ? allow_raise_hand : true
                ]
            );

            return this.findById(result.insertId);
        } catch (error) {
            console.error('Error creating meeting:', error);
            throw error;
        }
    }

    //   Find meeting by ID
     
    async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    u.email as creator_email
                FROM meetings m
                LEFT JOIN users u ON m.created_by = u.id
                WHERE m.id = ? AND m.deleted_at IS NULL`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding meeting by ID:', error);
            throw error;
        }
    }

    //   Find meeting by code
     
    async findByCode(code) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    u.email as creator_email
                FROM meetings m
                LEFT JOIN users u ON m.created_by = u.id
                WHERE m.code = ? AND m.deleted_at IS NULL`,
                [code]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding meeting by code:', error);
            throw error;
        }
    }

    //   Get meetings for a user
     
    async findByUser(userId, status = null, limit = 50, offset = 0) {
        try {
            let query = `
                SELECT DISTINCT
                    m.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    mp.role as user_role,
                    mp.status as participant_status
                FROM meetings m
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                LEFT JOIN users u ON m.created_by = u.id
                WHERE (m.created_by = ? OR mp.user_id = ?)
                AND m.deleted_at IS NULL
            `;

            const params = [userId, userId];

            if (status) {
                query += ' AND m.status = ?';
                params.push(status);
            }

            query += ' ORDER BY m.start_time DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error finding meetings by user:', error);
            throw error;
        }
    }

    //   Get meetings created by user
     
    async findByCreator(userId, limit = 50, offset = 0) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    COUNT(mp.user_id) as participant_count
                FROM meetings m
                LEFT JOIN users u ON m.created_by = u.id
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                WHERE m.created_by = ? AND m.deleted_at IS NULL
                GROUP BY m.id
                ORDER BY m.created_at DESC
                LIMIT ? OFFSET ?`,
                [userId, limit, offset]
            );
            return rows;
        } catch (error) {
            console.error('Error finding meetings by creator:', error);
            throw error;
        }
    }

    //   Update meeting
     
    async update(id, meetingData) {
        try {
            const updates = [];
            const values = [];

            const fields = [
                'title', 'description', 'start_time', 'end_time',
                'duration_minutes', 'meeting_type', 'max_participants',
                'is_locked', 'waiting_room_enabled', 'allow_screen_sharing',
                'allow_chat', 'allow_reactions', 'allow_raise_hand'
            ];

            for (const field of fields) {
                if (meetingData[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    values.push(meetingData[field]);
                }
            }

            if (meetingData.status !== undefined) {
                updates.push('status = ?');
                values.push(meetingData.status);
            }

            if (updates.length === 0) {
                return this.findById(id);
            }

            values.push(id);
            await pool.execute(
                `UPDATE meetings SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            return this.findById(id);
        } catch (error) {
            console.error('Error updating meeting:', error);
            throw error;
        }
    }

    //   Update meeting status
     
    async updateStatus(id, status) {
        try {
            await pool.execute(
                'UPDATE meetings SET status = ? WHERE id = ?',
                [status, id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('Error updating meeting status:', error);
            throw error;
        }
    }

    //   Start meeting (set status to ongoing)
     
    async startMeeting(id) {
        try {
            await pool.execute(
                'UPDATE meetings SET status = "ongoing", start_time = NOW() WHERE id = ?',
                [id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('Error starting meeting:', error);
            throw error;
        }
    }

    //   End meeting (set status to ended)
     
    async endMeeting(id) {
        try {
            await pool.execute(
                'UPDATE meetings SET status = "ended", end_time = NOW() WHERE id = ?',
                [id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('Error ending meeting:', error);
            throw error;
        }
    }

    //   Delete meeting
    async delete(id) {
        try {
            await pool.execute(
                'UPDATE meetings SET deleted_at = NOW() WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('Error deleting meeting:', error);
            throw error;
        }
    }

    //   Count meetings for a user
    async countByUser(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT COUNT(DISTINCT m.id) as total
                FROM meetings m
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                WHERE (m.created_by = ? OR mp.user_id = ?)
                AND m.deleted_at IS NULL`,
                [userId, userId]
            );
            return rows[0].total;
        } catch (error) {
            console.error('Error counting meetings by user:', error);
            throw error;
        }
    }

    //  Get upcoming meetings for a user
     
    async getUpcomingMeetings(userId, limit = 10) {
        try {
            const [rows] = await pool.execute(
                `SELECT DISTINCT
                    m.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name
                FROM meetings m
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                LEFT JOIN users u ON m.created_by = u.id
                WHERE (m.created_by = ? OR mp.user_id = ?)
                AND m.status = 'scheduled'
                AND m.start_time > NOW()
                AND m.deleted_at IS NULL
                ORDER BY m.start_time ASC
                LIMIT ?`,
                [userId, userId, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error getting upcoming meetings:', error);
            throw error;
        }
    }

    //  Get active meetings
     
    async getActiveMeetings() {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    COUNT(mp.user_id) as participant_count
                FROM meetings m
                LEFT JOIN users u ON m.created_by = u.id
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                WHERE m.status = 'ongoing' AND m.deleted_at IS NULL
                GROUP BY m.id
                ORDER BY m.created_at DESC`
            );
            return rows;
        } catch (error) {
            console.error('Error getting active meetings:', error);
            throw error;
        }
    }

    //   Get meetings by status
    async findByStatus(status, limit = 50, offset = 0) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    u.email as creator_email,
                    COUNT(mp.user_id) as participant_count
                FROM meetings m
                LEFT JOIN users u ON m.created_by = u.id
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                WHERE m.status = ? AND m.deleted_at IS NULL
                GROUP BY m.id
                ORDER BY m.created_at DESC
                LIMIT ? OFFSET ?`,
                [status, limit, offset]
            );
            return rows;
        } catch (error) {
            console.error('Error finding meetings by status:', error);
            throw error;
        }
    }

    //   Check if meeting code exists
    async codeExists(code) {
        try {
            const [rows] = await pool.execute(
                'SELECT id FROM meetings WHERE code = ? AND deleted_at IS NULL',
                [code]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking code existence:', error);
            throw error;
        }
    }

    //   Get meeting statistics
    async getStatistics(userId = null) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_meetings,
                    SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as active_meetings,
                    SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_meetings,
                    SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END) as completed_meetings,
                    AVG(duration_minutes) as avg_duration
                FROM meetings
                WHERE deleted_at IS NULL
            `;

            const params = [];

            if (userId) {
                query += ' AND created_by = ?';
                params.push(userId);
            }

            const [rows] = await pool.execute(query, params);
            return rows[0] || {
                total_meetings: 0,
                active_meetings: 0,
                scheduled_meetings: 0,
                completed_meetings: 0,
                avg_duration: 0
            };
        } catch (error) {
            console.error('Error getting meeting statistics:', error);
            throw error;
        }
    }

    //   Get meeting with full details including participants and WabiFocus
    async getMeetingWithDetails(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    u.email as creator_email,
                    COUNT(DISTINCT mp.user_id) as participant_count
                FROM meetings m
                LEFT JOIN users u ON m.created_by = u.id
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                WHERE m.id = ? AND m.deleted_at IS NULL
                GROUP BY m.id`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting meeting with details:', error);
            throw error;
        }
    }

    //   Search meetings by title or description
    async search(searchTerm, userId = null, limit = 50, offset = 0) {
        try {
            let query = `
                SELECT 
                    m.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    COUNT(mp.user_id) as participant_count
                FROM meetings m
                LEFT JOIN users u ON m.created_by = u.id
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                WHERE (m.title LIKE ? OR m.description LIKE ?)
                AND m.deleted_at IS NULL
            `;

            const params = [`%${searchTerm}%`, `%${searchTerm}%`];

            if (userId) {
                query += ' AND (m.created_by = ? OR mp.user_id = ?)';
                params.push(userId, userId);
            }

            query += ' GROUP BY m.id ORDER BY m.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error searching meetings:', error);
            throw error;
        }
    }

    //   Get meetings by date range
    async findByDateRange(startDate, endDate, userId = null) {
        try {
            let query = `
                SELECT 
                    m.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    COUNT(mp.user_id) as participant_count
                FROM meetings m
                LEFT JOIN users u ON m.created_by = u.id
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                WHERE m.start_time BETWEEN ? AND ?
                AND m.deleted_at IS NULL
            `;

            const params = [startDate, endDate];

            if (userId) {
                query += ' AND (m.created_by = ? OR mp.user_id = ?)';
                params.push(userId, userId);
            }

            query += ' GROUP BY m.id ORDER BY m.start_time ASC';

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error finding meetings by date range:', error);
            throw error;
        }
    }

    //   Update meeting password
    async updatePassword(id, password_hash) {
        try {
            await pool.execute(
                'UPDATE meetings SET password_hash = ? WHERE id = ?',
                [password_hash, id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('Error updating meeting password:', error);
            throw error;
        }
    }

    //   Lock/unlock meeting
    async setLockStatus(id, isLocked) {
        try {
            await pool.execute(
                'UPDATE meetings SET is_locked = ? WHERE id = ?',
                [isLocked, id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('Error setting lock status:', error);
            throw error;
        }
    }

    //   Toggle waiting room
    async setWaitingRoom(id, enabled) {
        try {
            await pool.execute(
                'UPDATE meetings SET waiting_room_enabled = ? WHERE id = ?',
                [enabled, id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('Error toggling waiting room:', error);
            throw error;
        }
    }
}

export default new MeetingRepository();