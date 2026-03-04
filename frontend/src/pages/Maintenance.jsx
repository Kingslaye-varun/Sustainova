import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea, Select, PageHeader, StatusChip, Badge, TabRow, Spinner, EmptyState } from '../components/ui';
import Layout from '../components/layout/Layout';
import { maintenanceAPI, userAPI } from '../services/api';

const Maintenance = () => {
    const [tab, setTab] = useState('tasks');
    const [tasks, setTasks] = useState([]);
    const [schedule] = useState([
        { date: '5 Mar', task: 'VRF system filter inspection', team: 'HVAC Team', time: '9:00 AM' },
        { date: '7 Mar', task: 'Monthly elevator safety check', team: 'Lift Team', time: '11:00 AM' },
        { date: '10 Mar', task: 'Sprinkler test — Floors 1-5', team: 'Safety Team', time: '2:00 PM' },
        { date: '12 Mar', task: 'Solar panel output calibration', team: 'Solar Team', time: '8:00 AM' },
        { date: '15 Mar', task: 'Quarterly BMS + IT audit', team: 'IT + Maint', time: '10:00 AM' },
    ]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', location: '', issueType: 'general', priority: 'high' });
    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const fetchTasks = () => {
        setLoading(true);
        maintenanceAPI.getTasks()
            .then(r => setTasks(r.data.tasks))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { if (tab === 'tasks') fetchTasks(); }, [tab]);

    const updateStatus = async (id, status) => {
        try {
            await maintenanceAPI.update(id, { status });
            fetchTasks();
        } catch (e) { console.error(e); }
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

            {tab === 'tasks' && (
                loading ? (
                    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                ) : tasks.length === 0 ? (
                    <EmptyState icon="✅" message="No tasks assigned. Check back later." />
                ) : (
                    <div className="flex flex-col gap-3">
                        {tasks.map(t => (
                            <Card key={t._id}>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant={STATUS_COLOR[t.status] || 'teal'}>{t.taskId}</Badge>
                                    <Badge variant={PRIORITY_COLOR[t.priority] || 'teal'}>{t.priority}</Badge>
                                </div>
                                <p className="font-semibold text-sm mb-0.5">{t.title}</p>
                                <p className="text-xs text-[#4A6580] mb-3">📍 {t.location} · {t.issueType}</p>
                                {t.status !== 'completed' && t.status !== 'cancelled' && (
                                    <div className="flex gap-2">
                                        {t.status === 'assigned' && (
                                            <Button onClick={() => updateStatus(t._id, 'in_progress')} variant="ghost" size="sm">▶ Start</Button>
                                        )}
                                        {t.status === 'in_progress' && (
                                            <Button onClick={() => updateStatus(t._id, 'completed')} size="sm">✅ Complete</Button>
                                        )}
                                        <Button onClick={() => updateStatus(t._id, 'cancelled')} variant="outline" size="sm">✕ Cancel</Button>
                                    </div>
                                )}
                                {t.status === 'completed' && <span className="text-xs text-[#2ECC71]">✅ Completed</span>}
                            </Card>
                        ))}
                    </div>
                )
            )}

            {tab === 'report' && (
                <form onSubmit={submitIssue}>
                    <Card>
                        <h3 className="font-['Space_Grotesk'] font-semibold mb-4">📋 Report New Issue</h3>
                        <Input name="title" label="Issue Title" placeholder="Brief issue description" value={form.title} onChange={handle} required />
                        <Select name="issueType" label="Issue Type" value={form.issueType} onChange={handle}>
                            <option value="electrical">Electrical fault</option>
                            <option value="plumbing">Plumbing issue</option>
                            <option value="hvac">HVAC / Cooling problem</option>
                            <option value="lighting">Lighting malfunction</option>
                            <option value="parking_sensor">Parking sensor fault</option>
                            <option value="elevator">Elevator issue</option>
                            <option value="general">General wear & tear</option>
                        </Select>
                        <Input name="location" label="Location" placeholder="Floor, Zone, Room number" value={form.location} onChange={handle} required />
                        <Select name="priority" label="Priority" value={form.priority} onChange={handle}>
                            <option value="low">Low</option><option value="medium">Medium</option>
                            <option value="high">High</option><option value="critical">Critical</option>
                        </Select>
                        <Textarea name="description" label="Description" placeholder="Describe the issue in detail..." value={form.description} onChange={handle} rows={3} />
                        <Button type="submit" fullWidth>Submit Report 🔧</Button>
                    </Card>
                </form>
            )}

            {tab === 'schedule' && (
                <Card>
                    <h3 className="font-['Space_Grotesk'] font-semibold mb-3">📅 Upcoming Maintenance</h3>
                    <div className="divide-y divide-[rgba(0,201,177,0.08)]">
                        {schedule.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                <div className="w-12 h-12 rounded-xl bg-[rgba(0,201,177,0.1)] border border-[rgba(0,201,177,0.2)] flex items-center justify-center text-xs font-bold text-[#00C9B1] text-center leading-tight">
                                    {s.date}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{s.task}</p>
                                    <p className="text-xs text-[#4A6580]">👥 {s.team} · 🕐 {s.time}</p>
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
