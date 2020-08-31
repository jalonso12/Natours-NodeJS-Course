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

    console.log(message)

    return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
    res
        .status(err.statusCode)
        .json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
}

const sendErrorProd = (err, res) => {
    if(err.isOperational) {
        res
            .status(err.statusCode)
            .json({
                status: err.status,
                message: err.message
            });
    } else {
        console.error('ERROR ', err);

        res 
            .status(500)
            .json({
                status: 'error',
                message: 'Something went wrong!'
            });
    };
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        let error = { ...err };

        sendErrorDev(err, res);
    }else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if(error.name === 'CastError') error = handleDBCastError(error);
        if(error.code === 11000) error = handleDBDuplicateField(error);
        if(error._message === 'Validation failed') error = handleDBValidationError(error);

        sendErrorProd(error, res);
    };
};