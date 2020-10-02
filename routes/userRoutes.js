const express = require('express');
const userCtrlr = require('../controllers/userController');
const authCtrlr = require('../controllers/authController');



// Routers will only be runned when it matches url
const router = express.Router();

router
    .post('/signup', authCtrlr.signup);

router
    .post('/login', authCtrlr.login);

router
    .get('/logout', authCtrlr.logout);

router
    .post('/forgotPassword', authCtrlr.forgotPassword);
  
router
    .patch('/resetPassword/:token', authCtrlr.resetPassword);

router.use(authCtrlr.protect); // Protect all routes after this point

router
    .patch('/updateMyPassword', authCtrlr.updatePassword);

router
    .get('/me', userCtrlr.getMe, userCtrlr.getSpecificUser);

router
    .patch(
        '/updateMe', 
        userCtrlr.uploadUserPhoto, 
        userCtrlr.resizeUserPhoto,
        userCtrlr.updateMe
        );

router
    .delete('/deleteMe', userCtrlr.deleteMe);

router.use(authCtrlr.restrictTo('admin'));

router
    .route('/')
    .get(userCtrlr.getAllUsers)
    .post(userCtrlr.createUser);

router 
    .route('/:id')
    .get(userCtrlr.getSpecificUser)
    .patch(userCtrlr.updateUser)
    .delete(userCtrlr.deleteUser);

module.exports = router;