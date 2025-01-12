const express = require('express');
const { getIndividualUnit, removeUserFromHub} = require('../controllers/individualUnitContoller');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.post('/get-individual-unit', verifyToken, getIndividualUnit);
router.post('/remove-user-from-hub', verifyToken, removeUserFromHub);

module.exports = router;