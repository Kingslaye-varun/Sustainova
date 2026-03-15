import { useState } from 'react';
import { Card, StatCard, Button, Input, PageHeader, Badge } from '../components/ui';
import Layout from '../components/layout/Layout';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const POLLUTANTS = [
    { name: 'PM2.5', value: 8, unit: 'μg/m³', max: 35, status: 'Good', color: '#2ECC71' },
    { name: 'PM10', value: 18, unit: 'μg/m³', max: 150, status: 'Good', color: '#2ECC71' },
    { name: 'CO₂', value: 480, unit: 'ppm', max: 1000, status: 'Good', color: '#2ECC71' },
    { name: 'VOC', value: 42, unit: 'ppb', max: 500, status: 'Good', color: '#2ECC71' },
    { name: 'Temp', value: 23, unit: '°C', max: 30, status: 'Optimal', color: '#00C9B1' },
    { name: 'Hum', value: 52, unit: '%', max: 70, status: 'Optimal', color: '#00C9B1' },
];

const MODES = [
    { id: 'walk', icon: '🚶', label: 'Walk', factor: 0 },
    { id: 'bike', icon: '🚲', label: 'Bike', factor: 0 },
    { id: 'metro', icon: '🚇', label: 'Metro', factor: 0.041 },
    { id: 'bus', icon: '🚌', label: 'Bus', factor: 0.089 },
    { id: 'car', icon: '🚗', label: 'Car', factor: 0.192 },
    { id: 'ev', icon: '⚡', label: 'EV', factor: 0.030 },
];

const CARBON_HISTORY = [
    { month: 'Oct', co2: 28 }, { month: 'Nov', co2: 18 }, { month: 'Dec', co2: 32 },
    { month: 'Jan', co2: 15 }, { month: 'Feb', co2: 12 }, { month: 'Mar', co2: 8 },
];

const TOOLTIP_STYLE = { background: '#132845', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 8, color: '#E8F4F8', fontSize: 12 };

const AQI = () => {
    const [tab, setTab] = useState('aqi');
    const [mode, setMode] = useState('walk');
    const [km, setKm] = useState('');
    const [result, setResult] = useState(null);
    const indoorAqi = 42, outdoorAqi = 78;

    const calculate = () => {
        const dist = parseFloat(km);
        if (!dist || dist <= 0) return;
        const factor = MODES.find(m => m.id === mode)?.factor || 0;
        const kg = (dist * factor).toFixed(3);
        setResult({ kg, dist, mode, icon: MODES.find(m => m.id === mode)?.icon });
    };

    const resultColor = result
        ? parseFloat(result.kg) === 0 ? 'var(--sn-teal)'
            : parseFloat(result.kg) < 0.5 ? 'var(--sn-green)'
                : parseFloat(result.kg) < 1.5 ? 'var(--sn-gold)'
                    : 'var(--sn-red)'
        : 'var(--sn-teal)';

    return (
        <Layout>
            <PageHeader label="🌍 Environment" title="AQI & Carbon Footprint" subtitle="Track air quality & your carbon impact" />

            {/* Tab toggle */}
            <div className="sn-tabs">
                {['aqi', 'carbon'].map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`sn-tabs__tab ${tab === t ? 'sn-tabs__tab--active' : ''}`}>
                        {t === 'aqi' ? '🌿 Air Quality' : '🚗 Carbon Tracker'}
                    </button>
                ))}
            </div>

            {tab === 'aqi' && (
                <>
                    {/* AQI overview */}
                    <Card style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.25)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <p className="sn-section-title" style={{ marginBottom: 0 }}>🌿 Air Quality Index</p>
                            <Badge variant="green">Good</Badge>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 700, color: 'var(--sn-green)' }}>{indoorAqi}</div>
                                <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--sn-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '0.25rem' }}>Indoor AQI</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--sn-green)', marginTop: '0.25rem' }}>✅ Excellent</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 700, color: 'var(--sn-gold)' }}>{outdoorAqi}</div>
                                <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--sn-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: '0.25rem' }}>Outdoor AQI</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--sn-gold)', marginTop: '0.25rem' }}>⚠️ Moderate</div>
                            </div>
                        </div>
                        <div className="sn-tip">
                            💡 <strong style={{ color: 'var(--sn-text)' }}>Tip:</strong> Indoor air is excellent — our green facade system is actively purifying air on your floor.
                        </div>
                    </Card>

                    {/* Pollutants */}
                    <Card>
                        <p className="sn-section-title">🔬 Pollutant Breakdown</p>
                        {POLLUTANTS.map((p, i) => (
                            <div key={p.name} style={{ marginBottom: i < POLLUTANTS.length - 1 ? '0.875rem' : 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                                    <span style={{ fontWeight: 600, color: p.color }}>{p.value} {p.unit} — {p.status}</span>
                                </div>
                                <div className="sn-progress-track" style={{ marginBottom: 0 }}>
                                    <div style={{ height: '100%', borderRadius: 99, background: p.color, width: `${Math.min(100, (p.value / p.max) * 100)}%`, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        ))}
                    </Card>
                </>
            )}

            {tab === 'carbon' && (
                <>
                    <Card style={{ marginBottom: '1rem' }}>
                        <p className="sn-section-title">🚗 Log Today's Commute</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                            {MODES.map(m => (
                                <div key={m.id} onClick={() => setMode(m.id)} className={`sn-mode-card ${mode === m.id ? 'sn-mode-card--active' : ''}`}>
                                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{m.icon}</div>
                                    <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--sn-muted)' }}>{m.label}</div>
                                </div>
                            ))}
                        </div>
                        <Input label="Distance (km)" type="number" placeholder="e.g. 12" value={km} onChange={e => setKm(e.target.value)} min="0" step="0.5" />
                        <Button fullWidth onClick={calculate}>Calculate My Footprint 🌱</Button>

                        {result && (
                            <div className="sn-fade-in" style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'var(--sn-dark)',
                                borderRadius: '1rem',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{result.icon}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: resultColor }}>
                                    {parseFloat(result.kg) === 0 ? '0 kg CO₂' : `${result.kg} kg CO₂`}
                                </div>
                                <div style={{ color: 'var(--sn-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{result.dist} km by {result.mode}</div>
                                {parseFloat(result.kg) === 0 && (
                                    <div style={{ color: 'var(--sn-teal)', fontSize: '0.875rem', marginTop: '0.5rem' }}>🌟 Zero emission! Sustainability hero!</div>
                                )}
                                <Button variant="ghost" size="sm" style={{ marginTop: '0.75rem' }} onClick={() => alert('Trip logged! ✅')}>
                                    Log This Trip 📝
                                </Button>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <p className="sn-section-title">📊 My Monthly Carbon (kg CO₂)</p>
                        <ResponsiveContainer width="100%" height={130}>
                            <BarChart data={CARBON_HISTORY} barSize={22}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,201,177,0.06)" />
                                <XAxis dataKey="month" tick={{ fill: '#8BA3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#8BA3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Bar dataKey="co2" fill="rgba(0,201,177,0.7)" name="CO₂ (kg)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}
        </Layout>
    );
};

export default AQI;
