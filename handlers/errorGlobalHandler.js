const AppError = require("../utils/appError.js");

const handleDBCastError = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400)
}

const handleDBDuplicateField = err => {
    const val = err.keyValue.name;


    const message = `Field '${val}' is already being used. Please use another value. c:`;

    return new AppError(message, 400)
}

const handleDBValidationError = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;

    return new AppError(message, 400)
}

const handleJWTError = err => {
    if(err.name === 'JsonWebTokenError') {
        return new AppError('Invalid token, please login again!', 401)
    } else if(err.name === 'TokenExpiredError') {
        return new AppError('Your token has expired, please log in again!', 401)
    };
}

const sendErrorDev = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        return res
                .status(err.statusCode)
                .json({
                    status: err.status,
                    error: err,
                    message: err.message,
                    stack: err.stack
                });
    }

    console.error('ERROR ', err);

    return res
            .status(err.statusCode)
            .render('error', {
                title: 'Something went wrong!',
                msg: err.message
            });
}

const sendErrorProd = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        if(err.isOperational) {
            return res
                    .status(err.statusCode)
                    .json({
                        status: err.status,
                        message: err.message
                    });
        }
        console.error('ERROR ', err);

        return res 
                .status(500)
                .json({
                    status: 'error',
                    message: 'Something went wrong!'
                });
    }

    if(err.isOperational) {
        res
            .status(err.statusCode)
            .render('error', {
                title: 'Something went wrong!',
                msg: err.message
            });
    }

    console.error('ERROR ', err);

    return res
            .status(err.statusCode)
            .render('error', {
                title: 'Something went wrong!',
                msg: 'Please try again later'
            });
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    }else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;

        if(error.name === 'CastError') error = handleDBCastError(error);
        if(error.code === 11000) error = handleDBDuplicateField(error);
        if(error._message === 'Validation failed') error = handleDBValidationError(error);
        if(error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') error = handleJWTError(error);

        sendErrorProd(error, req, res);
    };
};