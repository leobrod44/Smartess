const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  getCurrentUserOrgId,
  getAllHubUserEmailsInOrg,
  getAllHubUserEmailsInProject,
  sendAnnouncementEmail,
  storeAnnouncement,
  getAnnouncements,
} = require("../controllers/announcementController");

const router = express.Router();

router.get("/get_current_user_org_id/:userId", getCurrentUserOrgId);
router.get("/get_hub_user_emails_org/:orgId", getAllHubUserEmailsInOrg);
router.get("/get_hub_user_emails_proj/:projId", getAllHubUserEmailsInProject);
router.post(
  "/send_announcement_email",
  upload.array("files"),
  sendAnnouncementEmail
);
router.post("/post_announcement", upload.array("files"), storeAnnouncement);
router.get("/get-announcements/:userId", getAnnouncements);

module.exports = router;
