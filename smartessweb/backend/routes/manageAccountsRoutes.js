const express = require('express');
const { getCurrentUser, getOrgUsers, getOrgIndividualsData, getOrgUsersProjects, getOrgProjects, assignOrgUserToProject, removeOrgUserFromProject, changeOrgUserRole, deleteOrgUser } = require('../controllers/manageAccountsController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get-current-user', verifyToken, getCurrentUser);
router.get('/get-org-users', verifyToken, getOrgUsers);
router.post('/get-org-individuals-data', verifyToken, getOrgIndividualsData);
router.post('/get-org-users-projects', verifyToken, getOrgUsersProjects);
router.post('/get-org-projects', verifyToken, getOrgProjects);
router.post('/assign-org-user-to-project', verifyToken, assignOrgUserToProject);
router.post('/remove-org-user-from-project', verifyToken, removeOrgUserFromProject);
router.post('/change-org-user-role', verifyToken, changeOrgUserRole);
router.post('/delete-org_user', verifyToken, deleteOrgUser);


module.exports = router;