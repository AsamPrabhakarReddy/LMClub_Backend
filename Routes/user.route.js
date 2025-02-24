const express = require('express');
const userController = require('../Controllers/user.controller');

const router = express();

router.post('/registerUser', userController.registerUser);
router.post('/login', userController.loginUser);
router.get("/confirm/:token", userController.confirmToken);
router.get("/confirmTokenForBussinessRegistration/:token", userController.confirmTokenForBussinessRegistration);
router.get("/check-email-verification", userController.getEmailVerification);
router.get("/check-email-verification-for-bussiness", userController.getEmailVerificationForBussiness);
router.post("/bussinessUserRegistration",userController.bussinessUserRegisterUser);
router.post('/bussiness-login', userController.bussinessLoginUser);
router.post("/forgotPassword", userController.forgotPassword);
router.post("/resetPassword/:id/:token", userController.resetPassword);


module.exports = router;