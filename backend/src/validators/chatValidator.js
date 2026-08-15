export const validateSendMessage = (req, res, next) => {
    const { content, message_type } = req.body;
    const errors = [];

    if (!content || content.trim() === '') {
        errors.push({ field: 'content', message: 'Message content is required' });
    }

    if (content && content.length > 5000) {
        errors.push({ field: 'content', message: 'Message must be less than 5000 characters' });
    }

    if (message_type && !['text', 'system', 'alert'].includes(message_type)) {
        errors.push({ field: 'message_type', message: 'Invalid message type' });
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

export const validateReaction = (req, res, next) => {
    const { emoji } = req.body;
    const errors = [];

    if (!emoji) {
        errors.push({ field: 'emoji', message: 'Emoji is required' });
    }

    const validEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '👏', '🎉', '🔥', '💯', '🙌', '💪'];
    if (emoji && !validEmojis.includes(emoji)) {
        errors.push({ field: 'emoji', message: 'Invalid emoji' });
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