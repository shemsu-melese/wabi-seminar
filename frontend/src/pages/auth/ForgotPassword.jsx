import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import passwordResetService from '../../services/passwordResetService.js';
import './AuthPages.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    // Validation

    const validateForm = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit Handler

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            const response = await passwordResetService.requestReset(email);

            if (response.success) {
                setSubmitted(true);
                toast.success('Reset link sent to your email');
            } else {
                toast.error(response.message || 'Failed to send reset link');
            }
        } catch (error) {
            // For security, even if user doesn't exist, show success message
            setSubmitted(true);
            toast.success('If an account exists, a reset link will be sent');
        } finally {
            setLoading(false);
        }
    };

    // Handle Resend

    const handleResend = async () => {
        setLoading(true);
        try {
            const response = await passwordResetService.resendResetEmail(email);
            if (response.success) {
                toast.success('Reset link resent successfully');
            } else {
                toast.error(response.message || 'Failed to resend');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Success State

    if (submitted) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>📧 Check Your Email</h1>
                        <p>We've sent a password reset link to</p>
                        <p style={{ color: '#6366f1', fontWeight: '600', marginTop: '4px' }}>
                            {email}
                        </p>
                    </div>
                    <div className="auth-body">
                        <div className="auth-success-box">
                            <p>Click the link in the email to reset your password.</p>
                            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                                If you don't see the email, check your spam folder.
                            </p>
                        </div>
                        <button
                            onClick={handleResend}
                            disabled={loading}
                            className="btn-primary btn-full"
                            style={{ marginTop: '8px' }}
                        >
                            {loading ? 'Sending...' : 'Resend Email'}
                        </button>
                        <Link to="/login" className="btn-secondary btn-full" style={{ textAlign: 'center', display: 'block' }}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Render
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🔐 Reset Password</h1>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                            }}
                            className={errors.email ? 'input-error' : ''}
                            disabled={loading}
                            required
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    <button type="submit" disabled={loading} className="btn-full">
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Remember your password? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;