//  Meeting-specific Socket Handler
// Handles meeting-wide events like chat messages

export const meetingSocketHandler = (socket, io) => {
    
    // Send chat message
    socket.on('send-message', (data) => {
        const { meetingId, userId, username, message, messageType = 'text' } = data;
        
        if (!meetingId || !userId || !message) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        console.log(`💬 ${username || userId}: ${message.substring(0, 50)}...`);
        
        // Broadcast to all participants in the meeting
        io.to(`meeting-${meetingId}`).emit('new-message', {
            userId,
            username,
            message,
            messageType,
            timestamp: new Date().toISOString(),
            socketId: socket.id
        });
    });

    // Send system message (join/leave notifications)
    socket.on('send-system-message', (data) => {
        const { meetingId, message, type } = data;
        
        if (!meetingId || !message) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        console.log(`📢 System: ${message}`);
        
        io.to(`meeting-${meetingId}`).emit('system-message', {
            message,
            type: type || 'info',
            timestamp: new Date().toISOString()
        });
    });

    // Update meeting notes
    socket.on('update-notes', (data) => {
        const { meetingId, userId, noteId, content } = data;
        
        if (!meetingId || !userId || !content) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        console.log(`📝 ${userId} updated notes in meeting ${meetingId}`);
        
        // Broadcast to all participants
        io.to(`meeting-${meetingId}`).emit('notes-updated', {
            noteId,
            content,
            updatedBy: userId,
            timestamp: new Date().toISOString()
        });
    });

    // Start a poll (even though polls are removed, we'll handle this)
    // This event is intentionally left empty as polls are removed

    // Whiteboard update
    socket.on('whiteboard-update', (data) => {
        const { meetingId, userId, action, data: canvasData } = data;
        
        if (!meetingId || !userId || !action) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        console.log(`🎨 ${userId} performed ${action} on whiteboard`);
        
        // Broadcast to all participants except sender
        socket.to(`meeting-${meetingId}`).emit('whiteboard-updated', {
            action,
            data: canvasData,
            userId,
            timestamp: new Date().toISOString()
        });
    });

    // File sharing event
    socket.on('file-shared', (data) => {
        const { meetingId, userId, username, file } = data;
        
        if (!meetingId || !userId || !file) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        console.log(`📎 ${username || userId} shared a file: ${file.filename}`);
        
        // Broadcast to all participants
        io.to(`meeting-${meetingId}`).emit('file-shared', {
            file,
            sharedBy: userId,
            sharedByUsername: username,
            timestamp: new Date().toISOString()
        });
    });

    // Request participant list
    socket.on('request-participants', (data) => {
        const { meetingId, userId } = data;
        
        if (!meetingId) {
            socket.emit('error', { message: 'Missing meetingId' });
            return;
        }

        const room = io.sockets.adapter.rooms.get(`meeting-${meetingId}`);
        const participants = [];
        
        if (room) {
            for (const socketId of room) {
                // Get participant info from socket data
                const s = io.sockets.sockets.get(socketId);
                if (s && s.data) {
                    participants.push({
                        userId: s.data.userId,
                        username: s.data.username || `User-${s.data.userId}`,
                        socketId: socketId,
                        isActive: true
                    });
                }
            }
        }

        socket.emit('participant-list', { meetingId, participants });
    });
};

export default meetingSocketHandler;