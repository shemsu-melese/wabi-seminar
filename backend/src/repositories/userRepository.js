import { pool } from '../config/database.js';
class UserRepository {
    //  Find user by email
    async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    //  Find user by ID
    async findById(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    id, email, first_name, last_name, 
                    role, status, 
                    created_at, updated_at, last_login_at 
                FROM users 
                WHERE id = ? AND deleted_at IS NULL`,
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

     //  Create new user
     
    async create(userData) {
        try {
            const { 
                email, 
                password_hash, 
                first_name, 
                last_name, 
                role = 'user' 
            } = userData;

            const [result] = await pool.execute(
                `INSERT INTO users 
                (email, password_hash, first_name, last_name, role) 
                VALUES (?, ?, ?, ?, ?)`,
                [email, password_hash, first_name, last_name, role]
            );

            return this.findById(result.insertId);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    //   Update user profile
     
    async update(id, userData) {
        try {
            const { first_name, last_name } = userData;
            
            const updates = [];
            const values = [];

            if (first_name !== undefined) {
                updates.push('first_name = ?');
                values.push(first_name);
            }
            if (last_name !== undefined) {
                updates.push('last_name = ?');
                values.push(last_name);
            }

            if (updates.length === 0) {
                return this.findById(id);
            }

            values.push(id);
            
            await pool.execute(
                `UPDATE users 
                SET ${updates.join(', ')} 
                WHERE id = ? AND deleted_at IS NULL`,
                values
            );

            return this.findById(id);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    //   Update user password
    
    async updatePassword(id, password_hash) {
        try {
            await pool.execute(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                [password_hash, id]
            );
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    
    //   Update last login timestamp
     
    async updateLastLogin(id) {
        try {
            await pool.execute(
                'UPDATE users SET last_login_at = NOW() WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }

    
    // Soft delete user
     
    async delete(id) {
        try {
            await pool.execute(
                'UPDATE users SET deleted_at = NOW() WHERE id = ?',
                [id]
            );
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    //   Check if user exists by email
     
    async existsByEmail(email) {
        try {
            const user = await this.findByEmail(email);
            return !!user;
        } catch (error) {
            console.error('Error checking user existence:', error);
            throw error;
        }
    }

    //   Get user statistics
     
    async getUserStats(id) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    COUNT(DISTINCT mp.meeting_id) as total_meetings,
                    SUM(CASE WHEN mp.role = 'host' THEN 1 ELSE 0 END) as hosted_meetings,
                    AVG(a.duration_seconds) as avg_meeting_duration,
                    COUNT(DISTINCT a.meeting_id) as meetings_attended
                FROM users u
                LEFT JOIN meeting_participants mp ON u.id = mp.user_id
                LEFT JOIN attendance a ON u.id = a.user_id
                WHERE u.id = ?`,
                [id]
            );
            return rows[0] || { 
                total_meetings: 0, 
                hosted_meetings: 0, 
                avg_meeting_duration: 0,
                meetings_attended: 0
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    //   Get all users (admin only)
    async findAll(limit = 50, offset = 0) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    id, email, first_name, last_name, 
                    role, status, 
                    created_at, updated_at, last_login_at 
                FROM users 
                WHERE deleted_at IS NULL
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?`,
                [limit, offset]
            );
            return rows;
        } catch (error) {
            console.error('Error finding all users:', error);
            throw error;
        }
    }

    //  Count total users
    
    async count() {
        try {
            const [rows] = await pool.execute(
                'SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL'
            );
            return rows[0].total;
        } catch (error) {
            console.error('Error counting users:', error);
            throw error;
        }
    }

    //  Find users by name (search functionality)
     
    async searchByName(searchTerm, limit = 20) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    id, email, first_name, last_name, 
                    role, status
                FROM users 
                WHERE deleted_at IS NULL
                AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)
                LIMIT ?`,
                [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit]
            );
            return rows;
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }
}

export default new UserRepository();