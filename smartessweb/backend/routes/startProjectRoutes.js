const express = require('express');
const { sendEmailController, storeDataController } = require('../controllers/startProjectController');
const router = express.Router();

router.post('/send-email', sendEmailController);
router.post('/store-start-project-data', storeDataController);

module.exports = router;
