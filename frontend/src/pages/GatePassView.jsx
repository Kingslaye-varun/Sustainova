import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { gatePassAPI } from '../services/api';

const StatusBadge = ({ status }) => {
    const cfg = {
        active:  { bg: 'rgba(26,122,68,0.10)',  border: 'rgba(26,122,68,0.35)',  color: '#1A7A44', icon: '✅', label: 'ACTIVE'  },
        expired: { bg: 'rgba(200,41,58,0.10)',   border: 'rgba(200,41,58,0.35)',  color: '#C8293A', icon: '❌', label: 'EXPIRED' },
        revoked: { bg: 'rgba(100,110,120,0.10)', border: 'rgba(100,110,120,0.3)', color: '#667788', icon: '🚫', label: 'REVOKED' },
        used:    { bg: 'rgba(245,184,0,0.10)',   border: 'rgba(245,184,0,0.35)',  color: '#B87900', icon: '🔄', label: 'USED'    },
    }[status] || { bg: 'transparent', border: '#888', color: '#888', icon: '❓', label: status };

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.875rem', borderRadius: 99,
            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
        }}>
            {cfg.icon} {cfg.label}
        </span>
    );
};

const InfoRow = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: '0.8125rem', color: '#4A6580' }}>{label}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: color || '#0F1C2E', textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
);

const GatePassView = () => {
    const { code } = useParams();
    const [pass,    setPass]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        if (!code) return;
        const isStaff = code.startsWith('STGP-');
        const fn = isStaff ? gatePassAPI.verifyStaff : gatePassAPI.verifyVisitor;
        fn(code)
            .then(r => setPass({ ...r.data.pass, _type: isStaff ? 'staff' : 'visitor' }))
            .catch(() => setError('Gate pass not found or invalid code.'))
            .finally(() => setLoading(false));
    }, [code]);

    const isActive = pass?.status === 'active';

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F5F9' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏢</div>
                <p style={{ color: '#4A6580', fontFamily: "'Inter', sans-serif" }}>Verifying gate pass…</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F5F9', padding: '1rem' }}>
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>❌</div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#0F1C2E', marginBottom: '0.5rem' }}>Invalid Pass</h2>
                <p style={{ color: '#4A6580', fontSize: '0.875rem' }}>{error}</p>
                <p style={{ color: '#8A9BAD', fontSize: '0.75rem', marginTop: '1rem' }}>Contact reception at Ext. 100 for assistance.</p>
            </div>
        </div>
    );

    const isStaff = pass._type === 'staff';
    const user = isStaff ? pass.userId : null;

    return (
        <div style={{ minHeight: '100vh', background: '#F2F5F9', fontFamily: "'Inter', sans-serif", padding: '1rem' }}>
            <div style={{ maxWidth: 480, margin: '0 auto' }}>

                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg,#0A1628,#132845)',
                    borderRadius: '1.25rem 1.25rem 0 0',
                    padding: '1.5rem',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏢</div>
                    <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#00C9B1', fontSize: '1.375rem', fontWeight: 700, letterSpacing: '2px', margin: 0 }}>
                        SUSTAINOVA
                    </h1>
                    <p style={{ color: '#8BA3B8', fontSize: '0.75rem', margin: '0.375rem 0 0' }}>
                        {isStaff ? 'Staff Gate Pass' : 'Visitor Gate Pass'} · Ghansoli, Navi Mumbai
                    </p>
                </div>

                {/* Body */}
                <div style={{ background: '#FFFFFF', padding: '1.5rem', borderLeft: '1px solid #E4EBF2', borderRight: '1px solid #E4EBF2' }}>

                    {/* Status banner */}
                    <div style={{
                        padding: '1rem',
                        borderRadius: '0.875rem',
                        background: isActive ? 'rgba(26,122,68,0.06)' : 'rgba(200,41,58,0.06)',
                        border: `1px solid ${isActive ? 'rgba(26,122,68,0.25)' : 'rgba(200,41,58,0.25)'}`,
                        textAlign: 'center',
                        marginBottom: '1.25rem',
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.375rem' }}>{isActive ? '✅' : '🚫'}</div>
                        <StatusBadge status={pass.status} />
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: '#4A6580' }}>
                            {isActive ? 'This pass is valid. Welcome to SUSTAINOVA!' : 'This pass is no longer valid for entry.'}
                        </p>
                    </div>

                    {/* Photo (staff) */}
                    {isStaff && pass.photoUrl && (
                        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                            <img
                                src={pass.photoUrl}
                                alt="Staff Photo"
                                style={{
                                    width: 100, height: 100, borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '3px solid #00C9B1',
                                    display: 'block', margin: '0 auto',
                                }}
                            />
                        </div>
                    )}

                    {/* Pass info */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        {isStaff ? (
                            <>
                                <InfoRow label="👤 Name"        value={user?.name || '—'} color="#0F1C2E" />
                                <InfoRow label="🆔 Staff ID"    value={user?.userId || '—'} color="#007A6E" />
                                <InfoRow label="🏢 Department"  value={user?.department || '—'} />
                                <InfoRow label="🔖 Role"        value="Maintenance Staff" />
                                <InfoRow label="🗓 Issued"      value={new Date(pass.issuedDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })} />
                                {pass.expiryDate && (
                                    <InfoRow label="📅 Expires" value={new Date(pass.expiryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })} />
                                )}
                            </>
                        ) : (
                            <>
                                <InfoRow label="👤 Visitor"     value={pass.visitorName} color="#0F1C2E" />
                                <InfoRow label="🏢 Company"     value={pass.company || 'N/A'} />
                                <InfoRow label="📋 Purpose"     value={pass.purpose} />
                                <InfoRow label="👔 Host"        value={pass.hostEmployee} />
                                <InfoRow label="🗓 Valid From"  value={new Date(pass.validFrom).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
                                <InfoRow label="⏰ Valid Until" value={new Date(pass.validTo).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
                                <InfoRow label="🏢 Floors"      value={(pass.authorizedFloors || []).join(', ')} />
                            </>
                        )}
                        <InfoRow label="🆔 Pass Code" value={pass.passCode} color="#007A6E" />
                    </div>

                    {/* QR Code */}
                    {pass.qrCodeUrl && (
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#4A6580', marginBottom: '0.75rem' }}>
                                Show this QR code at the security gate:
                            </p>
                            <img
                                src={pass.qrCodeUrl}
                                alt="Gate Pass QR Code"
                                style={{ width: 160, height: 160, borderRadius: 12, border: '3px solid #E4EBF2', display: 'block', margin: '0 auto' }}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    background: '#0A1628',
                    borderRadius: '0 0 1.25rem 1.25rem',
                    padding: '1rem 1.5rem',
                    textAlign: 'center',
                }}>
                    <p style={{ margin: 0, color: '#4A6580', fontSize: '0.6875rem', lineHeight: 1.6 }}>
                        SUSTAINOVA · Solar Decathlon India 2026 · TATA Realty<br />
                        For assistance: Reception Ext. 100 | Security Ext. 9000
                    </p>
                </div>

            </div>
        </div>
    );
};

export default GatePassView;
