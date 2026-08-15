import { pool } from '../config/database.js';

class ChatRepository {
    /**
     * Save a new chat message
     */
    async saveMessage(meetingId, userId, content, messageType = 'text', parentMessageId = null) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO chat_messages 
                (meeting_id, user_id, content, message_type, parent_message_id) 
                VALUES (?, ?, ?, ?, ?)`,
                [meetingId, userId, content, messageType, parentMessageId]
            );
            
            return this.getMessageById(result.insertId);
        } catch (error) {
            console.error('Error saving chat message:', error);
            throw error;
        }
    }

    /**
     * Get message by ID
     */
    async getMessageById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    cm.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.avatar_url
                FROM chat_messages cm
                JOIN users u ON cm.user_id = u.id
                WHERE cm.id = ? AND cm.deleted_at IS NULL`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting message by ID:', error);
            throw error;
        }
    }

    /**
     * Get messages for a meeting
     */
    async getMessages(meetingId, limit = 50, offset = 0) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    cm.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.avatar_url
                FROM chat_messages cm
                JOIN users u ON cm.user_id = u.id
                WHERE cm.meeting_id = ? AND cm.deleted_at IS NULL
                ORDER BY cm.timestamp DESC
                LIMIT ? OFFSET ?`,
                [meetingId, limit, offset]
            );
            return rows;
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    }

    /**
     * Get message with replies
     */
    async getMessageWithReplies(messageId) {
        try {
            const message = await this.getMessageById(messageId);
            if (!message) return null;

            const [replies] = await pool.execute(
                `SELECT 
                    cm.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.avatar_url
                FROM chat_messages cm
                JOIN users u ON cm.user_id = u.id
                WHERE cm.parent_message_id = ? AND cm.deleted_at IS NULL
                ORDER BY cm.timestamp ASC`,
                [messageId]
            );

            return { ...message, replies };
        } catch (error) {
            console.error('Error getting message with replies:', error);
            throw error;
        }
    }

    /**
     * Delete message (soft delete)
     */
    async deleteMessage(messageId, userId) {
        try {
            // Check if user is the author
            const [rows] = await pool.execute(
                'SELECT user_id FROM chat_messages WHERE id = ?',
                [messageId]
            );
            
            if (rows.length === 0) {
                throw new Error('Message not found');
            }
            
            if (rows[0].user_id !== userId) {
                throw new Error('You can only delete your own messages');
            }

            await pool.execute(
                'UPDATE chat_messages SET deleted_at = NOW() WHERE id = ?',
                [messageId]
            );
            
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    /**
     * Pin message
     */
    async pinMessage(messageId, userId) {
        try {
            // Check if user is host or admin
            // This will be validated in service layer
            
            await pool.execute(
                'UPDATE chat_messages SET is_pinned = TRUE WHERE id = ?',
                [messageId]
            );
            return this.getMessageById(messageId);
        } catch (error) {
            console.error('Error pinning message:', error);
            throw error;
        }
    }

    /**
     * Unpin message
     */
    async unpinMessage(messageId) {
        try {
            await pool.execute(
                'UPDATE chat_messages SET is_pinned = FALSE WHERE id = ?',
                [messageId]
            );
            return this.getMessageById(messageId);
        } catch (error) {
            console.error('Error unpinning message:', error);
            throw error;
        }
    }

    /**
     * Get pinned messages
     */
    async getPinnedMessages(meetingId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    cm.*,
                    u.first_name,
                    u.last_name,
                    u.email,
                    u.avatar_url
                FROM chat_messages cm
                JOIN users u ON cm.user_id = u.id
                WHERE cm.meeting_id = ? 
                AND cm.is_pinned = TRUE 
                AND cm.deleted_at IS NULL
                ORDER BY cm.timestamp DESC`,
                [meetingId]
            );
            return rows;
        } catch (error) {
            console.error('Error getting pinned messages:', error);
            throw error;
        }
    }

    /**
     * Get message count for meeting
     */
    async getMessageCount(meetingId) {
        try {
            const [rows] = await pool.execute(
                'SELECT COUNT(*) as count FROM chat_messages WHERE meeting_id = ? AND deleted_at IS NULL',
                [meetingId]
            );
            return rows[0].count;
        } catch (error) {
            console.error('Error getting message count:', error);
            throw error;
        }
    }
}

export default new ChatRepository();