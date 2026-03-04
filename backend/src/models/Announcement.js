const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    target: {
        type: String,
        enum: ['all', 'employees', 'maintenance', 'admins'],
        default: 'all',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
