const express = require('express');
const { getTasks, createTask, updateTask } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', authorize('admin', 'maintenance'), getTasks);
router.post('/', protect, createTask); // any authenticated user can report
router.put('/:id', authorize('admin', 'maintenance'), updateTask);

module.exports = router;
