const express = require("express");
const { getUserName, getUserType } = require("../controllers/userController");
const { verifyToken } = require("../middleware/middleware");
const router = express.Router();

router.get("/get_user_name", verifyToken, getUserName);
router.get("/get_user_type", verifyToken, getUserType);

module.exports = router;
