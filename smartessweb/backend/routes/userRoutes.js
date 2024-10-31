const express = require('express');
const { getUserName } = require('../controllers/userController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get_user_name', verifyToken, getUserName);

module.exports = router;