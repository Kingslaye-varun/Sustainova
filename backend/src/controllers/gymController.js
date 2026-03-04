const { GymEnergy, GymCycle } = require('../models/Gym');

// GET /api/gym/cycles — live cycle status
const getCycles = async (req, res) => {
    try {
        let cycles = await GymCycle.find().sort({ cycleId: 1 }).populate('userId', 'name userId');
        if (cycles.length === 0) {
            // Auto-seed 40 cycles if none exist
            const seed = Array.from({ length: 40 }, (_, i) => ({
                cycleId: `C${String(i + 1).padStart(2, '0')}`,
                occupied: i < 18, // 18 occupied by default for demo
                watts: i < 18 ? Math.floor(Math.random() * 100 + 80) : 0,
            }));
            await GymCycle.insertMany(seed);
            cycles = await GymCycle.find().sort({ cycleId: 1 });
            console.log('🚴 Seeded 40 gym cycles');
        }
        const active = cycles.filter(c => c.occupied).length;
        console.log(`🚴 Gym cycles fetched: ${active}/${cycles.length} active`);
        res.json({ success: true, cycles, summary: { total: cycles.length, active, free: cycles.length - active } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/gym/cycles/:cycleId — update cycle status (from IoT)
const updateCycle = async (req, res) => {
    try {
        const { occupied, watts } = req.body;
        const cycle = await GymCycle.findOneAndUpdate(
            { cycleId: req.params.cycleId },
            { occupied, watts: occupied ? (watts || 100) : 0, lastUpdated: new Date() },
            { new: true, upsert: true }
        );
        console.log(`🚴 Cycle ${cycle.cycleId}: ${cycle.occupied ? `occupied (${cycle.watts}W)` : 'free'}`);
        res.json({ success: true, cycle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/gym/energy — energy stats (today, month, year)
const getEnergy = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.slice(0, 7); // YYYY-MM
        const currentYear = today.slice(0, 4);  // YYYY

        // Calculate from live cycles (estimated)
        const cycles = await GymCycle.find({ occupied: true });
        const liveWatts = cycles.reduce((sum, c) => sum + (c.watts || 100), 0);

        const todayRecord = await GymEnergy.findOne({ date: today });
        const todayWh = todayRecord ? todayRecord.totalWh : Math.floor(liveWatts * 6); // 6hrs avg

        // Monthly & yearly (aggregate)
        const monthlyAgg = await GymEnergy.aggregate([
            { $match: { date: { $regex: `^${currentMonth}` } } },
            { $group: { _id: null, total: { $sum: '$totalWh' } } },
        ]);
        const yearlyAgg = await GymEnergy.aggregate([
            { $match: { date: { $regex: `^${currentYear}` } } },
            { $group: { _id: null, total: { $sum: '$totalWh' } } },
        ]);

        // Monthly chart (last 6 months)
        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        const mockMonthly = [98000, 112000, 89000, 134000, 118000, todayWh];

        const stats = {
            todayWh: todayWh,
            todayKwh: (todayWh / 1000).toFixed(2),
            monthWh: monthlyAgg[0]?.total || todayWh * 25,
            monthKwh: ((monthlyAgg[0]?.total || todayWh * 25) / 1000).toFixed(1),
            yearWh: yearlyAgg[0]?.total || todayWh * 280,
            yearMwh: ((yearlyAgg[0]?.total || todayWh * 280) / 1000000).toFixed(2),
            liveWatts,
            activeCycles: cycles.length,
            lightbulbsEquivalent: Math.floor(todayWh / 100), // 100Wh per bulb
            monthlyChart: months.map((m, i) => ({ month: m, kwh: +(mockMonthly[i] / 1000).toFixed(1) })),
        };

        console.log(`⚡ Gym energy stats: today=${stats.todayKwh}kWh, live=${liveWatts}W`);
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getCycles, updateCycle, getEnergy };
