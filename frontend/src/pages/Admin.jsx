import { useState, useEffect, useRef } from 'react';
import { Card, StatCard, Button, Input, Textarea, Select, PageHeader, StatusChip, Badge, TabRow, Spinner, EmptyState } from '../components/ui';
import Layout from '../components/layout/Layout';
import { userAPI, ticketAPI, announcementAPI, gatePassAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const SYSTEMS = [
    { name: 'Parking Sensors',   icon: '🚗', status: 'online',  detail: '999/1000 sensors active'      },
    { name: 'Smart Lighting',    icon: '💡', status: 'online',  detail: '28 floors monitored'           },
    { name: 'Gym Energy Module', icon: '🚴', status: 'online',  detail: '40 cycles connected'           },
    { name: 'AQI Sensors',       icon: '🌿', status: 'online',  detail: 'Indoor + outdoor live'         },
    { name: 'BMS (Building)',    icon: '🏢', status: 'online',  detail: 'AI-optimized mode'             },
    { name: 'NOVA Health AI',    icon: '🤖', status: 'online',  detail: 'Grok API connected'            },
    { name: 'Parking Gate B2',   icon: '⚠️', status: 'offline', detail: 'Sensor fault · Ticket TK-001' },
];

const ENERGY_WEEK = [
    { day: 'Mon', consumed: 42, solar: 8  }, { day: 'Tue', consumed: 38, solar: 12 },
    { day: 'Wed', consumed: 45, solar: 10 }, { day: 'Thu', consumed: 52, solar: 6  },
    { day: 'Fri', consumed: 48, solar: 14 }, { day: 'Sat', consumed: 22, solar: 16 },
    { day: 'Sun', consumed: 18, solar: 15 },
];

const TOOLTIP_STYLE = { background: '#132845', border: '1px solid rgba(0,201,177,0.2)', borderRadius: 8, color: '#E8F4F8', fontSize: 12 };

const FLOORS_OPTIONS = ['Lobby', 'Meeting Rooms', 'Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5',
    'Floor 6', 'Floor 7', 'Floor 8', 'Floor 9', 'Floor 10', 'Floor 11', 'Floor 12', 'Cafeteria', 'Terrace'];

/* ─── Pass Status Badge ─────────────────────────────── */
const PassBadge = ({ status }) => {
    const cfg = {
        active:  { variant: 'green', label: '✅ Active'  },
        expired: { variant: 'red',   label: '❌ Expired' },
        revoked: { variant: 'red',   label: '🚫 Revoked' },
    }[status] || { variant: 'teal', label: status };
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

const Admin = () => {
    const [tab,           setTab]           = useState('overview');
    const [users,         setUsers]         = useState([]);
    const [tickets,       setTickets]       = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [stats,         setStats]         = useState(null);
    const [loading,       setLoading]       = useState(false);
    const [search,        setSearch]        = useState('');
    const [annForm,       setAnnForm]       = useState({ title: '', message: '', target: 'all' });

    // Gate pass state
    const [visitorPasses, setVisitorPasses] = useState([]);
    const [staffPasses,   setStaffPasses]   = useState([]);
    const [passTab,       setPassTab]       = useState('visitor'); // 'visitor' | 'staff'
    const [passLoading,   setPassLoading]   = useState(false);
    const [submittingPass, setSubmittingPass] = useState(false);
    const [passSuccess,   setPassSuccess]   = useState('');
    const [passError,     setPassError]     = useState('');
    const photoRef = useRef(null);

    const [visitorForm, setVisitorForm] = useState({
        visitorName: '', email: '', phone: '', company: '', purpose: '',
        hostEmployee: '', validFrom: '', validTo: '',
        authorizedFloors: ['Lobby', 'Meeting Rooms'],
    });
    const [staffForm, setStaffForm] = useState({
        name: '', email: '', department: '', floor: 1,
    });

    /* ─ Data fetchers ───────────────────────────────── */
    const fetchUsers = (q) => {
        setLoading(true);
        userAPI.getAll(q ? { search: q } : {})
            .then(r => setUsers(r.data.users))
            .catch(console.error)
            .finally(() => setLoading(false));
    };
    const fetchTickets = () => {
        ticketAPI.getAll().then(r => setTickets(r.data.tickets)).catch(console.error);
        ticketAPI.getStats().then(r => setStats(r.data.stats)).catch(console.error);
    };
    const fetchAnnouncements = () => {
        announcementAPI.getAll().then(r => setAnnouncements(r.data.announcements)).catch(console.error);
    };
    const fetchPasses = () => {
        setPassLoading(true);
        Promise.all([gatePassAPI.listVisitors(), gatePassAPI.listStaff()])
            .then(([v, s]) => { setVisitorPasses(v.data.passes); setStaffPasses(s.data.passes); })
            .catch(console.error)
            .finally(() => setPassLoading(false));
    };

    useEffect(() => {
        if (tab === 'users')     fetchUsers();
        if (tab === 'tickets')   fetchTickets();
        if (tab === 'announce')  fetchAnnouncements();
        if (tab === 'passes')    fetchPasses();
    }, [tab]);

    /* ─ Actions ─────────────────────────────────────── */
    const resolveTicket = async (id) => {
        try { await ticketAPI.update(id, { status: 'resolved' }); fetchTickets(); }
        catch (e) { console.error(e); }
    };
    const sendAnnouncement = async (e) => {
        e.preventDefault();
        try { await announcementAPI.create(annForm); setAnnForm({ title: '', message: '', target: 'all' }); fetchAnnouncements(); alert('📢 Sent!'); }
        catch (e) { console.error(e.response?.data); }
    };
    const revokePass = async (id) => {
        if (!confirm('Revoke this gate pass?')) return;
        try { await gatePassAPI.revokeVisitor(id); fetchPasses(); }
        catch (e) { console.error(e); }
    };

    const toggleFloor = (floor) => {
        setVisitorForm(prev => ({
            ...prev,
            authorizedFloors: prev.authorizedFloors.includes(floor)
                ? prev.authorizedFloors.filter(f => f !== floor)
                : [...prev.authorizedFloors, floor],
        }));
    };

    const submitVisitorPass = async (e) => {
        e.preventDefault();
        setSubmittingPass(true); setPassError(''); setPassSuccess('');
        try {
            const res = await gatePassAPI.createVisitor(visitorForm);
            setPassSuccess(`✅ Gate pass ${res.data.pass.passCode} created & email queued to ${visitorForm.email}`);
            setVisitorForm({ visitorName: '', email: '', phone: '', company: '', purpose: '', hostEmployee: '', validFrom: '', validTo: '', authorizedFloors: ['Lobby', 'Meeting Rooms'] });
            fetchPasses();
            setTimeout(() => setPassSuccess(''), 7000);
        } catch (e) { setPassError(e.response?.data?.message || 'Failed to create pass'); }
        finally { setSubmittingPass(false); }
    };

    const submitStaffPass = async (e) => {
        e.preventDefault();
        setSubmittingPass(true); setPassError(''); setPassSuccess('');
        try {
            const fd = new FormData();
            Object.entries(staffForm).forEach(([k, v]) => fd.append(k, v));
            if (photoRef.current?.files[0]) fd.append('photo', photoRef.current.files[0]);
            const res = await gatePassAPI.createStaffUser(fd);
            setPassSuccess(`✅ Staff account ${res.data.user.userId} created. Welcome email sent to ${staffForm.email}`);
            setStaffForm({ name: '', email: '', department: '', floor: 1 });
            if (photoRef.current) photoRef.current.value = '';
            fetchPasses();
            setTimeout(() => setPassSuccess(''), 7000);
        } catch (e) { setPassError(e.response?.data?.message || 'Failed to create staff'); }
        finally { setSubmittingPass(false); }
    };

    const handleAnn = e => setAnnForm(p => ({ ...p, [e.target.name]: e.target.value }));
    const ROLE_COLOR = { admin: 'gold', employee: 'teal', maintenance: 'red', visitor: 'purple' };

    return (
        <Layout>
            <PageHeader label="⚙️ Admin" title="Admin Panel" subtitle="Building management · Full system control" />

            {/* Overview stats — always visible */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <StatCard icon="👥" value="2,847"                                                               label="Active Users" />
                <StatCard icon="⚠️" value={<span style={{ color: 'var(--sn-red)'   }}>3</span>}               label="Open Alerts"  variant="red"   />
                <StatCard icon="🎫" value={<span style={{ color: 'var(--sn-teal)'  }}>{stats?.open || '—'}</span>} label="Open Tickets" variant="teal"  />
                <StatCard icon="✅" value={<span style={{ color: 'var(--sn-green)' }}>98.2%</span>}            label="Uptime"       variant="green" />
            </div>

            <TabRow
                tabs={[
                    { id: 'overview', label: '📊 Overview' },
                    { id: 'passes',   label: '🪪 Gate Passes' },
                    { id: 'users',    label: '👥 Users' },
                    { id: 'tickets',  label: '🎫 Tickets' },
                    { id: 'announce', label: '📢 Announce' },
                ]}
                active={tab}
                onChange={setTab}
            />

            {/* ── OVERVIEW ─────────────────────────────── */}
            {tab === 'overview' && (
                <>
                    <Card style={{ marginBottom: '1rem' }}>
                        <p className="sn-section-title">⚡ Systems Status</p>
                        <div className="sn-row-list">
                            {SYSTEMS.map(s => (
                                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '0.625rem', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                                        background: s.status === 'online' ? 'rgba(46,204,113,0.10)' : 'rgba(255,71,87,0.10)',
                                    }}>{s.icon}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--sn-dim)' }}>{s.detail}</p>
                                    </div>
                                    <Badge variant={s.status === 'online' ? 'green' : 'red'}>
                                        <span className={s.status === 'online' ? 'sn-pulse-dot sn-pulse' : 'sn-pulse-dot'} style={{ background: s.status === 'online' ? 'var(--sn-green)' : 'var(--sn-red)', marginRight: '0.25rem' }} />
                                        {s.status === 'online' ? 'Online' : 'Offline'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <p className="sn-section-title">📊 Energy This Week (MWh)</p>
                        <ResponsiveContainer width="100%" height={140}>
                            <LineChart data={ENERGY_WEEK}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,201,177,0.06)" />
                                <XAxis dataKey="day" tick={{ fill: '#8BA3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#8BA3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
                                <Tooltip contentStyle={TOOLTIP_STYLE} />
                                <Line type="monotone" dataKey="consumed" stroke="#FF4757" strokeWidth={2} dot={false} name="Consumed" />
                                <Line type="monotone" dataKey="solar"    stroke="#F5B800" strokeWidth={2} dot={false} name="Solar"    />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}

            {/* ── GATE PASSES ──────────────────────────── */}
            {tab === 'passes' && (
                <>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        {['visitor', 'staff'].map(t => (
                            <button key={t} onClick={() => setPassTab(t)} style={{
                                flex: 1, padding: '0.625rem', borderRadius: '0.75rem',
                                border: `2px solid ${passTab === t ? 'var(--sn-teal)' : 'var(--sn-border)'}`,
                                background: passTab === t ? 'rgba(0,201,177,0.08)' : 'var(--sn-card)',
                                color: passTab === t ? 'var(--sn-teal)' : 'var(--sn-muted)',
                                fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                                fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                            }}>
                                {t === 'visitor' ? '🪪 Visitor Passes' : '🔧 Staff Accounts'}
                            </button>
                        ))}
                    </div>

                    {passSuccess && <div className="sn-alert-success">{passSuccess}</div>}
                    {passError   && <div style={{ background: 'var(--sn-red-dim)', border: '1px solid rgba(255,71,87,0.3)', color: 'var(--sn-red)', fontSize: '0.875rem', borderRadius: '0.75rem', padding: '0.625rem 1rem', marginBottom: '1rem' }}>{passError}</div>}

                    {/* ──── Visitor Pass Form ──────────────── */}
                    {passTab === 'visitor' && (
                        <>
                            <Card style={{ marginBottom: '1rem' }}>
                                <p className="sn-section-title">🪪 Create Visitor Gate Pass</p>
                                <form onSubmit={submitVisitorPass}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.75rem' }}>
                                        <Input name="visitorName"  label="Visitor Name"   placeholder="Aditya Kumar"          value={visitorForm.visitorName}  onChange={e => setVisitorForm(p => ({ ...p, visitorName: e.target.value }))}  required />
                                        <Input name="email"        label="Email Address"  placeholder="aditya@company.com"    value={visitorForm.email}        onChange={e => setVisitorForm(p => ({ ...p, email: e.target.value }))}        required />
                                        <Input name="phone"        label="Phone"          placeholder="+91 98765 43210"       value={visitorForm.phone}        onChange={e => setVisitorForm(p => ({ ...p, phone: e.target.value }))}               />
                                        <Input name="company"      label="Company"        placeholder="Infosys Ltd."          value={visitorForm.company}      onChange={e => setVisitorForm(p => ({ ...p, company: e.target.value }))}            />
                                        <Input name="hostEmployee" label="Host (Employee)" placeholder="Varun Rahatgaonkar"   value={visitorForm.hostEmployee} onChange={e => setVisitorForm(p => ({ ...p, hostEmployee: e.target.value }))} required />
                                        <Input name="purpose"      label="Purpose"        placeholder="Client Meeting / Demo" value={visitorForm.purpose}      onChange={e => setVisitorForm(p => ({ ...p, purpose: e.target.value }))}      required />
                                        <Input name="validFrom"    label="Valid From"     type="datetime-local"               value={visitorForm.validFrom}    onChange={e => setVisitorForm(p => ({ ...p, validFrom: e.target.value }))}    required />
                                        <Input name="validTo"      label="Valid Until"    type="datetime-local"               value={visitorForm.validTo}      onChange={e => setVisitorForm(p => ({ ...p, validTo: e.target.value }))}      required />
                                    </div>

                                    {/* Floor selector */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="sn-label" style={{ display: 'block', marginBottom: '0.5rem' }}>🏢 Authorized Floors</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                            {FLOORS_OPTIONS.map(f => {
                                                const selected = visitorForm.authorizedFloors.includes(f);
                                                return (
                                                    <button key={f} type="button" onClick={() => toggleFloor(f)} style={{
                                                        padding: '0.3125rem 0.75rem',
                                                        borderRadius: 99,
                                                        border: `1px solid ${selected ? 'var(--sn-teal)' : 'var(--sn-border)'}`,
                                                        background: selected ? 'rgba(0,201,177,0.12)' : 'var(--sn-dark)',
                                                        color: selected ? 'var(--sn-teal)' : 'var(--sn-dim)',
                                                        fontSize: '0.75rem', fontWeight: 500,
                                                        cursor: 'pointer', fontFamily: 'var(--font-sans)',
                                                        transition: 'all 0.12s',
                                                    }}>{f}</button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <Button type="submit" fullWidth disabled={submittingPass}>
                                        {submittingPass ? <Spinner size="sm" /> : '📧 Create Pass & Send Email'}
                                    </Button>
                                </form>
                            </Card>

                            {/* List */}
                            <p className="sn-section-title">Active Visitor Passes</p>
                            {passLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>
                            ) : visitorPasses.length === 0 ? (
                                <EmptyState icon="🪪" message="No visitor passes created yet." />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {visitorPasses.map(p => (
                                        <Card key={p._id}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{p.visitorName}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--sn-dim)' }}>{p.email} · {p.company || 'N/A'}</p>
                                                </div>
                                                <PassBadge status={p.status} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--sn-muted)', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                                <span>📋 {p.purpose}</span>
                                                <span>👔 {p.hostEmployee}</span>
                                                <span>🆔 {p.passCode}</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--sn-dim)', marginBottom: '0.75rem' }}>
                                                🗓 {new Date(p.validFrom).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })} → {new Date(p.validTo).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {p.qrCodeUrl && (
                                                    <a href={p.qrCodeUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="sm">🔍 View QR</Button>
                                                    </a>
                                                )}
                                                <a href={`/gate-pass/${p.passCode}`} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="sm">🪪 Pass Page</Button>
                                                </a>
                                                {p.status === 'active' && (
                                                    <Button variant="outline" size="sm" onClick={() => revokePass(p._id)}>🚫 Revoke</Button>
                                                )}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ──── Staff Account Form ─────────────── */}
                    {passTab === 'staff' && (
                        <>
                            <Card style={{ marginBottom: '1rem' }}>
                                <p className="sn-section-title">🔧 Create Maintenance Staff Account</p>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--sn-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
                                    This will create a login account, generate a staff gate pass, and send a welcome email with credentials.
                                </p>
                                <form onSubmit={submitStaffPass}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.75rem' }}>
                                        <Input name="name"       label="Full Name"    placeholder="Raju Kumar"            value={staffForm.name}       onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))}       required />
                                        <Input name="email"      label="Email"        placeholder="raju@sustainova.in"    value={staffForm.email}      onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))}      required />
                                        <Input name="department" label="Department"   placeholder="HVAC / Electricals"   value={staffForm.department} onChange={e => setStaffForm(p => ({ ...p, department: e.target.value }))} required />
                                        <Input name="floor"      label="Base Floor"   placeholder="2" type="number"      value={staffForm.floor}      onChange={e => setStaffForm(p => ({ ...p, floor: e.target.value }))}              />
                                    </div>

                                    {/* Photo upload */}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="sn-label" style={{ display: 'block', marginBottom: '0.5rem' }}>📸 Staff Photo (for Gate Pass)</label>
                                        <div style={{
                                            border: '2px dashed var(--sn-border)',
                                            borderRadius: '0.875rem',
                                            padding: '1.25rem',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            background: 'var(--sn-dark)',
                                            transition: 'border-color 0.15s',
                                        }}
                                            onClick={() => photoRef.current?.click()}
                                            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--sn-teal)'; }}
                                            onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--sn-border)'; }}
                                        >
                                            <div style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>📷</div>
                                            <p style={{ fontSize: '0.8125rem', color: 'var(--sn-muted)' }}>Click or drag a photo here</p>
                                            <p style={{ fontSize: '0.6875rem', color: 'var(--sn-dim)', marginTop: '0.25rem' }}>JPG, PNG — max 5MB</p>
                                        </div>
                                        <input
                                            ref={photoRef}
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    // Show filename in the box
                                                    e.target.previousSibling.querySelector('p').textContent = `📎 ${file.name}`;
                                                }
                                            }}
                                        />
                                    </div>

                                    <Button type="submit" fullWidth disabled={submittingPass}>
                                        {submittingPass ? <Spinner size="sm" /> : '👤 Create Account & Send Welcome Email'}
                                    </Button>
                                </form>
                            </Card>

                            {/* Staff list */}
                            <p className="sn-section-title">Maintenance Staff Passes</p>
                            {passLoading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>
                            ) : staffPasses.length === 0 ? (
                                <EmptyState icon="🔧" message="No maintenance staff added yet." />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {staffPasses.map(p => (
                                        <Card key={p._id}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                                {p.photoUrl ? (
                                                    <img src={p.photoUrl} alt="Staff" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--sn-border)', flexShrink: 0 }} />
                                                ) : (
                                                    <div className="sn-avatar sn-avatar--md" style={{ flexShrink: 0 }}>
                                                        {(p.userId?.name || '?').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{p.userId?.name}</p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--sn-dim)' }}>{p.userId?.userId} · {p.userId?.department}</p>
                                                    <p style={{ fontSize: '0.6875rem', color: 'var(--sn-dim)', marginTop: '0.125rem' }}>🆔 {p.passCode}</p>
                                                </div>
                                                <Badge variant={p.isActive ? 'green' : 'red'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                                            </div>
                                            {p.qrCodeUrl && (
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                    <a href={p.qrCodeUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="sm">🔍 QR Code</Button>
                                                    </a>
                                                    <a href={`/gate-pass/${p.passCode}`} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="sm">🪪 Gate Pass</Button>
                                                    </a>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ── USERS ─────────────────────────────────── */}
            {tab === 'users' && (
                <Card>
                    <div style={{ marginBottom: '1rem' }}>
                        <input className="sn-input" placeholder="🔍 Search by name or ID..." value={search} onChange={e => { setSearch(e.target.value); fetchUsers(e.target.value); }} />
                    </div>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Spinner /></div>
                    ) : users.length === 0 ? (
                        <EmptyState icon="👥" message="No users found" />
                    ) : (
                        <div className="sn-row-list">
                            {users.map(u => (
                                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div className="sn-avatar sn-avatar--sm">{u.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--sn-dim)' }}>{u.userId} · {u.department}</p>
                                    </div>
                                    <Badge variant={ROLE_COLOR[u.role] || 'teal'}>{u.role}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* ── TICKETS ───────────────────────────────── */}
            {tab === 'tickets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tickets.length === 0 ? <EmptyState icon="🎫" message="No tickets yet" /> : (
                        tickets.map(t => (
                            <Card key={t._id}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t.ticketId} — {t.category}</span>
                                    <StatusChip status={t.status} />
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--sn-muted)', marginBottom: '0.5rem' }}>{t.title}</p>
                                {t.status !== 'resolved' && <Button onClick={() => resolveTicket(t._id)} size="sm">✅ Resolve</Button>}
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* ── ANNOUNCEMENTS ─────────────────────────── */}
            {tab === 'announce' && (
                <>
                    <form onSubmit={sendAnnouncement}>
                        <Card style={{ marginBottom: '1rem' }}>
                            <p className="sn-section-title">📢 Send Announcement</p>
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
                    <p className="sn-section-title">📜 Recent Announcements</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {announcements.map(a => (
                            <Card key={a._id}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.title}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--sn-dim)' }}>{new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--sn-muted)', marginBottom: '0.5rem' }}>{a.message}</p>
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
