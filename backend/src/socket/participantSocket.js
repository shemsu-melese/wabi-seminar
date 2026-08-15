/**
 * Participant State Management Handler
 * Handles participant status updates, media states, etc.
 */
export const participantSocketHandler = (socket, io) => {
    
    // Update media state (camera/mic on/off)
    socket.on('media-state-change', (data) => {
        const { meetingId, userId, type, enabled } = data;
        
        if (!meetingId || !userId) {
            socket.emit('error', { message: 'Missing meetingId or userId' });
            return;
        }

        console.log(`📹 ${userId} ${type} ${enabled ? 'enabled' : 'disabled'}`);
        
        // Broadcast to all participants in the meeting
        socket.to(`meeting-${meetingId}`).emit('media-state-updated', {
            userId,
            type, // 'camera' or 'microphone'
            enabled,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    // Raise hand
    socket.on('raise-hand', (data) => {
        const { meetingId, userId, username } = data;
        
        if (!meetingId || !userId) {
            socket.emit('error', { message: 'Missing meetingId or userId' });
            return;
        }

        console.log(`✋ ${username || userId} raised hand in meeting ${meetingId}`);
        
        // Broadcast to all participants
        io.to(`meeting-${meetingId}`).emit('hand-raised', {
            userId,
            username,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    // Lower hand
    socket.on('lower-hand', (data) => {
        const { meetingId, userId, username } = data;
        
        if (!meetingId || !userId) {
            socket.emit('error', { message: 'Missing meetingId or userId' });
            return;
        }

        console.log(`✋ ${username || userId} lowered hand in meeting ${meetingId}`);
        
        // Broadcast to all participants
        io.to(`meeting-${meetingId}`).emit('hand-lowered', {
            userId,
            username,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    // Emoji reaction
    socket.on('send-reaction', (data) => {
        const { meetingId, userId, username, emoji } = data;
        
        if (!meetingId || !userId || !emoji) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        console.log(`😊 ${username || userId} sent reaction ${emoji}`);
        
        // Broadcast to all participants
        io.to(`meeting-${meetingId}`).emit('reaction-received', {
            userId,
            username,
            emoji,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    // Screen sharing state
    socket.on('screen-share-state', (data) => {
        const { meetingId, userId, isSharing } = data;
        
        if (!meetingId || !userId) {
            socket.emit('error', { message: 'Missing meetingId or userId' });
            return;
        }

        console.log(`🖥️ ${userId} ${isSharing ? 'started' : 'stopped'} screen sharing`);
        
        // Broadcast to all participants
        io.to(`meeting-${meetingId}`).emit('screen-share-updated', {
            userId,
            isSharing,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    // Participant typing (chat)
    socket.on('typing', (data) => {
        const { meetingId, userId, username, isTyping } = data;
        
        if (!meetingId || !userId) {
            socket.emit('error', { message: 'Missing meetingId or userId' });
            return;
        }

        // Broadcast to all participants except sender
        socket.to(`meeting-${meetingId}`).emit('user-typing', {
            userId,
            username,
            isTyping,
            socketId: socket.id
        });
    });

    // Participant muted by host
    socket.on('host-mute-participant', (data) => {
        const { meetingId, hostId, targetUserId } = data;
        
        if (!meetingId || !hostId || !targetUserId) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        console.log(`🔇 Host ${hostId} muted ${targetUserId}`);
        
        // Find the target socket
        // Note: In production, you'd track socket IDs by userId
        io.to(`meeting-${meetingId}`).emit('participant-muted', {
            targetUserId,
            mutedBy: hostId,
            timestamp: new Date().toISOString()
        });
    });

    // Participant removed by host
    socket.on('host-remove-participant', (data) => {
        const { meetingId, hostId, targetUserId } = data;
        
        if (!meetingId || !hostId || !targetUserId) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        console.log(`🚫 Host ${hostId} removed ${targetUserId}`);
        
        // Broadcast to all participants
        io.to(`meeting-${meetingId}`).emit('participant-removed', {
            targetUserId,
            removedBy: hostId,
            timestamp: new Date().toISOString()
        });

        // In production, you'd also disconnect the participant
    });

    // Meeting locked/unlocked
    socket.on('meeting-lock-state', (data) => {
        const { meetingId, userId, isLocked } = data;
        
        if (!meetingId || !userId) {
            socket.emit('error', { message: 'Missing meetingId or userId' });
            return;
        }

        console.log(`🔒 Meeting ${meetingId} ${isLocked ? 'locked' : 'unlocked'} by ${userId}`);
        
        // Broadcast to all participants
        io.to(`meeting-${meetingId}`).emit('meeting-lock-updated', {
            isLocked,
            updatedBy: userId,
            timestamp: new Date().toISOString()
        });
    });
};

export default participantSocketHandler;