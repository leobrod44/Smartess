const express = require("express");
const { verifyRegistrationToken, register} = require("../controllers/registrationController");

const router = express.Router();

router.get("/verify-token/:token", verifyRegistrationToken);
router.post("/register", register);

module.exports = router;