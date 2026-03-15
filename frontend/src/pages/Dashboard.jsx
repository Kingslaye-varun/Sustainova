import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { StatCard, Card, Badge, EmptyState } from '../components/ui';
import Layout from '../components/layout/Layout';
import { parkingAPI, gymAPI, announcementAPI, ticketAPI } from '../services/api';
import {
    LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const ENERGY_DATA = [
    { time: '6AM',  consumed: 12, solar: 0.5  },
    { time: '8AM',  consumed: 28, solar: 2.1  },
    { time: '10AM', consumed: 55, solar: 8.4  },
    { time: '12PM', consumed: 72, solar: 14.2 },
    { time: '2PM',  consumed: 68, solar: 13.0 },
    { time: '4PM',  consumed: 80, solar: 9.1  },
    { time: '6PM',  consumed: 62, solar: 3.2  },
    { time: '8PM',  consumed: 40, solar: 0.2  },
];

const ALERTS = [
    { icon: '⚠️', text: 'Parking B2 — Gate sensor offline',     time: '5m ago',  type: 'red'  },
    { icon: '💡', text: 'Floor 14 lights on — no occupancy',    time: '12m ago', type: 'gold' },
    { icon: '🌬️', text: 'HVAC fault on Floor 9 — Ticket raised', time: '1h ago',  type: 'gold' },
];

const TOOLTIP_STYLE = {
    background: 'var(--sn-card)',
    border: '1px solid var(--sn-border)',
    borderRadius: 8,
    color: 'var(--sn-text)',
    fontSize: 12,
    boxShadow: 'var(--sn-shadow-card)',
};

const Dashboard = () => {
    const { user } = useAuth();
    const [parkingStats, setParkingStats] = useState(null);
    const [gymCycles,    setGymCycles]    = useState([]);
    const [announcements,setAnnouncements]= useState([]);
    const [tickets,      setTickets]      = useState([]);
    const [loading,      setLoading]      = useState(true);

    useEffect(() => {
        Promise.allSettled([
            parkingAPI.getStats(),
            gymAPI.getCycles(),
            announcementAPI.getAll(),
            ticketAPI.getAll({ limit: 3 }),
        ]).then(([park, gym, ann, tick]) => {
            if (park.status === 'fulfilled') setParkingStats(park.value.data.stats);
            if (gym.status  === 'fulfilled') setGymCycles(gym.value.data.cycles?.slice(0, 5) || []);
            if (ann.status  === 'fulfilled') setAnnouncements(ann.value.data.announcements?.slice(0, 4) || []);
            if (tick.status === 'fulfilled') setTickets(tick.value.data.tickets?.slice(0, 3) || []);
        }).finally(() => setLoading(false));
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const firstName = user?.name?.split(' ')[0] || 'User';
    const activeCycles = gymCycles.filter(c => c.isOccupied).length;
    const freeSlots = parkingStats?.available ?? '—';
    const totalSlots = parkingStats?.total ?? '—';

    const QUICK = [
        { to: '/parking',    icon: '🚗', label: 'Reserve Parking',    color: 'var(--sn-teal-dim)',  border: 'var(--sn-teal-mid)',   text: 'var(--sn-teal)'  },
        { to: '/gym',        icon: '🚴', label: 'Gym Dashboard',       color: 'var(--sn-green-dim)', border: 'rgba(46,204,113,0.25)', text: 'var(--sn-green)' },
        { to: '/support',    icon: '🎫', label: 'Submit Ticket',       color: 'var(--sn-gold-dim)',  border: 'rgba(245,184,0,0.25)', text: 'var(--sn-gold)'  },
        { to: '/healthcare', icon: '🤖', label: 'Health AI (NOVA)',     color: 'var(--sn-blue-dim)',  border: 'rgba(59,130,246,0.25)', text: 'var(--sn-blue)'  },
    ];

    return (
        <Layout>
            {/* ── Greeting ─────────────────────────────── */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 700, color: 'var(--sn-text)' }}>
                    {greeting}, {firstName} 👋
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--sn-muted)', marginTop: '0.25rem' }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Smart Building Overview
                </p>
            </div>

            {/* ── Alert strip ──────────────────────────── */}
            {ALERTS.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {ALERTS.map((a, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.625rem 1rem', borderRadius: '0.75rem',
                            background: a.type === 'red' ? 'var(--sn-red-dim)' : 'var(--sn-gold-dim)',
                            border: `1px solid ${a.type === 'red' ? 'rgba(255,71,87,0.25)' : 'rgba(245,184,0,0.25)'}`,
                        }}>
                            <span style={{ fontSize: '1rem' }}>{a.icon}</span>
                            <span style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--sn-text)', minWidth: 0 }}>{a.text}</span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--sn-dim)', flexShrink: 0 }}>{a.time}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Stat Cards ───────────────────────────── */}
            <div className="sn-grid sn-grid--stats" style={{ marginBottom: '1.25rem' }}>
                <StatCard icon="🚗" value={`${freeSlots}`} label="Parking Available" sub={`of ${totalSlots} total`} variant="teal"  trend={{ up: true,  value: '8 freed today'      }} />
                <StatCard icon="🚴" value={activeCycles}   label="Gym Cycles Active" sub="generating energy"         variant="green" trend={{ up: true,  value: '2.4 kWh today'       }} />
                <StatCard icon="🌿" value="42"             label="AQI Index"          sub="Air quality: Good"         variant="green" trend={{ up: true,  value: 'Excellent today'      }} />
                <StatCard icon="🎫" value={tickets.filter(t=>t.status==='open').length || '0'} label="Open Tickets" sub="support requests" variant="gold" />
            </div>

            {/* ── Main grid ────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem', marginBottom: '1rem' }}>

                {/* Energy chart */}
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--sn-text)' }}>⚡ Energy Today</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--sn-muted)', marginTop: '0.125rem' }}>Building consumption vs solar generation (kWh)</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <span style={{ fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--sn-red)', display: 'inline-block' }} />Consumed</span>
                            <span style={{ fontSize: '0.6875rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: 8, height: 8, borderRadius: 99, background: '#F5B800', display: 'inline-block' }} />Solar</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={ENERGY_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gConsumed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#FF4757" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#FF4757" stopOpacity={0}   />
                                </linearGradient>
                                <linearGradient id="gSolar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#F5B800" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#F5B800" stopOpacity={0}   />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--sn-divider)" />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--sn-dim)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--sn-dim)' }} axisLine={false} tickLine={false} width={30} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Area type="monotone" dataKey="consumed" stroke="#FF4757" fill="url(#gConsumed)" strokeWidth={2} name="Consumed kWh" />
                            <Area type="monotone" dataKey="solar"    stroke="#F5B800" fill="url(#gSolar)"    strokeWidth={2} name="Solar kWh"    />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--sn-text)', marginBottom: '1rem' }}>⚡ Quick Actions</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {QUICK.map(({ to, icon, label, color, border, text }) => (
                            <Link key={to} to={to} style={{
                                display: 'flex', alignItems: 'center', gap: '0.875rem',
                                padding: '0.875rem 1rem', borderRadius: '0.875rem',
                                background: color, border: `1px solid ${border}`,
                                textDecoration: 'none', transition: 'all 0.15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: text }}>{label}</span>
                                <span style={{ marginLeft: 'auto', color: text, opacity: 0.6 }}>→</span>
                            </Link>
                        ))}
                    </div>
                </Card>
            </div>

            {/* ── Second row ───────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                {/* Announcements */}
                <Card>
                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.875rem' }}>📢 Announcements</p>
                    {announcements.length === 0 ? (
                        <EmptyState icon="📢" message="No announcements yet." />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {announcements.map((a, i) => (
                                <div key={a._id || i} className="sn-row">
                                    <div style={{ width: 36, height: 36, borderRadius: '0.625rem', background: 'var(--sn-teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📋</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--sn-muted)', marginTop: '0.125rem' }}>{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    <Badge variant="teal">{a.target || 'all'}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* My Tickets */}
                <Card>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>🎫 My Tickets</p>
                        <Link to="/support" style={{ fontSize: '0.75rem', color: 'var(--sn-teal)' }}>View all →</Link>
                    </div>
                    {tickets.length === 0 ? (
                        <EmptyState icon="🎫" message="No tickets raised yet." />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {tickets.map((t, i) => (
                                <div key={t._id || i} className="sn-row">
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--sn-muted)' }}>{t.ticketId} · {t.category}</p>
                                    </div>
                                    <Badge variant={t.status === 'open' ? 'red' : t.status === 'in-progress' ? 'gold' : 'green'}>
                                        {t.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* ── Responsive override ───────────────────── */}
            <style>{`
                @media (max-width: 900px) {
                    .dash-main-grid { grid-template-columns: 1fr !important; }
                    .dash-second-row { grid-template-columns: 1fr !important; }
                }
            `}</style>

        </Layout>
    );
};

export default Dashboard;
