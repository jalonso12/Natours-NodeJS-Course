const express = require('express');
const authCtrlr = require('../controllers/authController');
const bookingCtrlr = require('../controllers/bookingController');

const {
        getOverview,
        getTour,
        getLoginForm,
        getAccount,
        updateUserData,
        getMyTours
    } = require('../controllers/viewController');

const router = express.Router();

router
    .get('/', bookingCtrlr.createBookingCheckout, authCtrlr.isLoggedIn, getOverview);

router
    .get('/login', authCtrlr.isLoggedIn, getLoginForm);

router
    .get('/me', authCtrlr.protect, getAccount);

router
    .get('/my-tours', authCtrlr.protect, getMyTours);

router
    .post('/submit-user-data', authCtrlr.protect, updateUserData)

router
    .get('/tour/:slug', authCtrlr.isLoggedIn, getTour);

module.exports = router;