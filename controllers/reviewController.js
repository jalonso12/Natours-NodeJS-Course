const Review = require('../models/reviewModel');
const catchAsync = require('../handlers/errorCatchHandler');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.id;
    if(!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    res 
        .status(200)
        .json({
            status: 'success',
            data: {
                review: newReview
            }
        });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};

    if(req.params.id) filter = { tour: req.params.id };

    const reviews = await Review.find(filter);

    res
        .status(200)
        .json({
            status: 'success',
            reviews
        });
});
