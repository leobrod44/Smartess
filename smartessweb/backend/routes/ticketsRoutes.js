const express = require('express');
const { getTickets } = require('../controllers/ticketsController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get-tickets', verifyToken, getTickets);

module.exports = router;