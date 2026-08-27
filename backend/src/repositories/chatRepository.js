import { pool } from '../config/database.js';

class ChatRepository {
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

    async getMessageById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    cm.*,
                    u.first_name,
                    u.last_name,
                    u.email
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

    async getMessages(meetingId, limit = 50, offset = 0) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    cm.*,
                    u.first_name,
                    u.last_name,
                    u.email
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

    async getMessageWithReplies(messageId) {
        try {
            const message = await this.getMessageById(messageId);
            if (!message) return null;

            const [replies] = await pool.execute(
                `SELECT 
                    cm.*,
                    u.first_name,
                    u.last_name,
                    u.email
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

    // ... other methods (delete, pin, etc.) remain unchanged
}

export default new ChatRepository();