const express = require('express');
const { sendEmailController, storeEmailController } = require('../controllers/emailController');
const router = express.Router();

router.post('/send-email', sendEmailController);
router.post('/store-email', storeEmailController);

module.exports = router;
