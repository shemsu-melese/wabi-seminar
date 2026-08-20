//  Real-time chat socket events
 
export const chatSocketHandler = (socket, io) => {
    
    // Send chat message (real-time)
    socket.on('send-chat-message', (data) => {
        const { meetingId, userId, username, content, messageType = 'text' } = data;
        
        if (!meetingId || !userId || !content) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        console.log(`💬 ${username}: ${content.substring(0, 50)}...`);
        
        // Broadcast to all participants in the meeting
        io.to(`meeting-${meetingId}`).emit('new-chat-message', {
            userId,
            username,
            content,
            messageType,
            timestamp: new Date().toISOString(),
            socketId: socket.id
        });
    });

    // Typing indicator
    socket.on('typing', (data) => {
        const { meetingId, userId, username, isTyping } = data;
        
        if (!meetingId || !userId) {
            return;
        }

        socket.to(`meeting-${meetingId}`).emit('user-typing', {
            userId,
            username,
            isTyping,
            socketId: socket.id
        });
    });

    // Send reaction (real-time)
    socket.on('send-reaction', (data) => {
        const { meetingId, userId, username, emoji, messageId } = data;
        
        if (!meetingId || !userId || !emoji) {
            socket.emit('error', { message: 'Missing required fields' });
            return;
        }

        console.log(`😊 ${username} sent reaction ${emoji}`);
        
        io.to(`meeting-${meetingId}`).emit('new-reaction', {
            userId,
            username,
            emoji,
            messageId,
            timestamp: new Date().toISOString(),
            socketId: socket.id
        });
    });
};

export default chatSocketHandler;