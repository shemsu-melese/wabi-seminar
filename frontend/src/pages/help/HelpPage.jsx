import React, { useState } from 'react';
import './HelpPage.css';

const HelpPage = () => {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Contact Form Submit

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        //  API call
        setTimeout(() => {
            setSubmitted(true);
            setLoading(false);
            setEmail('');
            setMessage('');
            setTimeout(() => setSubmitted(false), 5000);
        }, 1000);
    };

    // FAQ Data
  
    const faqs = [
        {
            question: 'How do I create a meeting?',
            answer: 'Click the "New Meeting" button on your dashboard. Fill in the meeting details (title, duration, type), set a password if needed, and click "Create Meeting". You\'ll receive a unique meeting code to share with participants.'
        },
        {
            question: 'What is the meeting code?',
            answer: 'The meeting code is a unique 6-character alphanumeric identifier. Participants use it to join your meeting. You can copy it from the meeting details or the meeting room screen.'
        },
        {
            question: 'Can I schedule a meeting in advance?',
            answer: 'Yes. When creating a meeting, set a "Start Time". The meeting will appear in the "Scheduled" section and participants can join at the scheduled time.'
        },
        {
            question: 'What is WabiFocus?',
            answer: 'WabiFocus is our productivity system that helps you run structured meetings. You can define goals, create an agenda, track decisions, and assign action items – all before, during, and after the meeting.'
        },
        {
            question: 'How do I track attendance?',
            answer: 'Attendance is automatically recorded when participants join and leave. You can view the attendance report for any meeting from the Attendance page or the meeting details.'
        },
        {
            question: 'Is my data secure?',
            answer: 'Absolutely. All communications are encrypted, passwords are hashed, and we follow industry best practices to protect your data. We use JWT authentication and HTTPS for all connections.'
        }
    ];

    // Section Content
   
    const sections = {
        'getting-started': {
            title: 'Getting Started',
            icon: '🚀',
            content: (
                <div>
                    <h3>Welcome to WabiSeminar</h3>
                    <p>
                        WabiSeminar is a professional online meeting platform designed to help you
                        <strong> Meet, Focus, and Collaborate</strong> effectively.
                    </p>
                    <div className="steps-grid">
                        <div className="step-item">
                            <span className="step-number">1</span>
                            <div>
                                <h4>Create an Account</h4>
                                <p>Sign up with your email and start hosting meetings in minutes.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">2</span>
                            <div>
                                <h4>Create or Join a Meeting</h4>
                                <p>Use the meeting code to join instantly or create your own meeting room.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">3</span>
                            <div>
                                <h4>Use WabiFocus</h4>
                                <p>Set goals, create agendas, and track action items for productive sessions.</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <span className="step-number">4</span>
                            <div>
                                <h4>Track Attendance</h4>
                                <p>Automatically record who joined and for how long, with detailed reports.</p>
                            </div>
                        </div>
                    </div>
                    
                </div>
            )
        },
        'faq': {
            title: 'FAQ',
            icon: '❓',
            content: (
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div key={index} className="faq-item">
                            <h4>{faq.question}</h4>
                            <p>{faq.answer}</p>
                        </div>
                    ))}
                </div>
            )
        },
        'video-audio': {
            title: 'Video & Audio',
            icon: '🎥',
            content: (
                <div>
                    <h3>Camera & Microphone</h3>
                    <p>
                        WabiSeminar uses WebRTC for high-quality, low-latency video and audio.
                        Ensure your browser has permission to access your camera and microphone.
                    </p>
                    <ul className="feature-list">
                        <li>
                            <strong>Camera:</strong>
                            <span>Click the camera icon in the meeting controls to toggle on/off.</span>
                        </li>
                        <li>
                            <strong>Microphone:</strong>
                            <span>Click the mic icon to mute/unmute your audio.</span>
                        </li>
                        <li>
                            <strong>Screen Sharing:</strong>
                            <span>Share your screen with participants for presentations or demos.</span>
                        </li>
                        <li>
                            <strong>Bandwidth:</strong>
                            <span>WabiSeminar automatically adjusts video quality based on your network.</span>
                        </li>
                    </ul>
                    <div className="help-tip">
                        ℹ️ For best performance, use Chrome or Firefox. Ensure your camera and mic permissions are enabled in your browser settings.
                    </div>
                </div>
            )
        },
        'wabifocus': {
            title: 'WabiFocus',
            icon: '🎯',
            content: (
                <div>
                    <h3>Run Productive Meetings</h3>
                    <p>
                        WabiFocus transforms your meetings into outcome-driven sessions with
                        clear goals, structured agendas, and actionable next steps.
                    </p>
                    <div className="wabifocus-steps">
                        <div className="wf-step">
                            <span className="step-number">1️</span>
                            <div>
                                <h4>Set a Goal</h4>
                                <p>Define what you want to achieve in the meeting.</p>
                            </div>
                        </div>
                        <div className="wf-step">
                            <span className="step-number">2️</span>
                            <div>
                                <h4>Create an Agenda</h4>
                                <p>Add discussion points in order of priority.</p>
                            </div>
                        </div>
                        <div className="wf-step">
                            <span className="step-number">3️</span>
                            <div>
                                <h4>Track Decisions</h4>
                                <p>Record important decisions made during the meeting.</p>
                            </div>
                        </div>
                        <div className="wf-step">
                            <span className="step-number">4️</span>
                            <div>
                                <h4>Assign Action Items</h4>
                                <p>Create tasks, assign owners, and set due dates.</p>
                            </div>
                        </div>
                    </div>
                    <p className="wf-note">
                        All WabiFocus items are saved and can be reviewed after the meeting.
                    </p>
                </div>
            )
        },
        'support': {
            title: 'Contact Support',
            icon: '📧',
            content: (
                <div>
                    <h3>We're here to help</h3>
                    <p>If you need assistance, reach out to our support team.</p>

                    <div className="support-options">
                        <div className="support-option">
                            <span>📧</span>
                            <strong>Email</strong>
                            <a href="mailto:support@wabiseminar.com">support@wabiseminar.com</a>
                        </div>
                        <div className="support-option">
                            <span>📞</span>
                            <strong>Phone</strong>
                            <span>+251 916 33 9382</span>
                        </div>
                        <div className="support-option">
                            <span>🕒</span>
                            <strong>Hours</strong>
                            <span>Mon–Sat, 9:00 AM – 6:00 PM (EST)</span>
                        </div>
                    </div>

                    <h4 style={{ marginTop: '24px' }}>Send us a message</h4>
                    {submitted ? (
                        <div className="success-message">
                            ✅ Thank you! Your message has been sent. We'll get back to you soon.
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleContactSubmit}>
                            <div className="form-group">
                                <label htmlFor="help-email">Your Email</label>
                                <input
                                    id="help-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="help-message">Message</label>
                                <textarea
                                    id="help-message"
                                    rows="4"
                                    placeholder="Describe your issue or question..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            )
        }
    };

    // Navigation Items
  
    const navItems = [
        { key: 'getting-started', label: 'Getting Started', icon: '🚀' },
        { key: 'faq', label: 'FAQ', icon: '❓' },
        { key: 'video-audio', label: 'Video & Audio', icon: '🎥' },
        { key: 'wabifocus', label: 'WabiFocus', icon: '🎯' },
        { key: 'support', label: 'Contact Support', icon: '📧' }
    ];

    // Render

    return (
        <div className="help-container">
            <header className="help-header">
                <h1>Help & Support</h1>
                <p>Everything you need to know about using WabiSeminar</p>
            </header>

            <div className="help-body">
                {/* Sidebar Navigation */}
                <aside className="help-sidebar">
                    <nav className="help-nav">
                        {navItems.map((item) => (
                            <button
                                key={item.key}
                                className={`help-nav-item ${activeSection === item.key ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.key)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="help-content">
                    <div className="help-section">
                        <h2>
                            {sections[activeSection].icon} {sections[activeSection].title}
                        </h2>
                        {sections[activeSection].content}
                    </div>
                </main>
            </div>

            <footer className="help-footer">
                <p>© 2026 WabiSeminar. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HelpPage;