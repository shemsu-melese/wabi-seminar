import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Hide navbar inside meeting room
    if (location.pathname.startsWith('/meeting/')) {
        return null;
    }

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    const closeProfileDropdown = () => {
        setShowProfileDropdown(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        closeMenu();
        closeProfileDropdown();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeProfileDropdown();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/dashboard" className="navbar-brand" onClick={closeMenu}>
                    <img src="/public/images/wabiskills logo.png" alt="Logo" className="brand-logo" />
                    <span className="brand-name">WabiSeminar</span>
                </Link>

                {/* Hamburger Button (mobile) */}
                <button
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle navigation"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {/* Overlay (mobile) */}
                {isMenuOpen && <div className="navbar-overlay" onClick={closeMenu}></div>}

                {/* Navigation Links (mobile slide‑in) */}
                <nav className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
                    <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={closeMenu}>
                        Dashboard
                    </Link>
                    <Link
                        to="/meetings"
                        className={`nav-link ${isActive('/meetings') || location.pathname.startsWith('/meeting') ? 'active' : ''}`}
                        onClick={closeMenu}
                    >
                        Meetings
                    </Link>
                    {/* Help link removed */}

                    {/* Mobile Profile & Actions */}
                    <div className="navbar-actions-mobile">
                        <Link to="/profile" className="user-profile-mobile" onClick={closeMenu}>
                            <span className="user-avatar">
                                {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                            </span>
                            <div className="user-info-mobile">
                                <span className="user-name">
                                    {user?.first_name || 'User'}
                                </span>
                                <span className="user-email-mobile">{user?.email}</span>
                            </div>
                        </Link>
                        <button onClick={handleLogout} className="logout-btn-mobile">
                            Logout
                        </button>
                    </div>
                </nav>

                {/* Desktop Right – User Profile with Dropdown */}
                <div className="navbar-actions-desktop" ref={dropdownRef}>
                    <div className="user-profile-wrapper" onClick={toggleProfileDropdown}>
                        <div className="user-profile">
                            <span className="user-avatar">
                                {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                            </span>
                            <span className="user-name">
                                {user?.first_name || 'User'}
                            </span>
                            <span className="dropdown-arrow">{showProfileDropdown ? '▲' : '▼'}</span>
                        </div>
                    </div>

                    {/* Dropdown */}
                    {showProfileDropdown && (
                        <div className="profile-dropdown">
                            <div className="dropdown-header">
                                <div className="dropdown-avatar">
                                    {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                                </div>
                                <div className="dropdown-user-info">
                                    <div className="dropdown-name">{user?.first_name} {user?.last_name}</div>
                                    <div className="dropdown-email">{user?.email}</div>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <Link to="/profile" className="dropdown-item" onClick={closeProfileDropdown}>
                                <span>✏️ Edit Profile</span>
                            </Link>
                            <button onClick={handleLogout} className="dropdown-item logout-item">
                                <span>🚪 Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;