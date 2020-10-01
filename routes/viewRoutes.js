const express = require('express');
const authCtrlr = require('../controllers/authController');

const {
        getOverview,
        getTour,
        getLoginForm,
        getAccount,
        updateUserData
    } = require('../controllers/viewController');

const router = express.Router();

router
    .get('/', authCtrlr.isLoggedIn, getOverview);

router
    .get('/login', authCtrlr.isLoggedIn, getLoginForm);

router
    .get('/me', authCtrlr.protect, getAccount);

router
    .post('/submit-user-data', authCtrlr.protect, updateUserData)

router
    .get('/tour/:slug', authCtrlr.isLoggedIn, getTour);

module.exports = router;