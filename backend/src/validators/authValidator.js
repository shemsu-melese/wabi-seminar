import { 
    validateEmail, 
    validatePassword, 
    validateUsername, 
    validateName,
    validateRequired 
} from '../utils/validators.js';

/**
 * Validate registration request
 */
export const validateRegister = (req, res, next) => {
    const { email, username, password, first_name, last_name } = req.body;
    const errors = [];

    // Validate email
    if (!validateRequired(email)) {
        errors.push({ field: 'email', message: 'Email is required' });
    } else if (!validateEmail(email)) {
        errors.push({ field: 'email', message: 'Invalid email format' });
    }

    // Validate username
    if (!validateRequired(username)) {
        errors.push({ field: 'username', message: 'Username is required' });
    } else if (!validateUsername(username)) {
        errors.push({ 
            field: 'username', 
            message: 'Username must be 3-50 characters (alphanumeric and underscore only)' 
        });
    }

    // Validate password
    if (!validateRequired(password)) {
        errors.push({ field: 'password', message: 'Password is required' });
    } else if (!validatePassword(password)) {
        errors.push({ 
            field: 'password', 
            message: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
        });
    }

    // Validate first name
    if (!validateRequired(first_name)) {
        errors.push({ field: 'first_name', message: 'First name is required' });
    } else if (!validateName(first_name)) {
        errors.push({ 
            field: 'first_name', 
            message: 'First name must be between 2 and 100 characters' 
        });
    }

    // Validate last name
    if (!validateRequired(last_name)) {
        errors.push({ field: 'last_name', message: 'Last name is required' });
    } else if (!validateName(last_name)) {
        errors.push({ 
            field: 'last_name', 
            message: 'Last name must be between 2 and 100 characters' 
        });
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
 * Validate login request
 */
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!validateRequired(email)) {
        errors.push({ field: 'email', message: 'Email is required' });
    }

    if (!validateRequired(password)) {
        errors.push({ field: 'password', message: 'Password is required' });
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
 * Validate change password request
 */
export const validateChangePassword = (req, res, next) => {
    const { current_password, new_password } = req.body;
    const errors = [];

    if (!validateRequired(current_password)) {
        errors.push({ field: 'current_password', message: 'Current password is required' });
    }

    if (!validateRequired(new_password)) {
        errors.push({ field: 'new_password', message: 'New password is required' });
    } else if (!validatePassword(new_password)) {
        errors.push({ 
            field: 'new_password', 
            message: 'New password must be at least 8 characters with uppercase, lowercase, and number' 
        });
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
 * Validate refresh token request
 */
export const validateRefreshToken = (req, res, next) => {
    const { refresh_token } = req.body;
    const errors = [];

    if (!validateRequired(refresh_token)) {
        errors.push({ field: 'refresh_token', message: 'Refresh token is required' });
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
 * Validate profile update
 */
export const validateProfileUpdate = (req, res, next) => {
    const { first_name, last_name, username, bio } = req.body;
    const errors = [];

    if (first_name !== undefined) {
        if (!validateRequired(first_name)) {
            errors.push({ field: 'first_name', message: 'First name cannot be empty' });
        } else if (!validateName(first_name)) {
            errors.push({ 
                field: 'first_name', 
                message: 'First name must be between 2 and 100 characters' 
            });
        }
    }

    if (last_name !== undefined) {
        if (!validateRequired(last_name)) {
            errors.push({ field: 'last_name', message: 'Last name cannot be empty' });
        } else if (!validateName(last_name)) {
            errors.push({ 
                field: 'last_name', 
                message: 'Last name must be between 2 and 100 characters' 
            });
        }
    }

    if (username !== undefined) {
        if (!validateRequired(username)) {
            errors.push({ field: 'username', message: 'Username cannot be empty' });
        } else if (!validateUsername(username)) {
            errors.push({ 
                field: 'username', 
                message: 'Username must be 3-50 characters (alphanumeric and underscore only)' 
            });
        }
    }

    if (bio !== undefined && bio.length > 500) {
        errors.push({ 
            field: 'bio', 
            message: 'Bio must be less than 500 characters' 
        });
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