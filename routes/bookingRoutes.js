const express = require('express');
const authCtrlr = require('../controllers/authController');

const
    {
        getCheckoutSession
    } = require('../controllers/bookingController');

const router = express.Router();

router
    .get('/checkout-session/:tourId', authCtrlr.protect, getCheckoutSession);

module.exports = router;