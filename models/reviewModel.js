const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        require: true,
        min: [0, 'Minimum rating is 0'],
        max: [5, 'Maximum rating is 5'],
        default: 0
    },
    review: {
        type: String,
        required: [true, 'Please add your review'],
        maxlength: 300
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must have an author']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // });

    this.populate({
        path: 'user',
        select: 'name photo'
    });

    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;