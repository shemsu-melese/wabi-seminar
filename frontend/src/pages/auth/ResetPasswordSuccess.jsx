import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

const ResetPasswordSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>✅ Password Reset Successful</h1>
                </div>
                <div className="auth-body">
                    <div className="auth-success-box">
                        <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>🎉</p>
                        <p>Your password has been successfully reset.</p>
                        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                            You can now log in with your new password.
                        </p>
                    </div>
                    <Link to="/login" className="btn-full">
                        Log In Now
                    </Link>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-secondary btn-full"
                        style={{ textAlign: 'center', display: 'block' }}
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordSuccess;