const express = require('express');
const { getTickets, deleteTicket, fetchIndividualTicket } = require('../controllers/ticketsController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get-tickets', verifyToken, getTickets);
router.delete('/delete-ticket/:ticket_id', verifyToken, deleteTicket);
router.get('/ticket/:ticket_id', verifyToken, fetchIndividualTicket);

module.exports = router;