import { connectionHandler } from './connectionHandler.js';

export const setupSocketServer = (io) => {
    console.log('📡 Setting up Socket.IO server...');
    
    io.on('connection', (socket) => {
        connectionHandler(socket, io);
    });
    
    io.on('error', (error) => {
        console.error('❌ Socket.IO error:', error);
    });
    
    console.log('✅ Socket.IO server ready');
};

export default setupSocketServer;