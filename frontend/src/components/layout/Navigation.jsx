import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
    { to: '/',           icon: '🏠', label: 'Home'    },
    { to: '/parking',    icon: '🚗', label: 'Parking' },
    { to: '/gym',        icon: '🚴', label: 'Gym'     },
    { to: '/aqi',        icon: '🌿', label: 'AQI'     },
    { to: '/support',    icon: '❓', label: 'Support' },
];

const ADMIN_NAV = { to: '/admin',       icon: '⚙️', label: 'Admin'    };
const MAINT_NAV = { to: '/maintenance', icon: '🔧', label: 'Maintain' };

export const BottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();

    const items = [...NAV_ITEMS];
    if (user?.role === 'maintenance' || user?.role === 'admin') items.push(MAINT_NAV);
    if (user?.role === 'admin') items.push(ADMIN_NAV);

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            zIndex: 50,
            height: 68,
            background: 'var(--sn-nav-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid var(--sn-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 0.25rem',
            transition: 'background-color 0.3s, border-color 0.3s',
        }}>
            {items.map(({ to, icon, label }) => {
                const isActive = location.pathname === to;
                return (
                    <Link key={to} to={to} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.2rem',
                        flex: 1,
                        padding: '0.5rem 0.25rem',
                        borderRadius: '0.75rem',
                        opacity: isActive ? 1 : 0.5,
                        transition: 'opacity 0.15s',
                        textDecoration: 'none',
                    }}>
                        <span style={{
                            fontSize: '1.25rem', lineHeight: 1,
                            filter: isActive ? 'drop-shadow(0 0 5px var(--sn-teal))' : 'none',
                            transition: 'filter 0.15s',
                        }}>{icon}</span>
                        <span style={{
                            fontSize: '0.5625rem',
                            fontWeight: 700,
                            letterSpacing: '0.03em',
                            color: isActive ? 'var(--sn-teal)' : 'var(--sn-dim)',
                            lineHeight: 1,
                        }}>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

export const Header = ({ aqiValue = 42 }) => {
    const { user } = useAuth();
    const { theme, toggle } = useTheme();
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    const aqiColor = aqiValue < 50
        ? { color: 'var(--sn-green)', bg: 'var(--sn-green-dim)', border: 'rgba(46,204,113,0.30)' }
        : aqiValue < 100
        ? { color: 'var(--sn-gold)',  bg: 'var(--sn-gold-dim)',  border: 'rgba(245,184,0,0.30)'   }
        : { color: 'var(--sn-red)',   bg: 'var(--sn-red-dim)',   border: 'rgba(255,71,87,0.30)'   };

    return (
        <header style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            zIndex: 50,
            height: 60,
            background: 'var(--sn-header-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--sn-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            transition: 'background-color 0.3s, border-color 0.3s',
        }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🏢</span>
                <div style={{ lineHeight: 1 }}>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        color: 'var(--sn-teal)',
                        fontSize: '0.9375rem',
                        letterSpacing: '0.02em',
                    }}>SUSTAINOVA</div>
                    <div style={{
                        fontSize: '0.625rem',
                        color: 'var(--sn-dim)',
                        textTransform: 'capitalize',
                        marginTop: 1,
                    }}>{user?.role || 'Guest'}</div>
                </div>
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* AQI badge */}
                <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.625rem',
                    borderRadius: 99,
                    background: aqiColor.bg,
                    color: aqiColor.color,
                    border: `1px solid ${aqiColor.border}`,
                    transition: 'all 0.3s',
                }}>🌿 AQI {aqiValue}</span>

                {/* Theme toggle */}
                <button
                    onClick={toggle}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        border: '1px solid var(--sn-border)',
                        background: 'var(--sn-dark)',
                        color: 'var(--sn-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sn-teal)'; e.currentTarget.style.color = 'var(--sn-teal)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--sn-border)'; e.currentTarget.style.color = 'var(--sn-muted)'; }}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {/* Avatar */}
                <Link to="/profile" style={{ textDecoration: 'none' }}>
                    <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--sn-teal), #00A896)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'transform 0.15s',
                        flexShrink: 0,
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >{initials}</div>
                </Link>
            </div>
        </header>
    );
};
