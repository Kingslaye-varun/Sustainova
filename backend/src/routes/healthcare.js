const express = require('express');
const { protect } = require('../middleware/auth');
const { chat, getDailyTip } = require('../controllers/healthcareController');

const router = express.Router();

router.post('/chat', protect, chat);
router.get('/tip',  protect, getDailyTip);

module.exports = router;
