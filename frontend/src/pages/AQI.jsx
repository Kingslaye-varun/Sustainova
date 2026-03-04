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

    return (
        <Layout>
            <PageHeader label="🌍 Environment" title="AQI & Carbon Footprint" subtitle="Track air quality & your carbon impact" />

            <div className="flex gap-1 bg-[#132845] rounded-full p-1 mb-4">
                {['aqi', 'carbon'].map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${tab === t ? 'bg-[#00C9B1] text-[#0A1628]' : 'text-[#4A6580] hover:text-[#8BA3B8]'}`}>
                        {t === 'aqi' ? '🌿 Air Quality' : '🚗 Carbon Tracker'}
                    </button>
                ))}
            </div>

            {tab === 'aqi' && (
                <>
                    <Card className="mb-4 bg-[rgba(46,204,113,0.06)] border-[rgba(46,204,113,0.25)]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-['Space_Grotesk'] font-semibold">🌿 Air Quality Index</h3>
                            <Badge variant="green">Good</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                                <div className="font-['Space_Grotesk'] text-5xl font-bold text-[#2ECC71]">{indoorAqi}</div>
                                <div className="text-[10px] font-medium text-[#4A6580] uppercase tracking-wide mt-1">Indoor AQI</div>
                                <div className="text-xs text-[#2ECC71] mt-0.5">✅ Excellent</div>
                            </div>
                            <div className="text-center">
                                <div className="font-['Space_Grotesk'] text-5xl font-bold text-[#F5B800]">{outdoorAqi}</div>
                                <div className="text-[10px] font-medium text-[#4A6580] uppercase tracking-wide mt-1">Outdoor AQI</div>
                                <div className="text-xs text-[#F5B800] mt-0.5">⚠️ Moderate</div>
                            </div>
                        </div>
                        <div className="bg-[#0d1e35] rounded-xl px-4 py-2.5 text-sm text-[#8BA3B8]">
                            💡 <strong className="text-[#E8F4F8]">Tip:</strong> Indoor air is excellent — our green facade system is actively purifying air on your floor.
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-['Space_Grotesk'] font-semibold mb-4">🔬 Pollutant Breakdown</h3>
                        {POLLUTANTS.map(p => (
                            <div key={p.name} className="mb-3 last:mb-0">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{p.name}</span>
                                    <span className="font-semibold" style={{ color: p.color }}>{p.value} {p.unit} — {p.status}</span>
                                </div>
                                <div className="h-1.5 bg-[#0d1e35] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (p.value / p.max) * 100)}%`, background: p.color }} />
                                </div>
                            </div>
                        ))}
                    </Card>
                </>
            )}

            {tab === 'carbon' && (
                <>
                    <Card className="mb-4">
                        <h3 className="font-['Space_Grotesk'] font-semibold mb-3">🚗 Log Today's Commute</h3>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {MODES.map(m => (
                                <div key={m.id} onClick={() => setMode(m.id)}
                                    className={`rounded-xl p-2.5 text-center cursor-pointer border-2 transition-all ${mode === m.id ? 'border-[#00C9B1] bg-[rgba(0,201,177,0.1)]' : 'border-[rgba(0,201,177,0.1)] bg-[#0d1e35] hover:border-[rgba(0,201,177,0.3)]'}`}>
                                    <div className="text-xl mb-0.5">{m.icon}</div>
                                    <div className="text-[10px] font-semibold text-[#8BA3B8]">{m.label}</div>
                                </div>
                            ))}
                        </div>
                        <Input label="Distance (km)" type="number" placeholder="e.g. 12" value={km} onChange={e => setKm(e.target.value)} min="0" step="0.5" />
                        <Button fullWidth onClick={calculate}>Calculate My Footprint 🌱</Button>

                        {result && (
                            <div className="mt-4 p-4 bg-[#0d1e35] rounded-2xl text-center animate-[fadeIn_0.3s_ease]">
                                <div className="text-3xl mb-1">{result.icon}</div>
                                <div className={`font-['Space_Grotesk'] text-3xl font-bold ${parseFloat(result.kg) === 0 ? 'text-[#00C9B1]' : parseFloat(result.kg) < 0.5 ? 'text-[#2ECC71]' : parseFloat(result.kg) < 1.5 ? 'text-[#F5B800]' : 'text-[#FF4757]'}`}>
                                    {parseFloat(result.kg) === 0 ? '0 kg CO₂' : `${result.kg} kg CO₂`}
                                </div>
                                <div className="text-[#8BA3B8] text-sm mt-1">{result.dist} km by {result.mode}</div>
                                {parseFloat(result.kg) === 0 && <div className="text-[#00C9B1] text-sm mt-2">🌟 Zero emission! Sustainability hero!</div>}
                                <Button variant="ghost" size="sm" className="mt-3" onClick={() => alert('Trip logged! ✅')}>Log This Trip 📝</Button>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h3 className="font-['Space_Grotesk'] font-semibold mb-3">📊 My Monthly Carbon (kg CO₂)</h3>
                        <ResponsiveContainer width="100%" height={130}>
                            <BarChart data={CARBON_HISTORY} barSize={22}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,201,177,0.06)" />
                                <XAxis dataKey="month" tick={{ fill: '#8BA3B8', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#8BA3B8', fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#132845', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 8, color: '#E8F4F8' }} />
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
