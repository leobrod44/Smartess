const express = require('express');
const { getUserProjects} = require('../controllers/unitsController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get-user-projects', verifyToken, getUserProjects);

module.exports = router;