const mongoose = require('mongoose');

// Tracks energy data per day
const gymEnergySchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    totalWh: { type: Number, default: 0 },     // Watt-hours generated
    activeCycles: { type: Number, default: 0 },     // peak cycles active
    sessions: { type: Number, default: 0 },     // total cycle sessions
    peakHour: { type: String, default: '' },    // e.g. "18:00"
}, { timestamps: true });

// Live cycle status (40 cycles)
const gymCycleSchema = new mongoose.Schema({
    cycleId: { type: String, required: true, unique: true }, // C01 - C40
    occupied: { type: Boolean, default: false },
    watts: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = {
    GymEnergy: mongoose.model('GymEnergy', gymEnergySchema),
    GymCycle: mongoose.model('GymCycle', gymCycleSchema),
};
