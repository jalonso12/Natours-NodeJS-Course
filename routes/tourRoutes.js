const express = require('express');
const authCtrlr = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

// Importing using destructuring
const 
    { 
        getAllTours,
        createTour,
        getSpecificTour,
        updateTour,
        deleteTour,
        aliasTopTours,
        getTourStats,
        getMonthlyPlan,
        getToursWithin,
        getDistances
    } = require(`./../controllers/tourController`);

// Routers will only be runned when it matches url
const router = express.Router();

router.use('/:id/reviews', reviewRouter);

router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

router
    .route('/tour-stats')
    .get(getTourStats);

router
    .route('/monthly-plan/:year')
    .get(
        authCtrlr.protect, 
        authCtrlr.restrictTo('admin', 'lead-guide', 'guide'),
        getMonthlyPlan
        );

router
    .route('/within/:distance/center/:latlng/unit/:unit')
    .get(getToursWithin);

router
    .route('/distances/:latlng/unit/:unit')
    .get(getDistances);

router
    .route('/')
    .get(getAllTours)
    .post(authCtrlr.protect, authCtrlr.restrictTo('admin', 'lead-guide'), createTour);

router
    .route('/:id')
    .get(getSpecificTour)
    .patch(
        authCtrlr.protect, 
        authCtrlr.restrictTo('admin', 'lead-guide'),
        updateTour
        )
    .delete(
        authCtrlr.protect, 
        authCtrlr.restrictTo('admin', 'lead-guide'), 
        deleteTour
        );

module.exports = router;