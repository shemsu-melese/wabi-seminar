import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = {};
        this.isConnected = false;
        this.currentMeetingId = null;
        this.currentUserId = null;
        this.currentUsername = null;
    }

    connect(userId) {
        if (this.socket && this.isConnected) return;
        this.socket = io(SOCKET_URL, {
            transports: ['websocket'],
            query: { userId },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log('✅ Socket.IO connected');
            if (this.currentMeetingId) {
                this.joinMeeting(this.currentMeetingId, this.currentUserId, this.currentUsername);
            }
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('❌ Socket.IO disconnected');
        });

        this.socket.onAny((event, ...args) => {
            if (this.listeners[event]) {
                this.listeners[event].forEach(cb => cb(...args));
            }
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
        }
    }

    joinMeeting(meetingId, userId, username) {
        this.currentMeetingId = meetingId;
        this.currentUserId = userId;
        this.currentUsername = username;
        if (this.isConnected) {
            this.socket.emit('join-meeting', { meetingId, userId, username });
        }
    }

    leaveMeeting() {
        if (this.isConnected) {
            this.socket.emit('leave-meeting');
        }
        this.currentMeetingId = null;
    }

    sendMessage(meetingId, userId, username, content) {
        if (this.isConnected) {
            this.socket.emit('send-chat-message', { meetingId, userId, username, content });
        }
    }

    sendReaction(meetingId, userId, username, emoji) {
        if (this.isConnected) {
            this.socket.emit('send-reaction', { meetingId, userId, username, emoji });
        }
    }

    raiseHand(meetingId, userId, username) {
        if (this.isConnected) {
            this.socket.emit('raise-hand', { meetingId, userId, username });
        }
    }

    lowerHand(meetingId, userId, username) {
        if (this.isConnected) {
            this.socket.emit('lower-hand', { meetingId, userId, username });
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
}

export default new SocketService();