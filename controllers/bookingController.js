const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const catchAsync = require('../handlers/errorCatchHandler');
const AppError = require('../utils/appError');

exports.createBooking = factory.createOne(Booking);
exports.getSpecificBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);

    const homePage = `${req.protocol}://${req.get('host')}`;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        //success_url: `${homePage}?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${homePage}/my-tours?alert=booking`,
        cancel_url: `${homePage}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [{
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1
        }]
    });

    res
        .status(200)
        .json({
            status: 'success',
            session
        });
});

const createBookingCheckout = async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.line_items[0].amount / 100;

    await Booking.create({ tour, user, price });
}

exports.webhookCheckout = catchAsync(async (req, res, next) => {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    }catch (err) {
        return res.status(200).send(`Webhook error: ${err.message}`)
    }

    if(event.type === 'checkout.session.completed') createBookingCheckout(event.data.object);

    res
        .status(200)
        .json({ received: true });
});




// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     const { tour, user, price } = req.query;

//     if(!tour && !user && !price) return next();

//     await Booking.create({tour, user, price});

//     res
//         .redirect(req.originalUrl.split('?')[0]);
// });