import { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, PageHeader, StatCard, TabRow, StatusChip, Spinner, EmptyState } from '../components/ui';
import Layout from '../components/layout/Layout';
import { parkingAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TRAFFIC_DATA = [
    { hour: '7AM', entries: 45, exits: 10 },
    { hour: '8AM', entries: 120, exits: 35 },
    { hour: '9AM', entries: 210, exits: 80 },
    { hour: '10AM', entries: 85, exits: 110 },
    { hour: '12PM', entries: 42, exits: 30 },
    { hour: '2PM', entries: 68, exits: 55 },
    { hour: '5PM', entries: 40, exits: 175 },
    { hour: '6PM', entries: 20, exits: 200 },
];

const SLOT_COLORS = {
    free: 'bg-[#2ECC71] shadow-[0_0_8px_rgba(46,204,113,0.5)]',
    occupied: 'bg-[#FF4757]',
    reserved: 'bg-[#F5B800]',
    disabled: 'bg-[#4A6580] opacity-40',
};

const Parking = () => {
    const [activeFloor, setActiveFloor] = useState('B1');
    const [stats, setStats] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);
    const [seeding, setSeeding] = useState(false);

    const fetchStats = useCallback(() => {
        parkingAPI.getStats().then(r => setStats(r.data.stats)).catch(console.error);
    }, []);

    const fetchSlots = useCallback((floor) => {
        setLoading(true);
        parkingAPI.getSlots({ floor })
            .then(r => setSlots(r.data.slots))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { fetchSlots(activeFloor); }, [activeFloor, fetchSlots]);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            await parkingAPI.seed();
            fetchStats();
            fetchSlots(activeFloor);
        } catch (e) {
            console.error('Seed error:', e.response?.data?.message);
        } finally { setSeeding(false); }
    };

    const handleReserve = async (slot) => {
        if (slot.status !== 'free') return;
        try {
            await parkingAPI.reserve(slot.slotId, {});
            fetchSlots(activeFloor);
            fetchStats();
            setSelected(null);
        } catch (e) { console.error(e); }
    };

    const handleFree = async (slot) => {
        try {
            await parkingAPI.free(slot.slotId);
            fetchSlots(activeFloor);
            fetchStats();
            setSelected(null);
        } catch (e) { console.error(e); }
    };

    return (
        <Layout>
            <PageHeader label="🚗 Smart Parking" title="Parking Map" subtitle="Real-time slot availability · Tap a slot" />

            {/* Stats */}
            {stats ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <StatCard icon="🟢" value={<span className="text-[#2ECC71]">{stats.free}</span>} label="Free" variant="green" />
                    <StatCard icon="🔴" value={<span className="text-[#FF4757]">{stats.occupied}</span>} label="Occupied" variant="red" />
                    <StatCard icon="📊" value={stats.total} label="Total" />
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-shimmer rounded-2xl" />)}
                </div>
            )}

            {/* Floor tabs */}
            <TabRow
                tabs={[{ id: 'B1', label: 'Floor B1' }, { id: 'B2', label: 'Floor B2' }, { id: 'B3', label: 'Floor B3' }]}
                active={activeFloor}
                onChange={setActiveFloor}
            />

            {/* Legend */}
            <div className="flex gap-4 mb-3 text-xs text-[#8BA3B8]">
                {[['#2ECC71', 'Free'], ['#FF4757', 'Occupied'], ['#F5B800', 'Reserved'], ['#4A6580', 'Disabled']].map(([c, l]) => (
                    <span key={l} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm inline-block" style={{ background: c }} />
                        {l}
                    </span>
                ))}
            </div>

            {/* Grid */}
            <Card className="mb-4">
                <p className="font-['Space_Grotesk'] font-semibold mb-3">🅿️ Floor {activeFloor}</p>
                {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                ) : slots.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-[#8BA3B8] text-sm mb-3">No parking data yet.</p>
                        <Button onClick={handleSeed} variant="ghost" size="sm" disabled={seeding}>
                            {seeding ? <Spinner size="sm" /> : '🌱 Seed Parking Data'}
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
                        {slots.map(slot => (
                            <div
                                key={slot.slotId}
                                title={`${slot.slotId} — ${slot.status}`}
                                onClick={() => slot.status !== 'disabled' && setSelected(slot)}
                                className={`aspect-square rounded-[5px] flex items-center justify-center text-[0.45rem] font-bold text-black/70 cursor-pointer transition-transform hover:scale-110 ${SLOT_COLORS[slot.status]}`}
                            >
                                {slot.slotId.split('-')[1]}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Selected slot info */}
            {selected && (
                <Card className="mb-4 border-[rgba(0,201,177,0.3)]">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-['Space_Grotesk'] font-bold text-lg">{selected.slotId}</h3>
                        <StatusChip status={selected.status} />
                    </div>
                    <p className="text-[#8BA3B8] text-sm mb-3">Floor {activeFloor}</p>
                    <div className="flex gap-2">
                        {selected.status === 'free' && (
                            <Button onClick={() => handleReserve(selected)} size="sm">🅿️ Reserve</Button>
                        )}
                        {selected.status === 'reserved' && (
                            <Button onClick={() => handleFree(selected)} variant="ghost" size="sm">🟢 Free Slot</Button>
                        )}
                        <Button onClick={() => setSelected(null)} variant="outline" size="sm">Close ✕</Button>
                    </div>
                </Card>
            )}

            {/* Traffic chart */}
            <Card>
                <p className="font-['Space_Grotesk'] font-semibold mb-3">📊 Today's Traffic</p>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={TRAFFIC_DATA} barSize={8} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,201,177,0.06)" />
                        <XAxis dataKey="hour" tick={{ fill: '#8BA3B8', fontSize: 9 }} />
                        <YAxis tick={{ fill: '#8BA3B8', fontSize: 9 }} />
                        <Tooltip contentStyle={{ background: '#132845', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 8, color: '#E8F4F8' }} />
                        <Bar dataKey="entries" fill="rgba(0,201,177,0.7)" name="Entries" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="exits" fill="rgba(255,71,87,0.6)" name="Exits" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </Layout>
    );
};

export default Parking;
