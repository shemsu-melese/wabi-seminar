import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import meetingService from '../../services/meetingService.js';
import toast from 'react-hot-toast';
const MeetingsPage = () => {
    const navigate = useNavigate();

    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Join Meeting
    const [joinCode, setJoinCode] = useState('');
    const [joinLoading, setJoinLoading] = useState(false);

    // Attendance lookup
    const [meetingCodeInput, setMeetingCodeInput] = useState('');
    const [codeLookupLoading, setCodeLookupLoading] = useState(false);

    // ==============================
    // Fetch meetings – NO TOASTS
    // ==============================
    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const response = await meetingService.getMeetings(null, currentPage, limit);
            if (response.success) {
                setMeetings(response.data.meetings || []);
                setTotalPages(response.data.pagination?.totalPages || 1);
            } else {
                // ✅ No toast – just log
                console.error('Failed to load meetings:', response.message);
            }
        } catch (error) {
            // ✅ No toast – just log
            console.error('Failed to load meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, [currentPage]);

    // ==============================
    // Delete meeting
    // ==============================
    const handleDeleteClick = (meeting) => {
        setSelectedMeeting(meeting);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedMeeting) return;
        try {
            const response = await meetingService.deleteMeeting(selectedMeeting.id);
            if (response.success) {
                toast.success('Meeting deleted');
                fetchMeetings();
            } else {
                toast.error(response.message || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setShowDeleteModal(false);
            setSelectedMeeting(null);
        }
    };

    // ==============================
    // Join Meeting
    // ==============================
    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        if (!joinCode.trim()) {
            toast.error('Please enter a meeting code');
            return;
        }
        const code = joinCode.trim().toUpperCase();
        setJoinLoading(true);
        try {
            const response = await meetingService.getMeetingByCode(code);
            if (response.success) {
                navigate(`/meeting/${code}`);
            } else {
                toast.error('Meeting not found. Please check the code.');
            }
        } catch (error) {
            toast.error('Error finding meeting. Please try again.');
        } finally {
            setJoinLoading(false);
            setJoinCode('');
        }
    };

    // ==============================
    // Attendance lookup
    // ==============================
    const handleCodeLookup = async (e) => {
        e.preventDefault();
        if (!meetingCodeInput.trim()) {
            toast.error('Please enter a meeting code');
            return;
        }
        const code = meetingCodeInput.trim().toUpperCase();
        setCodeLookupLoading(true);
        try {
            const response = await meetingService.getMeetingByCode(code);
            if (response.success) {
                const meeting = response.data;
                navigate(`/attendance/${meeting.id}`);
                toast.success(`Meeting found: ${meeting.title}`);
            } else {
                toast.error('Meeting not found. Please check the code.');
            }
        } catch (error) {
            toast.error('Error finding meeting. Please try again.');
        } finally {
            setCodeLookupLoading(false);
            setMeetingCodeInput('');
        }
    };

    // ==============================
    // Helpers
    // ==============================
    const getStatusBadge = (status) => {
        const map = {
            'scheduled': { label: 'Scheduled', class: 'badge-scheduled' },
            'ongoing': { label: 'Live', class: 'badge-ongoing' },
            'ended': { label: 'Ended', class: 'badge-ended' },
            'cancelled': { label: 'Cancelled', class: 'badge-cancelled' }
        };
        const s = map[status] || { label: status, class: 'badge-default' };
        return <span className={`badge ${s.class}`}>{s.label}</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const copyMeetingCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Meeting code copied!');
    };

    // ==============================
    // Loading state
    // ==============================
    if (loading) {
        return (
            <div className="meetings-loading">
                <div className="spinner"></div>
                <p>Loading meetings...</p>
            </div>
        );
    }

    // ==============================
    // Render
    // ==============================
    return (
        <>
            <style>{`
                /* ============================================================
                   MEETINGS PAGE – COMPLETE STYLES
                   ============================================================ */

                .meetings-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px 32px;
                }

                .meetings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .meetings-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0;
                }
                .meetings-header p {
                    color: #64748b;
                    margin: 4px 0 0;
                }

                .meetings-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #e2e8f0;
                    border-top-color: #d68f0a;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Join & Lookup sections */
                .join-section,
                .code-lookup-section {
                    background: #fff;
                    border-radius: 8px;
                    padding: 16px 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .join-section label,
                .code-lookup-section label {
                    font-weight: 500;
                    color: #0f172a;
                }
                .join-form,
                .lookup-form {
                    display: flex;
                    flex: 1;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .join-form input,
                .lookup-form input {
                    flex: 1;
                    min-width: 150px;
                    padding: 8px 14px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 15px;
                }
                .join-form input:focus,
                .lookup-form input:focus {
                    border-color: #d68f0a;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
                }
                .join-form button,
                .lookup-form button {
                    background: #d68f0a;
                    color: #fff;
                    border: none;
                    padding: 8px 20px;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: 0.2s;
                    white-space: nowrap;
                }
                .join-form button:hover,
                .lookup-form button:hover {
                    background: #hsl(39, 94%, 25%);
                }
                .join-form button:disabled,
                .lookup-form button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .hint {
                    font-size: 13px;
                    color: #94a3b8;
                    margin-left: auto;
                }

                /* Meeting list */
                .meeting-list {
                    list-style: none;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .meeting-card {
                    background: #fff;
                    border-radius: 8px;
                    padding: 16px 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: box-shadow 0.2s;
                }
                .meeting-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                }
                .meeting-info {
                    flex: 1;
                    min-width: 0;
                }
                .meeting-title-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 4px;
                }
                .meeting-title {
                    font-weight: 500;
                    font-size: 16px;
                }
                .badge {
                    font-size: 12px;
                    padding: 2px 10px;
                    border-radius: 20px;
                    font-weight: 500;
                    white-space: nowrap;
                }
                .badge-scheduled { background: #e0f2fe; color: #0369a1; }
                .badge-ongoing { background: #dcfce7; color: #16a34a; }
                .badge-ended { background: #f1f5f9; color: #64748b; }
                .badge-cancelled { background: #fee2e2; color: #dc2626; }
                .badge-default { background: #f1f5f9; color: #475569; }

                .meeting-meta {
                    display: flex;
                    gap: 16px;
                    font-size: 14px;
                    color: #64748b;
                    flex-wrap: wrap;
                }
                .meeting-code {
                    cursor: pointer;
                    transition: color 0.2s;
                }
                .meeting-code:hover {
                    color: #hsl(39, 94%, 25%);
                }
                .meeting-description {
                    font-size: 14px;
                    color: #94a3b8;
                    margin: 4px 0 0;
                }

                .meeting-actions {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .btn-join, .btn-view, .btn-edit, .btn-delete {
                    padding: 6px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .btn-join { background: #d68f0a; color: #fff; }
                .btn-join:hover { background: #hsl(39, 94%, 25%); }
                .btn-view { background: #f1f5f9; color: #0f172a; }
                .btn-view:hover { background: #e2e8f0; }
                .btn-edit { background: #eef2ff; color: #6366f1; }
                .btn-edit:hover { background: #e0e7ff; }
                .btn-delete { background: #fef2f2; color: #ef4444; }
                .btn-delete:hover { background: #fee2e2; }
               .viewatendance:hover{
                background: #6366f1;
               }
                .btn-primary {
                    background: green;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                }
                .btn-primary:hover { background: #4f46e5; }
                .btn-outline {
                    background: transparent;
                    border: 1.5px solid #0e7d1f;
                    color: #6366f1;
                    padding: 8px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                }
                .btn-outline:hover { background: #eef2ff; }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: #94a3b8;
                }

                .pagination {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    margin-top: 24px;
                }
                .pagination button {
                    padding: 8px 16px;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    background: #fff;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .pagination button:hover:not(:disabled) { background: #f1f5f9; }
                .pagination button:disabled { opacity: 0.5; cursor: not-allowed; }
                .pagination span { font-weight: 500; color: #0f172a; }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: #fff;
                    border-radius: 12px;
                    padding: 32px;
                    max-width: 420px;
                    width: 90%;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                }
                .modal-content h2 {
                    font-size: 20px;
                    margin: 0 0 8px;
                }
                .modal-content p {
                    color: #64748b;
                    margin: 8px 0 20px;
                    line-height: 1.6;
                }
                .modal-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }
                .btn-secondary {
                    background: #f1f5f9;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                }
                .btn-secondary:hover { background: #e2e8f0; }
                .btn-danger {
                    background: #ef4444;
                    color: #fff;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                }
                .btn-danger:hover { background: #dc2626; }

                /* Responsive */
                @media (max-width: 768px) {
                    .meetings-container { padding: 16px; }
                    .meeting-card { flex-direction: column; align-items: stretch; gap: 12px; }
                    .meeting-actions { justify-content: flex-start; }
                    .join-section,
                    .code-lookup-section {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .join-form,
                    .lookup-form {
                        flex-direction: column;
                    }
                    .join-form button,
                    .lookup-form button {
                        width: 100%;
                    }
                    .hint {
                        margin-left: 0;
                        text-align: center;
                    }
                }
            `}</style>

            <div className="meetings-container">
                {/* Header */}
                <header className="meetings-header">
                    <div>
                        <h1>My Meetings</h1>
                        <p>Manage all your meetings in one place</p>
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/meetings/create')}>
                        + New Meeting
                    </button>
                </header>

                {/* Join Section */}
                <section className="join-section">
                    <label htmlFor="joinMeetingCode">🚪 Join a Meeting</label>
                    <form onSubmit={handleJoinSubmit} className="join-form">
                        <input
                            id="joinMeetingCode"
                            type="text"
                            placeholder="Enter meeting code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn-primary" disabled={joinLoading}>
                            {joinLoading ? 'Joining...' : 'Join'}
                        </button>
                    </form>
                    <span className="hint">Enter the meeting code to join instantly</span>
                </section>

                {/* Attendance Lookup */}
                <section className="code-lookup-section">
                    <label htmlFor="meetingCodeLookup">🔍 Find Meeting by Code</label>
                    <form onSubmit={handleCodeLookup} className="lookup-form">
                        <input
                            id="meetingCodeLookup"
                            type="text"
                            placeholder="Enter meeting code"
                            value={meetingCodeInput}
                            onChange={(e) => setMeetingCodeInput(e.target.value)}
                            disabled={codeLookupLoading}
                        />
                        <button className="viewatendance" type="submit" disabled={codeLookupLoading}>
                            {codeLookupLoading ? 'Searching...' : 'View Attendance'}
                        </button>
                    </form>
                    <span className="hint">Enter the meeting code to view its attendance report</span>
                </section>

                {/* Meeting List */}
                {meetings.length === 0 ? (
                    <div className="empty-state">
                        {/* <p>No meetings found.</p> */}
                    </div>
                ) : (
                    <>
                        <ul className="meeting-list">
                            {meetings.map((meeting) => (
                                <li key={meeting.id} className="meeting-card">
                                    <div className="meeting-info">
                                        <div className="meeting-title-row">
                                            <span className="meeting-title">{meeting.title}</span>
                                            {getStatusBadge(meeting.status)}
                                        </div>
                                        <div className="meeting-meta">
                                            <span>📅 {formatDate(meeting.start_time)}</span>
                                            <span>👥 {meeting.participant_count || 0} participants</span>
                                            <span
                                                className="meeting-code"
                                                onClick={() => copyMeetingCode(meeting.code)}
                                                title="Click to copy"
                                            >
                                                📝 Code: {meeting.code}
                                            </span>
                                        </div>
                                        {meeting.description && (
                                            <p className="meeting-description">{meeting.description}</p>
                                        )}
                                    </div>
                                    <div className="meeting-actions">
                                        {(meeting.status === 'scheduled' || meeting.status === 'ongoing') && (
                                            <button
                                                className="btn-join"
                                                onClick={() => navigate(`/meeting/${meeting.code}`)}
                                            >
                                                {meeting.status === 'ongoing' ? '🔴 Join Live' : 'Join'}
                                            </button>
                                        )}
                                        <button
                                            className="btn-view"
                                            onClick={() => navigate(`/meeting/${meeting.code}`)}
                                        >
                                            View
                                        </button>
                                        {meeting.status === 'scheduled' && (
                                            <button
                                                className="btn-edit"
                                                onClick={() => navigate(`/meetings/edit/${meeting.id}`)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDeleteClick(meeting)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <span>Page {currentPage} of {totalPages}</span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Delete Modal */}
                {showDeleteModal && selectedMeeting && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h2>Delete Meeting</h2>
                            <p>
                                Are you sure you want to delete <strong>"{selectedMeeting.title}"</strong>?
                                <br />
                                This action cannot be undone.
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button className="btn-danger" onClick={confirmDelete}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MeetingsPage;