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

            // Get max order_index for this meeting and type
            const [orderResult] = await pool.execute(
                'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM wabifocus_items WHERE meeting_id = ? AND type = ?',
                [meeting_id, type]
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
                    u.email as creator_email,
                    u2.first_name as assignee_first_name,
                    u2.last_name as assignee_last_name,
                    u2.email as assignee_email
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
                    u.email as creator_email,
                    u2.first_name as assignee_first_name,
                    u2.last_name as assignee_last_name,
                    u2.email as assignee_email
                FROM wabifocus_items wf
                LEFT JOIN users u ON wf.user_id = u.id
                LEFT JOIN users u2 ON wf.assigned_to = u2.id
                WHERE wf.meeting_id = ? AND wf.deleted_at IS NULL
                ORDER BY 
                    FIELD(wf.type, 'goal', 'agenda', 'outcome', 'decision', 'action_item'),
                    wf.order_index ASC`,
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
                    u.email as creator_email,
                    u2.first_name as assignee_first_name,
                    u2.last_name as assignee_last_name,
                    u2.email as assignee_email
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
     * Get incomplete action items for a meeting
     */
    async getActionItems(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    wf.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    u2.first_name as assignee_first_name,
                    u2.last_name as assignee_last_name,
                    u2.email as assignee_email
                FROM wabifocus_items wf
                LEFT JOIN users u ON wf.user_id = u.id
                LEFT JOIN users u2 ON wf.assigned_to = u2.id
                WHERE wf.meeting_id = ? 
                AND wf.type = 'action_item' 
                AND wf.is_completed = FALSE
                AND wf.deleted_at IS NULL
                ORDER BY wf.priority DESC, wf.order_index ASC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting action items:', error);
            throw error;
        }
    }

    /**
     * Get completed action items for a meeting
     */
    async getCompletedActionItems(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    wf.*,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name,
                    u2.first_name as assignee_first_name,
                    u2.last_name as assignee_last_name,
                    u2.email as assignee_email
                FROM wabifocus_items wf
                LEFT JOIN users u ON wf.user_id = u.id
                LEFT JOIN users u2 ON wf.assigned_to = u2.id
                WHERE wf.meeting_id = ? 
                AND wf.type = 'action_item' 
                AND wf.is_completed = TRUE
                AND wf.deleted_at IS NULL
                ORDER BY wf.completed_at DESC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting completed action items:', error);
            throw error;
        }
    }

    /**
     * Get user's assigned action items
     */
    async getAssignedActionItems(userId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    wf.*,
                    m.title as meeting_title,
                    m.code as meeting_code,
                    m.status as meeting_status,
                    u.first_name as creator_first_name,
                    u.last_name as creator_last_name
                FROM wabifocus_items wf
                JOIN meetings m ON wf.meeting_id = m.id
                JOIN users u ON wf.user_id = u.id
                WHERE wf.assigned_to = ? 
                AND wf.type = 'action_item'
                AND wf.deleted_at IS NULL
                ORDER BY wf.is_completed ASC, wf.priority DESC, wf.due_date ASC`,
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting assigned action items:', error);
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
     * Reorder items
     */
    async reorder(meetingId, type, itemIds) {
        try {
            for (let i = 0; i < itemIds.length; i++) {
                await pool.execute(
                    'UPDATE wabifocus_items SET order_index = ? WHERE id = ? AND meeting_id = ? AND type = ?',
                    [i, itemIds[i], meetingId, type]
                );
            }
            return true;
        } catch (error) {
            console.error('Error reordering items:', error);
            throw error;
        }
    }

    /**
     * Delete WabiFocus item (soft delete)
     */
    async delete(id, userId) {
        try {
            // Check ownership
            const [rows] = await pool.execute(
                'SELECT user_id FROM wabifocus_items WHERE id = ?',
                [id]
            );
            
            if (rows.length === 0) {
                throw new Error('Item not found');
            }
            
            if (rows[0].user_id !== userId) {
                throw new Error('You can only delete your own items');
            }

            await pool.execute(
                'UPDATE wabifocus_items SET deleted_at = NOW() WHERE id = ?',
                [id]
            );
            return true;
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
                    SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN is_completed = FALSE THEN 1 ELSE 0 END) as pending
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

    /**
     * Get meeting outcome (summary of goals, decisions, action items)
     */
    async getMeetingOutcome(meetingId) {
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
                WHERE wf.meeting_id = ? 
                AND wf.type IN ('goal', 'outcome', 'decision')
                AND wf.deleted_at IS NULL
                ORDER BY wf.type, wf.order_index`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting meeting outcome:', error);
            throw error;
        }
    }

    /**
     * Get action items with deadline approaching
     */
    async getUpcomingActionItems(days = 7) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    wf.*,
                    m.title as meeting_title,
                    m.code as meeting_code,
                    u.first_name as assignee_first_name,
                    u.last_name as assignee_last_name
                FROM wabifocus_items wf
                JOIN meetings m ON wf.meeting_id = m.id
                JOIN users u ON wf.assigned_to = u.id
                WHERE wf.type = 'action_item'
                AND wf.is_completed = FALSE
                AND wf.due_date IS NOT NULL
                AND wf.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
                AND wf.deleted_at IS NULL
                ORDER BY wf.due_date ASC`,
                [days]
            );
            return rows;
        } catch (error) {
            console.error('Error getting upcoming action items:', error);
            throw error;
        }
    }
}

export default new WabiFocusRepository();