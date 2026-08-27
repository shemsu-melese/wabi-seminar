export const chatSocketHandler = (socket, io) => {
    // Send chat message
    socket.on('send-chat-message', (data) => {
        const { meetingId, userId, username, content } = data;
        if (!meetingId || !userId || !content) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }
        console.log(`💬 ${username}: ${content.substring(0, 50)}...`);
        io.to(`meeting-${meetingId}`).emit('new-chat-message', {
            userId,
            username,
            content,
            timestamp: new Date().toISOString(),
            socketId: socket.id
        });
    });

    // Typing indicator
    socket.on('typing', (data) => {
        const { meetingId, userId, username, isTyping } = data;
        if (!meetingId || !userId) return;
        socket.to(`meeting-${meetingId}`).emit('user-typing', {
            userId,
            username,
            isTyping,
            socketId: socket.id
        });
    });

    // Send reaction
    socket.on('send-reaction', (data) => {
        const { meetingId, userId, username, emoji } = data;
        if (!meetingId || !userId || !emoji) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }
        console.log(`😊 ${username} sent reaction ${emoji}`);
        io.to(`meeting-${meetingId}`).emit('new-reaction', {
            userId,
            username,
            emoji,
            timestamp: new Date().toISOString(),
            socketId: socket.id
        });
    });
};