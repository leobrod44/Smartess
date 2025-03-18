const express = require('express');

const { getOrganizationAlerts, getProjectsForAlerts } = require('../controllers/alertsController');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get_organization_alerts', verifyToken, getOrganizationAlerts);
router.get('/get_projects_for_alerts', verifyToken, getProjectsForAlerts);

module.exports = router;