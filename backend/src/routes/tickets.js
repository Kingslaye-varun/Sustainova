const express = require('express');
const { getTickets, createTicket, updateTicket, getStats } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/stats', authorize('admin'), getStats);
router.get('/', getTickets);
router.post('/', createTicket);
router.put('/:id', authorize('admin', 'maintenance'), updateTicket);

module.exports = router;
