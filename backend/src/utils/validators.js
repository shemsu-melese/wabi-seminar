// Email validation

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

 //  Password validation

export const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
};

 //  Required field validation

export const validateRequired = (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
};

 //  Name validation

export const validateName = (name) => {
    return name && name.length >= 2 && name.length <= 100;
};

 //  Meeting code validation

export const validateMeetingCode = (code) => {
    const codeRegex = /^[A-Z0-9]{6}$/;
    return codeRegex.test(code);
};