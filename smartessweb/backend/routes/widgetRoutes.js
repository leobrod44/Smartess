const express = require('express');
const { getDashboardWidgets } = require('../controllers/widgetController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/dashboard', verifyToken, getDashboardWidgets);

module.exports = router;