import { validateRequired } from '../utils/validators.js';

// ============================================
// VALIDATE CREATE MEETING
// ============================================
export const validateCreateMeeting = (req, res, next) => {
    const { title, duration_minutes, meeting_type, max_participants } = req.body;
    const errors = [];

    // Title is required
    if (!validateRequired(title)) {
        errors.push({ field: 'title', message: 'Meeting title is required' });
    } else if (title.length > 255) {
        errors.push({ field: 'title', message: 'Title must be less than 255 characters' });
    }

    // Duration is optional but must be valid if provided
    if (duration_minutes !== undefined && duration_minutes !== null) {
        if (typeof duration_minutes !== 'number' || duration_minutes < 1 || duration_minutes > 1440) {
            errors.push({
                field: 'duration_minutes',
                message: 'Duration must be between 1 and 1440 minutes',
            });
        }
    }

    // Meeting type is optional
    if (meeting_type) {
        const validTypes = ['seminar', 'business', 'education', 'personal', 'other'];
        if (!validTypes.includes(meeting_type)) {
            errors.push({
                field: 'meeting_type',
                message: 'Meeting type must be one of: ' + validTypes.join(', '),
            });
        }
    }

    // Max participants is optional
    if (max_participants !== undefined) {
        if (typeof max_participants !== 'number' || max_participants < 1) {
            errors.push({
                field: 'max_participants',
                message: 'Max participants must be at least 1',
            });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors,
        });
    }

    next();
};

// ============================================
// VALIDATE JOIN MEETING – FIXED: safe null check
// ============================================
export const validateJoinMeeting = (req, res, next) => {
    const { password } = req.body;
    const errors = [];

    // ✅ Only check length if password is provided (not null/undefined)
    if (password && password.length > 50) {
        errors.push({ field: 'password', message: 'Password must be less than 50 characters' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors,
        });
    }

    next();
};

// ============================================
// VALIDATE UPDATE MEETING
// ============================================
export const validateUpdateMeeting = (req, res, next) => {
    const { title, duration_minutes, meeting_type, max_participants } = req.body;
    const errors = [];

    if (title !== undefined && title.length > 255) {
        errors.push({ field: 'title', message: 'Title must be less than 255 characters' });
    }

    if (duration_minutes !== undefined && duration_minutes !== null) {
        if (typeof duration_minutes !== 'number' || duration_minutes < 1 || duration_minutes > 1440) {
            errors.push({
                field: 'duration_minutes',
                message: 'Duration must be between 1 and 1440 minutes',
            });
        }
    }

    if (meeting_type) {
        const validTypes = ['seminar', 'business', 'education', 'personal', 'other'];
        if (!validTypes.includes(meeting_type)) {
            errors.push({
                field: 'meeting_type',
                message: 'Meeting type must be one of: ' + validTypes.join(', '),
            });
        }
    }

    if (max_participants !== undefined) {
        if (typeof max_participants !== 'number' || max_participants < 1) {
            errors.push({
                field: 'max_participants',
                message: 'Max participants must be at least 1',
            });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors,
        });
    }

    next();
};