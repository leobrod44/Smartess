const express = require('express');
const { getTickets, deleteTicket, fetchIndividualTicket, getAssignableEmployees, getAssignedUsers, assignUsersToTicket, unassignUserFromTicket } = require('../controllers/ticketsController');
const { verifyToken } = require('../middleware/middleware');

const router = express.Router();

router.get('/get-tickets', verifyToken, getTickets);
router.delete('/delete-ticket/:ticket_id', verifyToken, deleteTicket);
router.get('/ticket/:ticket_id', verifyToken, fetchIndividualTicket);
router.get('/assignable-employees/:ticket_id', verifyToken, getAssignableEmployees);
router.get('/assigned-users/:ticket_id', verifyToken, getAssignedUsers);
router.post('/assign-users', verifyToken, assignUsersToTicket);
router.post('/unassign-user', verifyToken, unassignUserFromTicket);

module.exports = router;
