const express = require('express');
const { getHubDetails } = require('../controllers/hubController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/:proj_id/units/:unit_number', verifyToken, getHubDetails);

module.exports = router;