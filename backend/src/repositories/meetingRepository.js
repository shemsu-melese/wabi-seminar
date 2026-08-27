import { pool } from '../config/database.js';

class MeetingRepository {
    // ============================================
    // CREATE MEETING
    // ============================================
    async create(meetingData) {
        try {
            const safe = {
                code: meetingData.code ?? null,
                title: meetingData.title ?? null,
                description: meetingData.description ?? null,
                created_by: meetingData.created_by ?? null,
                start_time: meetingData.start_time ?? null,
                end_time: meetingData.end_time ?? null,
                duration_minutes: meetingData.duration_minutes ?? 30,
                meeting_type: meetingData.meeting_type ?? 'other',
                max_participants: meetingData.max_participants ?? 50,
                password_hash: meetingData.password_hash ?? null,
                is_locked: meetingData.is_locked ?? false,
                waiting_room_enabled: meetingData.waiting_room_enabled ?? true,
                allow_screen_sharing: meetingData.allow_screen_sharing ?? true,
                allow_chat: meetingData.allow_chat ?? true,
                allow_reactions: meetingData.allow_reactions ?? true,
                allow_raise_hand: meetingData.allow_raise_hand ?? true,
            };

            const [result] = await pool.execute(
                `INSERT INTO meetings (
                    code, title, description, created_by, start_time, end_time,
                    duration_minutes, meeting_type, max_participants, password_hash,
                    is_locked, waiting_room_enabled, allow_screen_sharing,
                    allow_chat, allow_reactions, allow_raise_hand
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    safe.code,
                    safe.title,
                    safe.description,
                    safe.created_by,
                    safe.start_time,
                    safe.end_time,
                    safe.duration_minutes,
                    safe.meeting_type,
                    safe.max_participants,
                    safe.password_hash,
                    safe.is_locked,
                    safe.waiting_room_enabled,
                    safe.allow_screen_sharing,
                    safe.allow_chat,
                    safe.allow_reactions,
                    safe.allow_raise_hand,
                ]
            );

            return this.findById(result.insertId);
        } catch (error) {
            console.error('❌ Error creating meeting:', error);
            throw error;
        }
    }

    // ============================================
    // FIND BY ID
    // ============================================
    async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.id,
                    m.code,
                    m.title,
                    m.description,
                    m.created_by,
                    m.start_time,
                    m.end_time,
                    m.duration_minutes,
                    m.status,
                    m.meeting_type,
                    m.max_participants,
                    m.password_hash,
                    m.is_locked,
                    m.waiting_room_enabled,
                    m.allow_screen_sharing,
                    m.allow_chat,
                    m.allow_reactions,
                    m.allow_raise_hand,
                    m.created_at,
                    m.updated_at,
                    m.deleted_at,
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
            console.error('❌ Error finding meeting by ID:', error);
            throw error;
        }
    }

    // ============================================
    // FIND BY CODE
    // ============================================
    async findByCode(code) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.id,
                    m.code,
                    m.title,
                    m.description,
                    m.created_by,
                    m.start_time,
                    m.end_time,
                    m.duration_minutes,
                    m.status,
                    m.meeting_type,
                    m.max_participants,
                    m.password_hash,
                    m.is_locked,
                    m.waiting_room_enabled,
                    m.allow_screen_sharing,
                    m.allow_chat,
                    m.allow_reactions,
                    m.allow_raise_hand,
                    m.created_at,
                    m.updated_at,
                    m.deleted_at,
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
            console.error('❌ Error finding meeting by code:', error);
            throw error;
        }
    }

    // ============================================
    // FIND BY USER – fixed (safe)
    // ============================================
    async findByUser(userId, status = null, limit = 50, offset = 0) {
        try {
            if (!userId) {
                console.error('findByUser: userId is required');
                return [];
            }

            let query = `
                SELECT DISTINCT
                    m.id,
                    m.code,
                    m.title,
                    m.description,
                    m.created_by,
                    m.start_time,
                    m.end_time,
                    m.duration_minutes,
                    m.status,
                    m.meeting_type,
                    m.max_participants,
                    m.password_hash,
                    m.is_locked,
                    m.waiting_room_enabled,
                    m.allow_screen_sharing,
                    m.allow_chat,
                    m.allow_reactions,
                    m.allow_raise_hand,
                    m.created_at,
                    m.updated_at,
                    m.deleted_at,
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
            params.push(parseInt(limit) || 50, parseInt(offset) || 0);

            const [rows] = await pool.execute(query, params);
            return rows;
        } catch (error) {
            console.error('❌ Error finding meetings by user:', error);
            throw error;
        }
    }

    // ============================================
    // COUNT BY USER – fixed (safe)
    // ============================================
    async countByUser(userId) {
        try {
            if (!userId) {
                console.error('countByUser: userId is required');
                return 0;
            }

            const [rows] = await pool.execute(
                `SELECT COUNT(DISTINCT m.id) as total
                FROM meetings m
                LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
                WHERE (m.created_by = ? OR mp.user_id = ?)
                AND m.deleted_at IS NULL`,
                [userId, userId]
            );
            return rows[0].total || 0;
        } catch (error) {
            console.error('❌ Error counting meetings by user:', error);
            throw error;
        }
    }

    // ============================================
    // CODE EXISTS
    // ============================================
    async codeExists(code) {
        try {
            const [rows] = await pool.execute(
                'SELECT id FROM meetings WHERE code = ? AND deleted_at IS NULL',
                [code]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('❌ Error checking code existence:', error);
            throw error;
        }
    }

    // ============================================
    // UPDATE
    // ============================================
    async update(id, meetingData) {
        try {
            const updates = [];
            const values = [];

            const fields = [
                'title',
                'description',
                'start_time',
                'end_time',
                'duration_minutes',
                'meeting_type',
                'max_participants',
                'is_locked',
                'waiting_room_enabled',
                'allow_screen_sharing',
                'allow_chat',
                'allow_reactions',
                'allow_raise_hand',
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
            console.error('❌ Error updating meeting:', error);
            throw error;
        }
    }

    // ============================================
    // UPDATE STATUS
    // ============================================
    async updateStatus(id, status) {
        try {
            await pool.execute(
                'UPDATE meetings SET status = ? WHERE id = ?',
                [status, id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('❌ Error updating meeting status:', error);
            throw error;
        }
    }

    // ============================================
    // START MEETING
    // ============================================
    async startMeeting(id) {
        try {
            await pool.execute(
                'UPDATE meetings SET status = "ongoing", start_time = NOW() WHERE id = ?',
                [id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('❌ Error starting meeting:', error);
            throw error;
        }
    }

    // ============================================
    // END MEETING
    // ============================================
    async endMeeting(id) {
        try {
            await pool.execute(
                'UPDATE meetings SET status = "ended", end_time = NOW() WHERE id = ?',
                [id]
            );
            return this.findById(id);
        } catch (error) {
            console.error('❌ Error ending meeting:', error);
            throw error;
        }
    }

    // ============================================
    // DELETE (soft delete)
    // ============================================
    async delete(id) {
        try {
            await pool.execute(
                'UPDATE meetings SET deleted_at = NOW() WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('❌ Error deleting meeting:', error);
            throw error;
        }
    }

    // ============================================
    // GET UPCOMING MEETINGS
    // ============================================
    async getUpcomingMeetings(userId, limit = 10) {
        try {
            const [rows] = await pool.execute(
                `SELECT DISTINCT
                    m.id,
                    m.code,
                    m.title,
                    m.description,
                    m.created_by,
                    m.start_time,
                    m.end_time,
                    m.duration_minutes,
                    m.status,
                    m.meeting_type,
                    m.max_participants,
                    m.password_hash,
                    m.is_locked,
                    m.waiting_room_enabled,
                    m.allow_screen_sharing,
                    m.allow_chat,
                    m.allow_reactions,
                    m.allow_raise_hand,
                    m.created_at,
                    m.updated_at,
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
            console.error('❌ Error getting upcoming meetings:', error);
            throw error;
        }
    }

    // ============================================
    // GET ACTIVE MEETINGS
    // ============================================
    async getActiveMeetings() {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.id,
                    m.code,
                    m.title,
                    m.description,
                    m.created_by,
                    m.start_time,
                    m.end_time,
                    m.duration_minutes,
                    m.status,
                    m.meeting_type,
                    m.max_participants,
                    m.password_hash,
                    m.is_locked,
                    m.waiting_room_enabled,
                    m.allow_screen_sharing,
                    m.allow_chat,
                    m.allow_reactions,
                    m.allow_raise_hand,
                    m.created_at,
                    m.updated_at,
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
            console.error('❌ Error getting active meetings:', error);
            throw error;
        }
    }

    // ============================================
    // GET STATISTICS
    // ============================================
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
                avg_duration: 0,
            };
        } catch (error) {
            console.error('❌ Error getting meeting statistics:', error);
            throw error;
        }
    }

    // ============================================
    // GET MEETING WITH DETAILS
    // ============================================
    async getMeetingWithDetails(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    m.id,
                    m.code,
                    m.title,
                    m.description,
                    m.created_by,
                    m.start_time,
                    m.end_time,
                    m.duration_minutes,
                    m.status,
                    m.meeting_type,
                    m.max_participants,
                    m.password_hash,
                    m.is_locked,
                    m.waiting_room_enabled,
                    m.allow_screen_sharing,
                    m.allow_chat,
                    m.allow_reactions,
                    m.allow_raise_hand,
                    m.created_at,
                    m.updated_at,
                    m.deleted_at,
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
            console.error('❌ Error getting meeting with details:', error);
            throw error;
        }
    }
}

export default new MeetingRepository();