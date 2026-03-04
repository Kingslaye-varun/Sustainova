const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotId: { type: String, required: true, unique: true }, // e.g. B1-A5
    floor: { type: String, enum: ['B1', 'B2', 'B3'], required: true },
    row: { type: String, required: true }, // A, B, C ...
    number: { type: Number, required: true }, // 1, 2, 3 ...
    status: { type: String, enum: ['free', 'occupied', 'reserved', 'disabled'], default: 'free' },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    vehicleNumber: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

parkingSlotSchema.index({ floor: 1, status: 1 });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
