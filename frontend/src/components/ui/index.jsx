/* UI Primitives — SUSTAINOVA Design System */

/* ── Spinner ─────────────────────────────────────────── */
export const Spinner = ({ size = 'md' }) => (
    <span className={`sn-spinner sn-spinner--${size}`} />
);

/* ── Badge ───────────────────────────────────────────── */
export const Badge = ({ variant = 'teal', children }) => (
    <span className={`sn-badge sn-badge--${variant}`}>{children}</span>
);

/* ── Button ──────────────────────────────────────────── */
export const Button = ({
    children, onClick, type = 'button',
    variant = 'primary', size = 'md', fullWidth = false,
    disabled = false, className = '', ...rest
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`sn-btn sn-btn--${variant} ${size !== 'md' ? `sn-btn--${size}` : ''} ${fullWidth ? 'sn-btn--full' : ''} ${className}`}
        {...rest}
    >
        {children}
    </button>
);

/* ── Input ───────────────────────────────────────────── */
export const Input = ({
    label, name, type = 'text', placeholder, value, onChange,
    icon, required = false, ...rest
}) => (
    <div className="sn-field">
        {label && <label className="sn-label" htmlFor={name}>{label}</label>}
        <div className="sn-input-wrap">
            {icon && <span className="sn-input-prefix">{icon}</span>}
            <input
                id={name} name={name} type={type}
                placeholder={placeholder} value={value}
                onChange={onChange} required={required}
                className={`sn-input${icon ? ' sn-input--icon' : ''}`}
                {...rest}
            />
        </div>
    </div>
);

/* ── Textarea ────────────────────────────────────────── */
export const Textarea = ({ label, name, placeholder, value, onChange, rows = 3, ...rest }) => (
    <div className="sn-field">
        {label && <label className="sn-label" htmlFor={name}>{label}</label>}
        <textarea
            id={name} name={name} placeholder={placeholder}
            value={value} onChange={onChange} rows={rows}
            className="sn-input"
            {...rest}
        />
    </div>
);

/* ── Select ──────────────────────────────────────────── */
export const Select = ({ label, name, value, onChange, children, ...rest }) => (
    <div className="sn-field">
        {label && <label className="sn-label" htmlFor={name}>{label}</label>}
        <select id={name} name={name} value={value} onChange={onChange} className="sn-input" {...rest}>
            {children}
        </select>
    </div>
);

/* ── Card ────────────────────────────────────────────── */
export const Card = ({ children, style, flat = false, className = '', ...rest }) => (
    <div
        className={`sn-card ${flat ? 'sn-card--flat' : ''} ${className}`}
        style={style}
        {...rest}
    >
        {children}
    </div>
);

/* ── StatCard ────────────────────────────────────────── */
const STAT_VARIANTS = {
    teal:  { iconBg: 'var(--sn-teal-dim)',  iconColor: 'var(--sn-teal)'  },
    green: { iconBg: 'var(--sn-green-dim)', iconColor: 'var(--sn-green)' },
    red:   { iconBg: 'var(--sn-red-dim)',   iconColor: 'var(--sn-red)'   },
    gold:  { iconBg: 'var(--sn-gold-dim)',  iconColor: 'var(--sn-gold)'  },
    blue:  { iconBg: 'var(--sn-blue-dim)',  iconColor: 'var(--sn-blue)'  },
    dim:   { iconBg: 'rgba(74,101,128,0.1)', iconColor: 'var(--sn-muted)' },
};
export const StatCard = ({ icon, value, label, sub, variant = 'teal', trend }) => {
    const v = STAT_VARIANTS[variant] || STAT_VARIANTS.teal;
    return (
        <div className="sn-stat-card">
            <div className="sn-stat-card__icon" style={{ background: v.iconBg, color: v.iconColor }}>
                {icon}
            </div>
            <div className="sn-stat-card__value">{value}</div>
            <div className="sn-stat-card__label">{label}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: 'var(--sn-dim)' }}>{sub}</div>}
            {trend && (
                <div className="sn-stat-card__trend" style={{ color: trend.up ? 'var(--sn-green)' : 'var(--sn-red)' }}>
                    {trend.up ? '↑' : '↓'} {trend.value}
                </div>
            )}
        </div>
    );
};

/* ── TabRow ──────────────────────────────────────────── */
export const TabRow = ({ tabs, active, onChange }) => (
    <div className="sn-tabs">
        {tabs.map(t => (
            <button
                key={t.id}
                className={`sn-tab ${active === t.id ? 'active' : ''}`}
                onClick={() => onChange(t.id)}
            >
                {t.label}
            </button>
        ))}
    </div>
);

/* ── StatusChip ──────────────────────────────────────── */
const STATUS_MAP = {
    open:        { variant: 'red',   label: 'Open'        },
    'in-progress':{ variant: 'gold', label: 'In Progress' },
    resolved:    { variant: 'green', label: 'Resolved'    },
    closed:      { variant: 'dim',   label: 'Closed'      },
    active:      { variant: 'green', label: 'Active'      },
    expired:     { variant: 'red',   label: 'Expired'     },
    revoked:     { variant: 'dim',   label: 'Revoked'     },
    online:      { variant: 'green', label: 'Online'      },
    offline:     { variant: 'red',   label: 'Offline'     },
};
export const StatusChip = ({ status }) => {
    const m = STATUS_MAP[status] || { variant: 'dim', label: status };
    return <Badge variant={m.variant}>{m.label}</Badge>;
};

/* ── PageHeader ──────────────────────────────────────── */
export const PageHeader = ({ label, title, subtitle, action }) => (
    <div className="sn-page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
            {label && <p className="sn-section-title" style={{ marginBottom: '0.375rem' }}>{label}</p>}
            {title && <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>{title}</h1>}
            {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--sn-muted)', marginTop: '0.25rem' }}>{subtitle}</p>}
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
);

/* ── EmptyState ──────────────────────────────────────── */
export const EmptyState = ({ icon = '📭', message = 'Nothing here yet.', action }) => (
    <div className="sn-empty">
        <div className="sn-empty__icon">{icon}</div>
        <p className="sn-empty__text">{message}</p>
        {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
);

/* ── Divider ─────────────────────────────────────────── */
export const Divider = ({ text }) =>
    text
        ? <div className="sn-divider--text">{text}</div>
        : <div className="sn-divider" />;

/* ── Progress ────────────────────────────────────────── */
export const Progress = ({ value, max = 100, color }) => (
    <div className="sn-progress">
        <div
            className="sn-progress__fill"
            style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color || 'var(--sn-teal)' }}
        />
    </div>
);
