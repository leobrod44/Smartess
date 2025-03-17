const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  getUser,
  storeProfilePicture,
} = require("../controllers/userController");
const { verifyToken } = require("../middleware/middleware");
const router = express.Router();

router.get("/get_user", verifyToken, getUser);
router.post(
  "/post_profile_picture",
  upload.single("file"),
  storeProfilePicture
);

module.exports = router;
