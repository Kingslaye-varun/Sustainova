import { useState, useEffect } from 'react';
import { Card, StatCard, Button, Input, Textarea, Select, PageHeader, StatusChip, Badge, TabRow, Spinner, EmptyState } from '../components/ui';
import Layout from '../components/layout/Layout';
import { userAPI, ticketAPI, announcementAPI, parkingAPI, gymAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SYSTEMS = [
    { name: 'Parking Sensors', icon: '🚗', status: 'online', detail: '999/1000 sensors active' },
    { name: 'Smart Lighting', icon: '💡', status: 'online', detail: '28 floors monitored' },
    { name: 'Gym Energy Module', icon: '🚴', status: 'online', detail: '40 cycles connected' },
    { name: 'AQI Sensors', icon: '🌿', status: 'online', detail: 'Indoor + outdoor live' },
    { name: 'BMS (Building)', icon: '🏢', status: 'online', detail: 'AI-optimized mode' },
    { name: 'NOVA Health AI', icon: '🤖', status: 'online', detail: 'Grok API connected' },
    { name: 'Parking Gate B2', icon: '⚠️', status: 'offline', detail: 'Sensor fault · Ticket TK-001' },
];

const ENERGY_WEEK = [
    { day: 'Mon', consumed: 42, solar: 8 }, { day: 'Tue', consumed: 38, solar: 12 },
    { day: 'Wed', consumed: 45, solar: 10 }, { day: 'Thu', consumed: 52, solar: 6 },
    { day: 'Fri', consumed: 48, solar: 14 }, { day: 'Sat', consumed: 22, solar: 16 },
    { day: 'Sun', consumed: 18, solar: 15 },
];

const Admin = () => {
    const [tab, setTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [annForm, setAnnForm] = useState({ title: '', message: '', target: 'all' });

    const fetchUsers = (q) => {
        setLoading(true);
        userAPI.getAll(q ? { search: q } : {})
            .then(r => setUsers(r.data.users))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const fetchTickets = () => {
        ticketAPI.getAll()
            .then(r => setTickets(r.data.tickets))
            .catch(console.error);
        ticketAPI.getStats()
            .then(r => setStats(r.data.stats))
            .catch(console.error);
    };

    const fetchAnnouncements = () => {
        announcementAPI.getAll()
            .then(r => setAnnouncements(r.data.announcements))
            .catch(console.error);
    };

    useEffect(() => {
        if (tab === 'users') fetchUsers();
        if (tab === 'tickets') fetchTickets();
        if (tab === 'announce') fetchAnnouncements();
    }, [tab]);

    const resolveTicket = async (id) => {
        try { await ticketAPI.update(id, { status: 'resolved' }); fetchTickets(); } catch (e) { console.error(e); }
    };

    const sendAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await announcementAPI.create(annForm);
            setAnnForm({ title: '', message: '', target: 'all' });
            fetchAnnouncements();
            alert('Announcement sent! 📢');
        } catch (e) { console.error(e.response?.data); }
    };

    const handleAnn = e => setAnnForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const ROLE_COLOR = { admin: 'gold', employee: 'teal', maintenance: 'red', visitor: 'purple' };

    return (
        <Layout>
            <PageHeader label="⚙️ Admin" title="Admin Panel" subtitle="Building management · Full system control" />

            {/* Overview stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <StatCard icon="👥" value="2,847" label="Active Users" />
                <StatCard icon="⚠️" value={<span className="text-[#FF4757]">3</span>} label="Open Alerts" variant="red" />
                <StatCard icon="🎫" value={<span className="text-[#00C9B1]">{stats?.open || '—'}</span>} label="Open Tickets" variant="teal" />
                <StatCard icon="✅" value={<span className="text-[#2ECC71]">98.2%</span>} label="Uptime" variant="green" />
            </div>

            <TabRow
                tabs={[{ id: 'overview', label: 'Overview' }, { id: 'users', label: 'Users' }, { id: 'tickets', label: 'Tickets' }, { id: 'announce', label: 'Announce' }]}
                active={tab}
                onChange={setTab}
            />

            {/* OVERVIEW */}
            {tab === 'overview' && (
                <>
                    <Card className="mb-4">
                        <h3 className="font-['Space_Grotesk'] font-semibold mb-3">⚡ Systems Status</h3>
                        <div className="divide-y divide-[rgba(0,201,177,0.08)]">
                            {SYSTEMS.map(s => (
                                <div key={s.name} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.status === 'online' ? 'bg-[rgba(46,204,113,0.1)]' : 'bg-[rgba(255,71,87,0.1)]'}`}>
                                        {s.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{s.name}</p>
                                        <p className="text-xs text-[#4A6580]">{s.detail}</p>
                                    </div>
                                    <Badge variant={s.status === 'online' ? 'green' : 'red'}>
                                        <span className={`w-1.5 h-1.5 rounded-full inline-block mr-1 ${s.status === 'online' ? 'bg-[#2ECC71] animate-pulse' : 'bg-[#FF4757]'}`} />
                                        {s.status === 'online' ? 'Online' : 'Offline'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <h3 className="font-['Space_Grotesk'] font-semibold mb-3">📊 Energy This Week (MWh)</h3>
                        <ResponsiveContainer width="100%" height={140}>
                            <LineChart data={ENERGY_WEEK}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,201,177,0.06)" />
                                <XAxis dataKey="day" tick={{ fill: '#8BA3B8', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#8BA3B8', fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#132845', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 8, color: '#E8F4F8' }} />
                                <Line type="monotone" dataKey="consumed" stroke="#FF4757" strokeWidth={2} dot={false} name="Consumed" />
                                <Line type="monotone" dataKey="solar" stroke="#F5B800" strokeWidth={2} dot={false} name="Solar" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}

            {/* USERS */}
            {tab === 'users' && (
                <Card>
                    <div className="flex gap-2 mb-4">
                        <input
                            className="flex-1 bg-[#0d1e35] border border-[rgba(0,201,177,0.12)] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4A6580] focus:outline-none focus:border-[#00C9B1]"
                            placeholder="🔍 Search by name or ID..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); fetchUsers(e.target.value); }}
                        />
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    ) : users.length === 0 ? (
                        <EmptyState icon="👥" message="No users found" />
                    ) : (
                        <div className="divide-y divide-[rgba(0,201,177,0.08)]">
                            {users.map(u => (
                                <div key={u._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00C9B1] to-[#00A896] flex items-center justify-center text-[#0A1628] text-xs font-bold flex-shrink-0">
                                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{u.name}</p>
                                        <p className="text-xs text-[#4A6580]">{u.userId} · {u.department}</p>
                                    </div>
                                    <Badge variant={ROLE_COLOR[u.role] || 'teal'}>{u.role}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* TICKETS */}
            {tab === 'tickets' && (
                <div className="flex flex-col gap-3">
                    {tickets.length === 0 ? (
                        <EmptyState icon="🎫" message="No tickets yet" />
                    ) : (
                        tickets.map(t => (
                            <Card key={t._id}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold">{t.ticketId} — {t.category}</span>
                                    <StatusChip status={t.status} />
                                </div>
                                <p className="text-sm text-[#8BA3B8] mb-2">{t.title}</p>
                                <div className="flex gap-2">
                                    {t.status !== 'resolved' && (
                                        <Button onClick={() => resolveTicket(t._id)} size="sm">✅ Resolve</Button>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* ANNOUNCEMENTS */}
            {tab === 'announce' && (
                <>
                    <form onSubmit={sendAnnouncement}>
                        <Card className="mb-4">
                            <h3 className="font-['Space_Grotesk'] font-semibold mb-4">📢 Send Announcement</h3>
                            <Input name="title" label="Title" placeholder="Announcement title" value={annForm.title} onChange={handleAnn} required />
                            <Textarea name="message" label="Message" placeholder="Type your message..." value={annForm.message} onChange={handleAnn} rows={4} />
                            <Select name="target" label="Target Audience" value={annForm.target} onChange={handleAnn}>
                                <option value="all">All Users</option>
                                <option value="employees">Employees Only</option>
                                <option value="maintenance">Maintenance Staff</option>
                                <option value="admins">Admins Only</option>
                            </Select>
                            <Button type="submit" fullWidth>📢 Send to All</Button>
                        </Card>
                    </form>

                    <h3 className="font-['Space_Grotesk'] font-semibold mb-3">📜 Recent Announcements</h3>
                    <div className="flex flex-col gap-3">
                        {announcements.map(a => (
                            <Card key={a._id}>
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-sm">{a.title}</p>
                                    <span className="text-xs text-[#4A6580]">{new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                                </div>
                                <p className="text-xs text-[#8BA3B8] mb-2">{a.message}</p>
                                <Badge variant="teal">{a.target}</Badge>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </Layout>
    );
};

export default Admin;
