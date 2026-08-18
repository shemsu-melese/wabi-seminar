import { validateRequired } from '../utils/validators.js';

/**
 * Validate meeting creation
 */
export const validateCreateMeeting = (req, res, next) => {
    const { title, start_time, duration_minutes } = req.body;
    const errors = [];

    // Validate title
    if (!validateRequired(title)) {
        errors.push({ field: 'title', message: 'Meeting title is required' });
    } else if (title.length > 255) {
        errors.push({ field: 'title', message: 'Title must be less than 255 characters' });
    }

    // Validate start_time (optional)
    if (start_time) {
        const date = new Date(start_time);
        if (isNaN(date.getTime())) {
            errors.push({ field: 'start_time', message: 'Invalid date format' });
        }
    }

    // Validate duration_minutes (optional)
    if (duration_minutes !== undefined && duration_minutes !== null) {
        if (typeof duration_minutes !== 'number' || duration_minutes < 1 || duration_minutes > 1440) {
            errors.push({ field: 'duration_minutes', message: 'Duration must be between 1 and 1440 minutes' });
        }
    }

    // Validate meeting_type (optional)
    const validTypes = ['seminar', 'business', 'education', 'personal', 'other'];
    if (req.body.meeting_type && !validTypes.includes(req.body.meeting_type)) {
        errors.push({ 
            field: 'meeting_type', 
            message: 'Meeting type must be one of: ' + validTypes.join(', ') 
        });
    }

    // Validate max_participants (optional)
    if (req.body.max_participants !== undefined) {
        if (typeof req.body.max_participants !== 'number' || req.body.max_participants < 1) {
            errors.push({ field: 'max_participants', message: 'Max participants must be at least 1' });
        }
    }

    // Validate password (optional)
    if (req.body.password) {
        if (req.body.password.length < 4) {
            errors.push({ field: 'password', message: 'Password must be at least 4 characters' });
        }
        if (req.body.password.length > 50) {
            errors.push({ field: 'password', message: 'Password must be less than 50 characters' });
        }
    }

    // Validate WabiFocus items
    if (req.body.wabifocus) {
        const { goal, agenda, outcomes, action_items } = req.body.wabifocus;
        
        if (goal && typeof goal !== 'string') {
            errors.push({ field: 'wabifocus.goal', message: 'Goal must be a string' });
        }
        
        if (agenda && !Array.isArray(agenda)) {
            errors.push({ field: 'wabifocus.agenda', message: 'Agenda must be an array' });
        }
        
        if (outcomes && typeof outcomes !== 'string') {
            errors.push({ field: 'wabifocus.outcomes', message: 'Outcomes must be a string' });
        }
        
        if (action_items && !Array.isArray(action_items)) {
            errors.push({ field: 'wabifocus.action_items', message: 'Action items must be an array' });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    }

    next();
};

/**
 * Validate join meeting
 */
export const validateJoinMeeting = (req, res, next) => {
    const { password } = req.body;
    const errors = [];

    if (password !== undefined && password.length > 50) {
        errors.push({ field: 'password', message: 'Password must be less than 50 characters' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    }

    next();
};

/**
 * Validate update meeting
 */
export const validateUpdateMeeting = (req, res, next) => {
    const { title, start_time, duration_minutes, meeting_type, max_participants } = req.body;
    const errors = [];

    if (title !== undefined) {
        if (title.length > 255) {
            errors.push({ field: 'title', message: 'Title must be less than 255 characters' });
        }
    }

    if (start_time) {
        const date = new Date(start_time);
        if (isNaN(date.getTime())) {
            errors.push({ field: 'start_time', message: 'Invalid date format' });
        }
    }

    if (duration_minutes !== undefined && duration_minutes !== null) {
        if (typeof duration_minutes !== 'number' || duration_minutes < 1 || duration_minutes > 1440) {
            errors.push({ field: 'duration_minutes', message: 'Duration must be between 1 and 1440 minutes' });
        }
    }

    if (meeting_type) {
        const validTypes = ['seminar', 'business', 'education', 'personal', 'other'];
        if (!validTypes.includes(meeting_type)) {
            errors.push({ 
                field: 'meeting_type', 
                message: 'Meeting type must be one of: ' + validTypes.join(', ') 
            });
        }
    }

    if (max_participants !== undefined) {
        if (typeof max_participants !== 'number' || max_participants < 1) {
            errors.push({ field: 'max_participants', message: 'Max participants must be at least 1' });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors
        });
    }

    next();
};