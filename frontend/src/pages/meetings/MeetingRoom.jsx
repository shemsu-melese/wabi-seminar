import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import meetingService from '../../services/meetingService.js';
import socketService from '../../services/socketService.js';
import toast from 'react-hot-toast';

// SOUND UTILITIES (Web Audio API)
const playBeep = (frequency = 800, duration = 200) => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + duration / 1000);
    } catch (e) {
        console.warn('Sound not supported:', e);
    }
};

const playWaitingSound = () => playBeep(600, 300);
const playAdmitSound = () => {
    playBeep(900, 150);
    setTimeout(() => playBeep(1200, 150), 200);
};

const MeetingRoom = () => {
    const { code } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // STATE
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [joined, setJoined] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerInterval = useRef(null);

    // UI Controls
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [showReactions, setShowReactions] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [wabifocus, setWabifocus] = useState({ goal: '', agenda: [], action_items: [] });

    // Waiting room
    const [waitingParticipants, setWaitingParticipants] = useState([]);
    const [showWaitingList, setShowWaitingList] = useState(false);

    // Sidebar toggle
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobilePanel, setMobilePanel] = useState(null);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // MEDIA STREAMS & AUDIO VISUALIZER
    const [localStream, setLocalStream] = useState(null);
    const localVideoRef = useRef(null);
    const canvasRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationIdRef = useRef(null);

    // START / STOP LOCAL MEDIA
    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
            setIsCameraOn(true);
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                setIsMicOn(audioTrack.enabled);
            } else {
                setIsMicOn(false);
                toast.error('Microphone not available – please check permissions.');
            }
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true;
                localVideoRef.current.play();
            }

            // Set up audio visualizer
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.8;
            source.connect(analyser);
            audioCtxRef.current = audioContext;
            analyserRef.current = analyser;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
            drawVisualizer();
        } catch (err) {
            console.error('Error accessing media devices:', err);
            toast.error('Could not access camera/microphone. Please allow permissions.');
            setIsCameraOn(false);
            setIsMicOn(false);
        }
    };

    const stopLocalStream = () => {
        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close();
            audioCtxRef.current = null;
            analyserRef.current = null;
            dataArrayRef.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
        }
    };

    const drawVisualizer = () => {
        if (!analyserRef.current || !canvasRef.current || !dataArrayRef.current) {
            animationIdRef.current = requestAnimationFrame(drawVisualizer);
            return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        const barWidth = (width / dataArray.length) * 2.5;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * height;
            const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
            gradient.addColorStop(0, '#1a73e8');
            gradient.addColorStop(1, '#8ab4f8');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }

        animationIdRef.current = requestAnimationFrame(drawVisualizer);
    };

    const toggleCamera = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                const newState = !isCameraOn;
                videoTrack.enabled = newState;
                setIsCameraOn(newState);
            }
        } else {
            toast.error('Camera not available');
        }
    };

    const toggleMic = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                const newState = !isMicOn;
                audioTrack.enabled = newState;
                setIsMicOn(newState);
                if (!newState && animationIdRef.current) {
                    cancelAnimationFrame(animationIdRef.current);
                    animationIdRef.current = null;
                    const canvas = canvasRef.current;
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                } else if (newState && !animationIdRef.current) {
                    drawVisualizer();
                }
            } else {
                toast.error('No microphone found. Please check your permissions.');
            }
        } else {
            toast.error('Microphone not available – please join the meeting first.');
        }
    };

    // SOCKET LISTENERS
    useEffect(() => {
        socketService.on('new-chat-message', (data) => {
            setChatMessages(prev => [...prev, {
                user: data.username,
                text: data.content,
                timestamp: new Date(data.timestamp).toLocaleTimeString()
            }]);
        });

        socketService.on('new-reaction', (data) => {
            toast(`😊 ${data.username} reacted with ${data.emoji}`);
        });

        socketService.on('hand-raised', (data) => {
            toast(`✋ ${data.username} raised their hand`);
            fetchParticipants();
        });

        socketService.on('hand-lowered', (data) => {
            toast(`✋ ${data.username} lowered their hand`);
            fetchParticipants();
        });

        socketService.on('user-joined', (data) => {
            toast(`👤 ${data.username} joined`);
            fetchParticipants();
        });

        socketService.on('user-left', (data) => {
            toast(`👋 ${data.username} left`);
            fetchParticipants();
        });

        socketService.on('waiting-participant', (data) => {
            toast(`⏳ ${data.username} is waiting to join`);
            fetchParticipants();
            if (isHost) setShowWaitingList(true);
            if (isHost && soundEnabled) playWaitingSound();
        });

        socketService.on('participant-admitted', (data) => {
            toast(`✅ ${data.username} was admitted to the meeting`);
            fetchParticipants();
            if (soundEnabled) playAdmitSound();
        });

        return () => {
            socketService.off('new-chat-message');
            socketService.off('new-reaction');
            socketService.off('hand-raised');
            socketService.off('hand-lowered');
            socketService.off('user-joined');
            socketService.off('user-left');
            socketService.off('waiting-participant');
            socketService.off('participant-admitted');
        };
    }, [isHost, soundEnabled]);

    // FETCH MEETING DATA
    const fetchMeeting = async () => {
        try {
            const response = await meetingService.getMeetingByCode(code);
            if (response.success) {
                const data = response.data;
                setMeeting(data);
                setParticipants(Array.isArray(data.participants) ? data.participants : []);
                const currentUser = data.participants?.find(p => p.user_id === user?.id);
                if (currentUser) {
                    setIsHost(currentUser.role === 'host');
                    setJoined(currentUser.status === 'joined');
                    setIsWaiting(currentUser.status === 'waiting');
                } else {
                    setJoined(false);
                    setIsWaiting(false);
                }
                const waiting = (data.participants || []).filter(p => p.status === 'waiting');
                setWaitingParticipants(waiting);

                if (data.wabifocus && Array.isArray(data.wabifocus)) {
                    const wf = { goal: '', agenda: [], action_items: [] };
                    data.wabifocus.forEach(item => {
                        if (item.type === 'goal') wf.goal = item.title || '';
                        if (item.type === 'agenda') wf.agenda.push({ title: item.title || '', completed: !!item.is_completed });
                        if (item.type === 'action_item') wf.action_items.push({ title: item.title || '', completed: !!item.is_completed });
                    });
                    setWabifocus(wf);
                } else {
                    setWabifocus({ goal: '', agenda: [], action_items: [] });
                }

                if (data.status === 'ongoing' && data.start_time) {
                    const start = new Date(data.start_time);
                    const now = new Date();
                    setElapsedTime(Math.floor((now - start) / 1000));
                    if (timerInterval.current) clearInterval(timerInterval.current);
                    timerInterval.current = setInterval(() => {
                        setElapsedTime(prev => prev + 1);
                    }, 1000);
                }
            } else {
                setError('Meeting not found');
            }
        } catch (err) {
            setError('Failed to load meeting');
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async () => {
        if (!meeting) return;
        try {
            const response = await meetingService.getMeeting(meeting.id);
            if (response.success) {
                const data = response.data;
                setParticipants(Array.isArray(data.participants) ? data.participants : []);
                const currentUser = data.participants?.find(p => p.user_id === user?.id);
                if (currentUser) {
                    setIsHost(currentUser.role === 'host');
                    setJoined(currentUser.status === 'joined');
                    setIsWaiting(currentUser.status === 'waiting');
                }
                const waiting = (data.participants || []).filter(p => p.status === 'waiting');
                setWaitingParticipants(waiting);
            }
        } catch (err) {
            console.error('Failed to refresh participants');
        }
    };

    useEffect(() => {
        fetchMeeting();
        if (user?.id) {
            socketService.connect(user.id);
        }
        return () => {
            if (timerInterval.current) clearInterval(timerInterval.current);
            socketService.disconnect();
            stopLocalStream();
        };
    }, [code, user]);

    // Start local stream when joined
    useEffect(() => {
        if (joined) {
            startLocalStream();
        } else {
            stopLocalStream();
        }
    }, [joined]);

    // MEETING ACTIONS
    const handleJoin = async () => {
        if (!meeting) {
            toast.error('Meeting not loaded');
            return;
        }
        try {
            const response = await meetingService.joinMeeting(meeting.id);
            if (response.success) {
                await fetchMeeting();
                if (isWaiting) {
                    toast('Request sent – waiting for host to admit you.', { icon: '⏳' });
                } else if (joined) {
                    toast.success('Joined meeting');
                    socketService.joinMeeting(meeting.id, user.id, user.first_name || 'User');
                } else {
                    if (meeting.waiting_room_enabled) {
                        setIsWaiting(true);
                        toast('Waiting room enabled – you will be admitted shortly.', { icon: '⏳' });
                    } else {
                        setJoined(true);
                        toast.success('Joined meeting');
                        socketService.joinMeeting(meeting.id, user.id, user.first_name || 'User');
                    }
                }
            } else {
                toast.error(response.message || 'Failed to join');
            }
        } catch (error) {
            console.error('Join error:', error);
            const message = error.response?.data?.message || error.message || 'Failed to join meeting';
            toast.error(message);
        }
    };

    const handleAdmit = async (userId) => {
        if (!meeting) return;
        try {
            await meetingService.admitParticipant(meeting.id, userId);
            toast.success('Participant admitted');
            await fetchParticipants();
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to admit participant';
            toast.error(message);
        }
    };

    const handleDeny = async (userId) => {
        try {
            await meetingService.removeParticipant(meeting.id, userId);
            toast.success('Participant denied');
            await fetchParticipants();
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to deny participant';
            toast.error(message);
        }
    };

    const handleLeave = async () => {
        if (!meeting) return;
        try {
            await meetingService.leaveMeeting(meeting.id);
            setJoined(false);
            setIsWaiting(false);
            toast.success('Left meeting');
            socketService.leaveMeeting();
            stopLocalStream();
            await fetchParticipants();
            navigate('/meetings');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to leave meeting';
            toast.error(message);
        }
    };

    const handleStart = async () => {
        if (!meeting) return;
        try {
            const response = await meetingService.startMeeting(meeting.id);
            if (response.success) {
                toast.success('Meeting started');
                setMeeting(response.data);
                if (response.data.start_time) {
                    const start = new Date(response.data.start_time);
                    const now = new Date();
                    setElapsedTime(Math.floor((now - start) / 1000));
                    if (timerInterval.current) clearInterval(timerInterval.current);
                    timerInterval.current = setInterval(() => {
                        setElapsedTime(prev => prev + 1);
                    }, 1000);
                }
            } else {
                toast.error(response.message || 'Failed to start');
            }
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to start meeting';
            toast.error(message);
        }
    };

    const handleEnd = async () => {
        if (!meeting) return;
        try {
            await meetingService.endMeeting(meeting.id);
            toast.success('Meeting ended');
            if (timerInterval.current) clearInterval(timerInterval.current);
            const updated = await meetingService.getMeeting(meeting.id);
            if (updated.success) setMeeting(updated.data);
            navigate('/meetings');
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to end meeting';
            toast.error(message);
        }
    };

    // UI ACTIONS
    const copyMeetingCode = () => {
        if (meeting?.code) {
            navigator.clipboard.writeText(meeting.code);
            toast.success('Meeting code copied!');
        }
    };

    const toggleRaiseHand = () => {
        if (!meeting || !joined) return;
        const newState = !handRaised;
        setHandRaised(newState);
        if (newState) {
            socketService.raiseHand(meeting.id, user.id, user.first_name || 'User');
        } else {
            socketService.lowerHand(meeting.id, user.id, user.first_name || 'User');
        }
        toast(newState ? 'Hand raised' : 'Hand lowered');
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !meeting || !joined) return;
        const content = newMessage.trim();
        socketService.sendMessage(meeting.id, user.id, user.first_name || 'User', content);
        setChatMessages(prev => [...prev, {
            user: user.first_name || 'You',
            text: content,
            timestamp: new Date().toLocaleTimeString()
        }]);
        setNewMessage('');
    };

    const sendReaction = (emoji) => {
        if (!meeting || !joined) return;
        socketService.sendReaction(meeting.id, user.id, user.first_name || 'User', emoji);
        setShowReactions(false);
        toast(`Reacted with ${emoji}`);
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // SCREEN SHARE 
   
    const handleScreenShare = () => {
        toast('Screen share feature coming soon', {
            icon: '🖥️',
            duration: 3000,
        });
        setIsSharing(false);
    };

    // LOADING / ERROR
    if (loading) {
        return (
            <div className="meeting-loading">
                <div className="spinner"></div>
                <p>Loading meeting...</p>
            </div>
        );
    }

    if (error || !meeting) {
        return (
            <div className="meeting-error">
                <h2>Meeting Not Found</h2>
                <p>{error || 'The meeting you\'re looking for doesn\'t exist.'}</p>
                <button className="btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            </div>
        );
    }

    const isOngoing = meeting.status === 'ongoing';
    const isScheduled = meeting.status === 'scheduled';
    const isEnded = meeting.status === 'ended';

    // WAITING ROOM OVERLAY
    if (isWaiting) {
        return (
            <div className="meeting-room waiting-room">
                <div className="waiting-overlay">
                    <div className="waiting-content">
                        <div className="waiting-spinner"></div>
                        <h2>⏳ You are in the waiting room</h2>
                        <p>The host will admit you shortly.</p>
                        <button className="control-btn leave" onClick={handleLeave}>Leave</button>
                    </div>
                </div>
                <header className="meeting-header">
                    <div className="header-left">
                        <h1 className="meeting-title">{meeting.title}</h1>
                        <div className="status-badge scheduled">Waiting Room</div>
                    </div>
                    <div className="header-right">
                        <span className="meeting-code">
                            Code: <strong>{meeting.code}</strong>
                            <button className="copy-btn" onClick={copyMeetingCode}>📋 Copy</button>
                        </span>
                    </div>
                </header>
                <style>{`
                    .waiting-room { background: #202124; }
                    .waiting-overlay { flex:1; display:flex; align-items:center; justify-content:center; text-align:center; }
                    .waiting-content { display:flex; flex-direction:column; align-items:center; gap:16px; }
                    .waiting-spinner { width:60px; height:60px; border:4px solid #3c4043; border-top:4px solid #8ab4f8; border-radius:50%; animation:spin 1s linear infinite; }
                    @keyframes spin { to { transform:rotate(360deg); } }
                    .waiting-content h2 { margin:0; font-size:1.8rem; font-weight:400; color:#e8eaed; }
                    .waiting-content p { font-size:1rem; color:#9aa0a6; }
                    .waiting-content .control-btn.leave { background:#d93025; padding:10px 32px; font-size:1rem; }
                    .waiting-content .control-btn.leave:hover { background:#b3261e; }
                `}</style>
            </div>
        );
    }

    // SAFE helpers for WabiFocus progress
    const agendaItems = Array.isArray(wabifocus.agenda) ? wabifocus.agenda : [];
    const actionItems = Array.isArray(wabifocus.action_items) ? wabifocus.action_items : [];
    const totalItems = agendaItems.length + actionItems.length;
    const completedItems = agendaItems.filter(i => i.completed).length + actionItems.filter(i => i.completed).length;
    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // RENDER – FULL MEETING ROOM
    return (
        <div className="meeting-room full-room">
            {/* ===== HEADER ===== */}
            <header className="meeting-header">
                <div className="header-left">
                    <h1 className="meeting-title">{meeting.title}</h1>
                    <div className={`status-badge ${isOngoing ? 'live' : isScheduled ? 'scheduled' : 'ended'}`}>
                        {isOngoing && <span className="pulse-dot"></span>}
                        {isOngoing ? 'LIVE' : isScheduled ? 'Scheduled' : 'Ended'}
                    </div>
                    {isOngoing && <span className="timer">⏱️ {formatTime(elapsedTime)}</span>}
                </div>
                <div className="header-right">
                    <span className="meeting-code">
                        Code: <strong>{meeting.code}</strong>
                        <button className="copy-btn" onClick={copyMeetingCode}>📋 Copy</button>
                    </span>
                </div>
            </header>

            {/* ===== MAIN CONTENT ===== */}
            <div className="main-content">
                {/* Video Grid */}
                <section className={`video-grid ${sidebarOpen ? 'with-sidebar' : 'full-width'}`}>
                    {/* Local user tile – always rendered when joined */}
                    {joined && (
                        <div className="participant-tile" style={{ border: '2px solid #1a73e8' }}>
                            <div className="participant-video-wrapper">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="participant-video"
                                    style={{ display: isCameraOn && localStream ? 'block' : 'none' }}
                                />
                                <div
                                    className="participant-avatar-circle"
                                    style={{ display: (!isCameraOn || !localStream) ? 'flex' : 'none' }}
                                >
                                    {user?.first_name?.[0] || '?'}
                                </div>

                                {isMicOn && localStream && (
                                    <canvas
                                        ref={canvasRef}
                                        className="audio-visualizer"
                                        width="250"
                                        height="50"
                                    />
                                )}

                                <div className="participant-name">
                                    You
                                    {handRaised && <span className="hand-icon-name">✋</span>}
                                </div>
                                <div className="status-dot online"></div>
                            </div>
                        </div>
                    )}

                    {/* Remote participants (excluding local user) */}
                    {participants
                        .filter(p => p.user_id !== user?.id)
                        .map((p) => (
                            <div key={p.user_id} className="participant-tile">
                                <div className="participant-video-wrapper">
                                    <div className="participant-avatar-circle">
                                        {p.first_name?.[0] || '?'}
                                    </div>
                                    {p.role === 'host' && <span className="crown">👑</span>}
                                    <div className="participant-name">
                                        {p.first_name} {p.last_name}
                                        {p.role === 'host' && <span className="host-badge">Host</span>}
                                        {p.hand_raised_at && <span className="hand-icon-name">✋</span>}
                                    </div>
                                    <div className={`status-dot ${p.status === 'joined' ? 'online' : 'offline'}`}></div>
                                </div>
                            </div>
                        ))}

                    {!joined && participants.length === 0 && (
                        <div className="empty-grid">No participants yet</div>
                    )}
                    {joined && participants.filter(p => p.user_id !== user?.id).length === 0 && (
                        <div className="empty-grid">Waiting for others to join...</div>
                    )}
                </section>

                {/* Sidebar (desktop + landscape) */}
                <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                    <div className="sidebar-inner">
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                        >
                            {sidebarOpen ? '◀' : '▶'}
                        </button>

                        <div className="participants-panel">
                            <div className="panel-header">
                                <h3>👥 Participants</h3>
                                <span className="participant-count">{participants.length}</span>
                            </div>
                            <ul className="participant-list">
                                {participants.map((p) => (
                                    <li key={p.user_id} className="participant-item">
                                        <span className="p-avatar">{p.first_name?.[0] || '?'}</span>
                                        <span className="p-name">
                                            {p.first_name} {p.last_name}
                                            {p.role === 'host' && ' 👑'}
                                            {p.user_id === user?.id && ' (You)'}
                                            {p.hand_raised_at && <span className="hand-icon-small">✋</span>}
                                        </span>
                                        <span className={`p-status ${p.status}`}>{p.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="chat-panel">
                            <div className="panel-header">
                                <h3>💬 Chat</h3>
                                <span className="chat-count">{chatMessages.length}</span>
                            </div>
                            <div className="chat-messages">
                                {chatMessages.length === 0 && <div className="chat-empty">No messages yet</div>}
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`chat-message ${msg.user === '💬 System' ? 'system' : ''}`}>
                                        <strong>{msg.user}</strong>
                                        <span className="chat-time">{msg.timestamp}</span>
                                        <p>{msg.text}</p>
                                    </div>
                                ))}
                            </div>
                            <form className="chat-input" onSubmit={sendMessage}>
                                <input
                                    type="text"
                                    placeholder={joined ? "Send a message..." : "Join to chat..."}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={!joined}
                                />
                                <button type="submit" disabled={!joined}>Send</button>
                            </form>
                        </div>

                        <div className="wabifocus-panel">
                            <div className="panel-header">
                                <h3>📋 WabiFocus</h3>
                                <span className="wf-badge">Productivity</span>
                            </div>
                            {wabifocus.goal && (
                                <div className="wf-section">
                                    <h4>🎯 Goal</h4>
                                    <p>{wabifocus.goal}</p>
                                </div>
                            )}
                            {agendaItems.length > 0 && (
                                <div className="wf-section">
                                    <h4>📌 Agenda</h4>
                                    <ul className="wf-list">
                                        {agendaItems.map((item, idx) => (
                                            <li key={idx} className={item.completed ? 'completed' : ''}>
                                                <span className="wf-icon">{item.completed ? '✅' : '⬜'}</span>
                                                {item.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {actionItems.length > 0 && (
                                <div className="wf-section">
                                    <h4>✅ Action Items</h4>
                                    <ul className="wf-list">
                                        {actionItems.map((item, idx) => (
                                            <li key={idx} className={item.completed ? 'completed' : ''}>
                                                <span className="wf-icon">{item.completed ? '✅' : '⬜'}</span>
                                                {item.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="wf-progress">
                                <div className="wf-progress-bar">
                                    <div className="wf-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                                <span className="wf-progress-text">{progressPercent}% complete</span>
                            </div>
                        </div>

                        {isHost && meeting.waiting_room_enabled && showWaitingList && (
                            <div className="wabifocus-panel waiting-list-panel">
                                <div className="panel-header">
                                    <h3>⏳ Waiting Room</h3>
                                    <span className="participant-count">{waitingParticipants.length}</span>
                                </div>
                                {waitingParticipants.length === 0 ? (
                                    <div className="chat-empty">No one is waiting</div>
                                ) : (
                                    <ul className="participant-list">
                                        {waitingParticipants.map((p) => (
                                            <li key={p.user_id} className="participant-item">
                                                <span className="p-avatar">{p.first_name?.[0] || '?'}</span>
                                                <span className="p-name">{p.first_name} {p.last_name}</span>
                                                <button className="admit-btn" onClick={() => handleAdmit(p.user_id)}>Admit</button>
                                                <button className="deny-btn" onClick={() => handleDeny(p.user_id)}>Deny</button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                {!sidebarOpen && (
                    <button
                        className="sidebar-toggle-floating"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        ◀
                    </button>
                )}
            </div>

            {/* ===== CONTROLS BAR ===== */}
            <section className="controls-bar">
                <button
                    className={`control-btn ${!isMicOn ? 'muted' : ''}`}
                    onClick={toggleMic}
                    disabled={!joined}
                    title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                    {isMicOn ? '🎤' : '🔇'}
                </button>
                <button
                    className={`control-btn ${!isCameraOn ? 'off' : ''}`}
                    onClick={toggleCamera}
                    disabled={!joined}
                >
                    {isCameraOn ? '📹' : '🚫'}
                </button>
                {/* ✅ Screen share button – shows toast on click */}
                <button
                    className={`control-btn ${isSharing ? 'active' : ''}`}
                    onClick={handleScreenShare}
                >
                    🖥️ Share
                </button>
                <button className="control-btn" onClick={() => setShowReactions(!showReactions)}>
                    👍 React
                </button>
                <button
                    className={`control-btn ${handRaised ? 'active' : ''}`}
                    onClick={toggleRaiseHand}
                    disabled={!joined}
                >
                    ✋
                </button>
                {isHost && meeting.waiting_room_enabled && (
                    <button className={`control-btn ${showWaitingList ? 'active' : ''}`} onClick={() => setShowWaitingList(!showWaitingList)}>
                        ⏳ {waitingParticipants.length > 0 && `(${waitingParticipants.length})`}
                    </button>
                )}
                <button className="control-btn" onClick={() => setSoundEnabled(!soundEnabled)}>
                    {soundEnabled ? '🔊' : '🔇'}
                </button>

                {!joined && !isEnded && (
                    <button className="control-btn join" onClick={handleJoin}>
                        {meeting.waiting_room_enabled ? 'Request to Join' : 'Join'}
                    </button>
                )}
                {joined && !isEnded && (
                    <button className="control-btn leave" onClick={handleLeave}>Leave</button>
                )}
                {isHost && !isEnded && !isOngoing && (
                    <button className="control-btn start" onClick={handleStart}>▶ Start</button>
                )}
                {isHost && isOngoing && (
                    <button className="control-btn end" onClick={handleEnd}>⏹ End</button>
                )}
            </section>

            {/* ===== REACTIONS POPUP ===== */}
            {showReactions && (
                <div className="reactions-popup">
                    {['👍', '👎', '❤️', '😂', '😮', '👏', '🎉', '🔥', '🙌', '💪'].map((emoji) => (
                        <button key={emoji} onClick={() => sendReaction(emoji)}>{emoji}</button>
                    ))}
                </div>
            )}

            {/* ===== MOBILE BOTTOM NAV ===== */}
            <nav className="bottom-nav">
                <button
                    className={`nav-btn ${mobilePanel === 'participants' ? 'active' : ''}`}
                    onClick={() => setMobilePanel(mobilePanel === 'participants' ? null : 'participants')}
                >
                    <span className="nav-icon">👥</span>
                    <span className="nav-label">Participants</span>
                    <span className="nav-badge">{participants.length}</span>
                </button>
                <button
                    className={`nav-btn ${mobilePanel === 'chat' ? 'active' : ''}`}
                    onClick={() => setMobilePanel(mobilePanel === 'chat' ? null : 'chat')}
                >
                    <span className="nav-icon">💬</span>
                    <span className="nav-label">Chat</span>
                    <span className="nav-badge">{chatMessages.length}</span>
                </button>
                <button
                    className={`nav-btn ${mobilePanel === 'wabifocus' ? 'active' : ''}`}
                    onClick={() => setMobilePanel(mobilePanel === 'wabifocus' ? null : 'wabifocus')}
                >
                    <span className="nav-icon">📋</span>
                    <span className="nav-label">WabiFocus</span>
                </button>
                <button className="nav-btn" onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}>
                    <span className="nav-icon">{soundEnabled ? '🔊' : '🔇'}</span>
                    <span className="nav-label">Sound</span>
                </button>
            </nav>

            {/* ===== MOBILE BOTTOM SHEET ===== */}
            {mobilePanel && (
                <div className="bottom-sheet">
                    <div className="bottom-sheet-header">
                        <h3>
                            {mobilePanel === 'participants' && '👥 Participants'}
                            {mobilePanel === 'chat' && '💬 Chat'}
                            {mobilePanel === 'wabifocus' && '📋 WabiFocus'}
                        </h3>
                        <button className="close-sheet" onClick={() => setMobilePanel(null)}>✕</button>
                    </div>
                    <div className="bottom-sheet-body">
                        {mobilePanel === 'participants' && (
                            <ul className="participant-list">
                                {participants.map((p) => (
                                    <li key={p.user_id} className="participant-item">
                                        <span className="p-avatar">{p.first_name?.[0] || '?'}</span>
                                        <span className="p-name">
                                            {p.first_name} {p.last_name}
                                            {p.role === 'host' && ' 👑'}
                                            {p.user_id === user?.id && ' (You)'}
                                            {p.hand_raised_at && <span className="hand-icon-small">✋</span>}
                                        </span>
                                        <span className={`p-status ${p.status}`}>{p.status}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {mobilePanel === 'chat' && (
                            <>
                                <div className="chat-messages">
                                    {chatMessages.length === 0 && <div className="chat-empty">No messages yet</div>}
                                    {chatMessages.map((msg, idx) => (
                                        <div key={idx} className={`chat-message ${msg.user === '💬 System' ? 'system' : ''}`}>
                                            <strong>{msg.user}</strong>
                                            <span className="chat-time">{msg.timestamp}</span>
                                            <p>{msg.text}</p>
                                        </div>
                                    ))}
                                </div>
                                <form className="chat-input" onSubmit={sendMessage}>
                                    <input
                                        type="text"
                                        placeholder={joined ? "Send a message..." : "Join to chat..."}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={!joined}
                                    />
                                    <button type="submit" disabled={!joined}>Send</button>
                                </form>
                            </>
                        )}
                        {mobilePanel === 'wabifocus' && (
                            <div className="wabifocus-content">
                                {wabifocus.goal && (
                                    <div className="wf-section">
                                        <h4>🎯 Goal</h4>
                                        <p>{wabifocus.goal}</p>
                                    </div>
                                )}
                                {agendaItems.length > 0 && (
                                    <div className="wf-section">
                                        <h4>📌 Agenda</h4>
                                        <ul className="wf-list">
                                            {agendaItems.map((item, idx) => (
                                                <li key={idx} className={item.completed ? 'completed' : ''}>
                                                    <span className="wf-icon">{item.completed ? '✅' : '⬜'}</span>
                                                    {item.title}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {actionItems.length > 0 && (
                                    <div className="wf-section">
                                        <h4>✅ Action Items</h4>
                                        <ul className="wf-list">
                                            {actionItems.map((item, idx) => (
                                                <li key={idx} className={item.completed ? 'completed' : ''}>
                                                    <span className="wf-icon">{item.completed ? '✅' : '⬜'}</span>
                                                    {item.title}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ============================================================
                STYLES
            ============================================================ */}
            <style>{`
                /* ---------- Base ---------- */
                .meeting-room {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background: #202124;
                    color: #e8eaed;
                    font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 12px 16px;
                    box-sizing: border-box;
                    overflow: hidden;
                    position: relative;
                }
                .full-room { padding: 12px 16px; }

                /* ---------- Header ---------- */
                .meeting-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #3c4043;
                    flex-shrink: 0;
                    flex-wrap: wrap;
                }
                .header-left {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 8px 16px;
                }
                .meeting-title {
                    font-size: 1.2rem;
                    font-weight: 500;
                    margin: 0;
                    color: #e8eaed;
                }
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 10px;
                    border-radius: 16px;
                    font-size: 0.65rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    background: #3c4043;
                    color: #9aa0a6;
                }
                .status-badge.live { background: #1e8e3e; color: #e8eaed; }
                .status-badge.scheduled { background: #1a73e8; color: #e8eaed; }
                .status-badge.ended { background: #d93025; color: #e8eaed; }
                .pulse-dot {
                    display: inline-block;
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #e8eaed;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse { 0% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.85); } 100% { opacity:1; transform:scale(1); } }
                .timer {
                    font-size: 0.8rem;
                    font-variant-numeric: tabular-nums;
                    background: #3c4043;
                    padding: 2px 10px;
                    border-radius: 14px;
                    color: #e8eaed;
                }
                .header-right { display: flex; align-items: center; }
                .meeting-code {
                    font-size: 0.8rem;
                    background: #3c4043;
                    padding: 3px 14px;
                    border-radius: 18px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .meeting-code strong { color: #e8eaed; letter-spacing:0.5px; }
                .copy-btn {
                    background: none;
                    border: none;
                    color: #8ab4f8;
                    cursor: pointer;
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    border-radius: 12px;
                    transition: 0.2s;
                }
                .copy-btn:hover { background: #3c4043; }

                /* ---------- Main Content ---------- */
                .main-content {
                    flex: 1;
                    display: flex;
                    gap: 0;
                    overflow: hidden;
                    padding-top: 12px;
                    position: relative;
                }

                /* ---------- Video Grid ---------- */
                .video-grid {
                    flex: 1;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 12px;
                    overflow-y: auto;
                    align-content: start;
                    transition: all 0.3s;
                    padding-right: 8px;
                }
                .video-grid.full-width {
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                }
                .empty-grid {
                    grid-column: 1 / -1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #3c4043;
                    border-radius: 12px;
                    height: 160px;
                    color: #9aa0a6;
                    font-size: 0.9rem;
                }

                .participant-tile {
                    background: #2d2f33;
                    border-radius: 12px;
                    overflow: hidden;
                    position: relative;
                    aspect-ratio: 16 / 9;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    transition: 0.2s;
                }
                .participant-tile:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                }
                .participant-video-wrapper {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #1a1a1e;
                }

                .participant-video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .participant-avatar-circle {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: #3c4043;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.2rem;
                    font-weight: 500;
                    color: #e8eaed;
                    text-transform: uppercase;
                    border: 2px solid #5f6368;
                    flex-shrink: 0;
                    user-select: none;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .audio-visualizer {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 20px;
                    background: rgba(0, 0, 0, 0.25);
                    border-radius: 0 0 12px 12px;
                    pointer-events: none;
                    z-index: 8;
                }

                .crown {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    font-size: 1.2rem;
                    z-index: 5;
                }

                /* Name with hand icon inline */
                .participant-name {
                    position: absolute;
                    bottom: 8px;
                    left: 12px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: #e8eaed;
                    background: rgba(0, 0, 0, 0.6);
                    padding: 2px 10px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    z-index: 5;
                }

                .hand-icon-name {
                    font-size: 0.9rem;
                    line-height: 1;
                    animation: handWave 1s infinite alternate;
                    display: inline-block;
                }

                @keyframes handWave {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(15deg); }
                }

                .host-badge {
                    background: #1a73e8;
                    color: #e8eaed;
                    font-size: 0.55rem;
                    padding: 0 8px;
                    border-radius: 12px;
                    font-weight: 500;
                    text-transform: uppercase;
                }
                .status-dot {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #5f6368;
                    z-index: 5;
                    border: 2px solid #202124;
                }
                .status-dot.online { background: #34a853; }
                .status-dot.offline { background: #d93025; }

                .hand-icon-small {
                    font-size: 0.8rem;
                    margin-left: 4px;
                    display: inline-block;
                    animation: handWave 1s infinite alternate;
                }

                /* ---------- Sidebar (unchanged) ---------- */
                .sidebar {
                    flex-shrink: 0;
                    width: 0;
                    overflow: hidden;
                    transition: width 0.3s ease;
                    position: relative;
                    display: none;
                }
                .sidebar.open {
                    width: 340px;
                    display: flex;
                }
                .sidebar.closed {
                    width: 0;
                }
                .sidebar-inner {
                    width: 340px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    overflow-y: auto;
                    padding: 0 0 0 8px;
                    height: 100%;
                    box-sizing: border-box;
                }
                .sidebar-toggle {
                    align-self: flex-end;
                    background: #3c4043;
                    border: none;
                    color: #e8eaed;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: 0.2s;
                    margin-bottom: 4px;
                }
                .sidebar-toggle:hover { background: #5f6368; }

                .sidebar-toggle-floating {
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    background: #3c4043;
                    border: none;
                    color: #e8eaed;
                    padding: 8px 4px;
                    border-radius: 4px 0 0 4px;
                    cursor: pointer;
                    font-size: 1.2rem;
                    z-index: 10;
                    transition: 0.2s;
                }
                .sidebar-toggle-floating:hover { background: #5f6368; }

                .participants-panel,
                .chat-panel,
                .wabifocus-panel,
                .waiting-list-panel {
                    background: #2d2f33;
                    border-radius: 12px;
                    border: 1px solid #3c4043;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .participants-panel { flex: 1; }
                .chat-panel { flex: 2; }
                .wabifocus-panel { flex: 1; }
                .waiting-list-panel { background: #1e2a3a; border-color: #1a73e8; }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .panel-header h3 { margin:0; font-size:0.9rem; font-weight:500; color:#e8eaed; }
                .panel-header .participant-count,
                .panel-header .chat-count,
                .wf-badge {
                    background: #3c4043;
                    padding: 1px 10px;
                    border-radius: 16px;
                    font-size: 0.6rem;
                    font-weight: 500;
                    color: #9aa0a6;
                }
                .wf-badge { background: #1a73e8; color: #e8eaed; }

                .participant-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    overflow-y: auto;
                    flex: 1;
                }
                .participant-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 0;
                    border-bottom: 1px solid #3c4043;
                    font-size: 0.8rem;
                    flex-wrap: wrap;
                }
                .participant-item:last-child { border-bottom: none; }
                .p-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #5f6368;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.65rem;
                    font-weight: 500;
                    color: #e8eaed;
                    flex-shrink: 0;
                }
                .p-name { flex: 1; color: #e8eaed; display: flex; align-items: center; gap: 4px; }
                .p-status {
                    font-size: 0.55rem;
                    text-transform: uppercase;
                    background: #3c4043;
                    padding: 0 8px;
                    border-radius: 12px;
                    color: #9aa0a6;
                }
                .p-status.joined { background: #1e8e3e; color: #e8eaed; }
                .p-status.waiting { background: #f9ab00; color: #202124; }
                .p-status.left { background: #d93025; color: #e8eaed; }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 4px 0;
                    max-height: 140px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .chat-empty { color: #9aa0a6; text-align:center; padding:16px 0; font-size:0.8rem; }
                .chat-message {
                    background: #3c4043;
                    padding: 4px 10px;
                    border-radius: 10px;
                    font-size: 0.8rem;
                    word-break: break-word;
                }
                .chat-message.system { background: #2d2f33; color: #9aa0a6; text-align:center; font-style:italic; opacity:0.7; }
                .chat-message strong { color: #8ab4f8; margin-right:4px; }
                .chat-time { float:right; font-size:0.55rem; color:#9aa0a6; margin-left:8px; }
                .chat-message p { margin:2px 0 0; }
                .chat-input {
                    display: flex;
                    gap: 6px;
                    margin-top: 6px;
                    padding-top: 6px;
                    border-top: 1px solid #3c4043;
                }
                .chat-input input {
                    flex:1;
                    background: #3c4043;
                    border: 1px solid #5f6368;
                    border-radius: 30px;
                    padding: 6px 14px;
                    color: #e8eaed;
                    font-size: 0.8rem;
                    outline: none;
                    min-height: 34px;
                }
                .chat-input input:focus { border-color: #8ab4f8; }
                .chat-input input:disabled { opacity: 0.4; }
                .chat-input button {
                    background: #1a73e8;
                    border: none;
                    color: #e8eaed;
                    border-radius: 30px;
                    padding: 0 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: 0.2s;
                    min-height: 34px;
                }
                .chat-input button:hover { background: #1a5bb5; }
                .chat-input button:disabled { opacity:0.4; cursor:not-allowed; }

                .wf-section { margin-bottom:10px; }
                .wf-section h4 { margin:0 0 4px; font-size:0.8rem; color:#9aa0a6; font-weight:500; }
                .wf-section p { margin:0; font-size:0.85rem; line-height:1.3; color:#e8eaed; }
                .wf-list { list-style:none; padding:0; margin:0; }
                .wf-list li { display:flex; align-items:center; gap:6px; padding:2px 0; font-size:0.8rem; color:#e8eaed; }
                .wf-list li.completed { text-decoration:line-through; opacity:0.6; }
                .wf-icon { font-size:0.8rem; }
                .wf-progress { margin-top:8px; padding-top:8px; border-top:1px solid #3c4043; }
                .wf-progress-bar { height:4px; background:#3c4043; border-radius:4px; overflow:hidden; }
                .wf-progress-fill { height:100%; background:linear-gradient(90deg, #1a73e8, #8ab4f8); border-radius:4px; transition:width 0.4s ease; }
                .wf-progress-text { display:block; text-align:right; font-size:0.6rem; color:#9aa0a6; margin-top:2px; }

                .admit-btn, .deny-btn { border:none; border-radius:16px; padding:2px 12px; font-size:0.7rem; font-weight:500; cursor:pointer; transition:0.2s; }
                .admit-btn { background:#1a73e8; color:#e8eaed; }
                .admit-btn:hover { background:#1a5bb5; }
                .deny-btn { background:#d93025; color:#e8eaed; }
                .deny-btn:hover { background:#b3261e; }

                /* ---------- Controls Bar ---------- */
                .controls-bar {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    flex-wrap: wrap;
                    padding: 8px 0 4px;
                    border-top: 1px solid #3c4043;
                    flex-shrink: 0;
                }
                .control-btn {
                    background: #3c4043;
                    border: none;
                    color: #e8eaed;
                    padding: 6px 14px;
                    border-radius: 30px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    transition: 0.2s;
                    min-height: 36px;
                    border: 1px solid transparent;
                }
                .control-btn:hover { background: #5f6368; }
                .control-btn.muted, .control-btn.off { background: #5f6368; color: #e8eaed; }
                .control-btn.active { background: #1a73e8; color: #e8eaed; }
                .control-btn.join { background: #1a73e8; color: #e8eaed; font-weight:500; padding:6px 24px; }
                .control-btn.join:hover { background: #1a5bb5; }
                .control-btn.leave { background: #d93025; color: #e8eaed; padding:6px 24px; }
                .control-btn.leave:hover { background: #b3261e; }
                .control-btn.start { background: #1a73e8; color: #e8eaed; padding:6px 24px; }
                .control-btn.start:hover { background: #1a5bb5; }
                .control-btn.end { background: #d93025; color: #e8eaed; padding:6px 24px; }
                .control-btn.end:hover { background: #b3261e; }
                .control-btn:disabled { opacity:0.4; cursor:not-allowed; }

                /* ---------- Reactions Popup ---------- */
                .reactions-popup {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #3c4043;
                    border: 1px solid #5f6368;
                    border-radius: 40px;
                    padding: 8px 12px;
                    display: flex;
                    gap: 4px;
                    z-index: 999;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.6);
                    flex-wrap: wrap;
                    justify-content: center;
                }
                .reactions-popup button { background:none; border:none; font-size:1.4rem; cursor:pointer; transition:0.15s; padding:2px 4px; border-radius:30px; }
                .reactions-popup button:hover { transform:scale(1.3); background:#5f6368; }

                /* ---------- Mobile Bottom Nav ---------- */
                .bottom-nav {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    background: #2d2f33;
                    border-top: 1px solid #3c4043;
                    padding: 6px 0;
                    flex-shrink: 0;
                    margin: 0 -16px;
                    padding: 6px 16px;
                    position: sticky;
                    bottom: 0;
                    z-index: 100;
                }
                .nav-btn {
                    background: none;
                    border: none;
                    color: #9aa0a6;
                    font-size: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    padding: 4px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: 0.2s;
                    position: relative;
                }
                .nav-btn .nav-icon { font-size:1.4rem; line-height:1.2; }
                .nav-btn .nav-label { font-size:0.6rem; font-weight:500; }
                .nav-btn .nav-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    background: #1a73e8;
                    color: #e8eaed;
                    font-size: 0.6rem;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                }
                .nav-btn.active { color: #e8eaed; }
                .nav-btn.active .nav-icon { transform:scale(1.1); }

                /* ---------- Bottom Sheet ---------- */
                .bottom-sheet {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    max-height: 70vh;
                    background: #2d2f33;
                    border-top-left-radius: 20px;
                    border-top-right-radius: 20px;
                    box-shadow: 0 -8px 30px rgba(0,0,0,0.5);
                    z-index: 200;
                    display: flex;
                    flex-direction: column;
                    padding: 16px;
                    padding-bottom: 20px;
                    animation: slideUp 0.3s ease-out;
                }
                @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
                .bottom-sheet-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .bottom-sheet-header h3 { margin:0; font-size:1.1rem; font-weight:500; color:#e8eaed; }
                .close-sheet { background:none; border:none; color:#9aa0a6; font-size:1.4rem; cursor:pointer; padding:4px 8px; }
                .bottom-sheet-body { flex:1; overflow-y:auto; }
                .bottom-sheet-body .participant-list,
                .bottom-sheet-body .chat-messages { max-height:50vh; }
                .bottom-sheet-body .wabifocus-content { max-height:50vh; overflow-y:auto; }

                /* ---------- Breakpoint: Show sidebar on 640px+ ---------- */
                @media (min-width: 640px) {
                    .bottom-nav { display: none; }
                    .bottom-sheet { display: none; }
                    .sidebar { display: flex; }
                    .main-content { gap: 0; }
                }

                /* ---------- Portrait mobile (under 640px) ---------- */
                @media (max-width: 639px) {
                    .sidebar { display: none !important; }
                    .sidebar-toggle-floating { display: none; }
                    .meeting-room { padding: 8px 10px; }
                    .full-room { padding: 8px 10px; }
                    .meeting-header { flex-wrap: wrap; }
                    .header-left { gap: 6px 10px; }
                    .meeting-title { font-size: 1rem; }
                    .controls-bar { gap: 4px; flex-wrap: wrap; justify-content:center; }
                    .control-btn { padding:4px 10px; font-size:0.7rem; min-height:30px; }
                    .video-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:8px; }
                    .participant-tile { aspect-ratio: 16/9; }
                    .participant-avatar-circle { width: 60px; height: 60px; font-size: 1.6rem; }
                    .participant-name { font-size: 0.7rem; }
                    .reactions-popup { bottom:120px; }
                }

                /* ---------- Loading & Error ---------- */
                .meeting-loading,
                .meeting-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    background: #202124;
                    color: #e8eaed;
                    text-align: center;
                    padding: 20px;
                }
                .spinner {
                    width:40px; height:40px; border:4px solid #3c4043; border-top:4px solid #8ab4f8; border-radius:50%; animation:spin 0.8s linear infinite;
                }
                @keyframes spin { to { transform:rotate(360deg); } }
                .meeting-error button { margin-top:16px; background:#1a73e8; border:none; color:#e8eaed; padding:8px 24px; border-radius:30px; font-size:0.9rem; cursor:pointer; }
                .meeting-error button:hover { background:#1a5bb5; }
            `}</style>
        </div>
    );
};

export default MeetingRoom;