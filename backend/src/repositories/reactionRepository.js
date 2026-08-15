import { pool } from '../config/database.js';

class ReactionRepository {
    /**
     * Add a reaction
     */
    async addReaction(meetingId, userId, emoji, messageId = null) {
        try {
            // Check if reaction already exists
            const [existing] = await pool.execute(
                `SELECT id FROM reactions 
                WHERE meeting_id = ? AND user_id = ? AND emoji = ? 
                AND (message_id = ? OR (message_id IS NULL AND ? IS NULL))`,
                [meetingId, userId, emoji, messageId, messageId]
            );

            if (existing.length > 0) {
                // Remove reaction (toggle)
                await pool.execute(
                    'DELETE FROM reactions WHERE id = ?',
                    [existing[0].id]
                );
                return { removed: true };
            }

            const [result] = await pool.execute(
                `INSERT INTO reactions (meeting_id, user_id, emoji, message_id) 
                VALUES (?, ?, ?, ?)`,
                [meetingId, userId, emoji, messageId]
            );

            return this.getReactionById(result.insertId);
        } catch (error) {
            console.error('Error adding reaction:', error);
            throw error;
        }
    }

    /**
     * Get reaction by ID
     */
    async getReactionById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    r.*,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM reactions r
                JOIN users u ON r.user_id = u.id
                WHERE r.id = ?`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting reaction:', error);
            throw error;
        }
    }

    /**
     * Get reactions for a meeting
     */
    async getMeetingReactions(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    r.*,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM reactions r
                JOIN users u ON r.user_id = u.id
                WHERE r.meeting_id = ?
                ORDER BY r.timestamp DESC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting meeting reactions:', error);
            throw error;
        }
    }

    /**
     * Get reactions for a message
     */
    async getMessageReactions(messageId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    r.*,
                    u.first_name,
                    u.last_name,
                    u.email
                FROM reactions r
                JOIN users u ON r.user_id = u.id
                WHERE r.message_id = ?
                ORDER BY r.timestamp DESC`,
                [messageId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting message reactions:', error);
            throw error;
        }
    }

    /**
     * Get reaction count by emoji
     */
    async getReactionCounts(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    emoji,
                    COUNT(*) as count
                FROM reactions
                WHERE meeting_id = ?
                GROUP BY emoji`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting reaction counts:', error);
            throw error;
        }
    }

    /**
     * Remove reaction
     */
    async removeReaction(reactionId, userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT user_id FROM reactions WHERE id = ?',
                [reactionId]
            );
            
            if (rows.length === 0) {
                throw new Error('Reaction not found');
            }
            
            if (rows[0].user_id !== userId) {
                throw new Error('You can only remove your own reactions');
            }

            await pool.execute(
                'DELETE FROM reactions WHERE id = ?',
                [reactionId]
            );
            
            return true;
        } catch (error) {
            console.error('Error removing reaction:', error);
            throw error;
        }
    }
}

export default new ReactionRepository();