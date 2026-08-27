import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import toast from 'react-hot-toast';
import './AuthPages.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();

    // Handle Input Changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Password Strength
    const getPasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 4) score += 1;
        if (password.length >= 8) score += 1;
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

    const passwordScore = getPasswordStrength(formData.password);
    const strengthInfo = getStrengthInfo(passwordScore);

    // Validation

    const validateForm = () => {
        const newErrors = {};
        const { fullName, email, password, confirmPassword } = formData;

        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = 'Name must be at least 2 characters';
        }

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 4) {
            newErrors.password = 'Password must be at least 4 characters';
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
            // Split full name into first and last name
            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const result = await register({
                email: formData.email,
                password: formData.password,
                first_name: firstName,
                last_name: lastName
            });

            if (result.success) {
                toast.success('Account created successfully!');
                navigate('/dashboard');
            } else {
                toast.error(result.error || 'Registration failed');
                if (result.error?.toLowerCase().includes('email')) {
                    setErrors(prev => ({ ...prev, email: 'Email already registered' }));
                }
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Render

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Start your first meeting in minutes.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Full Name */}
                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            className={errors.fullName ? 'input-error' : ''}
                            disabled={loading}
                            required
                        />
                        {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? 'input-error' : ''}
                            disabled={loading}
                            required
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'input-error' : ''}
                                disabled={loading}
                                required
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
                        {formData.password && (
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
                            Minimum 4 characters with uppercase, lowercase, and number
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-wrapper">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'input-error' : ''}
                                disabled={loading}
                                required
                                style={{
                                    borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword
                                        ? '#ef4444'
                                        : formData.confirmPassword && formData.password === formData.confirmPassword
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
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <span className="error-text">Passwords do not match</span>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length > 0 && (
                            <span style={{ color: '#22c55e', fontSize: '13px' }}>✓ Passwords match</span>
                        )}
                    </div>

                    {/* Submit */}
                    <button type="submit"  disabled={loading} className="btn-full">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;