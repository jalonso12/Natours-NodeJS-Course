const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
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

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000),
        httpOnly: true
    };

    user.password = undefined;

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    res
        .status(statusCode)
        .json({
            status: 'success',
            token,
            data: {
                user
            }
        });
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

    createSendToken(newUser, 201, res);
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

    createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
    res.cookie('jwt', 'logged-out', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res
        .status(200)
        .json({
            status: 'success'
        });
};

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Receiving token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt) {
        token = req.cookies.jwt;
    }

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

exports.isLoggedIn = async (req, res, next) => {
    // 1) Receiving token
    if(req.cookies.jwt) {
        try{
            // 2) Verificate token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // 3) Check if user exists
            const freshUser = await User.findById(decoded.id);

            if(!freshUser) return next();

            // 4) Check any password changes
            if(freshUser.changedPassword(decoded.iat)) return next();

            res.locals.user = freshUser; // Sends data to pug files
            return next();
        }catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403))
        }

        next();
    }
};

exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based only on email address
    const user = await User.findOne({ email: req.body.email });

    if(!user) {
        return next(new AppError('No user found with the specific email address', 404))
    }

    // 2) Generate reset Token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send email with Token
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to: ${resetURL}.\n
    If you didn't requested a password reset, please ignore this email`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res 
            .status(200)
            .json({
                status: 'success',
                message: 'Token sent to email!'
            });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('Error while sending email, please try again later', 500))
    }
});

exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1) Get user from token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne(
        { 
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        }
    );

    // 2) Set new password (validators)
    if(!user) {
        return next(new AppError('Token invalid or has expired'), 400)
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async(req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current password is incorrect', 401))
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user, 200, res);
});