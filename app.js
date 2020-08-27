const express = require('express');
const morgan = require('morgan');

// ROUTE MODULES
const AppError = require('./utils/appError.js');
const errorHandler = require('./handlers/errorController.js');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const APP = express();

// MIDDLEWARE
if(process.env.NODE_ENV === 'development'){
    APP.use(morgan('dev'));
}

APP.use(express.json());
APP.use(express.static(`${__dirname}/public`));

// Local Middleware
// APP.use((req, res, next) => {
//     //console.log('Middleware hobbit in action');
//     next();
// });

APP.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// MOUNT ROUTING
APP.use('/api/v1/tours', tourRouter);
APP.use('/api/v1/users', userRouter);

// Unexisting endpoint handdling
APP.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // Param only applies for errors
});

APP.use(errorHandler);

// Export app for server
module.exports = APP;