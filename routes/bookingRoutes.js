const express = require('express');
const authCtrlr = require('../controllers/authController');

const
    {
        getCheckoutSession, 
        getAllBookings,
        createBooking,
        getSpecificBooking,
        updateBooking,
        deleteBooking
    } = require('../controllers/bookingController');

const router = express.Router();

router.use(authCtrlr.protect);

router
    .get('/checkout-session/:tourId', getCheckoutSession);

router.use(authCtrlr.restrictTo('admin', 'lead-guide'));

router
    .route('/')
    .get(getAllBookings)
    .post(createBooking);

router
    .route('/:id')
    .get(getSpecificBooking)
    .patch(updateBooking)
    .delete(deleteBooking)

module.exports = router;