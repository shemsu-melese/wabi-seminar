import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // ============================================
    // Check authentication on mount
    // ============================================
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    // Verify token is still valid with backend
                    const response = await api.get('/auth/me');
                    if (response.data.success) {
                        setUser(response.data.data);
                        setIsAuthenticated(true);
                    } else {
                        // Token invalid - clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // ============================================
    // Login
    // ============================================
    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            if (response.data.success) {
                const { user, token } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                setIsAuthenticated(true);
                return { success: true, data: response.data };
            }
            
            return { success: false, error: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    // ============================================
    // Register
    // ============================================
    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            
            if (response.data.success) {
                const { user, token } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                setUser(user);
                setIsAuthenticated(true);
                return { success: true, data: response.data };
            }
            
            return { success: false, error: response.data.message };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    // ============================================
    // Logout
    // ============================================
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
    };

    // ============================================
    // Update User
    // ============================================
    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // ============================================
    // Context Value
    // ============================================
    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        // Helper
        isHost: user?.role === 'host' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;