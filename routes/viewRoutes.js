const express = require('express');
const authCtrlr = require('../controllers/authController');

const {
        getOverview,
        getTour,
        getLoginForm
    } = require('../controllers/viewController');

const router = express.Router();

router.use(authCtrlr.isLoggedIn);

router
    .get('/', getOverview);

router
    .get('/login', getLoginForm);

router
    .get('/tour/:slug', getTour);

module.exports = router;