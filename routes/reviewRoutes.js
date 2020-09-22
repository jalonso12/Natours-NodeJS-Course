const express = require('express');
const authCtrlr = require('../controllers/authController');

const
    {
        createReview,
        getAllReviews
    } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getAllReviews)
    .post(authCtrlr.protect, authCtrlr.restrictTo('user'), createReview);

module.exports = router;