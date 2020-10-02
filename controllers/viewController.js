const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../handlers/errorCatchHandler');

exports.getLoginForm = catchAsync(async (req, res) => {
    res
        .status(200)
        .render('login', {
            title: 'Log into your account'
        });
});

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    res
        .status(200)
        .render('overview', {
            title: 'All Tours',
            tours
        });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if(!tour) {
        return next(new AppError('Something must be wrong with the name or no tour exists', 404));
    }

    res
        .status(200)
        .render('tour', {
            title: tour.name,
            tour
        });
});

exports.getAccount = (req, res) => {
    res
        .status(200)
        .render('account', {
            title: 'Your Account'
        });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    },
    {
        new: true,
        runValidators: true
    });

    res
        .status(200)
        .render('account', {
            title: 'Your Account',
            user: updatedUser
        });
});