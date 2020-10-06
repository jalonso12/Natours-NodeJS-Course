const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        require: [true, 'Booking must belong to a tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'Booking must belong to a user!']
    },
    price: {
        type: Number,
        require: [true, 'Booking must have a price.']
    },
    createdAd: {
        type: Boolean,
        default: true
    },
    paid: {
        type: Boolean,
        default: true
    }
});

bookingSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    });

    next();
});

const Booking = mongoose.model('Booking', bookingSchema)

module.exports = Booking;