const express = require('express');
const { getUserProjects, getProjectImages} = require('../controllers/surveillanceController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get-user-projects', verifyToken, getUserProjects);
router.get('/get-project-images', verifyToken, getProjectImages);

module.exports = router;