/**
 * Generate a unique 6-character meeting code
 * Format: Uppercase letters and numbers
 */
export const generateMeetingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

/**
 * Check if code is valid format
 */
export const isValidMeetingCode = (code) => {
    const codeRegex = /^[A-Z0-9]{6}$/;
    return codeRegex.test(code);
};