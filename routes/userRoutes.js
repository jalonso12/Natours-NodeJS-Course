const express = require('express');
const userCtrlr = require(`./../controllers/userController`);

// Routers will only be runned when it matches url
const router = express.Router();

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