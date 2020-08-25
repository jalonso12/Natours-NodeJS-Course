const Tour = require('../models/tourModel.js');
const APIFeatures = require('./../utils/apiFeatures.js');

// Adds data to the API and JSON file.
exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);

        res 
            .status(200)
            .json({
                status: 'success',
                data: {
                    tour: newTour
                }
            });
    } catch(err) {
        res.status(400).json({
            status: 'failed',
            message: `ERROR!!! ${err}`
        });
    };
};

// Creates the API with the data information plus some additions (status & results)
exports.getAllTours = async (req, res) => {
    try {
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
    } catch(err) {
        res 
            .status(400)
            .json({
                status: 'failed',
                message: `ERROR!!! ${err}`
            });
    };
};

exports.aliasTopTours = (req, res, next) => {
    //?limit=5&sort=-ratingsAverage,price
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    
    next();
}

exports.getSpecificTour = async (req, res) => {
    try {
        console.log(req.query);

        const id = req.params.id;

        const tour = await Tour.findById(id);

        res
            .status(200)
            .json({
                status: 'success',
                data: {
                    tour
                }
            });
    } catch(err) {
        res
            .status(400)
            .json({
                status: 'failed',
                message: `ERROR!!! ${err}`
            });
    };
};

exports.updateTour = async (req, res) => {
    try {
        const id = req.params.id;

        const tour = await Tour.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        res
            .status(200)
            .json({
                status: 'success',
                data: {
                    tour
                }
            });
    } catch(err) {
        res
            .status(204)
            .json({
                status: 'failed',
                message: `ERROR!!! ${err}`
            });
    };
};

exports.deleteTour = async (req, res) => {
    try {
        const id = req.params.id;

        await Tour.findByIdAndDelete(id);

        res
            .status(204)
            .json({
                status: 'success',
                data: null
            });
    } catch(err) {
        res
            .status(404)
            .json({
                status: 'failed',
                message: `ERROR!!! ${err}`
            });
    };
};

exports.getTourStats = async (req, res) => {
    try{
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
    }catch (err) {
        res
            .status(404)
            .json({
                status: 'failed',
                message: `ERROR!!! ${err}`
            });
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try{    
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
    }catch (err){
        res
            .status(404)
            .json({
                status: 'failed',
                message: `ERROR!!! ${err}`
            });
    }
}