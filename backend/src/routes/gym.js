const express = require('express');
const { getCycles, updateCycle, getEnergy } = require('../controllers/gymController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/cycles', getCycles);
router.patch('/cycles/:cycleId', updateCycle);
router.get('/energy', getEnergy);

module.exports = router;
