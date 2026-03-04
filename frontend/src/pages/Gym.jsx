import { useState, useEffect } from 'react';
import { Card, StatCard, Badge, PageHeader, Spinner } from '../components/ui';
import Layout from '../components/layout/Layout';
import { gymAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Gym = () => {
    const [cycles, setCycles] = useState([]);
    const [energy, setEnergy] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        Promise.all([gymAPI.getCycles(), gymAPI.getEnergy()])
            .then(([cRes, eRes]) => {
                setCycles(cRes.data.cycles);
                setEnergy(eRes.data.stats);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
        // Live update every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <Layout>
            <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
        </Layout>
    );

    const active = cycles.filter(c => c.occupied).length;

    return (
        <Layout>
            <PageHeader label="🚴 Gym Energy" title="Cycle Power Station" subtitle="Your pedaling powers the building ⚡" />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard icon="⚡" value={<span className="text-[#F5B800]">{energy?.todayKwh || '—'}<span className="text-xs font-normal"> kWh</span></span>} label="Today" variant="gold" />
                <StatCard icon="📅" value={<span className="text-[#00C9B1]">{energy?.monthKwh || '—'}<span className="text-xs font-normal"> kWh</span></span>} label="This Month" variant="teal" />
                <StatCard icon="📆" value={<span className="text-[#2ECC71]">{energy?.yearMwh || '—'}<span className="text-xs font-normal"> MWh</span></span>} label="This Year" variant="green" />
                <StatCard icon="🌟" value={<span className="text-[#F5B800]">{active}<span className="text-sm font-normal">/{cycles.length}</span></span>} label="Active Now" />
            </div>

            {/* Fun fact */}
            <Card className="bg-[rgba(245,184,0,0.06)] border-[rgba(245,184,0,0.25)] mb-4 text-center py-5">
                <div className="text-3xl mb-1">💡</div>
                <p className="text-[#8BA3B8] font-medium mb-1">Today's cycling powered</p>
                <p className="font-['Space_Grotesk'] text-2xl font-bold text-[#F5B800]">
                    {energy?.lightbulbsEquivalent || 42} lightbulbs
                </p>
                <p className="text-[#4A6580] text-xs mt-1">for 1 hour each!</p>
            </Card>

            {/* Live cycles grid */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-['Space_Grotesk'] font-semibold">🚴 Cycle Status (Live)</h3>
                <Badge variant="red">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4757] animate-pulse inline-block mr-1" />
                    {active} active
                </Badge>
            </div>
            <Card className="mb-4">
                <div className="grid grid-cols-5 gap-2.5 justify-items-center">
                    {cycles.map(cycle => (
                        <div key={cycle.cycleId} className="flex flex-col items-center gap-1">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border-2 transition-all ${cycle.occupied
                                    ? 'bg-[rgba(255,71,87,0.12)] border-[#FF4757] animate-pulse shadow-[0_0_8px_rgba(255,71,87,0.3)]'
                                    : 'bg-[rgba(46,204,113,0.08)] border-[rgba(46,204,113,0.4)]'
                                }`}>
                                🚴
                            </div>
                            <span className={`text-[9px] font-bold leading-none ${cycle.occupied ? 'text-[#FF4757]' : 'text-[#2ECC71]'}`}>
                                {cycle.cycleId}
                            </span>
                            {cycle.occupied && cycle.watts > 0 && (
                                <span className="text-[8px] text-[#F5B800] leading-none">{cycle.watts}W</span>
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Monthly chart */}
            <Card>
                <h3 className="font-['Space_Grotesk'] font-semibold mb-3">📈 Monthly Energy (kWh)</h3>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={energy?.monthlyChart || []} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,201,177,0.06)" />
                        <XAxis dataKey="month" tick={{ fill: '#8BA3B8', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#8BA3B8', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#132845', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 8, color: '#E8F4F8' }} />
                        <Bar dataKey="kwh" fill="rgba(245,184,0,0.7)" name="Energy (kWh)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </Layout>
    );
};

export default Gym;
