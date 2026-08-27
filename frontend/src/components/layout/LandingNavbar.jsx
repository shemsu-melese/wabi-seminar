import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './LandingNavbar.css';

const LandingNavbar = () => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className="landing-navbar">
            <div className="navbar-container">
                {/* Left: Logo */}
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    <img src="/public/images/wabiskills logo.png" alt="Logo" className="brand-logo" />
                    <span className="brand-name">WabiSeminar</span>
                </Link>

                {/* Center: Desktop Navigation */}
                <nav className="desktop-nav">
                    <Link to="/" className={`desktop-link ${isActive('/')}`}>Home</Link>
                    <Link to="/about" className={`desktop-link ${isActive('/about')}`}>About</Link>
                    <Link to="/help" className={`desktop-link ${isActive('/help')}`}>Help</Link>
                </nav>

                {/* Right: Desktop Auth Buttons */}
                <div className="desktop-actions">
                    <Link to="/login" className="login-btn">Log In</Link>
                    <Link to="/register" className="signup-btn">Sign Up</Link>
                </div>

                {/* Hamburger (mobile only) */}
                <button
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle navigation"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>

            {/* Mobile Full‑screen Overlay Menu */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-container">
                    <Link to="/" className="mobile-link" onClick={closeMenu}>Home</Link>
                    <Link to="/about" className="mobile-link" onClick={closeMenu}>About</Link>
                    <Link to="/help" className="mobile-link" onClick={closeMenu}>Help</Link>
                    <div className="mobile-divider"></div>
                    <Link to="/login" className="mobile-link mobile-login" onClick={closeMenu}>Log In</Link>
                    <Link to="/register" className="mobile-link mobile-signup" onClick={closeMenu}>Sign Up</Link>
                </div>
            </div>
        </header>
    );
};

export default LandingNavbar;