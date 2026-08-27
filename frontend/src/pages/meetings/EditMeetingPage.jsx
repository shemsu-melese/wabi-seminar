import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import meetingService from '../../services/meetingService.js';
import toast from 'react-hot-toast';
import './CreateMeetingPage.css';

const EditMeetingPage = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration_minutes: 30,
        meeting_type: 'business',
        max_participants: 20,
        waiting_room_enabled: true,
        start_time: '',
        allow_screen_sharing: true,
        allow_chat: true,
        allow_reactions: true,
        allow_raise_hand: true,
        is_locked: false
    });

    const [wabifocus, setWabifocus] = useState({
        goal: '',
        agenda: [],
        outcomes: '',
        action_items: []
    });

    const [errors, setErrors] = useState({});

    // ============================================
    // Fetch Meeting Data
    // ============================================
    useEffect(() => {
        const fetchMeeting = async () => {
            try {
                const response = await meetingService.getMeeting(meetingId);
                if (response.success) {
                    const meeting = response.data;

                    setFormData({
                        title: meeting.title || '',
                        description: meeting.description || '',
                        duration_minutes: meeting.duration_minutes || 30,
                        meeting_type: meeting.meeting_type || 'business',
                        max_participants: meeting.max_participants || 20,
                        waiting_room_enabled: meeting.waiting_room_enabled !== false,
                        start_time: meeting.start_time ? meeting.start_time.slice(0, 16) : '',
                        allow_screen_sharing: meeting.allow_screen_sharing !== false,
                        allow_chat: meeting.allow_chat !== false,
                        allow_reactions: meeting.allow_reactions !== false,
                        allow_raise_hand: meeting.allow_raise_hand !== false,
                        is_locked: meeting.is_locked || false
                    });

                    // Load WabiFocus items
                    if (meeting.wabifocus && meeting.wabifocus.length > 0) {
                        const goals = meeting.wabifocus.filter(i => i.type === 'goal');
                        const agendaItems = meeting.wabifocus.filter(i => i.type === 'agenda');
                        const outcomes = meeting.wabifocus.filter(i => i.type === 'outcome');
                        const actionItems = meeting.wabifocus.filter(i => i.type === 'action_item');

                        setWabifocus({
                            goal: goals.length > 0 ? goals[0].title : '',
                            agenda: agendaItems.map(i => i.title),
                            outcomes: outcomes.length > 0 ? outcomes[0].title : '',
                            action_items: actionItems.map(i => ({
                                title: i.title,
                                description: i.description || '',
                                priority: i.priority || 'medium'
                            }))
                        });
                    }
                } else {
                    toast.error('Meeting not found');
                    navigate('/meetings');
                }
            } catch (error) {
                toast.error('Failed to load meeting');
                navigate('/meetings');
            } finally {
                setLoading(false);
            }
        };

        fetchMeeting();
    }, [meetingId, navigate]);

    // ============================================
    // Handle Form Changes
    // ============================================
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ============================================
    // Handle WabiFocus Changes
    // ============================================
    const handleWabiFocusChange = (section, index, field, value) => {
        setWabifocus(prev => {
            const newSection = [...prev[section]];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...prev, [section]: newSection };
        });
    };

    // ============================================
    // WabiFocus - Add/Remove Items
    // ============================================
    const addAgendaItem = () => {
        setWabifocus(prev => ({
            ...prev,
            agenda: [...prev.agenda, '']
        }));
    };

    const removeAgendaItem = (index) => {
        if (wabifocus.agenda.length <= 1) {
            toast.error('At least one agenda item is required');
            return;
        }
        setWabifocus(prev => ({
            ...prev,
            agenda: prev.agenda.filter((_, i) => i !== index)
        }));
    };

    const addActionItem = () => {
        setWabifocus(prev => ({
            ...prev,
            action_items: [...prev.action_items, { title: '', description: '', priority: 'medium' }]
        }));
    };

    const removeActionItem = (index) => {
        if (wabifocus.action_items.length <= 1) {
            toast.error('At least one action item is required');
            return;
        }
        setWabifocus(prev => ({
            ...prev,
            action_items: prev.action_items.filter((_, i) => i !== index)
        }));
    };

    // ============================================
    // Validation
    // ============================================
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Meeting title is required';
        }

        if (formData.duration_minutes < 1) {
            newErrors.duration_minutes = 'Duration must be at least 1 minute';
        }

        if (formData.max_participants < 1) {
            newErrors.max_participants = 'Max participants must be at least 1';
        }

        if (formData.start_time) {
            const selectedDate = new Date(formData.start_time);
            if (selectedDate < new Date()) {
                newErrors.start_time = 'Start time must be in the future';
            }
        }

        const emptyAgenda = wabifocus.agenda.some(item => !item.trim());
        if (emptyAgenda) {
            newErrors.agenda = 'Please fill in all agenda items or remove empty ones';
        }

        const emptyActions = wabifocus.action_items.some(item => !item.title.trim());
        if (emptyActions) {
            newErrors.action_items = 'Please fill in all action items or remove empty ones';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ============================================
    // Submit Handler
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setSaving(true);

        try {
            const wabifocusData = {
                goal: wabifocus.goal || undefined,
                agenda: wabifocus.agenda.filter(item => item.trim() !== ''),
                outcomes: wabifocus.outcomes || undefined,
                action_items: wabifocus.action_items
                    .filter(item => item.title.trim() !== '')
                    .map(item => ({
                        title: item.title,
                        description: item.description || undefined,
                        priority: item.priority
                    }))
            };

            const meetingData = {
                ...formData,
                wabifocus: wabifocusData
            };

            // Remove empty start_time
            if (!meetingData.start_time) {
                delete meetingData.start_time;
            }

            const response = await meetingService.updateMeeting(meetingId, meetingData);

            if (response.success) {
                toast.success('Meeting updated successfully!');
                navigate(`/meeting/${response.data.code}`);
            } else {
                toast.error(response.message || 'Failed to update meeting');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // ============================================
    // Loading State
    // ============================================
    if (loading) {
        return (
            <div className="create-meeting-container">
                <div className="meetings-loading">
                    <div className="spinner"></div>
                    <p>Loading meeting...</p>
                </div>
            </div>
        );
    }

    // ============================================
    // Render
    // ============================================
    return (
        <div className="create-meeting-container">
            <header className="create-header">
                <h1>Edit Meeting</h1>
                <p>Update your meeting details</p>
            </header>

            <form onSubmit={handleSubmit} className="create-form">
                {/* ============================================
                    BASIC INFORMATION
                ============================================ */}
                <section className="form-section">
                    <h2>Basic Information</h2>

                    <div className="form-group">
                        <label htmlFor="title">
                            Meeting Title <span className="required">*</span>
                        </label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="Enter meeting title"
                            value={formData.title}
                            onChange={handleChange}
                            className={errors.title ? 'input-error' : ''}
                            required
                        />
                        {errors.title && <span className="error-text">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Describe the purpose of this meeting"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="duration_minutes">
                                Duration <span className="required">*</span>
                            </label>
                            <select
                                id="duration_minutes"
                                name="duration_minutes"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                className={errors.duration_minutes ? 'input-error' : ''}
                            >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="90">1.5 hours</option>
                                <option value="120">2 hours</option>
                                <option value="180">3 hours</option>
                            </select>
                            {errors.duration_minutes && <span className="error-text">{errors.duration_minutes}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="meeting_type">Meeting Type</label>
                            <select
                                id="meeting_type"
                                name="meeting_type"
                                value={formData.meeting_type}
                                onChange={handleChange}
                            >
                                <option value="seminar">Seminar</option>
                                <option value="business">Business</option>
                                <option value="education">Education</option>
                                <option value="personal">Personal</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="start_time">Start Time</label>
                            <input
                                id="start_time"
                                name="start_time"
                                type="datetime-local"
                                value={formData.start_time}
                                onChange={handleChange}
                                className={errors.start_time ? 'input-error' : ''}
                            />
                            {errors.start_time && <span className="error-text">{errors.start_time}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="max_participants">
                                Max Participants <span className="required">*</span>
                            </label>
                            <input
                                id="max_participants"
                                name="max_participants"
                                type="number"
                                min="1"
                                max="100"
                                value={formData.max_participants}
                                onChange={handleChange}
                                className={errors.max_participants ? 'input-error' : ''}
                            />
                            {errors.max_participants && <span className="error-text">{errors.max_participants}</span>}
                        </div>
                    </div>

                    <div className="form-check">
                        <input
                            id="is_locked"
                            name="is_locked"
                            type="checkbox"
                            checked={formData.is_locked}
                            onChange={handleChange}
                        />
                        <label htmlFor="is_locked">Lock Meeting</label>
                    </div>
                </section>

                {/* ============================================
                    MEETING SETTINGS
                ============================================ */}
                <section className="form-section">
                    <h2>Meeting Settings</h2>

                    <div className="form-check-group">
                        <div className="form-check">
                            <input
                                id="waiting_room_enabled"
                                name="waiting_room_enabled"
                                type="checkbox"
                                checked={formData.waiting_room_enabled}
                                onChange={handleChange}
                            />
                            <label htmlFor="waiting_room_enabled">Enable Waiting Room</label>
                        </div>

                        <div className="form-check">
                            <input
                                id="allow_screen_sharing"
                                name="allow_screen_sharing"
                                type="checkbox"
                                checked={formData.allow_screen_sharing}
                                onChange={handleChange}
                            />
                            <label htmlFor="allow_screen_sharing">Allow Screen Sharing</label>
                        </div>

                        <div className="form-check">
                            <input
                                id="allow_chat"
                                name="allow_chat"
                                type="checkbox"
                                checked={formData.allow_chat}
                                onChange={handleChange}
                            />
                            <label htmlFor="allow_chat">Allow Chat</label>
                        </div>

                        <div className="form-check">
                            <input
                                id="allow_reactions"
                                name="allow_reactions"
                                type="checkbox"
                                checked={formData.allow_reactions}
                                onChange={handleChange}
                            />
                            <label htmlFor="allow_reactions">Allow Reactions</label>
                        </div>

                        <div className="form-check">
                            <input
                                id="allow_raise_hand"
                                name="allow_raise_hand"
                                type="checkbox"
                                checked={formData.allow_raise_hand}
                                onChange={handleChange}
                            />
                            <label htmlFor="allow_raise_hand">Allow Raise Hand</label>
                        </div>
                    </div>
                </section>

                {/* ============================================
                    WABIFOCUS
                ============================================ */}
                <section className="form-section">
                    <h2>🎯 WabiFocus</h2>
                    <p className="section-hint">Make your meeting more productive</p>

                    <div className="form-group">
                        <label htmlFor="goal">Meeting Goal</label>
                        <input
                            id="goal"
                            type="text"
                            placeholder="What do you want to achieve?"
                            value={wabifocus.goal}
                            onChange={(e) => setWabifocus(prev => ({ ...prev, goal: e.target.value }))}
                        />
                    </div>

                    <div className="form-group">
                        <label>Agenda Items <span className="required">*</span></label>
                        {wabifocus.agenda.map((item, index) => (
                            <div key={index} className="agenda-item">
                                <input
                                    type="text"
                                    placeholder={`Agenda item ${index + 1}`}
                                    value={item}
                                    onChange={(e) => handleWabiFocusChange('agenda', index, 'title', e.target.value)}
                                    className={errors.agenda ? 'input-error' : ''}
                                />
                                <button
                                    type="button"
                                    className="btn-remove"
                                    onClick={() => removeAgendaItem(index)}
                                    title="Remove agenda item"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {errors.agenda && <span className="error-text">{errors.agenda}</span>}
                        <button type="button" className="btn-add" onClick={addAgendaItem}>
                            + Add Agenda Item
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="outcomes">Expected Outcomes</label>
                        <input
                            id="outcomes"
                            type="text"
                            placeholder="What should be achieved?"
                            value={wabifocus.outcomes}
                            onChange={(e) => setWabifocus(prev => ({ ...prev, outcomes: e.target.value }))}
                        />
                    </div>

                    <div className="form-group">
                        <label>Action Items <span className="required">*</span></label>
                        {wabifocus.action_items.map((item, index) => (
                            <div key={index} className="action-item">
                                <input
                                    type="text"
                                    placeholder="Action title"
                                    value={item.title}
                                    onChange={(e) => handleWabiFocusChange('action_items', index, 'title', e.target.value)}
                                    className={errors.action_items ? 'input-error' : ''}
                                />
                                <input
                                    type="text"
                                    placeholder="Description (optional)"
                                    value={item.description}
                                    onChange={(e) => handleWabiFocusChange('action_items', index, 'description', e.target.value)}
                                />
                                <select
                                    value={item.priority}
                                    onChange={(e) => handleWabiFocusChange('action_items', index, 'priority', e.target.value)}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                                <button
                                    type="button"
                                    className="btn-remove"
                                    onClick={() => removeActionItem(index)}
                                    title="Remove action item"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {errors.action_items && <span className="error-text">{errors.action_items}</span>}
                        <button type="button" className="btn-add" onClick={addActionItem}>
                            + Add Action Item
                        </button>
                    </div>
                </section>

                {/* ============================================
                    FORM ACTIONS
                ============================================ */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate(`/meeting/${meetingId}`)}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditMeetingPage;