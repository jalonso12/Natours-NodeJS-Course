const express = require('express');
const userCtrlr = require('./../controllers/userController');
const authCtrlr = require('./../controllers/authController')

// Routers will only be runned when it matches url
const router = express.Router();

router
    .post('/signup', authCtrlr.signup);

router
    .post('/login', authCtrlr.login);

router
    .route('/')
    .get(userCtrlr.getAllUsers)
    .post(userCtrlr.createUser);

router 
    .route('/:id')
    .get(userCtrlr.getUser)
    .patch(userCtrlr.updateUser)
    .delete(userCtrlr.deleteUser);

module.exports = router;