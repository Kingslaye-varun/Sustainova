const ParkingSlot = require('../models/ParkingSlot');

// GET /api/parking — get all slots (optionally filter by floor)
const getSlots = async (req, res) => {
    try {
        const { floor } = req.query;
        const filter = floor ? { floor } : {};
        const slots = await ParkingSlot.find(filter).populate('reservedBy', 'name userId');
        console.log(`🚗 Parking slots fetched: floor=${floor || 'all'}, count=${slots.length}`);
        res.json({ success: true, count: slots.length, slots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/parking/stats
const getStats = async (req, res) => {
    try {
        const [total, free, occupied, reserved] = await Promise.all([
            ParkingSlot.countDocuments(),
            ParkingSlot.countDocuments({ status: 'free' }),
            ParkingSlot.countDocuments({ status: 'occupied' }),
            ParkingSlot.countDocuments({ status: 'reserved' }),
        ]);
        const byFloor = await ParkingSlot.aggregate([
            { $group: { _id: '$floor', free: { $sum: { $cond: [{ $eq: ['$status', 'free'] }, 1, 0] } }, total: { $sum: 1 } } },
        ]);
        console.log(`📊 Parking stats: total=${total} free=${free} occupied=${occupied}`);
        res.json({ success: true, stats: { total, free, occupied, reserved, byFloor } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/parking/:slotId/reserve
const reserveSlot = async (req, res) => {
    try {
        const { vehicleNumber } = req.body;
        const slot = await ParkingSlot.findOne({ slotId: req.params.slotId });
        if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
        if (slot.status !== 'free') return res.status(400).json({ success: false, message: `Slot is ${slot.status}` });

        slot.status = 'reserved';
        slot.reservedBy = req.user._id;
        slot.vehicleNumber = vehicleNumber || '';
        slot.updatedAt = new Date();
        await slot.save();

        console.log(`🅿️  Slot ${slot.slotId} reserved by ${req.user.userId}`);
        res.json({ success: true, message: `Slot ${slot.slotId} reserved`, slot });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/parking/:slotId/reserve
const freeSlot = async (req, res) => {
    try {
        const slot = await ParkingSlot.findOne({ slotId: req.params.slotId });
        if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

        slot.status = 'free';
        slot.reservedBy = null;
        slot.vehicleNumber = '';
        slot.updatedAt = new Date();
        await slot.save();

        console.log(`🟢 Slot ${slot.slotId} freed by ${req.user.userId}`);
        res.json({ success: true, message: `Slot ${slot.slotId} is now free`, slot });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/parking/seed — seed parking slots (admin only)
const seedParking = async (req, res) => {
    try {
        const existing = await ParkingSlot.countDocuments();
        if (existing > 0) return res.status(400).json({ success: false, message: `Already seeded: ${existing} slots exist` });

        const floors = { B1: 120, B2: 120, B3: 80 };
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const slots = [];

        for (const [floor, total] of Object.entries(floors)) {
            const perRow = Math.ceil(total / rows.length);
            for (let i = 0; i < total; i++) {
                const row = rows[Math.floor(i / perRow)];
                const num = (i % perRow) + 1;
                const rand = Math.random();
                const status = rand < 0.65 ? 'occupied' : rand > 0.97 ? 'disabled' : rand > 0.94 ? 'reserved' : 'free';
                slots.push({ slotId: `${floor}-${row}${num}`, floor, row, number: num, status });
            }
        }

        await ParkingSlot.insertMany(slots);
        console.log(`🅿️  Seeded ${slots.length} parking slots`);
        res.json({ success: true, message: `Seeded ${slots.length} parking slots` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getSlots, getStats, reserveSlot, freeSlot, seedParking };
