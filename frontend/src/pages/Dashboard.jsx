import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, StatCard, Badge, PageHeader } from '../components/ui';
import Layout from '../components/layout/Layout';
import { parkingAPI, gymAPI } from '../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ENERGY_DATA = [
    { time: '6AM', consumed: 12, gym: 0 },
    { time: '8AM', consumed: 28, gym: 0.5 },
    { time: '10AM', consumed: 55, gym: 1.2 },
    { time: '12PM', consumed: 72, gym: 1.8 },
    { time: '2PM', consumed: 68, gym: 2.0 },
    { time: '4PM', consumed: 80, gym: 2.4 },
    { time: '6PM', consumed: 62, gym: 1.8 },
    { time: '8PM', consumed: 40, gym: 0.9 },
];

const ALERTS = [
    { icon: '⚠️', title: 'Parking B2 — Gate sensor offline', time: '5 min ago', type: 'red' },
    { icon: '💡', title: 'Floor 14 lights on — no occupancy detected', time: '12 min ago', type: 'gold' },
];

const QUICK_LINKS = [
    { to: '/parking', icon: '🚗', label: 'Parking' },
    { to: '/gym', icon: '🚴', label: 'Gym Energy' },
    { to: '/healthcare', icon: '🏥', label: 'Health AI' },
    { to: '/lights', icon: '💡', label: 'Lights' },
    { to: '/aqi', icon: '🌿', label: 'AQI' },
    { to: '/support', icon: '❓', label: 'Support' },
];

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [parkingStats, setParkingStats] = useState({ free: '...', occupied: '...' });
    const [gymStats, setGymStats] = useState({ activeCycles: '...', todayKwh: '...' });
    const [aqi] = useState(42);

    useEffect(() => {
        parkingAPI.getStats()
            .then(r => setParkingStats(r.data.stats))
            .catch(() => setParkingStats({ free: 342, occupied: 658 }));

        gymAPI.getEnergy()
            .then(r => setGymStats(r.data.stats))
            .catch(() => setGymStats({ activeCycles: 18, todayKwh: '4.2' }));
    }, []);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return '🌅 Good Morning';
        if (h < 17) return '☀️ Good Afternoon';
        return '🌙 Good Evening';
    };

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
        <Layout aqi={aqi}>
            <PageHeader
                label={greeting()}
                title={`Welcome, ${user?.name?.split(' ')[0] || 'User'} 👋`}
                subtitle={`SUSTAINOVA · Floor ${user?.floor || '—'} · ${today}`}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard icon="🚗" value={<span className="text-[#2ECC71]">{parkingStats.free}</span>} label="Parking Free" variant="green" />
                <StatCard icon="🚴" value={<span className="text-[#F5B800]">{gymStats.activeCycles}<span className="text-sm font-normal">/40</span></span>} label="Cycles Active" variant="gold" />
                <StatCard icon="⚡" value={<span className="text-[#00C9B1]">{gymStats.todayKwh}<span className="text-xs font-normal">kWh</span></span>} label="Gym Energy Today" variant="teal" />
                <StatCard icon="🌿" value={<span className="text-[#2ECC71]">{aqi}</span>} label="AQI Indoor" variant="green" />
            </div>

            {/* Energy Chart */}
            <Card className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-['Space_Grotesk'] font-semibold">⚡ Energy Today</h3>
                    <Badge variant="teal">Live</Badge>
                </div>
                <ResponsiveContainer width="100%" height={130}>
                    <LineChart data={ENERGY_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,201,177,0.06)" />
                        <XAxis dataKey="time" tick={{ fill: '#8BA3B8', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#8BA3B8', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: '#132845', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 8, color: '#E8F4F8' }} />
                        <Line type="monotone" dataKey="consumed" stroke="#00C9B1" strokeWidth={2} dot={false} name="Consumed (kWh)" />
                        <Line type="monotone" dataKey="gym" stroke="#F5B800" strokeWidth={2} dot={false} name="Gym Gen (kWh)" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            {/* Quick Access */}
            <h3 className="font-['Space_Grotesk'] font-semibold mb-3">⚡ Quick Access</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
                {QUICK_LINKS.map(({ to, icon, label }) => (
                    <Card key={to} onClick={() => navigate(to)} className="text-center py-3 cursor-pointer hover:border-[rgba(0,201,177,0.3)]">
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className="text-[11px] font-semibold text-[#8BA3B8]">{label}</div>
                    </Card>
                ))}
            </div>

            {/* Alerts */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-['Space_Grotesk'] font-semibold">🔔 Live Alerts</h3>
                <Badge variant="red">2 New</Badge>
            </div>
            <Card className="divide-y divide-[rgba(0,201,177,0.08)] mb-4">
                {ALERTS.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base bg-[rgba(${a.type === 'red' ? '255,71,87' : '245,184,0'},0.12)]`}>
                            {a.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.title}</p>
                            <p className="text-xs text-[#4A6580]">{a.time}</p>
                        </div>
                        <Badge variant={a.type === 'red' ? 'red' : 'gold'}>{a.type === 'red' ? 'Urgent' : 'Info'}</Badge>
                    </div>
                ))}
            </Card>

            {/* Plants Promo */}
            <Card className="bg-gradient-to-br from-[rgba(46,204,113,0.1)] to-[rgba(0,168,150,0.06)] border-[rgba(46,204,113,0.25)] mb-4">
                <div className="flex items-center gap-4">
                    <div className="text-4xl">🌿</div>
                    <div>
                        <p className="font-semibold mb-1">Green Walls are Thriving!</p>
                        <p className="text-[#8BA3B8] text-sm">Our vertical gardens absorbed <strong className="text-[#2ECC71]">128 kg CO₂</strong> this month. Water plants, save Earth. 🌍</p>
                    </div>
                </div>
            </Card>
        </Layout>
    );
};

export default Dashboard;
