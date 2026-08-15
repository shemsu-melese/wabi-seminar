import app from './app.js';
import { createServer } from 'http';
import { setupSocketServer } from './socket/socketServer.js';
import config from './config/environment.js';

const PORT = config.port;

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.IO
setupSocketServer(httpServer);

// Start server
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO attached`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('\n🛑 Shutting down gracefully...');
    try {
        await new Promise((resolve, reject) => {
            httpServer.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('✅ HTTP server closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);