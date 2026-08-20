//  Standard success response
 
export const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
    const response = {
        success: true,
        message
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    return res.status(statusCode).json(response);
};

// Standard error response

export const errorResponse = (res, statusCode = 500, message = 'Error occurred', errors = null) => {
    const response = {
        success: false,
        message
    };
    
    if (errors !== null) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

//  Validation error response
 
export const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors
    });
};