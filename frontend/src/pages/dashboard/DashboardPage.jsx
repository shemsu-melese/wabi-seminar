import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import meetingService from '../../services/meetingService.js';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [creatingPublic, setCreatingPublic] = useState(false);
    const [publicMeeting, setPublicMeeting] = useState(null);

    // Minimal loading simulation
  
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    
    // Handlers
   
    const handleCreateMeeting = () => {
        navigate('/meetings/create');
    };

    const handleJoinMeeting = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const code = formData.get('meetingCode')?.trim();
        if (!code) {
            toast.error('Please enter a meeting code');
            return;
        }
        navigate(`/meeting/${code}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    // Public Meeting – Create & Show Link on Card
   
    const handleGetPublicMeetingLink = async () => {
        setCreatingPublic(true);
        try {
            const meetingData = {
                title: 'Public Meeting',
                description: 'Join this public meeting',
                duration_minutes: 60,
                meeting_type: 'business',
                max_participants: 50,
                waiting_room_enabled: false,
                allow_screen_sharing: true,
                allow_chat: true,
                allow_reactions: true,
                allow_raise_hand: true,
            };

            console.log('📤 Sending meeting data:', meetingData);

            const response = await meetingService.createMeeting(meetingData);

            console.log('📥 Backend response:', response);

            let meeting = null;

            if (response.success && response.data) {
                meeting = response.data;
            } else if (response.id && response.code) {
                meeting = response;
            } else if (response.meeting) {
                meeting = response.meeting;
            }

            if (meeting) {
                console.log('✅ Meeting created:', meeting);
                setPublicMeeting(meeting);
                toast.success('Public meeting created!');
            } else {
                console.error('❌ Unexpected response format:', response);
                toast.error('Unexpected response from server. Check console.');
            }
        } catch (error) {
            console.error('❌ Full error:', error);
            console.error('❌ Response data:', error.response?.data);
            console.error('❌ Response status:', error.response?.status);

            const msg = error.response?.data?.message || error.message || 'An error occurred';
            toast.error(`Error: ${msg}`);
        } finally {
            setCreatingPublic(false);
        }
    };

    const copyMeetingLink = () => {
        if (!publicMeeting) return;
        const link = `${window.location.origin}/meeting/${publicMeeting.code}`;
        navigator.clipboard.writeText(link);
        toast.success('Meeting link copied to clipboard!');
    };

    const joinPublicMeeting = () => {
        if (!publicMeeting) return;
        navigate(`/meeting/${publicMeeting.code}`);
    };

    const resetPublicMeeting = () => {
        setPublicMeeting(null);
    };

 
    // Loading State
  
    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    
    // Render
  
    return (
        <div className="dashboard-page">
            <main className="dashboard-main">
                <section className="dashboard-welcome">
                    <p className="dashboard-eyebrow">Your workspace</p>
                    <h1 className="dashboard-title">
                        Make space for
                        <br />
                        better conversations.
                    </h1>
                    <p className="dashboard-subtitle">
                        Start a meeting, invite your team, and connect
                        without the noise.
                    </p>
                </section>

                <section className="meeting-actions">
                    <div className="meeting-card public-meeting-card">
                        <div className="meeting-card-icon">🔗</div>
                        <h3>Public Meeting</h3>
                        <p>
                            Create a shareable meeting link – anyone with the link can join
                            without needing an account.
                        </p>

                        {publicMeeting ? (
                            <div className="public-link-container">
                                <div className="link-display">
                                    <input
                                        type="text"
                                        value={`${window.location.origin}/meeting/${publicMeeting.code}`}
                                        readOnly
                                        className="link-input"
                                    />
                                    <button className="copy-button" onClick={copyMeetingLink}>
                                        📋 Copy
                                    </button>
                                </div>
                                <div className="link-actions">
                                    <button className="secondary-button" onClick={resetPublicMeeting}>
                                        Create New
                                    </button>
                                    <button className="primary-button" onClick={joinPublicMeeting}>
                                        Join Meeting
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleGetPublicMeetingLink}
                                className="primary-button public-button"
                                disabled={creatingPublic}
                            >
                                {creatingPublic ? 'Creating...' : 'Get Meeting Link'}
                            </button>
                        )}
                    </div>

                    <div className="meeting-card">
                        <div className="meeting-card-icon">🎥</div>
                        <h3>Start a meeting</h3>
                        <p>
                            Create a private meeting room and invite
                            people with a simple meeting code.
                        </p>
                        <button onClick={handleCreateMeeting} className="primary-button">
                            +Create meeting
                        </button>
                    </div>

                    <div className="meeting-card">
                        <div className="meeting-card-icon">↗</div>
                        <h3>Join a meeting</h3>
                        <p>
                            Already have a meeting code?
                            Enter it below to join.
                        </p>
                        <form  onSubmit={handleJoinMeeting}>
                            <input
                                name="meetingCode"
                                type="text"
                                placeholder="ABC-123-XYZ"
                                className="meeting-input"
                            />
                            <button  type="submit" className="secondary-button">
                               Join meeting
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DashboardPage;