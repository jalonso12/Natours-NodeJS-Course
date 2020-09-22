const User = require('../models/userModel');
const catchAsync = require('../handlers/errorCatchHandler');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj
}

// ALL SERVER SIDE USERS INFORMATION
exports.createUser = (req, res) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is not yet defined, Please use /signup instead'
        })
};

exports.getSpecificUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.updateMe = catchAsync(async(req, res, next) => {
    if(req.body.password || req.body.passwordConfirm) return next(new AppError('Not for password updates. Please head to updateMyPassword', 400))

    const filteredBody = filterObj(req.body, 'name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
});

exports.deleteMe = catchAsync(async(req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res 
        .status(204)
        .json({
            status: 'success',
            data: null
        });
});