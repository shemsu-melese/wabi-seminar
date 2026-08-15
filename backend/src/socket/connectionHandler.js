import { meetingSocketHandler } from './meetingSocket.js';
import { signalingSocketHandler } from './signalingSocket.js';
import { participantSocketHandler } from './participantSocket.js';

// Store active connections
const activeConnections = new Map();

export const connectionHandler = (socket, io) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    // Store socket reference
    activeConnections.set(socket.id, {
        socket,
        userId: null,
        meetingId: null,
        username: null
    });

    // Socket event handlers
    socket.on('join-meeting', (data) => {
        handleJoinMeeting(socket, io, data);
    });

    socket.on('leave-meeting', () => {
        handleLeaveMeeting(socket, io);
    });

    socket.on('disconnect', () => {
        handleDisconnect(socket, io);
    });

    // Delegate to specific handlers
    meetingSocketHandler(socket, io);
    signalingSocketHandler(socket, io);
    participantSocketHandler(socket, io);
};

const handleJoinMeeting = (socket, io, data) => {
    const { meetingId, userId, username } = data;
    
    if (!meetingId || !userId) {
        socket.emit('error', { message: 'Missing meetingId or userId' });
        return;
    }

    // Update socket data
    const connection = activeConnections.get(socket.id);
    if (connection) {
        connection.userId = userId;
        connection.meetingId = meetingId;
        connection.username = username || `User-${userId}`;
    }

    // Join the room
    socket.join(`meeting-${meetingId}`);
    socket.data.meetingId = meetingId;
    socket.data.userId = userId;
    socket.data.username = username || `User-${userId}`;

    console.log(`👤 ${username || userId} joined meeting ${meetingId}`);

    // Get all participants in the room
    const room = io.sockets.adapter.rooms.get(`meeting-${meetingId}`);
    const participants = [];
    
    if (room) {
        for (const socketId of room) {
            const conn = activeConnections.get(socketId);
            if (conn && conn.userId !== userId) {
                participants.push({
                    userId: conn.userId,
                    username: conn.username,
                    socketId: socketId
                });
            }
        }
    }

    // Notify all participants about new user
    socket.to(`meeting-${meetingId}`).emit('user-joined', {
        userId,
        username: connection.username,
        socketId: socket.id
    });

    // Send existing participants to the new user
    socket.emit('existing-participants', participants);

    // Send participant count
    const participantCount = room ? room.size : 1;
    io.to(`meeting-${meetingId}`).emit('participant-count', {
        count: participantCount,
        meetingId
    });

    return { participants };
};

const handleLeaveMeeting = (socket, io) => {
    const { meetingId, userId, username } = socket.data;
    
    if (meetingId) {
        socket.leave(`meeting-${meetingId}`);
        
        // Notify others
        socket.to(`meeting-${meetingId}`).emit('user-left', {
            userId,
            username: username || 'Unknown User',
            socketId: socket.id
        });

        // Update participant count
        const room = io.sockets.adapter.rooms.get(`meeting-${meetingId}`);
        const count = room ? room.size : 0;
        io.to(`meeting-${meetingId}`).emit('participant-count', {
            count,
            meetingId
        });

        console.log(`👋 ${username || userId} left meeting ${meetingId}`);
    }

    // Clean up connection
    const connection = activeConnections.get(socket.id);
    if (connection) {
        connection.meetingId = null;
        connection.userId = null;
    }
};

const handleDisconnect = (socket, io) => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    
    const { meetingId, userId, username } = socket.data;
    
    if (meetingId) {
        // Notify others about disconnection
        socket.to(`meeting-${meetingId}`).emit('user-disconnected', {
            userId,
            username: username || 'Unknown User',
            socketId: socket.id
        });

        // Update participant count
        const room = io.sockets.adapter.rooms.get(`meeting-${meetingId}`);
        const count = room ? room.size : 0;
        io.to(`meeting-${meetingId}`).emit('participant-count', {
            count,
            meetingId
        });
    }

    // Clean up
    activeConnections.delete(socket.id);
};