const express = require('express');
const contactController = require('../Controllers/contact.controller.js');

const router = express.Router();

router.post('/contact-details', contactController.contactDetails);

module.exports = router;