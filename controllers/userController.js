const User = require('../models/userModel');
const catchAsync = require('./../handlers/errorCatchHandler');

// ALL SERVER SIDE USERS INFORMATION
exports.createUser = (req, res) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is not yet defined'
        })
};

exports.getUser = (req, res) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is not yet defined'
        })
};

exports.getAllUsers = catchAsync(async(req, res) => {
    const users = await User.find();

    res
        .status(200)
        .json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
});

exports.updateUser = (req, res) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is not yet defined'
        })
};

exports.deleteUser = (req, res) => {
    res
        .status(500)
        .json({
            status: 'error',
            message: 'This route is not yet defined'
        })
};