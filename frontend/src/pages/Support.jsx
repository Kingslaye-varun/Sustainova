import { useState, useEffect } from 'react';
import { Card, Button, Input, Textarea, Select, PageHeader, StatusChip, Badge, TabRow, Spinner, EmptyState } from '../components/ui';
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
        } catch (e) { console.error(e.response?.data); }
        finally { setSubmitting(false); }
    };

    const PRIORITY_COLOR = { low: 'green', medium: 'teal', high: 'gold', critical: 'red' };

    return (
        <Layout>
            <PageHeader label="❓ Help & Support" title="Raise a Ticket" subtitle="We'll get back to you within 30 minutes" />

            <TabRow tabs={[{ id: 'new', label: 'New Ticket' }, { id: 'mine', label: 'My Tickets' }]} active={tab} onChange={setTab} />

            {tab === 'new' && (
                <form onSubmit={submit}>
                    <p className="sn-section-title">Select Category</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                        {CATEGORIES.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedCat(c.id)}
                                className={`sn-category-card ${selectedCat === c.id ? 'sn-category-card--active' : ''}`}
                            >
                                <div style={{
                                    width: 40, height: 40,
                                    borderRadius: '0.625rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    background: `${c.color}18`,
                                    border: `1px solid ${c.color}45`,
                                    flexShrink: 0,
                                }}>
                                    {c.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--sn-dim)' }}>{c.desc}</div>
                                </div>
                                {selectedCat === c.id && <span style={{ color: c.color, fontWeight: 700 }}>✓</span>}
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

                    {success && <div className="sn-alert-success">{success}</div>}

                    <Button type="submit" fullWidth size="lg" disabled={submitting || !selectedCat}>
                        {submitting ? <Spinner size="sm" /> : '🚀 Submit Ticket'}
                    </Button>
                </form>
            )}

            {tab === 'mine' && (
                loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}><Spinner size="lg" /></div>
                ) : tickets.length === 0 ? (
                    <EmptyState icon="🎫" message="No tickets yet. Raise one if you need help!" />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {tickets.map(t => (
                            <Card key={t._id}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <Badge variant="teal">{t.ticketId}</Badge>
                                    <StatusChip status={t.status} />
                                </div>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{t.title}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--sn-dim)', marginBottom: '0.5rem' }}>
                                    {t.location} · {new Date(t.createdAt).toLocaleDateString('en-IN')}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--sn-muted)' }}>
                                    <span>🏷️ {t.category}</span>
                                    <Badge variant={PRIORITY_COLOR[t.priority] || 'teal'}>{t.priority}</Badge>
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
