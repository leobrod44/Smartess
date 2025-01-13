const express = require('express');
const { getCurrentUser, getIndividualUnit, removeUserFromHub} = require('../controllers/individualUnitContoller');
const { verifyToken } = require('../middleware/middleware');
const router = express.Router();

router.get('/get-current-user', verifyToken, getCurrentUser);
router.post('/get-individual-unit', verifyToken, getIndividualUnit);
router.post('/remove-user-from-hub', verifyToken, removeUserFromHub);

module.exports = router;