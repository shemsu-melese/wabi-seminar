import { Server } from 'socket.io';
import config from '../config/environment.js';
import { connectionHandler } from './connectionHandler.js';

let io = null;

export const setupSocketServer = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.client.url,
            credentials: true,
            methods: ['GET', 'POST']
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    console.log('📡 Setting up Socket.IO server...');

    // Connection handling
    io.on('connection', (socket) => {
        connectionHandler(socket, io);
    });

    io.on('error', (error) => {
        console.error('❌ Socket.IO error:', error);
    });

    console.log('✅ Socket.IO server ready');
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

export default { setupSocketServer, getIO };