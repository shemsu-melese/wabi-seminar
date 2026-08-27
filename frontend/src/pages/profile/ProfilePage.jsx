import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import authService from '../../services/authService.js';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();

    // Profile state
    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
    });

    // Store original values for cancel
    const [originalData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Profile Update
    
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleCancelProfile = () => {
        setFormData({
            ...formData,
            first_name: originalData.first_name,
            last_name: originalData.last_name,
        });
        setErrors(prev => ({ ...prev, first_name: '', last_name: '' }));
        toast('Profile changes discarded', { icon: '↩️' });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        if (!formData.first_name.trim() || !formData.last_name.trim()) {
            toast.error('First and last name are required');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.updateProfile({
                first_name: formData.first_name,
                last_name: formData.last_name
            });

            if (response.success) {
                updateUser(response.data);
                // Update original data to match new saved values
                Object.assign(originalData, {
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                });
                toast.success('Profile updated successfully');
            } else {
                toast.error(response.message || 'Update failed');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // Password Change
    
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleCancelPassword = () => {
        setPasswordData({
            current_password: '',
            new_password: '',
            confirm_password: ''
        });
        setErrors(prev => ({
            ...prev,
            current_password: '',
            new_password: '',
            confirm_password: ''
        }));
        toast('Password change cancelled', { icon: '↩️' });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!passwordData.current_password) {
            newErrors.current_password = 'Current password is required';
        }
        if (!passwordData.new_password) {
            newErrors.new_password = 'New password is required';
        } else if (passwordData.new_password.length < 8) {
            newErrors.new_password = 'Password must be at least 8 characters';
        } else if (!/[A-Z]/.test(passwordData.new_password) || !/[a-z]/.test(passwordData.new_password) || !/[0-9]/.test(passwordData.new_password)) {
            newErrors.new_password = 'Must contain uppercase, lowercase, and number';
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            newErrors.confirm_password = 'Passwords do not match';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error('Please fix the errors');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.changePassword(
                passwordData.current_password,
                passwordData.new_password
            );

            if (response.success) {
                toast.success('Password changed successfully');
                setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
            } else {
                toast.error(response.message || 'Password change failed');
                if (response.message?.toLowerCase().includes('current')) {
                    setErrors(prev => ({ ...prev, current_password: response.message }));
                }
            }
        } catch (error) {
            toast.error('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

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

    const passwordScore = getPasswordStrength(passwordData.new_password);
    const strengthInfo = getStrengthInfo(passwordScore);

    return (
        <div className="profile-container">
            <header className="profile-header">
                <h1>My Profile</h1>
                <p>Manage your account settings</p>
            </header>

            <div className="profile-grid">
                {/* Profile Section */}
                <section className="profile-section">
                    <h2>Personal Information</h2>
                    <form onSubmit={handleProfileSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="first_name">First Name</label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                value={formData.first_name}
                                onChange={handleProfileChange}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="last_name">Last Name</label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                value={formData.last_name}
                                onChange={handleProfileChange}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                disabled
                                className="disabled-input"
                            />
                            <span className="hint-text">Email cannot be changed</span>
                        </div>
                        <div className="profile-actions-row">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleCancelProfile}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-full"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Password Section */}
                <section className="profile-section">
                    <h2>Change Password</h2>
                    <form onSubmit={handlePasswordSubmit} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="current_password">Current Password</label>
                            <div className="password-wrapper">
                                <input
                                    id="current_password"
                                    name="current_password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={passwordData.current_password}
                                    onChange={handlePasswordChange}
                                    disabled={loading}
                                    className={errors.current_password ? 'input-error' : ''}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.current_password && <span className="error-text">{errors.current_password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="new_password">New Password</label>
                            <div className="password-wrapper">
                                <input
                                    id="new_password"
                                    name="new_password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={passwordData.new_password}
                                    onChange={handlePasswordChange}
                                    disabled={loading}
                                    className={errors.new_password ? 'input-error' : ''}
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
                            {errors.new_password && <span className="error-text">{errors.new_password}</span>}

                            {passwordData.new_password && (
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

                        <div className="form-group">
                            <label htmlFor="confirm_password">Confirm Password</label>
                            <div className="password-wrapper">
                                <input
                                    id="confirm_password"
                                    name="confirm_password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={passwordData.confirm_password}
                                    onChange={handlePasswordChange}
                                    disabled={loading}
                                    className={errors.confirm_password ? 'input-error' : ''}
                                    required
                                    style={{
                                        borderColor: passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password
                                            ? '#ef4444'
                                            : passwordData.confirm_password && passwordData.new_password === passwordData.confirm_password
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
                            {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
                            {passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                                <span className="error-text">Passwords do not match</span>
                            )}
                            {passwordData.confirm_password && passwordData.new_password === passwordData.confirm_password && passwordData.new_password.length > 0 && (
                                <span className="success-text">✓ Passwords match</span>
                            )}
                        </div>

                        <div className="profile-actions-row">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleCancelPassword}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-full"
                                disabled={loading}
                            >
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>

            {/* Profile Actions: Dashboard + Logout */}
            <div className="profile-actions">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="godashboard"
                >
                     Go to Dashboard
                </button>
                <button onClick={logout} className="btn-danger">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;