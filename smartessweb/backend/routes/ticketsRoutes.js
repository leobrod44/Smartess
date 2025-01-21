const express = require('express');
const { getTickets, deleteTicket } = require('../controllers/ticketsController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get-tickets', verifyToken, getTickets);
router.delete('/delete-ticket/:ticket_id', verifyToken, deleteTicket);

module.exports = router;