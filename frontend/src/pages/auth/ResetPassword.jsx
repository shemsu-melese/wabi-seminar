import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import passwordResetService from '../../services/passwordResetService.js';
import './AuthPages.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [tokenError, setTokenError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Validate token on mount

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setTokenError('No reset token provided');
                setValidating(false);
                return;
            }

            try {
                const response = await passwordResetService.checkToken(token);

                if (response.data?.valid) {
                    setTokenValid(true);
                } else {
                    setTokenError(response.data?.message || 'Invalid or expired reset token');
                }
            } catch (error) {
                setTokenError('Invalid or expired reset token. Please request a new one.');
            } finally {
                setValidating(false);
            }
        };

        validateToken();
    }, [token]);

    // Password Strength

    const getPasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        return score;
    };

    const getStrengthInfo = (score) => {
        if (score <= 2) return { label: 'Weak', color: '#ef4444', width: '20%' };
        if (score <= 4) return { label: 'Fair', color: '#f59e0b', width: '50%' };
        if (score <= 6) return { label: 'Good', color: '#22c55e', width: '80%' };
        return { label: 'Strong', color: '#22c55e', width: '100%' };
    };

    const passwordScore = getPasswordStrength(password);
    const strengthInfo = getStrengthInfo(passwordScore);

    // Validation

    const validateForm = () => {
        const newErrors = {};

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            newErrors.password = 'Must contain uppercase, lowercase, and number';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            const response = await passwordResetService.resetPassword(
                token,
                password,
                confirmPassword
            );

            if (response.success) {
                toast.success('Password reset successfully!');
                setTimeout(() => {
                    navigate('/reset-password/success');
                }, 1500);
            } else {
                toast.error(response.message || 'Failed to reset password');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Loading State

    if (validating) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>⏳ Validating...</h1>
                        <p>Please wait while we verify your reset link.</p>
                    </div>
                    <div className="auth-body">
                        <div className="auth-spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Invalid Token State

    if (!tokenValid) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>❌ Invalid Reset Link</h1>
                    </div>
                    <div className="auth-body">
                        <div className="auth-error-box">
                            <p>{tokenError}</p>
                            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
                                Password reset links expire after 1 hour and can only be used once.
                            </p>
                        </div>
                        <Link to="/forgot-password" className="btn-primary btn-full">
                            Request New Reset Link
                        </Link>
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
                    <h1>🔑 Create New Password</h1>
                    <p>Enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* New Password */}
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                                }}
                                className={errors.password ? 'input-error' : ''}
                                disabled={loading}
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.password && <span className="error-text">{errors.password}</span>}

                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: strengthInfo.width,
                                            backgroundColor: strengthInfo.color,
                                            transition: 'width 0.3s ease'
                                        }}
                                    />
                                </div>
                                <div className="strength-label" style={{ color: strengthInfo.color }}>
                                    <span>{strengthInfo.label}</span>
                                    <span style={{ color: '#94a3b8' }}>{passwordScore}/7</span>
                                </div>
                            </div>
                        )}

                        <div className="hint-text">
                            Minimum 8 characters with uppercase, lowercase, and number
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-wrapper">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                }}
                                className={errors.confirmPassword ? 'input-error' : ''}
                                disabled={loading}
                                required
                                style={{
                                    borderColor: confirmPassword && password !== confirmPassword
                                        ? '#ef4444'
                                        : confirmPassword && password === confirmPassword
                                        ? '#22c55e'
                                        : ''
                                }}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                        {confirmPassword && password !== confirmPassword && (
                            <span className="error-text">Passwords do not match</span>
                        )}
                        {confirmPassword && password === confirmPassword && password.length > 0 && (
                            <span style={{ color: '#22c55e', fontSize: '13px' }}>✓ Passwords match</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                        className="btn-full"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;