import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import attendanceService from '../../services/attendanceService.js';
import meetingService from '../../services/meetingService.js';
import toast from 'react-hot-toast';
import './AttendancePage.css';

const AttendancePage = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [meetings, setMeetings] = useState([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState(meetingId || '');
    const [attendance, setAttendance] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMeetings = async () => {
        try {
            const response = await meetingService.getMeetings(null, 1, 100);
            if (response.success) {
                const meetingsData = response.data.meetings || [];
                setMeetings(meetingsData);
                if (meetingsData.length > 0 && !selectedMeetingId) {
                    const firstId = meetingsData[0].id;
                    setSelectedMeetingId(firstId);
                    navigate(`/attendance/${firstId}`, { replace: true });
                }
            } else {
                // ✅ Silent error – no toast
                console.error('Failed to load meetings:', response.message);
            }
        } catch (error) {
            // ✅ Silent error – no toast
            console.error('Failed to load meetings:', error);
        }
    };

    const fetchAttendance = async (id) => {
        if (!id) {
            setAttendance(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await attendanceService.getAttendanceReport(id);
            if (response.success) {
                setAttendance(response.data);
            } else {
                // ✅ No toast – just log
                console.error('Failed to load attendance:', response.message);
            }
        } catch (error) {
            // ✅ No toast – just log
            console.error('Failed to load attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            await fetchMeetings();
            if (meetingId) {
                setSelectedMeetingId(meetingId);
                await fetchAttendance(meetingId);
            } else {
                setLoading(false);
            }
        };
        init();
    }, [meetingId]);

    useEffect(() => {
        if (selectedMeetingId) {
            fetchAttendance(selectedMeetingId);
            navigate(`/attendance/${selectedMeetingId}`, { replace: true });
        } else {
            setAttendance(null);
            navigate('/attendance', { replace: true });
        }
    }, [selectedMeetingId]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchMeetings();
        if (selectedMeetingId) {
            await fetchAttendance(selectedMeetingId);
        }
        setRefreshing(false);
        toast.success('Refreshed');
    };

    const handleMeetingChange = (e) => {
        const id = e.target.value;
        setSelectedMeetingId(id);
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs}s`;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const map = {
            'present': { label: 'Present', class: 'status-present' },
            'late': { label: 'Late', class: 'status-late' },
            'absent': { label: 'Absent', class: 'status-absent' },
            'excused': { label: 'Excused', class: 'status-excused' },
            'waiting': { label: 'Waiting', class: 'status-waiting' },
            'left early': { label: 'Left Early', class: 'status-left' },
        };
        const s = map[status] || { label: status || 'N/A', class: 'status-default' };
        return <span className={`status-badge ${s.class}`}>{s.label}</span>;
    };

    const exportCSV = () => {
        if (!attendance?.report || attendance.report.length === 0) {
            toast.error('No data to export');
            return;
        }

        const headers = ['Name', 'Email', 'Join Time', 'Leave Time', 'Duration', 'Status', 'Punctuality'];
        const rows = attendance.report.map(r => [
            `${r.first_name} ${r.last_name}`,
            r.email,
            formatDateTime(r.join_time),
            formatDateTime(r.leave_time),
            formatDuration(r.duration_seconds),
            r.status || 'N/A',
            r.punctuality || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${attendance.meeting?.title || 'report'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV exported successfully');
    };

    return (
        <div className="attendance-container">
            <header className="attendance-header">
                <h1>Attendance</h1>
                <p>View attendance reports for your meetings</p>
            </header>

            <div className="attendance-selector">
                <label htmlFor="meetingSelect">Select Meeting:</label>
                <select
                    id="meetingSelect"
                    value={selectedMeetingId}
                    onChange={handleMeetingChange}
                    className="meeting-select"
                >
                    <option value="">-- Select a meeting --</option>
                    {meetings.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.title} ({m.code}) - {m.status}
                        </option>
                    ))}
                </select>
                <button
                    className="btn-export"
                    onClick={exportCSV}
                    disabled={!attendance?.report || attendance.report.length === 0}
                >
                    📥 Export CSV
                </button>
                <button
                    className="btn-refresh"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    {refreshing ? '⟳' : '↻ Refresh'}
                </button>
            </div>

            {!loading && meetings.length === 0 && (
                <div className="attendance-empty">
                    <p>You haven't created any meetings yet.</p>
                    <button className="btn-primary" onClick={() => navigate('/meetings/create')}>
                        +Create a Meeting
                    </button>
                </div>
            )}

            {loading && (
                <div className="attendance-loading">
                    <div className="spinner"></div>
                    <p>Loading attendance...</p>
                </div>
            )}

            {!loading && meetings.length > 0 && !selectedMeetingId && (
                <div className="attendance-empty">
                    <p>Select a meeting to view attendance.</p>
                </div>
            )}

            {!loading && selectedMeetingId && attendance && (
                <>
                    <section className="attendance-summary">
                        <h2>{attendance.meeting?.title}</h2>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span className="summary-label">Total</span>
                                <span className="summary-value">{attendance.summary?.total || 0}</span>
                            </div>
                            <div className="summary-item present">
                                <span className="summary-label">Present</span>
                                <span className="summary-value">{attendance.summary?.present || 0}</span>
                            </div>
                            <div className="summary-item late">
                                <span className="summary-label">Late</span>
                                <span className="summary-value">{attendance.summary?.late || 0}</span>
                            </div>
                            <div className="summary-item absent">
                                <span className="summary-label">Absent</span>
                                <span className="summary-value">{attendance.summary?.absent || 0}</span>
                            </div>
                            <div className="summary-item excused">
                                <span className="summary-label">Excused</span>
                                <span className="summary-value">{attendance.summary?.excused || 0}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Attendance Rate</span>
                                <span className="summary-value">{attendance.summary?.attendance_rate || 0}%</span>
                            </div>
                        </div>
                    </section>

                    <section className="attendance-table-section">
                        <h3>Attendees</h3>
                        <div className="table-wrapper">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Join Time</th>
                                        <th>Leave Time</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Punctuality</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.report?.length > 0 ? (
                                        attendance.report.map((r, index) => (
                                            <tr key={index}>
                                                <td>{r.first_name} {r.last_name}</td>
                                                <td>{r.email}</td>
                                                <td>{formatDateTime(r.join_time)}</td>
                                                <td>{formatDateTime(r.leave_time)}</td>
                                                <td>{formatDuration(r.duration_seconds)}</td>
                                                <td>{getStatusBadge(r.status)}</td>
                                                <td>{r.punctuality || 'N/A'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="empty-row">
                                                No attendees recorded
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default AttendancePage;