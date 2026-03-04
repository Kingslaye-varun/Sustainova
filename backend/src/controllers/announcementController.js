const Announcement = require('../models/Announcement');

// GET /api/announcements
const getAnnouncements = async (req, res) => {
    try {
        const targetFilter = ['all'];
        if (req.user.role === 'employee') targetFilter.push('employees');
        if (req.user.role === 'maintenance') targetFilter.push('maintenance');
        if (req.user.role === 'admin') targetFilter.push('employees', 'maintenance', 'admins');

        const announcements = await Announcement.find({ target: { $in: targetFilter }, isActive: true })
            .populate('createdBy', 'name userId')
            .sort({ createdAt: -1 })
            .limit(20);

        console.log(`📢 ${req.user.userId} fetched ${announcements.length} announcements`);
        res.json({ success: true, count: announcements.length, announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/announcements — admin only
const createAnnouncement = async (req, res) => {
    try {
        const { title, message, target, expiresAt } = req.body;
        const ann = await Announcement.create({ title, message, target, expiresAt, createdBy: req.user._id });
        await ann.populate('createdBy', 'name userId');
        console.log(`📢 Announcement sent by ${req.user.userId} → ${target}: "${title}"`);
        res.status(201).json({ success: true, message: 'Announcement sent', announcement: ann });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/announcements/:id — admin only
const deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Announcement removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };
