const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

// ROUTE MODULES
const AppError = require('./utils/appError');
const errorHandler = require('./handlers/errorGlobalHandler');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const APP = express();

APP.set('view engine', 'pug');
APP.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE
// Serving static files
APP.use(express.static(path.join(__dirname, 'public')));
// Set security HTTP
APP.use(helmet());

// Development login
if(process.env.NODE_ENV === 'development'){
    APP.use(morgan('dev'));
}

// Limit requests from same IP
const limiter = rateLimit({
    max: 100, //Amount of requests allowed
    windowMs: 60 * 60 * 100, //Time interval per allowed requested
    message: 'Too many requests, please try again in 1 hour'
});
APP.use('/api', limiter);

// Body parser, reading data from body into req.body
APP.use(express.json({ limit: '10kb' }));

// Data sanitization (NoSQL Injection)
APP.use(mongoSanitize());

// Data sanitization (XSS Injection)
APP.use(xss());

// Prevent parameter pollution
APP.use(hpp({
    whitelist: [
        'duration',
        'ratingsAverage',
        'ratingsQuantity',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

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
APP.use('/', viewRouter);
APP.use('/api/v1/tours', tourRouter);
APP.use('/api/v1/users', userRouter);
APP.use('/api/v1/reviews', reviewRouter);

// Unexisting endpoint handdling
APP.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // Param only applies for errors
});

APP.use(errorHandler);

// Export app for server
module.exports = APP;