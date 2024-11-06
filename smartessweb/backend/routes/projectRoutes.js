const express = require('express');
const { getUserProjects } = require('../controllers/projectController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get_user_projects', verifyToken, getUserProjects);

module.exports = router;