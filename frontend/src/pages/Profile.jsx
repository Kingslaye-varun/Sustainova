import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, PageHeader } from '../components/ui';
import Layout from '../components/layout/Layout';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const ROLE_COLOR = { admin: 'gold', employee: 'teal', maintenance: 'red', visitor: 'purple' };

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <Layout>
            <PageHeader label="👤 My Profile" title={user?.name || 'User'} subtitle={`ID: ${user?.userId || '—'}`} />

            {/* Avatar card */}
            <Card style={{ textAlign: 'center', marginBottom: '1rem', padding: '1.5rem 1rem' }}>
                <div className="sn-avatar sn-avatar--lg" style={{ margin: '0 auto 0.875rem' }}>
                    {initials}
                </div>
                <Badge variant={ROLE_COLOR[user?.role] || 'teal'} style={{ marginBottom: '0.5rem' }}>
                    {user?.role}
                </Badge>
                <p style={{ color: 'var(--sn-muted)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
                    {user?.department} · Floor {user?.floor}
                </p>

                {/* Building ID */}
                <div style={{
                    marginTop: '1rem',
                    background: 'var(--sn-dark)',
                    borderRadius: '0.75rem',
                    padding: '0.875rem',
                }}>
                    <p style={{ fontSize: '0.625rem', color: 'var(--sn-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.375rem' }}>
                        Your Unique Building ID
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--sn-teal)', letterSpacing: '0.12em' }}>
                        {user?.userId || '—'}
                    </p>
                </div>
            </Card>

            {/* Carbon card */}
            <Card style={{ marginBottom: '1rem' }}>
                <p className="sn-section-title">🌍 My Carbon This Month</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--sn-muted)', fontSize: '0.875rem' }}>Total CO₂ emitted</span>
                    <span style={{ fontWeight: 600, color: 'var(--sn-green)' }}>12.4 kg</span>
                </div>
                <div className="sn-progress">
                    <div className="sn-progress__fill" style={{ width: '30%' }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--sn-dim)' }}>You're in the top 30% of low-carbon commuters 🎉</p>
            </Card>

            {/* Account info */}
            <Card style={{ marginBottom: '1rem' }}>
                <p className="sn-section-title">📧 Account Details</p>
                {[
                    { label: 'Email', value: user?.email || '—' },
                    { label: 'Department', value: user?.department || '—' },
                    { label: 'Floor', value: user?.floor || '—' },
                    { label: 'Role', value: user?.role || '—' },
                ].map(({ label, value }) => (
                    <div key={label} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.625rem 0',
                        borderBottom: '1px solid rgba(0,201,177,0.08)',
                    }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--sn-muted)' }}>{label}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value}</span>
                    </div>
                ))}
            </Card>

            <Button variant="ghost" fullWidth size="lg" onClick={handleLogout}>
                🚪 Sign Out
            </Button>
        </Layout>
    );
};

export default Profile;
