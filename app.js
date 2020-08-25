const express = require('express');
const morgan = require('morgan');

// ROUTE MODULES
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
APP.use((req, res, next) => {
    //console.log('Middleware hobbit in action');
    next();
});

APP.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// MOUNT ROUTING
APP.use('/api/v1/tours', tourRouter);
APP.use('/api/v1/users', userRouter);

// Export app for server
module.exports = APP;