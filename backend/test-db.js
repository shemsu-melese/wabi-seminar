// File: backend/test-db.js
import { pool, testConnection } from './src/config/database.js';

console.log('🔍 Testing database connection...');

async function testDatabase() {
    try {
        // Test connection
        const isConnected = await testConnection();
        
        if (isConnected) {
            console.log('✅ Database connection successful');
            
            // Test query
            const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
            console.log(`📊 Total users in database: ${rows[0].count}`);
            
            // Get database info
            const [dbInfo] = await pool.execute('SELECT DATABASE() as db_name');
            console.log(`📁 Database: ${dbInfo[0].db_name}`);
        }
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    } finally {
        await pool.end();
        console.log('🔌 Connection closed');
    }
}

testDatabase();