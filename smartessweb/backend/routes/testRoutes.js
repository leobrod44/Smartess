const express = require('express');
const { getTest1Data, getTest2Data } = require('../controllers/testController');
const router = express.Router();

router.get('/', getTest1Data);
router.get('/', getTest2Data);

module.exports = router;