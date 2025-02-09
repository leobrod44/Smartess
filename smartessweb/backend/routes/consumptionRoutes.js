const express = require("express");
const { getConsumptions } = require("../controllers/consumptionController");

const router = express.Router();

router.get("/get_consumptions/:userId", getConsumptions);

module.exports = router;
