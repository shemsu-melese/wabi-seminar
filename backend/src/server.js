import app from './app.js';
import { createServer } from 'http';
import { setupSocketServer } from './socket/socketServer.js';
import config from './config/environment.js';

/**
 * WabiSeminar Server Entry Point
 * This file sets up the HTTP server and attaches Socket.IO for real-time communication.
 */

const PORT = config.port || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.IO with the HTTP server
setupSocketServer(httpServer);

// Start the server
httpServer.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 WabiSeminar Backend Server');
    console.log('========================================');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO server attached on port ${PORT}`);
    console.log(`🌍 Environment: ${config.nodeEnv || 'development'}`);
    console.log('========================================');
    console.log('✅ Server is ready to accept connections');
});

// ============================================
// Graceful Shutdown Handler
// ============================================

const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

    // Close the HTTP server
    httpServer.close((err) => {
        if (err) {
            console.error('❌ Error closing HTTP server:', err);
            process.exit(1);
        }
        console.log('✅ HTTP server closed');
        process.exit(0);
    });

    // Force close after 10 seconds if server doesn't close
    setTimeout(() => {
        console.error('⚠️ Force closing after timeout');
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

// ============================================
// Health Check (optional – also in app.js)
// ============================================

// Log startup time
const startupTime = new Date().toISOString();
console.log(`📅 Startup time: ${startupTime}`);

// Export the server for testing purposes
export { httpServer };

console.log('✅ Server initialization complete');