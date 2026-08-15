import { pool } from '../config/database.js';

class WabiFocusRepository {
    /**
     * Create a WabiFocus item
     */
    async create(data) {
        try {
            const {
                meeting_id,
                user_id,
                type,
                title,
                description,
                assigned_to,
                due_date,
                priority = 'medium'
            } = data;

            // Get max order_index for this meeting
            const [orderResult] = await pool.execute(
                'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM wabifocus_items WHERE meeting_id = ?',
                [meeting_id]
            );
            const order_index = orderResult[0].next_order;

            const [result] = await pool.execute(
                `INSERT INTO wabifocus_items 
                (meeting_id, user_id, type, title, description, assigned_to, due_date, priority, order_index) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [meeting_id, user_id, type, title, description, assigned_to, due_date, priority, order_index]
            );

            return this.findById(result.insertId);
        } catch (error) {
            console.error('Error creating WabiFocus item:', error);
            throw error;
        }
    }

    /**
     * Find WabiFocus item by ID
     */
    async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    wf.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    u2.first_name as assignee_first_name,
                    u2.last_name as assignee_last_name
                FROM wabifocus_items wf
                LEFT JOIN users u ON wf.user_id = u.id
                LEFT JOIN users u2 ON wf.assigned_to = u2.id
                WHERE wf.id = ? AND wf.deleted_at IS NULL`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding WabiFocus item:', error);
            throw error;
        }
    }

    /**
     * Get all WabiFocus items for a meeting
     */
    async findByMeeting(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    wf.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    u2.first_name as assignee_first_name,
                    u2.last_name as assignee_last_name
                FROM wabifocus_items wf
                LEFT JOIN users u ON wf.user_id = u.id
                LEFT JOIN users u2 ON wf.assigned_to = u2.id
                WHERE wf.meeting_id = ? AND wf.deleted_at IS NULL
                ORDER BY wf.type, wf.order_index ASC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting WabiFocus items:', error);
            throw error;
        }
    }

    /**
     * Get WabiFocus items by type for a meeting
     */
    async findByMeetingAndType(meetingId, type) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    wf.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    u2.first_name as assignee_first_name,
                    u2.last_name as assignee_last_name
                FROM wabifocus_items wf
                LEFT JOIN users u ON wf.user_id = u.id
                LEFT JOIN users u2 ON wf.assigned_to = u2.id
                WHERE wf.meeting_id = ? AND wf.type = ? AND wf.deleted_at IS NULL
                ORDER BY wf.order_index ASC`,
                [meetingId, type]
            );
            return rows;
        } catch (error) {
            console.error('Error getting WabiFocus items by type:', error);
            throw error;
        }
    }

    /**
     * Update WabiFocus item
     */
    async update(id, data) {
        try {
            const updates = [];
            const values = [];

            const fields = ['title', 'description', 'type', 'assigned_to', 'due_date', 'priority', 'order_index'];

            for (const field of fields) {
                if (data[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }

            if (data.is_completed !== undefined) {
                updates.push('is_completed = ?');
                values.push(data.is_completed);
                if (data.is_completed) {
                    updates.push('completed_at = NOW()');
                } else {
                    updates.push('completed_at = NULL');
                }
            }

            if (updates.length === 0) {
                return this.findById(id);
            }

            values.push(id);
            await pool.execute(
                `UPDATE wabifocus_items SET ${updates.join(', ')} WHERE id = ?`,
                values
            );

            return this.findById(id);
        } catch (error) {
            console.error('Error updating WabiFocus item:', error);
            throw error;
        }
    }

    /**
     * Delete WabiFocus item (soft delete)
     */
    async delete(id) {
        try {
            await pool.execute(
                'UPDATE wabifocus_items SET deleted_at = NOW() WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('Error deleting WabiFocus item:', error);
            throw error;
        }
    }

    /**
     * Get WabiFocus summary for a meeting
     */
    async getSummary(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    type,
                    COUNT(*) as total,
                    SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed
                FROM wabifocus_items
                WHERE meeting_id = ? AND deleted_at IS NULL
                GROUP BY type`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting WabiFocus summary:', error);
            throw error;
        }
    }
}

export default new WabiFocusRepository();