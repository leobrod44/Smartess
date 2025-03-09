const express = require("express");
const {
  sendPasswordReset,
  verifyResetToken,
  resetPassword
} = require("../controllers/resetPasswordController");

const multer = require("multer");
const upload = multer();
const router = express.Router();

// Route to initiate password reset (send email)
router.post("/reset-password", upload.none(), sendPasswordReset);
//Route to verify reset token
router.get("/verify-token/:token", verifyResetToken);
//Route to update password with token
router.post("/update-password", upload.none(), resetPassword);

module.exports = router;