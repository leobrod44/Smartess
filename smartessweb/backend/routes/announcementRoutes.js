const express = require('express');
const {
  getAllHubUserEmailsInOrg,
  getAllHubUserEmailsInProject,
  sendAnnouncementEmail,
} = require('../controllers/announcementController');
const router = express.Router();

router.get('/get_hub_user_emails_org/:orgId', getAllHubUserEmailsInOrg);
router.get('/get_hub_user_emails_proj/:projId', getAllHubUserEmailsInProject);
router.post('/send_announcement_email', sendAnnouncementEmail);

module.exports = router;
