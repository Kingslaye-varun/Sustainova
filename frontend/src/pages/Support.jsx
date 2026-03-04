import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea, Select, PageHeader, StatusChip, Badge, TabRow, EmptyState, Spinner } from '../components/ui';
import Layout from '../components/layout/Layout';
import { ticketAPI } from '../services/api';

const CATEGORIES = [
    { id: 'facilities', icon: '🏢', label: 'Facilities Issue', desc: 'AC, plumbing, lights, cleaning', color: '#00C9B1' },
    { id: 'it', icon: '💻', label: 'IT / Tech Issue', desc: 'WiFi, screens, system errors', color: '#8E5CE4' },
    { id: 'health', icon: '🏥', label: 'Health / Medical', desc: 'First aid, wellness query', color: '#FF4757' },
    { id: 'parking', icon: '🚗', label: 'Parking Issue', desc: 'Gate fault, wrong sensor status', color: '#F5B800' },
    { id: 'general', icon: '💬', label: 'General Enquiry', desc: 'Visitors, bookings, directions', color: '#2ECC71' },
];

const Support = () => {
    const [tab, setTab] = useState('new');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCat, setSelectedCat] = useState(null);
    const [form, setForm] = useState({ title: '', description: '', priority: 'medium', location: '' });
    const [success, setSuccess] = useState('');

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const fetchTickets = () => {
        setLoading(true);
        ticketAPI.getAll()
            .then(r => setTickets(r.data.tickets))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { if (tab === 'mine') fetchTickets(); }, [tab]);

    const submit = async (e) => {
        e.preventDefault();
        if (!selectedCat) return alert('Please select a category');
        setSubmitting(true);
        try {
            const res = await ticketAPI.create({ ...form, category: selectedCat });
            setSuccess(`✅ Ticket ${res.data.ticket.ticketId} raised! We'll respond within 30 minutes.`);
            setForm({ title: '', description: '', priority: 'medium', location: '' });
            setSelectedCat(null);
            setTimeout(() => setSuccess(''), 5000);
        } catch (e) {
            console.error('Ticket create error:', e.response?.data);
        } finally { setSubmitting(false); }
    };

    const PRIORITY_COLOR = { low: 'green', medium: 'teal', high: 'gold', critical: 'red' };

    return (
        <Layout>
            <PageHeader label="❓ Help & Support" title="Raise a Ticket" subtitle="We'll get back to you within 30 minutes" />

            <TabRow tabs={[{ id: 'new', label: 'New Ticket' }, { id: 'mine', label: 'My Tickets' }]} active={tab} onChange={setTab} />

            {tab === 'new' && (
                <form onSubmit={submit}>
                    <h3 className="font-['Space_Grotesk'] font-semibold mb-3">Select Category</h3>
                    <div className="flex flex-col gap-2 mb-4">
                        {CATEGORIES.map(c => (
                            <div key={c.id} onClick={() => setSelectedCat(c.id)}
                                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${selectedCat === c.id ? 'border-[#00C9B1] bg-[rgba(0,201,177,0.06)]' : 'border-[rgba(0,201,177,0.12)] bg-[#132845] hover:border-[rgba(0,201,177,0.25)]'}`}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${c.color}15`, border: `1px solid ${c.color}40` }}>
                                    {c.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-sm">{c.label}</div>
                                    <div className="text-xs text-[#4A6580]">{c.desc}</div>
                                </div>
                                {selectedCat === c.id && <span style={{ color: c.color }}>✓</span>}
                            </div>
                        ))}
                    </div>

                    <Input name="title" label="Issue Title" placeholder="Brief summary of the issue" value={form.title} onChange={handle} required />
                    <Textarea name="description" label="Description" placeholder="Describe what's happening in detail..." value={form.description} onChange={handle} rows={4} />
                    <Input name="location" label="Location" placeholder="e.g. Floor 12, Meeting Room B" value={form.location} onChange={handle} />
                    <Select name="priority" label="Priority" value={form.priority} onChange={handle}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </Select>

                    {success && <div className="bg-[rgba(46,204,113,0.1)] border border-[rgba(46,204,113,0.3)] text-[#2ECC71] text-sm rounded-xl px-4 py-3 mb-4">{success}</div>}

                    <Button type="submit" fullWidth size="lg" disabled={submitting || !selectedCat}>
                        {submitting ? <Spinner size="sm" /> : '🚀 Submit Ticket'}
                    </Button>
                </form>
            )}

            {tab === 'mine' && (
                loading ? (
                    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                ) : tickets.length === 0 ? (
                    <EmptyState icon="🎫" message="No tickets yet. Raise one if you need help!" />
                ) : (
                    <div className="flex flex-col gap-3">
                        {tickets.map(t => (
                            <Card key={t._id}>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="teal" className="text-xs">{t.ticketId}</Badge>
                                    <StatusChip status={t.status} />
                                </div>
                                <p className="font-semibold text-sm mb-1">{t.title}</p>
                                <p className="text-xs text-[#4A6580] mb-2">{t.location} · {new Date(t.createdAt).toLocaleDateString('en-IN')}</p>
                                <div className="flex items-center gap-3 text-xs text-[#8BA3B8]">
                                    <span>🏷️ {t.category}</span>
                                    <Badge variant={PRIORITY_COLOR[t.priority] || 'teal'} className="text-xs">{t.priority}</Badge>
                                    <span>👤 {t.assignedTo?.name || 'Pending'}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )
            )}
        </Layout>
    );
};

export default Support;
