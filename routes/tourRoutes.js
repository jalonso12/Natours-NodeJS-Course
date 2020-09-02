const express = require('express');
const authController = require('./../controllers/authController');

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
    .get(authController.protect, getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getSpecificTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;