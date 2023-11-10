function errorHandler(err) {
    const { code, message } = err;
    const error = { message: '' };
    if (code === 11000) {
        error.username = error.email = 'Already exists'
    }
    else if (message.includes('user validation error')) {
        const errors = Object.values(err.errors);
        for (let { properties } of errors) {
            error[properties.path] = properties.message;
        }
    } else {
        error.message = err.message;
    }
    console.error(err);
    return error;
}

module.exports = errorHandler;