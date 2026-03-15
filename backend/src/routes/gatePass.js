const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const {
    createVisitorPass, listVisitorPasses, revokeVisitorPass, verifyVisitorPass,
    createStaffPass, listStaffPasses, verifyStaffPass, createStaffUser,
} = require('../controllers/gatePassController');

const router = express.Router();

// Multer — use memory storage, we'll upload to Cloudinary manually
const upload = multer({
    storage: multer.diskStorage({
        destination: require('os').tmpdir(),
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    },
});

/* ─── Visitor Routes ──────────────────────────────────────── */
router.post('/visitor',              protect, authorize('admin'), upload.none(), createVisitorPass);
router.get('/visitor',               protect, authorize('admin'), listVisitorPasses);
router.delete('/visitor/:id',        protect, authorize('admin'), revokeVisitorPass);
router.get('/visitor/verify/:code',  verifyVisitorPass); // PUBLIC — no auth

/* ─── Staff Routes ───────────────────────────────────────── */
router.post('/staff/create-staff',   protect, authorize('admin'), upload.single('photo'), createStaffUser);
router.post('/staff',                protect, authorize('admin'), upload.single('photo'), createStaffPass);
router.get('/staff',                 protect, authorize('admin'), listStaffPasses);
router.get('/staff/verify/:code',    verifyStaffPass); // PUBLIC — no auth

module.exports = router;
