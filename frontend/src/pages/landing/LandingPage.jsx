import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Online meetings<br />
                    </h1>
                    <p className="hero-description">
                        WabiSeminar is the modern meeting platform built for teams,
                        classrooms, and businesses who want productive, structured,
                        and engaging online sessions.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn-primary-large">
                            Get Started Free
                        </Link>
                        <Link to="/about" className="btn-secondary-large">
                            Learn More
                        </Link>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number">99.9%</span>
                            <span className="stat-label">Uptime</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">10K+</span>
                            <span className="stat-label">Meetings Hosted</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">4.9★</span>
                            <span className="stat-label">User Rating</span>
                        </div>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-image-placeholder">
                        <span>🎥</span>
                        <p>Meeting Preview</p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title">Everything you need to connect</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📹</div>
                        <h3>HD Video & Audio</h3>
                        <p>Crystal-clear communication with WebRTC technology.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>WabiFocus Productivity</h3>
                        <p>Set goals, agendas, and action items for every meeting.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Attendance & Analytics</h3>
                        <p>Track participation and gain insights automatically.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure & Private</h3>
                        <p>End-to-end encryption and role-based access control.</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <h2>Ready to transform your meetings?</h2>
                <p>Join thousands of teams who use WabiSeminar to collaborate better.</p>
                <Link to="/register" className="btn-primary-large">
                    Start Free Trial
                </Link>
            </section>

            {/* Footer (simple) */}
            <footer className="landing-footer">
                <p>© 2026 WabiSeminar. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;