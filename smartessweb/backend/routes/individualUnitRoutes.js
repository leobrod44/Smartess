const express = require('express');
const { getIndividualUnit} = require('../controllers/individualUnitContoller');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.post('/get-individual-unit', verifyToken, getIndividualUnit);

module.exports = router;