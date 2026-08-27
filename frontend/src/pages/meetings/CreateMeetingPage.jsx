import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import meetingService from '../../services/meetingService.js';
import toast from 'react-hot-toast';

const CreateMeetingPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // ============================================
    // Form State
    // ============================================
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration_minutes: 30,
        meeting_type: 'business',
        max_participants: 20,
        password: '',
        is_public: true,
        waiting_room_enabled: true,
        start_time: '',
        allow_screen_sharing: true,
        allow_chat: true,
        allow_reactions: true,
        allow_raise_hand: true,
        is_locked: false,
    });

    // ✅ Only goal and agenda remain
    const [wabifocus, setWabifocus] = useState({
        goal: '',
        agenda: [''],
    });

    const [errors, setErrors] = useState({});

    // ============================================
    // Success Modal State
    // ============================================
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdMeeting, setCreatedMeeting] = useState(null);

    // ============================================
    // Form Handlers
    // ============================================
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData((prev) => {
            const updated = { ...prev, [name]: newValue };
            if (name === 'is_public' && newValue === true) {
                updated.password = '';
            }
            return updated;
        });

        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // Agenda handlers (simple strings)
    const addAgendaItem = () => {
        setWabifocus((prev) => ({
            ...prev,
            agenda: [...prev.agenda, ''],
        }));
    };

    const removeAgendaItem = (index) => {
        if (wabifocus.agenda.length <= 1) return;
        setWabifocus((prev) => ({
            ...prev,
            agenda: prev.agenda.filter((_, i) => i !== index),
        }));
    };

    const handleAgendaChange = (index, value) => {
        setWabifocus((prev) => {
            const newAgenda = [...prev.agenda];
            newAgenda[index] = value;
            return { ...prev, agenda: newAgenda };
        });
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

        if (!formData.is_public && !formData.password.trim()) {
            newErrors.password = 'Password is required for private meetings';
        }

        const emptyAgenda = wabifocus.agenda.some((item) => !item.trim());
        if (emptyAgenda) {
            newErrors.agenda = 'Please fill in all agenda items or remove empty ones';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ============================================
    // Submit
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading('Creating meeting...');

        try {
            // Only goal and agenda
            const wabifocusData = {
                goal: wabifocus.goal || null,
                agenda: wabifocus.agenda.filter((item) => item.trim() !== ''),
            };

            const meetingData = {
                ...formData,
                wabifocus: wabifocusData,
            };

            if (meetingData.is_public) {
                delete meetingData.password;
            }
            if (!meetingData.start_time) delete meetingData.start_time;

            Object.keys(meetingData).forEach((key) => {
                if (meetingData[key] === undefined) {
                    meetingData[key] = null;
                }
            });

            console.log('📤 Sending meeting data:', meetingData);

            const response = await meetingService.createMeeting(meetingData);

            console.log('📥 Response from server:', response);

            toast.dismiss(loadingToast);

            if (response.success) {
                const meetingCode = response.data?.code;
                if (!meetingCode) {
                    console.warn('⚠️ No meeting code in response:', response);
                    toast.error('Meeting created but no code returned.');
                    setLoading(false);
                    return;
                }

                toast.success('Meeting created successfully! 🎉');
                setCreatedMeeting(response.data);
                setShowSuccessModal(true);
            } else {
                toast.error(response.message || 'Failed to create meeting');
            }
        } catch (error) {
            console.error('❌ Full error object:', error);
            console.error('❌ Response data:', error.response?.data);
            toast.dismiss(loadingToast);
            const msg = error.response?.data?.message || error.message || 'An error occurred';
            toast.error(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // Copy Code & Navigate
    // ============================================
    const copyCode = () => {
        if (createdMeeting?.code) {
            navigator.clipboard.writeText(createdMeeting.code);
            toast.success('Meeting code copied!');
        } else {
            toast.error('No code to copy');
        }
    };

    const goToMeeting = () => {
        if (createdMeeting?.code) {
            navigate(`/meeting/${createdMeeting.code}`);
        } else {
            toast.error('Meeting code not found');
        }
    };

    // ============================================
    // Render
    // ============================================
    return (
        <div className="create-meeting-container">
            <header className="create-header">
                <h1>Create New Meeting</h1>
                <p>Set up your meeting and share the code with participants</p>
            </header>

            <form onSubmit={handleSubmit} className="create-form">
                {/* ===== BASIC INFORMATION ===== */}
                <section className="form-section">
                    <h2>Basic Information</h2>

                    <div className="form-group">
                        <label htmlFor="title">Meeting Title *</label>
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
                            <label htmlFor="duration_minutes">Duration *</label>
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
                            <label htmlFor="max_participants">Max Participants *</label>
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
                </section>

                {/* ===== MEETING VISIBILITY ===== */}
                <section className="form-section">
                    <h2>Meeting Visibility</h2>
                    <div className="form-group">
                        <label>Who can join?</label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="is_public"
                                    value="true"
                                    checked={formData.is_public === true}
                                    onChange={() => setFormData(prev => ({ ...prev, is_public: true, password: '' }))}
                                />
                                🌐 Public – anyone with the link can join
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="is_public"
                                    value="false"
                                    checked={formData.is_public === false}
                                    onChange={() => setFormData(prev => ({ ...prev, is_public: false }))}
                                />
                                🔒 Private – participants need a password
                            </label>
                        </div>
                    </div>

                    {!formData.is_public && (
                        <div className="form-group">
                            <label htmlFor="password">Meeting Password *</label>
                            <input
                                id="password"
                                name="password"
                                type="text"
                                placeholder="Enter a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'input-error' : ''}
                            />
                            {errors.password && <span className="error-text">{errors.password}</span>}
                            <span className="hint-text">Participants must enter this password to join.</span>
                        </div>
                    )}
                </section>

                {/* ===== MEETING SETTINGS ===== */}
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
                    </div>
                </section>

                {/* ===== WABIFOCUS (only Goal + Agenda) ===== */}
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
                            onChange={(e) => {
                                setWabifocus((prev) => ({ ...prev, goal: e.target.value }));
                                if (errors.goal) setErrors((prev) => ({ ...prev, goal: '' }));
                            }}
                            className={errors.goal ? 'input-error' : ''}
                        />
                        {errors.goal && <span className="error-text">{errors.goal}</span>}
                    </div>

                    <div className="form-group">
                        <label>Agenda Items *</label>
                        {wabifocus.agenda.map((item, index) => (
                            <div key={index} className="agenda-item">
                                <input
                                    type="text"
                                    placeholder={`Agenda item ${index + 1}`}
                                    value={item}
                                    onChange={(e) => handleAgendaChange(index, e.target.value)}
                                    className={errors.agenda ? 'input-error' : ''}
                                />
                                {wabifocus.agenda.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => removeAgendaItem(index)}
                                        title="Remove agenda item"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        {errors.agenda && <span className="error-text">{errors.agenda}</span>}
                        <button type="button" className="btn-add" onClick={addAgendaItem}>
                            + Add Agenda Item
                        </button>
                    </div>
                </section>

                {/* ===== FORM ACTIONS ===== */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate('/meetings')}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Meeting'}
                    </button>
                </div>
            </form>

            {/* ===== SUCCESS MODAL ===== */}
            {showSuccessModal && createdMeeting && (
                <div className="success-modal-overlay">
                    <div className="success-modal">
                        <div className="success-icon">✅</div>
                        <h2>Meeting Created!</h2>
                        <p>Share this code with participants to join.</p>
                        <div className="code-display">
                            <span className="meeting-code">{createdMeeting.code}</span>
                            <button className="copy-btn-modal" onClick={copyCode}>
                                📋 Copy
                            </button>
                        </div>
                        <div className="success-actions">
                            <button className="btn-secondary" onClick={() => navigate('/meetings')}>
                                Back to Meetings
                            </button>
                            <button className="btn-primary" onClick={goToMeeting}>
                                Go to Meeting Room
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== STYLES ===== */}
            <style>{`
                .create-meeting-container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 24px 32px;
                }
                .create-header {
                    margin-bottom: 32px;
                }
                .create-header h1 {
                    font-size: 28px;
                    font-weight: 700;
                    margin: 0;
                }
                .create-header p {
                    color: #64748b;
                    margin: 4px 0 0;
                }
                .create-form {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }
                .form-section {
                    background: #fff;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                }
                .form-section h2 {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 16px 0;
                }
                .section-hint {
                    color: #64748b;
                    font-size: 14px;
                    margin: -8px 0 16px 0;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 16px;
                }
                .form-group label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #0f172a;
                }
                .form-group input,
                .form-group textarea,
                .form-group select {
                    padding: 10px 14px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 16px;
                    transition: all 0.2s;
                    background: #fff;
                    width: 100%;
                    box-sizing: border-box;
                }
                .form-group input:focus,
                .form-group textarea:focus,
                .form-group select:focus {
                    border-color: #d68f0a;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
                }
                .form-group input.input-error,
                .form-group textarea.input-error,
                .form-group select.input-error {
                    border-color: #ef4444;
                }
                .form-group textarea {
                    resize: vertical;
                    min-height: 80px;
                    font-family: inherit;
                }
                .hint-text {
                    font-size: 12px;
                    color: #94a3b8;
                }
                .error-text {
                    font-size: 13px;
                    color: #ef4444;
                }
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                .radio-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .radio-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    cursor: pointer;
                    padding: 8px 12px;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                    transition: 0.2s;
                }
                .radio-label:hover {
                    background: #f8fafc;
                }
                .radio-label input[type="radio"] {
                    width: 16px;
                    height: 16px;
                    accent-color: #d68f0a;
                }
                .form-check-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-check {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .form-check input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: #d68f0a;
                }
                .form-check label {
                    font-size: 14px;
                    cursor: pointer;
                }
                .agenda-item {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .agenda-item input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 6px;
                    font-size: 14px;
                    background: #fff;
                }
                .agenda-item input:focus {
                    border-color: #d68f0a;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
                }
                .btn-add {
                    background: transparent;
                    border: 1.5px dashed #d68f0a;
                    color: #6366f1;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                .btn-add:hover {
                    background: #eef2ff;
                }
                .btn-remove {
                    background: #fef2f2;
                    border: none;
                    color: #ef4444;
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-remove:hover {
                    background: #fee2e2;
                }
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding-top: 16px;
                    border-top: 1px solid #e2e8f0;
                }
                .btn-secondary {
                    background: #f1f5f9;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .btn-secondary:hover {
                    background: #e2e8f0;
                }
                .btn-primary {
                    background: #d68f0a;
                    border: none;
                    color: #fff;
                    padding: 10px 24px;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-primary:hover:not(:disabled) {
                    background: #4f46e5;
                    transform: translateY(-2px);
                }
                .btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Success Modal */
                .success-modal-overlay {
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
                .success-modal {
                    background: #fff;
                    padding: 40px;
                    border-radius: 16px;
                    max-width: 420px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                }
                .success-icon {
                    font-size: 48px;
                    margin-bottom: 8px;
                }
                .success-modal h2 {
                    margin: 0 0 8px;
                    font-size: 24px;
                    font-weight: 700;
                }
                .success-modal p {
                    margin: 0 0 16px;
                    color: #64748b;
                }
                .code-display {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #f1f5f9;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 24px;
                    justify-content: center;
                }
                .meeting-code {
                    font-size: 20px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    color: #0f172a;
                }
                .copy-btn-modal {
                    background: #e2e8f0;
                    border: none;
                    padding: 6px 14px;
                    border-radius: 6px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .copy-btn-modal:hover {
                    background: #cbd5e1;
                }
                .success-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                .success-actions .btn-secondary,
                .success-actions .btn-primary {
                    padding: 10px 24px;
                }
                @media (max-width: 768px) {
                    .create-meeting-container {
                        padding: 16px;
                    }
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    .agenda-item {
                        flex-wrap: wrap;
                    }
                    .form-actions {
                        flex-direction: column;
                    }
                    .form-actions button {
                        width: 100%;
                    }
                    .success-actions {
                        flex-direction: column;
                    }
                    .success-actions button {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default CreateMeetingPage;