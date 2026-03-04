import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Spinner } from '../components/ui';

const ROLES = [
    { id: 'employee', icon: '👤', label: 'Employee' },
    { id: 'admin', icon: '⚙️', label: 'Admin' },
    { id: 'maintenance', icon: '🔧', label: 'Maintenance' },
    { id: 'visitor', icon: '🪪', label: 'Visitor' },
];

const Login = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [role, setRole] = useState('employee');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', department: '', floor: 1 });

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login({ email: form.email, password: form.password });
            } else {
                await register({ ...form, role });
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center px-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[rgba(0,201,177,0.06)] blur-3xl pointer-events-none" />

            {/* Logo */}
            <div className="text-center mb-8 z-10">
                <div className="w-18 h-18 rounded-[22px] bg-gradient-to-br from-[#00C9B1] to-[#00A896] flex items-center justify-center text-4xl mx-auto mb-4 shadow-[0_0_30px_rgba(0,201,177,0.3)]" style={{ width: 72, height: 72 }}>
                    🏢
                </div>
                <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-white">SUSTAINOVA</h1>
                <p className="text-[#4A6580] text-sm mt-1">Smart Office Building · Ghansoli, Navi Mumbai</p>
            </div>

            {/* Card */}
            <div className="w-full max-w-[420px] bg-[#132845] border border-[rgba(0,201,177,0.12)] rounded-3xl p-7 shadow-[0_20px_60px_rgba(0,0,0,0.4)] z-10">

                {/* Mode toggle */}
                <div className="flex gap-1 bg-[#0d1e35] rounded-full p-1 mb-6">
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${mode === m ? 'bg-[#00C9B1] text-[#0A1628]' : 'text-[#4A6580] hover:text-[#8BA3B8]'}`}>
                            {m === 'login' ? '🔑 Login' : '✨ Register'}
                        </button>
                    ))}
                </div>

                {mode === 'register' && (
                    <>
                        <p className="text-xs font-semibold text-[#8BA3B8] uppercase tracking-wide mb-3">Select Role</p>
                        <div className="grid grid-cols-2 gap-2 mb-5">
                            {ROLES.map(r => (
                                <div key={r.id} onClick={() => setRole(r.id)}
                                    className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${role === r.id ? 'border-[#00C9B1] bg-[rgba(0,201,177,0.1)]' : 'border-[rgba(0,201,177,0.12)] bg-[#0d1e35] hover:border-[rgba(0,201,177,0.3)]'}`}>
                                    <div className="text-2xl mb-1">{r.icon}</div>
                                    <div className="text-xs font-semibold">{r.label}</div>
                                </div>
                            ))}
                        </div>
                        <Input name="name" label="Full Name" placeholder="Varun Rahatgaonkar" value={form.name} onChange={handle} icon="👤" />
                        <Input name="department" label="Department" placeholder="IT Engineering" value={form.department} onChange={handle} icon="🏢" />
                        <Input name="floor" label="Floor Number" type="number" placeholder="12" value={form.floor} onChange={handle} icon="🏠" />
                    </>
                )}

                <form onSubmit={submit}>
                    <Input name="email" label="Email" type="email" placeholder="varun@sustainova.in" value={form.email} onChange={handle} icon="✉️" />
                    <Input name="password" label="Password" type="password" placeholder="••••••••" value={form.password} onChange={handle} icon="🔒" />

                    {error && (
                        <div className="bg-[rgba(255,71,87,0.1)] border border-[rgba(255,71,87,0.3)] text-[#FF4757] text-sm rounded-xl px-4 py-2.5 mb-4">
                            ❌ {error}
                        </div>
                    )}

                    <Button type="submit" fullWidth size="lg" disabled={loading}>
                        {loading ? <Spinner size="sm" /> : mode === 'login' ? '🏢 Enter Building' : '✨ Create Account'}
                    </Button>
                </form>

                <p className="text-center text-[#4A6580] text-xs mt-4">
                    Solar Decathlon India · TATA Realty · VESCOA + VESIT
                </p>
            </div>
        </div>
    );
};

export default Login;
