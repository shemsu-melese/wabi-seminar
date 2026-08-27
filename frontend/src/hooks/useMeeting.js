import { useState, useEffect } from 'react';

/**
 * Custom hook to manage meetings locally
 * (Will be replaced with API calls later)
 */
const useMeeting = () => {
    const [meetings, setMeetings] = useState([]);

    // Load meetings from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('wabi_meetings');
        if (stored) {
            try {
                setMeetings(JSON.parse(stored));
            } catch {
                setMeetings([]);
            }
        }
    }, []);

    // Save to localStorage whenever meetings change
    useEffect(() => {
        localStorage.setItem('wabi_meetings', JSON.stringify(meetings));
    }, [meetings]);

    /**
     * Add a new meeting
     * @param {string} title - Meeting title
     * @returns {object} New meeting object
     */
    const addMeeting = (title) => {
        const newMeeting = {
            id: Date.now(),
            code: generateMeetingCode(),
            title: title || 'Untitled Meeting',
            createdAt: new Date().toISOString(),
        };
        setMeetings((prev) => [newMeeting, ...prev]);
        return newMeeting;
    };

    /**
     * Generate a random meeting code (6 characters)
     */
    const generateMeetingCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    return { meetings, addMeeting };
};

export default useMeeting;