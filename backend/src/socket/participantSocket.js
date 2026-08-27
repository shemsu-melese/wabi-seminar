export const participantSocketHandler = (socket, io) => {
    // Raise hand
    socket.on('raise-hand', (data) => {
        const { meetingId, userId, username } = data;
        if (!meetingId || !userId) {
            socket.emit('error', { message: 'Missing meetingId or userId' });
            return;
        }
        console.log(`✋ ${username || userId} raised hand in meeting ${meetingId}`);
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
        io.to(`meeting-${meetingId}`).emit('hand-lowered', {
            userId,
            username,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });

    // Media state change (camera/mic)
    socket.on('media-state-change', (data) => {
        const { meetingId, userId, type, enabled } = data;
        if (!meetingId || !userId) {
            socket.emit('error', { message: 'Missing meetingId or userId' });
            return;
        }
        console.log(`📹 ${userId} ${type} ${enabled ? 'enabled' : 'disabled'}`);
        socket.to(`meeting-${meetingId}`).emit('media-state-updated', {
            userId,
            type,
            enabled,
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
        io.to(`meeting-${meetingId}`).emit('screen-share-updated', {
            userId,
            isSharing,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    });
};