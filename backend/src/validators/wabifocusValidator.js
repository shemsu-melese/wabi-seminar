export const validateCreateItem = (req, res, next) => {
    const { type, title, description, priority, due_date } = req.body;
    const errors = [];

    // Validate type
    const validTypes = ['goal', 'agenda', 'outcome', 'decision', 'action_item'];
    if (!type) {
        errors.push({ field: 'type', message: 'Type is required' });
    } else if (!validTypes.includes(type)) {
        errors.push({ 
            field: 'type', 
            message: 'Type must be one of: ' + validTypes.join(', ') 
        });
    }

    // Validate title
    if (!title || title.trim() === '') {
        errors.push({ field: 'title', message: 'Title is required' });
    } else if (title.length > 255) {
        errors.push({ field: 'title', message: 'Title must be less than 255 characters' });
    }

    // Validate description
    if (description && description.length > 5000) {
        errors.push({ field: 'description', message: 'Description must be less than 5000 characters' });
    }

    // Validate priority
    if (priority) {
        const validPriorities = ['low', 'medium', 'high', 'critical'];
        if (!validPriorities.includes(priority)) {
            errors.push({ 
                field: 'priority', 
                message: 'Priority must be one of: ' + validPriorities.join(', ') 
            });
        }
    }

    // Validate due_date
    if (due_date) {
        const date = new Date(due_date);
        if (isNaN(date.getTime())) {
            errors.push({ field: 'due_date', message: 'Invalid date format' });
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

export const validateReorderItems = (req, res, next) => {
    const { type, item_ids } = req.body;
    const errors = [];

    const validTypes = ['goal', 'agenda', 'outcome', 'decision', 'action_item'];
    if (!type) {
        errors.push({ field: 'type', message: 'Type is required' });
    } else if (!validTypes.includes(type)) {
        errors.push({ 
            field: 'type', 
            message: 'Type must be one of: ' + validTypes.join(', ') 
        });
    }

    if (!item_ids) {
        errors.push({ field: 'item_ids', message: 'Item IDs are required' });
    } else if (!Array.isArray(item_ids)) {
        errors.push({ field: 'item_ids', message: 'Item IDs must be an array' });
    } else if (item_ids.length === 0) {
        errors.push({ field: 'item_ids', message: 'Item IDs cannot be empty' });
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