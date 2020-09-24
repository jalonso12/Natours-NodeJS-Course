const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.id;
    if(!req.body.user) req.body.user = req.user.id;

    next();
};

exports.createReview = factory.createOne(Review);

exports.getAllReviews = factory.getAll(Review);

exports.getSpecificReview = factory.getOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);