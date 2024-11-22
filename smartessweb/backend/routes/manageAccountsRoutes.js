const express = require('express');
const { getCurrentUser, getOrgUsers, getOrgIndividualsData, getOrgUsersProjects, getOrgProjects } = require('../controllers/manageAccountsController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get-current-user', verifyToken, getCurrentUser);
router.get('/get-org-users', verifyToken, getOrgUsers);
router.post('/get-org-individuals-data', verifyToken, getOrgIndividualsData);
router.post('/get-org-users-projects', verifyToken, getOrgUsersProjects);
router.post('/get-org-projects', verifyToken, getOrgProjects);

module.exports = router;