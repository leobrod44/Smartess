const express = require("express");
const {
  getConsumptions,
  getConsumption,
} = require("../controllers/consumptionController");

const router = express.Router();

router.get("/get_consumptions/:userId", getConsumptions);
router.get("/get_consumption/:hubId", getConsumption);

module.exports = router;
