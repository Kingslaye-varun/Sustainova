import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';

const FEATURES = [
    { icon: '🚗', title: 'Smart Parking',    desc: 'Real-time slot availability across all building levels' },
    { icon: '⚡', title: 'Green Energy',      desc: 'Gym energy generation, solar dashboard & net-zero tracking' },
    { icon: '🤖', title: 'Health AI (NOVA)', desc: 'AI-powered wellness assistant with SOS emergency support' },
];

const Login = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [mode,    setMode]    = useState('login');
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');
    const [showPw,  setShowPw]  = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', department: '', floor: 1 });

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            if (mode === 'login') {
                await login({ email: form.email, password: form.password });
            } else {
                await register({ name: form.name, email: form.email, password: form.password, department: form.department, floor: form.floor });
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sn-login">

            {/* ── Left panel ──────────────────────────── */}
            <div className="sn-login__left">
                {/* Logo */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3.5rem' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#00C9B1,#009B8B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.375rem', boxShadow: '0 4px 20px rgba(0,201,177,0.3)' }}>🏢</div>
                        <div>
                            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: '#fff', letterSpacing: '0.08em' }}>SUSTAINOVA</p>
                            <p style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', marginTop: 2 }}>SMART OFFICE BUILDING</p>
                        </div>
                    </div>

                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: '0.75rem' }}>
                        Welcome<br />
                        <span style={{ color: '#00C9B1' }}>Back.</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', marginBottom: '3rem', lineHeight: 1.6 }}>
                        Your smart building awaits.<br />Access everything from here.
                    </p>

                    {/* Feature list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {FEATURES.map(({ icon, title, desc }) => (
                            <div key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(0,201,177,0.12)', border: '1px solid rgba(0,201,177,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>{icon}</div>
                                <div>
                                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{title}</p>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem', lineHeight: 1.5 }}>{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', position: 'relative', zIndex: 1, lineHeight: 1.6 }}>
                    Powered by <span style={{ color: 'rgba(255,255,255,0.5)' }}>TATA Realty</span><br />
                    Solar Decathlon India 2026 · VESCOA + VESIT
                </p>
            </div>

            {/* ── Right panel ─────────────────────────── */}
            <div className="sn-login__right">
                <div className="sn-login__card">

                    {/* Header */}
                    <div style={{ marginBottom: '1.75rem' }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 700, color: 'var(--sn-text)', marginBottom: '0.375rem' }}>
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: 'var(--sn-muted)' }}>
                            {mode === 'login' ? 'Enter your credentials to access the building.' : 'Register as an employee to get started.'}
                        </p>
                    </div>

                    {/* Mode tabs */}
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--sn-surface)', borderRadius: '0.875rem', padding: '4px', marginBottom: '1.5rem' }}>
                        {[{ id: 'login', label: '🔑 Sign In' }, { id: 'register', label: '✨ Register' }].map(m => (
                            <button
                                key={m.id}
                                onClick={() => { setMode(m.id); setError(''); }}
                                style={{
                                    flex: 1, padding: '0.5rem', borderRadius: '0.625rem', border: 'none',
                                    background: mode === m.id ? 'var(--sn-card)' : 'transparent',
                                    color: mode === m.id ? 'var(--sn-text)' : 'var(--sn-muted)',
                                    fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                                    fontFamily: 'var(--font-sans)',
                                    boxShadow: mode === m.id ? 'var(--sn-shadow-sm)' : 'none',
                                    transition: 'all 0.15s',
                                }}
                            >{m.label}</button>
                        ))}
                    </div>

                    <form onSubmit={submit}>
                        {/* Register extras */}
                        {mode === 'register' && (
                            <>
                                {/* Notice */}
                                <div style={{
                                    background: 'var(--sn-teal-dim)',
                                    border: '1px solid var(--sn-teal-mid)',
                                    borderRadius: '0.875rem', padding: '0.75rem 1rem',
                                    marginBottom: '1.25rem', fontSize: '0.8125rem',
                                    color: 'var(--sn-muted)', lineHeight: 1.6,
                                }}>
                                    👤 <strong style={{ color: 'var(--sn-text)' }}>Employee Registration</strong><br />
                                    Maintenance & Admin accounts are created by the Building Admin. Visitors receive a gate pass via email — no login needed.
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.75rem' }}>
                                    <div className="sn-field" style={{ gridColumn: '1/-1' }}>
                                        <label className="sn-label">Full Name</label>
                                        <input name="name" className="sn-input" placeholder="Varun Rahatgaonkar" value={form.name} onChange={handle} required />
                                    </div>
                                    <div className="sn-field">
                                        <label className="sn-label">Department</label>
                                        <input name="department" className="sn-input" placeholder="IT Engineering" value={form.department} onChange={handle} />
                                    </div>
                                    <div className="sn-field">
                                        <label className="sn-label">Floor</label>
                                        <input name="floor" type="number" className="sn-input" placeholder="12" value={form.floor} onChange={handle} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div className="sn-field">
                            <label className="sn-label">Email Address</label>
                            <div className="sn-input-wrap">
                                <span className="sn-input-prefix">✉️</span>
                                <input name="email" type="email" className="sn-input sn-input--icon" placeholder="varun@sustainova.in" value={form.email} onChange={handle} required autoComplete="email" />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="sn-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="sn-label">Password</label>
                                {mode === 'login' && <span style={{ fontSize: '0.75rem', color: 'var(--sn-teal)', cursor: 'pointer' }}>Forgot password?</span>}
                            </div>
                            <div className="sn-input-wrap">
                                <span className="sn-input-prefix">🔒</span>
                                <input
                                    name="password" type={showPw ? 'text' : 'password'}
                                    className="sn-input sn-input--icon"
                                    placeholder="••••••••" value={form.password}
                                    onChange={handle} required
                                    style={{ paddingRight: '2.75rem' }}
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                />
                                <button type="button" onClick={() => setShowPw(p => !p)} className="sn-input-suffix" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--sn-dim)', transition: 'color 0.15s', padding: '0.25rem' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--sn-teal)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--sn-dim)'}
                                >
                                    {showPw ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="sn-alert sn-alert--error" style={{ marginBottom: '1rem' }}>
                                ❌ {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" disabled={loading} className="sn-btn sn-btn--primary sn-btn--lg sn-btn--full" style={{ marginTop: '0.25rem' }}>
                            {loading ? <Spinner size="sm" /> : mode === 'login' ? '🏢 Sign In to Building' : '✨ Create Employee Account'}
                        </button>
                    </form>

                    {/* Footer note */}
                    <p style={{ textAlign: 'center', color: 'var(--sn-dim)', fontSize: '0.6875rem', marginTop: '1.5rem', lineHeight: 1.6 }}>
                        SUSTAINOVA · Solar Decathlon India 2026<br />
                        VESCOA Architecture + VESIT IT · TATA Realty
                    </p>
                </div>
            </div>

        </div>
    );
};

export default Login;
