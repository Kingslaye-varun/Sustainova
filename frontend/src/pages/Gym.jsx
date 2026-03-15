import { useState, useEffect } from 'react';
import { Card, StatCard, Badge, PageHeader, Spinner } from '../components/ui';
import Layout from '../components/layout/Layout';
import { gymAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TOOLTIP_STYLE = { background: '#132845', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 8, color: '#E8F4F8', fontSize: 12 };

const Gym = () => {
    const [cycles, setCycles] = useState([]);
    const [energy, setEnergy] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        Promise.all([gymAPI.getCycles(), gymAPI.getEnergy()])
            .then(([cRes, eRes]) => { setCycles(cRes.data.cycles); setEnergy(eRes.data.stats); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
                <Spinner size="lg" />
            </div>
        </Layout>
    );

    const active = cycles.filter(c => c.occupied).length;

    return (
        <Layout>
            <PageHeader label="🚴 Gym Energy" title="Cycle Power Station" subtitle="Your pedaling powers the building ⚡" />

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <StatCard icon="⚡" value={<span style={{ color: 'var(--sn-gold)' }}>{energy?.todayKwh || '—'}<span style={{ fontSize: '0.75rem', fontWeight: 400 }}> kWh</span></span>} label="Today" variant="gold" />
                <StatCard icon="📅" value={<span style={{ color: 'var(--sn-teal)' }}>{energy?.monthKwh || '—'}<span style={{ fontSize: '0.75rem', fontWeight: 400 }}> kWh</span></span>} label="This Month" variant="teal" />
                <StatCard icon="📆" value={<span style={{ color: 'var(--sn-green)' }}>{energy?.yearMwh || '—'}<span style={{ fontSize: '0.75rem', fontWeight: 400 }}> MWh</span></span>} label="This Year" variant="green" />
                <StatCard icon="🌟" value={<span style={{ color: 'var(--sn-gold)' }}>{active}<span style={{ fontSize: '0.875rem', fontWeight: 400 }}>/{cycles.length}</span></span>} label="Active Now" />
            </div>

            {/* Fun fact */}
            <Card style={{
                background: 'rgba(245,184,0,0.06)',
                border: '1px solid rgba(245,184,0,0.25)',
                marginBottom: '1rem',
                textAlign: 'center',
                padding: '1.25rem 1rem',
            }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>💡</div>
                <p style={{ color: 'var(--sn-muted)', fontWeight: 500, marginBottom: '0.25rem' }}>Today's cycling powered</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--sn-gold)' }}>
                    {energy?.lightbulbsEquivalent || 42} lightbulbs
                </p>
                <p style={{ color: 'var(--sn-dim)', fontSize: '0.75rem', marginTop: '0.25rem' }}>for 1 hour each!</p>
            </Card>

            {/* Cycles grid */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <p className="sn-section-title" style={{ marginBottom: 0 }}>🚴 Cycle Status (Live)</p>
                <Badge variant="red">
                    <span className="sn-pulse-dot sn-pulse" style={{ background: 'var(--sn-red)', marginRight: '0.25rem' }} />
                    {active} active
                </Badge>
            </div>
            <Card style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.625rem', justifyItems: 'center' }}>
                    {cycles.map(cycle => (
                        <div key={cycle.cycleId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                            <div className={`sn-cycle ${cycle.occupied ? 'sn-cycle--active sn-pulse' : 'sn-cycle--free'}`}>
                                🚴
                            </div>
                            <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: cycle.occupied ? 'var(--sn-red)' : 'var(--sn-green)', lineHeight: 1 }}>
                                {cycle.cycleId}
                            </span>
                            {cycle.occupied && cycle.watts > 0 && (
                                <span style={{ fontSize: '0.5rem', color: 'var(--sn-gold)', lineHeight: 1 }}>{cycle.watts}W</span>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Monthly chart */}
            <Card>
                <p className="sn-section-title">📈 Monthly Energy (kWh)</p>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={energy?.monthlyChart || []} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,201,177,0.06)" />
                        <XAxis dataKey="month" tick={{ fill: '#8BA3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#8BA3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Bar dataKey="kwh" fill="rgba(245,184,0,0.7)" name="Energy (kWh)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </Layout>
    );
};

export default Gym;
