const express = require('express');
const {  } = require('../controllers/unitsController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

//router.get('/get-current-user', verifyToken, getCurrentUser);

module.exports = router;