function errorHandler(err) {
    const { code, message } = err;
    const error = { message: '' };
    if (code === 11000) {
        error.message = 'Email or Username Already exists';
    }
    else if (message.includes('user validation error')) {
        const errors = Object.values(err.errors);
        error.field = errors[0];
        error.message = errors[0].message;
    } else {
        error.message = err.message;
    }
    console.error(err);
    return error;
}

module.exports = errorHandler;