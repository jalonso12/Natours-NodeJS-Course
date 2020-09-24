const catchAsync = require('../handlers/errorCatchHandler');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res 
        .status(200)
        .json({
            status: 'success',
            data: {
                data: newDoc
            }
        });
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if(popOptions) query = query.populate(popOptions);

    const doc = await query;

    if(!doc) return next(new AppError('No document found with that ID', 404));

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                data: doc
            }
        });
});

exports.getAll = Model => catchAsync(async (req, res, next) => {
    // Allow nested GET reviews on tours
    let filter = {};
    if(req.params.id) filter = { tour: req.params.id };
    //

    const features = new APIFeatures(Model.find(filter), req.query).filter()
                                                            .sort()
                                                            .limitFields()
                                                            .paginate();
    const docs = await features.query;

    res
        .status(200)
        .json({
            status: 'success',
            results: docs.length,
            data: {
                data: docs
            }
        });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const doc = await Model.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });

    if(!doc) return next(new AppError('No document found with that ID', 404));

    res
        .status(200)
        .json({
            status: 'success',
            data: {
                data: doc
            }
        });
});

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const id = req.params.id;

    const doc = await Model.findByIdAndDelete(id);

    if(!doc) return next(new AppError('No document found with that ID', 404));

    res
        .status(204)
        .json({
            status: 'success',
            data: null
        });
});