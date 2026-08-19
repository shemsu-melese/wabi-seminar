import { pool } from '../config/database.js';
import crypto from 'crypto';

class PasswordResetRepository {

    //  Create a password reset token
     
    async create(data) {
        try {
            const { user_id, token, expires_at } = data;

            // Invalidate any existing unused tokens for this user
            await this.invalidateByUser(user_id);

            const [result] = await pool.execute(
                `INSERT INTO password_reset_tokens 
                (user_id, token, expires_at) 
                VALUES (?, ?, ?)`,
                [user_id, token, expires_at]
            );

            return this.findById(result.insertId);
        } catch (error) {
            console.error('Error creating password reset token:', error);
            throw error;
        }
    }

    //   Find reset token by token string
     
    async findByToken(token) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM password_reset_tokens WHERE token = ?',
                [token]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding reset token:', error);
            throw error;
        }
    }

    //   Find reset token by user ID
     
    async findByUser(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM password_reset_tokens WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding reset token by user:', error);
            throw error;
        }
    }

    //   Find by ID
     
    async findById(id) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM password_reset_tokens WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding reset token by ID:', error);
            throw error;
        }
    }

    //   Mark token as used
     
    async markAsUsed(id) {
        try {
            await pool.execute(
                'UPDATE password_reset_tokens SET is_used = TRUE WHERE id = ?',
                [id]
            );
            return true;
        } catch (error) {
            console.error('Error marking token as used:', error);
            throw error;
        }
    }

    //  Mark token as used by token string
    
    async markAsUsedByToken(token) {
        try {
            await pool.execute(
                'UPDATE password_reset_tokens SET is_used = TRUE WHERE token = ?',
                [token]
            );
            return true;
        } catch (error) {
            console.error('Error marking token as used by token:', error);
            throw error;
        }
    }

    //   Invalidate all tokens for a user
     
    async invalidateByUser(userId) {
        try {
            await pool.execute(
                'UPDATE password_reset_tokens SET is_used = TRUE WHERE user_id = ? AND is_used = FALSE',
                [userId]
            );
            return true;
        } catch (error) {
            console.error('Error invalidating user tokens:', error);
            throw error;
        }
    }

    //  Check if token is valid
     
    async isValid(token) {
        try {
            const record = await this.findByToken(token);
            if (!record) return false;
            if (record.is_used) return false;
            if (new Date() > new Date(record.expires_at)) return false;
            return true;
        } catch (error) {
            console.error('Error checking token validity:', error);
            return false;
        }
    }

    //   Get token with user details
     
    async getTokenWithUser(token) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    prt.*,
                    u.id as user_id,
                    u.email,
                    u.first_name,
                    u.last_name
                FROM password_reset_tokens prt
                JOIN users u ON prt.user_id = u.id
                WHERE prt.token = ?`,
                [token]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting token with user:', error);
            throw error;
        }
    }

    // Clean expired tokens (scheduled job)
     
    async cleanExpired() {
        try {
            const [result] = await pool.execute(
                'DELETE FROM password_reset_tokens WHERE expires_at < NOW()',
                []
            );
            return result.affectedRows;
        } catch (error) {
            console.error('Error cleaning expired tokens:', error);
            throw error;
        }
    }

    //   Get count of active tokens for a user
     
    async countActiveByUser(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT COUNT(*) as count FROM password_reset_tokens WHERE user_id = ? AND is_used = FALSE AND expires_at > NOW()',
                [userId]
            );
            return rows[0].count;
        } catch (error) {
            console.error('Error counting active tokens:', error);
            throw error;
        }
    }

    //   Generate secure reset token
    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    //  Get token expiry time
    //   Default: 1 hour from now
     
    getExpiryTime(hours = 1) {
        return new Date(Date.now() + hours * 60 * 60 * 1000);
    }
}

export default new PasswordResetRepository();