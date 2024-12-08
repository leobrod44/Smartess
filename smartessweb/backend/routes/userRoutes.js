const express = require("express");
const { getUser } = require("../controllers/userController");
const { verifyToken } = require("../middleware/middleware");
const router = express.Router();

router.get("/get_user", verifyToken, getUser);

module.exports = router;
