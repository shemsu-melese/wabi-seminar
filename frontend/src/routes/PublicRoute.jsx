import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // Render child routes if not authenticated
    return <Outlet />;
};

export default PublicRoute;