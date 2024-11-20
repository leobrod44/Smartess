const express = require('express');
const { getOrgUsers, getOrgIndividualsData, getOrgUsersProjects } = require('../controllers/manageAccountsController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get-org-users', verifyToken, getOrgUsers);
router.post('/get-org-individuals-data', verifyToken, getOrgIndividualsData);
router.post('/get-org-users-projects', verifyToken, getOrgUsersProjects);

module.exports = router;