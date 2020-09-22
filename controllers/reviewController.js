const Review = require('../models/reviewModel');
const catchAsync = require('../handlers/errorCatchHandler');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);

    res 
        .status(200)
        .json({
            status: 'success',
            results: reviews.length,
            data: {
                review: newReview
            }
        });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();

    res
        .status(200)
        .json({
            status: 'success',
            reviews
        });
});
