import { Server } from 'socket.io';

let io = null;

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            socket.join(`user-${userId}`);
            console.log(`🔌 User ${userId} connected.`);
        }

        socket.on('join-meeting', (meetingId, userId) => {
            socket.join(`meeting-${meetingId}`);
            console.log(`📥 User ${userId} joined meeting room ${meetingId}`);
        });

        // other events (chat, reactions, hand raise) ...
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        console.warn('⚠️ Socket.io not initialized – emitting events will be ignored.');
        return {
            to: () => ({
                emit: () => console.warn('⚠️ Socket emit skipped – io not initialized.')
            })
        };
    }
    return io;
};