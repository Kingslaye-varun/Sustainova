const { VisitorGatePass, StaffGatePass } = require('../models/GatePass');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { generateAndUploadQR } = require('../utils/generateQR');
const { sendVisitorGatePass, sendStaffWelcome } = require('../utils/sendGatePass');
const crypto = require('crypto');

/* ─── Helpers ────────────────────────────────────────────── */
const genPassCode = (prefix) =>
    `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

/* ─── VISITOR GATE PASSES ──────────────────────────────────── */

// POST /api/gate-pass/visitor  → Admin creates a visitor pass + sends email
const createVisitorPass = async (req, res) => {
    try {
        const {
            visitorName, email, phone, company, purpose,
            hostEmployee, hostEmployeeId,
            authorizedFloors, validFrom, validTo,
        } = req.body;

        const passCode = genPassCode('VSGP');

        // Generate QR
        const { qrCodeUrl, qrData } = await generateAndUploadQR(
            { type: 'visitor', passCode, visitorName, email, purpose, validFrom, validTo },
            'sustainova/gate-passes/visitors'
        );

        const pass = await VisitorGatePass.create({
            passCode, visitorName, email, phone, company, purpose,
            hostEmployee, hostEmployeeId,
            authorizedFloors: authorizedFloors || ['Lobby', 'Meeting Rooms'],
            validFrom: new Date(validFrom),
            validTo: new Date(validTo),
            qrCodeUrl, qrData,
            createdBy: req.user._id,
        });

        // Send email (non-blocking — don't fail if email fails)
        sendVisitorGatePass({ visitorName, email, passCode, purpose, hostEmployee, validFrom, validTo, authorizedFloors: pass.authorizedFloors, qrCodeUrl })
            .then(() => VisitorGatePass.findByIdAndUpdate(pass._id, { emailSent: true }))
            .catch(err => console.error('Email send failed:', err.message));

        res.status(201).json({ success: true, message: 'Visitor gate pass created & email queued', pass });
    } catch (err) {
        console.error('❌ createVisitorPass:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/gate-pass/visitor  → Admin lists all visitor passes
const listVisitorPasses = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        // Auto-expire passes whose validTo has passed
        await VisitorGatePass.updateMany(
            { validTo: { $lt: new Date() }, status: 'active' },
            { status: 'expired' }
        );

        const passes = await VisitorGatePass.find(filter)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name userId');

        res.json({ success: true, passes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/gate-pass/visitor/:id  → Revoke
const revokeVisitorPass = async (req, res) => {
    try {
        const pass = await VisitorGatePass.findByIdAndUpdate(
            req.params.id, { status: 'revoked' }, { new: true }
        );
        if (!pass) return res.status(404).json({ success: false, message: 'Pass not found' });
        res.json({ success: true, message: 'Pass revoked', pass });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/gate-pass/visitor/verify/:code  → PUBLIC — scan at gate
const verifyVisitorPass = async (req, res) => {
    try {
        const pass = await VisitorGatePass.findOne({ passCode: req.params.code });
        if (!pass) return res.status(404).json({ success: false, message: 'Pass not found' });

        // Auto-expire check
        if (pass.status === 'active' && new Date() > new Date(pass.validTo)) {
            pass.status = 'expired';
            await pass.save();
        }

        res.json({ success: true, pass });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ─── STAFF GATE PASSES ────────────────────────────────────── */

// POST /api/gate-pass/staff  → Admin creates staff pass (with photo upload)
const createStaffPass = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Staff user not found' });

        // Upload photo to Cloudinary (from multipart upload)
        let photoUrl = '';
        let photoPublicId = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'sustainova/staff-photos',
                transformation: [{ width: 400, height: 400, crop: 'face', gravity: 'face' }],
            });
            photoUrl = result.secure_url;
            photoPublicId = result.public_id;
        }

        const passCode = genPassCode('STGP');

        const { qrCodeUrl, qrData } = await generateAndUploadQR(
            { type: 'staff', passCode, userId: user.userId, name: user.name, role: user.role },
            'sustainova/gate-passes/staff'
        );

        // Upsert — one pass per user
        const pass = await StaffGatePass.findOneAndUpdate(
            { userId: user._id },
            {
                passCode, photoUrl, photoPublicId, qrCodeUrl, qrData,
                issuedDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                isActive: true,
                createdBy: req.user._id,
            },
            { upsert: true, new: true }
        );

        res.status(201).json({ success: true, message: 'Staff gate pass created', pass, user });
    } catch (err) {
        console.error('❌ createStaffPass:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/gate-pass/staff  → Admin lists all staff passes
const listStaffPasses = async (req, res) => {
    try {
        const passes = await StaffGatePass.find()
            .populate('userId', 'name userId email department floor')
            .sort({ createdAt: -1 });
        res.json({ success: true, passes });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/gate-pass/staff/verify/:code  → PUBLIC — scan at gate
const verifyStaffPass = async (req, res) => {
    try {
        const pass = await StaffGatePass.findOne({ passCode: req.params.code })
            .populate('userId', 'name userId email department floor role');
        if (!pass || !pass.isActive) {
            return res.status(404).json({ success: false, message: 'Pass not found or inactive' });
        }
        res.json({ success: true, pass });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/* ─── CREATE STAFF USER + GATE PASS (single flow) ──────────── */
// POST /api/gate-pass/staff/create-staff
const createStaffUser = async (req, res) => {
    try {
        const { name, email, department, floor } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

        // Generate a temporary password
        const tempPassword = crypto.randomBytes(4).toString('hex'); // e.g. "a3f9b2c1"

        // Create user
        const user = await User.create({
            name, email, password: tempPassword,
            role: 'maintenance', department, floor: parseInt(floor) || 1,
        });

        // Upload photo if provided
        let photoUrl = '', photoPublicId = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path || req.file.buffer, {
                folder: 'sustainova/staff-photos',
                transformation: [{ width: 400, height: 400, crop: 'face', gravity: 'face' }],
            });
            photoUrl = result.secure_url;
            photoPublicId = result.public_id;
        }

        const passCode = genPassCode('STGP');
        const { qrCodeUrl, qrData } = await generateAndUploadQR(
            { type: 'staff', passCode, userId: user.userId, name: user.name, role: user.role },
            'sustainova/gate-passes/staff'
        );

        const pass = await StaffGatePass.create({
            userId: user._id, passCode, photoUrl, photoPublicId,
            qrCodeUrl, qrData,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            createdBy: req.user._id,
        });

        // Send welcome email
        sendStaffWelcome({ name, email, userId: user.userId, tempPassword, qrCodeUrl, passCode })
            .catch(err => console.error('Staff email failed:', err.message));

        res.status(201).json({
            success: true,
            message: 'Maintenance staff account created, gate pass generated, welcome email queued.',
            user, pass,
        });
    } catch (err) {
        console.error('❌ createStaffUser:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createVisitorPass, listVisitorPasses, revokeVisitorPass, verifyVisitorPass,
    createStaffPass, listStaffPasses, verifyStaffPass, createStaffUser,
};
