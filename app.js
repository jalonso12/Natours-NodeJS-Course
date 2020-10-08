const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

// ROUTE MODULES
const AppError = require('./utils/appError');
const errorHandler = require('./handlers/errorGlobalHandler');
const bookingCtrlr = require('./controllers/bookingController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const APP = express();

APP.enable('trust proxy');

APP.set('view engine', 'pug');
APP.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE
APP.use(cors());

// APP.use(cors({
//     origin: '[site allow to access external API]'
// }));

APP.options('*', cors());

// Serving static files
APP.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP
APP.use(helmet());
APP.use(helmet.contentSecurityPolicy({
    directives: {
        baseUri: ["'self'"],
        defaultSrc: ["'self'", 'http:', 'https:', 'ws:', 'blob:', 'data:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: ["'self'", 'https:', 'blob:'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        upgradeInsecureRequests: []
    }
}));

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

APP.post('/webhook-checkout', express.raw({ type: 'application/json' }), bookingCtrlr.webhookCheckout);

// Body parser, reading data from body into req.body
APP.use(express.json({ limit: '10kb' }));
APP.use(express.urlencoded({ extended: true, limit: '10kb' }));
APP.use(cookieParser());

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

APP.use(compression());

APP.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// MOUNT ROUTING
APP.use('/', viewRouter);
APP.use('/api/v1/tours', tourRouter);
APP.use('/api/v1/users', userRouter);
APP.use('/api/v1/reviews', reviewRouter);
APP.use('/api/v1/bookings', bookingRouter);

// Unexisting endpoint handdling
APP.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); // Param only applies for errors
});

APP.use(errorHandler);

// Export app for server
module.exports = APP;