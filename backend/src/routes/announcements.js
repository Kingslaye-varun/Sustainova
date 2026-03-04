const express = require('express');
const { getAnnouncements, createAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('admin'), createAnnouncement);
router.delete('/:id', authorize('admin'), deleteAnnouncement);

module.exports = router;
