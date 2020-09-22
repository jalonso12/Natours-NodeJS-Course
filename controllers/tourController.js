const Tour = require('../models/tourModel.js');
const APIFeatures = require('./../utils/apiFeatures.js');
const catchAsync = require('../handlers/errorCatchHandler.js');
const AppError = require('../utils/appError.js');

// Adds data to the API and JSON file.
exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res 
        .status(200)
        .json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
});

// Creates the API with the data information plus some additions (status & results)
exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query).filter()
                                                            .sort()
                                                            .limitFields()
                                                            .paginate();
    const tours = await features.query;

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                tours
            }
        });
});

exports.aliasTopTours = (req, res, next) => {
    //?limit=5&sort=-ratingsAverage,price
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    
    next();
};

exports.getSpecificTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const tour = await Tour.findById(id).populate('reviews');

    if(!tour) return next(new AppError('No tour found with that ID', 404));

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                tour
            }
        });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const tour = await Tour.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if(!tour) return next(new AppError('No tour found with that ID', 404));

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                tour
            }
        });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const tour = await Tour.findByIdAndDelete(id);

    if(!tour) return next(new AppError('No tour found with that ID', 404));

    res
        .status(204)
        .json({
            status: 'success',
            data: null
        });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: {$gte: 4.5} }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty'},
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }
        // {
        //     $match: { _id: { $ne: 'EASY' } }
        // }
    ]);

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                stats
            }
        });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lt: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month:'$_id' }
        },
        {
            $project: { 
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        {
            $limit: 12
        }
    ]);

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                plan
            }
        });
});