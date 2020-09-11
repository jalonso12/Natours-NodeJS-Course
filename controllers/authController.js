const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../handlers/errorCatchHandler');

const signToken = id => {
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET, 
        { 
            expiresIn: process.env.JWT_EXPIRATION 
        }
    )
}

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    const token = signToken(newUser._id);

    res
        .status(201)
        .json({
            status: 'success',
            token,
            data: {
                user: newUser
            }
        });
});

exports.login = catchAsync(async(req, res, next) => {
    const { email, password } = req.body;

    if(!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    };

    const user = await User.findOne({ email }).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    };

    const token = signToken(user._id);

    res
        .status(200)
        .json({
            status: 'success',
            token
        });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Receiving token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    };

    if(!token) return next(new AppError('You are not logged in, please login for access', 402));

    // 2) Verificate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if user exists
    const freshUser = await User.findById(decoded.id);

    if(!freshUser) return next(new AppError('User does not longer exists', 401));

    // 4) Check any password changes
    if(freshUser.changedPassword(decoded.iat)) return next(new AppError('Password changed recently please re-login', 401));

    req.user = freshUser;

    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403))
        }

        next();
    }
};