const express = require('express');
const userController = require('../Controllers/user.controller');

const router = express();

router.post('/registerUser', userController.registerUser);
router.post('/login', userController.loginUser);
router.get("/confirm/:token", userController.confirmToken);
router.get("/check-email-verification", userController.getEmailVerification);
module.exports = router;