const express = require('express');
const authCtrlr = require('../controllers/authController');

const
    {
        createReview,
        getAllReviews,
        getSpecificReview,
        updateReview,
        deleteReview,
        setTourUserIds
    } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use(authCtrlr.protect);

router
    .route('/')
    .get(getAllReviews)
    .post(
        authCtrlr.restrictTo('user'),
        setTourUserIds,
        createReview
        );

router
    .route('/:id')
    .get(getSpecificReview)
    .patch(authCtrlr.restrictTo('admin', 'user'), updateReview)
    .delete(authCtrlr.restrictTo('admin', 'user'), deleteReview);

module.exports = router;