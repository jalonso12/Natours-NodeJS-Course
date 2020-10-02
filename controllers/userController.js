const User = require('../models/userModel');
const catchAsync = require('../handlers/errorCatchHandler');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cbf) => {
//         cbf(null, 'public/img/users')
//     },
//     filename: (req, file, cbf) => {
//         const ext = file.mimetype.split('/')[1];

//         cbf(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cbf) => {
    if(file.mimetype.startsWith('image')) {
        cbf(null, true)
    }else {
        cbf(new AppError('Not an image, please upload only image files', 400), false)
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
};

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj
};

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

    if(req.file) filteredBody.photo = req.file.filename;

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