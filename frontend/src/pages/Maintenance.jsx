import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea, Select, PageHeader, Badge, TabRow, Spinner, EmptyState } from '../components/ui';
import Layout from '../components/layout/Layout';
import { maintenanceAPI } from '../services/api';

const Maintenance = () => {
    const [tab, setTab] = useState('tasks');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', location: '', issueType: 'general', priority: 'high' });
    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const SCHEDULE = [
        { date: '5 Mar', task: 'VRF system filter inspection', team: 'HVAC Team', time: '9:00 AM' },
        { date: '7 Mar', task: 'Monthly elevator safety check', team: 'Lift Team', time: '11:00 AM' },
        { date: '10 Mar', task: 'Sprinkler test — Floors 1-5', team: 'Safety Team', time: '2:00 PM' },
        { date: '12 Mar', task: 'Solar panel output calibration', team: 'Solar Team', time: '8:00 AM' },
        { date: '15 Mar', task: 'Quarterly BMS + IT audit', team: 'IT + Maint', time: '10:00 AM' },
    ];

    const fetchTasks = () => {
        setLoading(true);
        maintenanceAPI.getTasks()
            .then(r => setTasks(r.data.tasks))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { if (tab === 'tasks') fetchTasks(); }, [tab]);

    const updateStatus = async (id, status) => {
        try { await maintenanceAPI.update(id, { status }); fetchTasks(); }
        catch (e) { console.error(e); }
    };

    const submitIssue = async (e) => {
        e.preventDefault();
        try {
            await maintenanceAPI.create(form);
            setForm({ title: '', description: '', location: '', issueType: 'general', priority: 'high' });
            alert('Issue reported! Admin notified. 🔧');
        } catch (e) { console.error(e.response?.data); alert(e.response?.data?.message || 'Error'); }
    };

    const STATUS_COLOR = { assigned: 'teal', in_progress: 'gold', completed: 'green', cancelled: 'red' };
    const PRIORITY_COLOR = { low: 'green', medium: 'teal', high: 'gold', critical: 'red' };

    return (
        <Layout>
            <PageHeader label="🔧 Maintenance" title="Staff Panel" subtitle="Manage tasks and building issues" />

            <TabRow
                tabs={[{ id: 'tasks', label: 'Assigned Tasks' }, { id: 'report', label: 'Report Issue' }, { id: 'schedule', label: 'Schedule' }]}
                active={tab}
                onChange={setTab}
            />

            {/* Tasks */}
            {tab === 'tasks' && (
                loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}><Spinner size="lg" /></div>
                ) : tasks.length === 0 ? (
                    <EmptyState icon="✅" message="No tasks assigned. Check back later." />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {tasks.map(t => (
                            <Card key={t._id}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <Badge variant={STATUS_COLOR[t.status] || 'teal'}>{t.taskId}</Badge>
                                    <Badge variant={PRIORITY_COLOR[t.priority] || 'teal'}>{t.priority}</Badge>
                                </div>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{t.title}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--sn-dim)', marginBottom: '0.75rem' }}>📍 {t.location} · {t.issueType}</p>
                                {t.status !== 'completed' && t.status !== 'cancelled' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {t.status === 'assigned' && <Button onClick={() => updateStatus(t._id, 'in_progress')} variant="ghost" size="sm">▶ Start</Button>}
                                        {t.status === 'in_progress' && <Button onClick={() => updateStatus(t._id, 'completed')} size="sm">✅ Complete</Button>}
                                        <Button onClick={() => updateStatus(t._id, 'cancelled')} variant="outline" size="sm">✕ Cancel</Button>
                                    </div>
                                )}
                                {t.status === 'completed' && <span style={{ fontSize: '0.75rem', color: 'var(--sn-green)' }}>✅ Completed</span>}
                            </Card>
                        ))}
                    </div>
                )
            )}

            {/* Report Issue */}
            {tab === 'report' && (
                <form onSubmit={submitIssue}>
                    <Card>
                        <p className="sn-section-title">📋 Report New Issue</p>
                        <Input name="title" label="Issue Title" placeholder="Brief issue description" value={form.title} onChange={handle} required />
                        <Select name="issueType" label="Issue Type" value={form.issueType} onChange={handle}>
                            <option value="electrical">Electrical fault</option>
                            <option value="plumbing">Plumbing issue</option>
                            <option value="hvac">HVAC / Cooling problem</option>
                            <option value="lighting">Lighting malfunction</option>
                            <option value="parking_sensor">Parking sensor fault</option>
                            <option value="elevator">Elevator issue</option>
                            <option value="general">General wear &amp; tear</option>
                        </Select>
                        <Input name="location" label="Location" placeholder="Floor, Zone, Room number" value={form.location} onChange={handle} required />
                        <Select name="priority" label="Priority" value={form.priority} onChange={handle}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </Select>
                        <Textarea name="description" label="Description" placeholder="Describe the issue in detail..." value={form.description} onChange={handle} rows={3} />
                        <Button type="submit" fullWidth>Submit Report 🔧</Button>
                    </Card>
                </form>
            )}

            {/* Schedule */}
            {tab === 'schedule' && (
                <Card>
                    <p className="sn-section-title">📅 Upcoming Maintenance</p>
                    <div className="sn-row-list">
                        {SCHEDULE.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '0.625rem',
                                    background: 'rgba(0,201,177,0.10)',
                                    border: '1px solid rgba(0,201,177,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.6875rem', fontWeight: 700,
                                    color: 'var(--sn-teal)', textAlign: 'center', lineHeight: 1.2,
                                    flexShrink: 0,
                                }}>
                                    {s.date}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{s.task}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--sn-dim)' }}>👥 {s.team} · 🕐 {s.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </Layout>
    );
};

export default Maintenance;
