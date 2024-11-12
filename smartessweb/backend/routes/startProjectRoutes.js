const express = require('express');
const { sendEmail, storeData } = require('../controllers/startProjectController');
const router = express.Router();

router.post('/send-email', sendEmail);
router.post('/store-start-project-data', storeData);

module.exports = router;
