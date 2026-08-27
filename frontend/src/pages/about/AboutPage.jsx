import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
    return (
        <div className="about-container">
            <h1>About WabiSeminar</h1>
            <p>
                WabiSeminar is a modern online meeting platform designed to help teams,
                educators, and businesses connect, collaborate, and achieve more.
            </p>
            <p>
                Our mission is to make every meeting productive, engaging, and
                outcome-driven with features like WabiFocus, attendance tracking,
                and real-time collaboration.
            </p>
            <div className="about-values">
                <div className="value-item">
                    <h3>🎯 Focus</h3>
                    <p>Purpose-driven meetings with clear goals and outcomes.</p>
                </div>
                <div className="value-item">
                    <h3>🤝 Collaboration</h3>
                    <p>Real-time notes, chat, and sharing for seamless teamwork.</p>
                </div>
                <div className="value-item">
                    <h3>🔒 Security</h3>
                    <p>Your data is protected with enterprise-grade security.</p>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;