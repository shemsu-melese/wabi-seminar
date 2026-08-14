export const connectionHandler = (socket, io) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    // Store socket in a map or room
    socket.on('join-meeting', (data) => {
        console.log(`👤 User ${data.userId} joined meeting ${data.meetingId}`);
        socket.join(`meeting-${data.meetingId}`);
        socket.data.userId = data.userId;
        socket.data.meetingId = data.meetingId;
    });
    
    socket.on('leave-meeting', () => {
        const { meetingId } = socket.data;
        if (meetingId) {
            socket.leave(`meeting-${meetingId}`);
            console.log(`👋 User ${socket.id} left meeting ${meetingId}`);
        }
    });
    
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        // Handle cleanup
    });
};

export default connectionHandler;