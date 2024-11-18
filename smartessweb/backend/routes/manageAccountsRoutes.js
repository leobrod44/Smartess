const express = require('express');
const { getOrgUsers, getOrgIndividualsData } = require('../controllers/manageAccountsController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get-org-users', verifyToken, getOrgUsers);

module.exports = router;