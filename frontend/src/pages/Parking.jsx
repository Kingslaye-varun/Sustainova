import { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, PageHeader, StatCard, TabRow, StatusChip, Spinner, EmptyState } from '../components/ui';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
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

const Parking = () => {
    const { user } = useAuth();
    const canSeed = user?.role === 'admin' || user?.role === 'maintenance';
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
        } catch (e) { console.error(e.response?.data?.message); }
        finally { setSeeding(false); }
    };

    const handleReserve = async (slot) => {
        if (slot.status !== 'free') return;
        try { await parkingAPI.reserve(slot.slotId, {}); fetchSlots(activeFloor); fetchStats(); setSelected(null); }
        catch (e) { console.error(e); }
    };

    const handleFree = async (slot) => {
        try { await parkingAPI.free(slot.slotId); fetchSlots(activeFloor); fetchStats(); setSelected(null); }
        catch (e) { console.error(e); }
    };

    const TOOLTIP_STYLE = { background: '#132845', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 8, color: '#E8F4F8', fontSize: 12 };

    return (
        <Layout>
            <PageHeader label="🚗 Smart Parking" title="Parking Map" subtitle="Real-time slot availability · Tap a slot" />

            {/* Stats */}
            {stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    <StatCard icon="🟢" value={<span style={{ color: 'var(--sn-green)' }}>{stats.free}</span>} label="Free" variant="green" />
                    <StatCard icon="🔴" value={<span style={{ color: 'var(--sn-red)' }}>{stats.occupied}</span>} label="Occupied" variant="red" />
                    <StatCard icon="📊" value={stats.total} label="Total" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    {[...Array(3)].map((_, i) => <div key={i} className="sn-skeleton" style={{ height: '5rem' }} />)}
                </div>
            )}

            {/* Floor tabs */}
            <TabRow
                tabs={[{ id: 'B1', label: 'Floor B1' }, { id: 'B2', label: 'Floor B2' }, { id: 'B3', label: 'Floor B3' }]}
                active={activeFloor}
                onChange={setActiveFloor}
            />

            {/* Legend */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.75rem', color: 'var(--sn-muted)' }}>
                {[['#2ECC71', 'Free'], ['#FF4757', 'Occupied'], ['#F5B800', 'Reserved'], ['#4A6580', 'Disabled']].map(([c, l]) => (
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />
                        {l}
                    </span>
                ))}
            </div>

            {/* Slot grid */}
            <Card style={{ marginBottom: '1rem' }}>
                <p className="sn-section-title">🅿️ Floor {activeFloor}</p>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>
                ) : slots.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                        <p style={{ color: 'var(--sn-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>No parking data yet.</p>
                        {canSeed && (
                            <Button onClick={handleSeed} variant="ghost" size="sm" disabled={seeding}>
                                {seeding ? <Spinner size="sm" /> : '🌱 Seed Parking Data'}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: '0.375rem' }}>
                        {slots.map(slot => (
                            <div
                                key={slot.slotId}
                                title={`${slot.slotId} — ${slot.status}`}
                                onClick={() => slot.status !== 'disabled' && setSelected(slot)}
                                className={`sn-slot sn-slot--${slot.status}`}
                            >
                                {slot.slotId.split('-')[1]}
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Selected slot */}
            {selected && (
                <Card style={{ marginBottom: '1rem', borderColor: 'rgba(0,201,177,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem' }}>{selected.slotId}</h3>
                        <StatusChip status={selected.status} />
                    </div>
                    <p style={{ color: 'var(--sn-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>Floor {activeFloor}</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {selected.status === 'free' && <Button onClick={() => handleReserve(selected)} size="sm">🅿️ Reserve</Button>}
                        {selected.status === 'reserved' && <Button onClick={() => handleFree(selected)} variant="ghost" size="sm">🟢 Free Slot</Button>}
                        <Button onClick={() => setSelected(null)} variant="outline" size="sm">Close ✕</Button>
                    </div>
                </Card>
            )}

            {/* Traffic chart */}
            <Card>
                <p className="sn-section-title">📊 Today's Traffic</p>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={TRAFFIC_DATA} barSize={8} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,201,177,0.06)" />
                        <XAxis dataKey="hour" tick={{ fill: '#8BA3B8', fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#8BA3B8', fontSize: 9 }} axisLine={false} tickLine={false} width={24} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Bar dataKey="entries" fill="rgba(0,201,177,0.7)" name="Entries" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="exits" fill="rgba(255,71,87,0.6)" name="Exits" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </Layout>
    );
};

export default Parking;
