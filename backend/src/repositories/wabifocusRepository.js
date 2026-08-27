import { pool } from '../config/database.js';

class WabiFocusRepository {
    // ============================================
    // CREATE – safe from undefined
    // ============================================
    async create(data) {
        try {
            // Build a safe object – every field gets a value (null if missing)
            const safe = {
                meeting_id: data.meeting_id ?? null,
                user_id: data.user_id ?? null,
                type: data.type ?? null,
                title: data.title ?? null,
                description: data.description ?? null,
                assigned_to: data.assigned_to ?? null,
                due_date: data.due_date ?? null,
                priority: data.priority ?? 'medium',
                order_index: data.order_index ?? 0,
            };

            // Double‑check: replace any leftover undefined with null
            Object.keys(safe).forEach((key) => {
                if (safe[key] === undefined) safe[key] = null;
            });

            // Auto‑compute order_index if not provided and type is given
            let orderIndex = safe.order_index;
            if (orderIndex === 0 && safe.type && safe.meeting_id) {
                const [orderResult] = await pool.execute(
                    'SELECT COALESCE(MAX(order_index), -1) + 1 as next_order FROM wabifocus_items WHERE meeting_id = ? AND type = ?',
                    [safe.meeting_id, safe.type]
                );
                orderIndex = orderResult[0].next_order;
            }

            const [result] = await pool.execute(
                `INSERT INTO wabifocus_items 
                (meeting_id, user_id, type, title, description, assigned_to, due_date, priority, order_index) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    safe.meeting_id,
                    safe.user_id,
                    safe.type,
                    safe.title,
                    safe.description,
                    safe.assigned_to,
                    safe.due_date,
                    safe.priority,
                    orderIndex,
                ]
            );

            return this.findById(result.insertId);
        } catch (error) {
            console.error('❌ Error creating WabiFocus item:', error);
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
            console.error('❌ Error finding WabiFocus item:', error);
            throw error;
        }
    }

    // ============================================
    // FIND BY MEETING
    // ============================================
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
            console.error('❌ Error getting WabiFocus items:', error);
            throw error;
        }
    }

    // ============================================
    // UPDATE (optional – keep as is)
    // ============================================
    async update(id, data) {
        try {
            const updates = [];
            const values = [];
            const fields = ['title', 'description', 'priority', 'is_completed', 'assigned_to', 'due_date', 'order_index'];
            for (const field of fields) {
                if (data[field] !== undefined) {
                    updates.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }
            if (data.completed_at !== undefined) {
                updates.push('completed_at = ?');
                values.push(data.completed_at);
            }
            if (updates.length === 0) return this.findById(id);
            values.push(id);
            await pool.execute(`UPDATE wabifocus_items SET ${updates.join(', ')} WHERE id = ?`, values);
            return this.findById(id);
        } catch (error) {
            console.error('❌ Error updating WabiFocus item:', error);
            throw error;
        }
    }

    // ============================================
    // DELETE (soft delete)
    // ============================================
    async delete(id) {
        try {
            await pool.execute('UPDATE wabifocus_items SET deleted_at = NOW() WHERE id = ?', [id]);
        } catch (error) {
            console.error('❌ Error deleting WabiFocus item:', error);
            throw error;
        }
    }
}

export default new WabiFocusRepository();