const express = require('express');
const { getSlots, getStats, reserveSlot, freeSlot, seedParking } = require('../controllers/parkingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/stats', getStats);
router.get('/', getSlots);
router.post('/seed', authorize('admin'), seedParking);
router.post('/:slotId/reserve', reserveSlot);
router.delete('/:slotId/reserve', freeSlot);

module.exports = router;
