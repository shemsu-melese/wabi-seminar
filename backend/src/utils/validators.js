/**
 * Email validation
 * Validates standard email format
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Password validation
 * Minimum 8 characters, at least one uppercase, one lowercase, one number
 */
export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
};

/**
 * Username validation
 * 3-50 characters, alphanumeric and underscore only
 */
export const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    return usernameRegex.test(username);
};

/**
 * Required field validation
 */
export const validateRequired = (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
};

/**
 * Name validation
 * Minimum 2 characters, maximum 100 characters
 */
export const validateName = (name) => {
    return name && name.length >= 2 && name.length <= 100;
};

/**
 * Meeting code validation
 * 6 characters, uppercase letters and numbers only
 */
export const validateMeetingCode = (code) => {
    const codeRegex = /^[A-Z0-9]{6}$/;
    return codeRegex.test(code);
};