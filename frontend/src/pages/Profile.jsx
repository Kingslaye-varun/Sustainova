import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, PageHeader } from '../components/ui';
import Layout from '../components/layout/Layout';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const ROLE_COLOR = { admin: 'gold', employee: 'teal', maintenance: 'red', visitor: 'purple' };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Layout>
            <PageHeader label="👤 My Profile" title={user?.name || 'User'} subtitle={`ID: ${user?.userId || '—'}`} />

            <Card className="text-center mb-4 py-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00C9B1] to-[#00A896] flex items-center justify-center text-[#0A1628] text-2xl font-bold mx-auto mb-3">
                    {initials}
                </div>
                <Badge variant={ROLE_COLOR[user?.role] || 'teal'} className="mb-2">{user?.role}</Badge>
                <p className="text-[#8BA3B8] text-sm">{user?.department} · Floor {user?.floor}</p>
                <div className="mt-4 bg-[#0d1e35] rounded-2xl p-4">
                    <p className="text-[10px] text-[#4A6580] uppercase tracking-wider mb-1">Your Unique Building ID</p>
                    <p className="font-['Space_Grotesk'] text-xl font-bold text-[#00C9B1] tracking-widest">{user?.userId || '—'}</p>
                </div>
            </Card>

            <Card className="mb-4">
                <h3 className="font-['Space_Grotesk'] font-semibold mb-3">🌍 My Carbon This Month</h3>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[#8BA3B8] text-sm">Total CO₂ emitted</span>
                    <span className="font-semibold text-[#2ECC71]">12.4 kg</span>
                </div>
                <div className="h-1.5 bg-[#0d1e35] rounded-full overflow-hidden mb-2">
                    <div className="h-full w-[30%] bg-gradient-to-r from-[#00C9B1] to-[#00A896] rounded-full" />
                </div>
                <p className="text-xs text-[#4A6580]">You're in the top 30% of low-carbon commuters 🎉</p>
            </Card>

            <Button variant="outline" fullWidth size="lg" onClick={handleLogout}>🚪 Logout</Button>
        </Layout>
    );
};

export default Profile;
