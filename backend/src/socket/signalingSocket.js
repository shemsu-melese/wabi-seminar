/**
 * WebRTC Signaling Handler
 * Handles SDP offers/answers and ICE candidates
 */
export const signalingSocketHandler = (socket, io) => {
    
    // WebRTC Offer
    socket.on('webrtc-offer', (data) => {
        const { targetSocketId, offer, meetingId } = data;
        
        if (!targetSocketId || !offer) {
            socket.emit('error', { message: 'Missing target or offer' });
            return;
        }

        console.log(`📤 WebRTC offer from ${socket.id} to ${targetSocketId}`);
        
        // Forward offer to target
        io.to(targetSocketId).emit('webrtc-offer', {
            offer,
            from: socket.id,
            fromUserId: socket.data.userId,
            fromUsername: socket.data.username,
            meetingId
        });
    });

    // WebRTC Answer
    socket.on('webrtc-answer', (data) => {
        const { targetSocketId, answer, meetingId } = data;
        
        if (!targetSocketId || !answer) {
            socket.emit('error', { message: 'Missing target or answer' });
            return;
        }

        console.log(`📤 WebRTC answer from ${socket.id} to ${targetSocketId}`);
        
        // Forward answer to target
        io.to(targetSocketId).emit('webrtc-answer', {
            answer,
            from: socket.id,
            fromUserId: socket.data.userId,
            fromUsername: socket.data.username,
            meetingId
        });
    });

    // ICE Candidate
    socket.on('webrtc-ice-candidate', (data) => {
        const { targetSocketId, candidate, meetingId } = data;
        
        if (!targetSocketId || !candidate) {
            socket.emit('error', { message: 'Missing target or candidate' });
            return;
        }

        // Forward ICE candidate to target
        io.to(targetSocketId).emit('webrtc-ice-candidate', {
            candidate,
            from: socket.id,
            fromUserId: socket.data.userId,
            fromUsername: socket.data.username,
            meetingId
        });
    });

    // Request to start call with specific user
    socket.on('start-call', (data) => {
        const { targetSocketId, meetingId } = data;
        
        if (!targetSocketId) {
            socket.emit('error', { message: 'Missing target' });
            return;
        }

        console.log(`📞 ${socket.id} requesting call with ${targetSocketId}`);
        
        io.to(targetSocketId).emit('incoming-call', {
            from: socket.id,
            fromUserId: socket.data.userId,
            fromUsername: socket.data.username,
            meetingId
        });
    });

    // Accept incoming call
    socket.on('accept-call', (data) => {
        const { targetSocketId, meetingId } = data;
        
        if (!targetSocketId) {
            socket.emit('error', { message: 'Missing target' });
            return;
        }

        console.log(`✅ ${socket.id} accepted call from ${targetSocketId}`);
        
        io.to(targetSocketId).emit('call-accepted', {
            from: socket.id,
            fromUserId: socket.data.userId,
            fromUsername: socket.data.username,
            meetingId
        });
    });

    // Reject incoming call
    socket.on('reject-call', (data) => {
        const { targetSocketId, meetingId } = data;
        
        if (!targetSocketId) {
            socket.emit('error', { message: 'Missing target' });
            return;
        }

        console.log(`❌ ${socket.id} rejected call from ${targetSocketId}`);
        
        io.to(targetSocketId).emit('call-rejected', {
            from: socket.id,
            fromUserId: socket.data.userId,
            fromUsername: socket.data.username,
            meetingId
        });
    });

    // End call
    socket.on('end-call', (data) => {
        const { targetSocketId, meetingId } = data;
        
        if (!targetSocketId) {
            socket.emit('error', { message: 'Missing target' });
            return;
        }

        console.log(`📴 ${socket.id} ended call with ${targetSocketId}`);
        
        io.to(targetSocketId).emit('call-ended', {
            from: socket.id,
            fromUserId: socket.data.userId,
            fromUsername: socket.data.username,
            meetingId
        });
    });
};

export default signalingSocketHandler;