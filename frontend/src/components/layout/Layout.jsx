/*
 * Layout.jsx — SUSTAINOVA
 * Desktop: top navbar + footer
 * Mobile: sticky header + bottom nav + "More" drawer
 */
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth   } from '../../context/AuthContext';
import { useTheme  } from '../../context/ThemeContext';

/* ── SVG icon set (no emoji) ────────────────────────── */
const Icon = ({ d, size = 20, strokeWidth = 1.75, ...rest }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...rest}>
        {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
);

const ICONS = {
    home:    'm3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    parking: ['M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3m3.5 6.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zm0 0 1.5 1.5','M13 17H7m4-7H8m0 0V5'],
    gym:     'M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z',
    aqi:     ['M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z','M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z'],
    health:  ['M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2'],
    support: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
    admin:   ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
    maint:   ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'],
    user:    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    moon:    'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
    sun:     ['M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z','M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'],
    bell:    ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9','M13.73 21a2 2 0 0 1-3.46 0'],
    logout:  ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4','M16 17l5-5-5-5','M21 12H9'],
    gate:    ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z','M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
    grid:    ['M10 3H3v7h7V3z','M21 3h-7v7h7V3z','M21 14h-7v7h7v-7z','M10 14H3v7h7v-7z'],
};

const NAV_LINKS = [
    { to: '/',           label: 'Dashboard',  icon: 'home'    },
    { to: '/parking',    label: 'Parking',    icon: 'parking' },
    { to: '/gym',        label: 'Gym Energy', icon: 'gym'     },
    { to: '/aqi',        label: 'AQI',        icon: 'aqi'     },
    { to: '/healthcare', label: 'Health AI',  icon: 'health'  },
    { to: '/support',    label: 'Support',    icon: 'support' },
];

const MORE_ITEMS = [
    { to: '/aqi',         label: 'AQI',        icon: 'aqi'    },
    { to: '/support',     label: 'Tickets',    icon: 'support'},
    { to: '/maintenance', label: 'Maintenance',icon: 'maint'  },
    { to: '/admin',       label: 'Admin',      icon: 'admin'  },
    { to: '/gate-pass/verify', label: 'Gate Pass', icon: 'gate'},
    { to: '/profile',     label: 'Profile',    icon: 'user'   },
];

const RoleMeta = {
    admin:       { label: 'Administrator', color: 'var(--sn-gold)'  },
    employee:    { label: 'Employee',       color: 'var(--sn-teal)'  },
    maintenance: { label: 'Maintenance',    color: 'var(--sn-red)'   },
    visitor:     { label: 'Visitor',        color: 'var(--sn-blue)'  },
};

/* ── Navbar component ───────────────────────────────── */
const Navbar = ({ user, theme, toggle, logout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

    const visibleLinks = [...NAV_LINKS];
    if (user?.role === 'admin' || user?.role === 'maintenance') {
        visibleLinks.push({ to: '/maintenance', label: 'Maintenance', icon: 'maint' });
    }
    if (user?.role === 'admin') {
        visibleLinks.push({ to: '/admin', label: 'Admin', icon: 'admin' });
    }

    return (
        <nav className="sn-navbar">
            <div className="sn-navbar__inner">
                {/* Logo */}
                <Link to="/" className="sn-navbar__logo">
                    <div className="sn-navbar__logo-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <div className="sn-navbar__logo-text">
                        <strong>SUSTAINOVA</strong>
                        <small>SMART BUILDING</small>
                    </div>
                </Link>

                {/* Nav links */}
                <div className="sn-navbar__nav">
                    {visibleLinks.map(({ to, label }) => (
                        <Link key={to} to={to} className={`sn-navbar__link ${isActive(to) ? 'active' : ''}`}>
                            {label}
                        </Link>
                    ))}
                </div>

                {/* Right actions */}
                <div className="sn-navbar__actions">
                    <span className="sn-aqi-badge">
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sn-green)', display: 'inline-block' }} />
                        AQI 42
                    </span>
                    <button className="sn-navbar__icon-btn" onClick={toggle} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                        <Icon d={theme === 'dark' ? ICONS.sun : ICONS.moon} size={16} />
                    </button>
                    <button className="sn-navbar__icon-btn" title="Notifications">
                        <Icon d={ICONS.bell} size={16} />
                    </button>
                    <Link to="/profile" className="sn-navbar__user-chip">
                        <div className="sn-avatar sn-avatar--xs">{initials}</div>
                        <span className="sn-navbar__user-name">{user?.name?.split(' ')[0]}</span>
                    </Link>
                    <button className="sn-navbar__icon-btn" onClick={() => { logout(); navigate('/login'); }} title="Sign Out">
                        <Icon d={ICONS.logout} size={16} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

/* ── Footer component ───────────────────────────────── */
const Footer = () => (
    <footer className="sn-footer">
        <div className="sn-footer__inner">
            <div className="sn-footer__grid">
                {/* Brand */}
                <div className="sn-footer__brand">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                        <div className="sn-navbar__logo-icon" style={{ width: 28, height: 28, borderRadius: 7 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: '#fff', letterSpacing: '0.06em' }}>SUSTAINOVA</span>
                    </div>
                    <p>Net-Zero Smart Office Building in Ghansoli, Navi Mumbai. Powered by solar energy, AI, and sustainable design.</p>
                </div>
                {/* Quick links */}
                <div className="sn-footer__col">
                    <h4>Quick Links</h4>
                    {[['/', 'Dashboard'], ['/parking', 'Smart Parking'], ['/gym', 'Gym Energy'], ['/aqi', 'AQI Monitor'], ['/healthcare', 'Health AI'], ['/support', 'Support']].map(([to, label]) => (
                        <Link key={to} to={to}>{label}</Link>
                    ))}
                </div>
                {/* Contact */}
                <div className="sn-footer__col">
                    <h4>Building Contacts</h4>
                    <p>Reception &nbsp;&nbsp;&nbsp;Ext. 100</p>
                    <p>Security &nbsp;&nbsp;&nbsp;&nbsp;Ext. 9000</p>
                    <p>IT Support &nbsp;&nbsp;Ext. 200</p>
                    <p>Doctor &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Ext. 300</p>
                    <p style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>Ghansoli, Navi Mumbai — 400701</p>
                </div>
            </div>
            <div className="sn-footer__bottom">
                <p>© 2026 SUSTAINOVA · TATA Realty · Solar Decathlon India · VESCOA + VESIT</p>
                <div className="sn-footer__powered">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 2.5h3L12 7" /><path d="M10 14v-3" /><path d="M14 14v-3" /><path d="M11 19c-1.7 0-3-1.3-3-3v-2h8v2c0 1.7-1.3 3-3 3h-2Z" /><path d="M12 22v-3" /></svg>
                    Powered by Gemini AI
                </div>
            </div>
        </div>
    </footer>
);

/* ── Mobile Bottom Nav ──────────────────────────────── */
const MOBILE_NAV = [
    { to: '/',           label: 'Home',    icon: 'home'    },
    { to: '/parking',    label: 'Parking', icon: 'parking' },
    { to: '/gym',        label: 'Gym',     icon: 'gym'     },
    { to: '/healthcare', label: 'Health',  icon: 'health'  },
    { key: 'more',       label: 'More',    icon: 'grid'    },
];

const MobileNav = ({ user, onMore }) => {
    const location = useLocation();
    const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

    return (
        <div className="sn-bottom-nav">
            {MOBILE_NAV.map(item =>
                item.key === 'more' ? (
                    <button key="more" className="sn-bottom-nav-item" onClick={onMore}
                        style={{ color: 'var(--sn-muted)' }}>
                        <Icon d={ICONS[item.icon]} size={22} />
                        <span className="bnl" style={{ color: 'var(--sn-dim)' }}>{item.label}</span>
                    </button>
                ) : (
                    <Link key={item.to} to={item.to} className="sn-bottom-nav-item"
                        style={{ color: isActive(item.to) ? 'var(--sn-teal)' : 'var(--sn-muted)' }}>
                        <Icon d={ICONS[item.icon]} size={22} />
                        <span className="bnl">{item.label}</span>
                    </Link>
                )
            )}
        </div>
    );
};

/* ── More Drawer ────────────────────────────────────── */
const MoreDrawer = ({ user, open, onClose, onLogout, onTheme, theme }) => {
    const moreItems = [...MORE_ITEMS];
    if (user?.role !== 'admin') {
        moreItems.splice(3, 1); // remove Admin
    }
    if (user?.role !== 'admin' && user?.role !== 'maintenance') {
        moreItems.splice(2, 1); // remove Maintenance
    }

    return (
        <>
            {open && <div className="sn-backdrop" onClick={onClose} />}
            <div className={`sn-more-drawer ${open ? 'open' : ''}`}>
                <div className="sn-more-drawer__handle" />
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sn-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
                    More Options
                </p>
                <div className="sn-more-drawer__grid">
                    {moreItems.map(item => (
                        <Link key={item.to} to={item.to} className="sn-more-drawer__item" onClick={onClose}>
                            <Icon d={ICONS[item.icon]} size={22} strokeWidth={1.5} style={{ color: 'var(--sn-teal)' }} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <button className="sn-more-drawer__item" onClick={onTheme}>
                        <Icon d={theme === 'dark' ? ICONS.sun : ICONS.moon} size={22} strokeWidth={1.5} style={{ color: 'var(--sn-muted)' }} />
                        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>
                    <button className="sn-more-drawer__item" onClick={onLogout}
                        style={{ color: 'var(--sn-red)' }}>
                        <Icon d={ICONS.logout} size={22} strokeWidth={1.5} style={{ color: 'var(--sn-red)' }} />
                        <span style={{ color: 'var(--sn-red)' }}>Sign Out</span>
                    </button>
                </div>
            </div>
        </>
    );
};

/* ── Main Layout export ─────────────────────────────── */
const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggle } = useTheme();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    const rm = RoleMeta[user?.role] || RoleMeta.employee;

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div className="sn-app">
            {/* Desktop Navbar */}
            <Navbar user={user} theme={theme} toggle={toggle} logout={logout} />

            {/* Mobile header */}
            <header className="sn-mobile-header">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <div className="sn-navbar__logo-icon" style={{ width: 28, height: 28, borderRadius: 7 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--sn-teal)', letterSpacing: '0.05em' }}>SUSTAINOVA</span>
                </Link>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={toggle} className="sn-navbar__icon-btn">
                        <Icon d={theme === 'dark' ? ICONS.sun : ICONS.moon} size={16} />
                    </button>
                    <Link to="/profile">
                        <div className="sn-avatar sn-avatar--sm">{initials}</div>
                    </Link>
                </div>
            </header>

            {/* Page content */}
            <div className="sn-page">
                {children}
            </div>

            {/* Desktop Footer */}
            <Footer />

            {/* Mobile bottom nav */}
            <MobileNav user={user} onMore={() => setDrawerOpen(true)} />

            {/* More Drawer */}
            <MoreDrawer
                user={user} open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onLogout={() => { setDrawerOpen(false); handleLogout(); }}
                onTheme={() => { toggle(); setDrawerOpen(false); }}
                theme={theme}
            />
        </div>
    );
};

export default Layout;
