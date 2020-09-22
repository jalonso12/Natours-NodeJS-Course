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
        getMonthlyPlan
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
    .get(getMonthlyPlan);

router
    .route('/')
    .get(authCtrlr.protect, getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getSpecificTour)
    .patch(updateTour)
    .delete(
        authCtrlr.protect, 
        authCtrlr.restrictTo('admin', 'lead-guide'), 
        deleteTour
        );

module.exports = router;