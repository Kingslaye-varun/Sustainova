// Reusable UI primitives for SUSTAINOVA

// ── Card ──────────────────────────────────
export const Card = ({ children, className = '', variant = 'default', onClick }) => {
    const variants = {
        default: 'bg-[#132845] border border-[rgba(0,201,177,0.12)]',
        teal: 'bg-[rgba(0,201,177,0.06)] border border-[rgba(0,201,177,0.25)]',
        gold: 'bg-[rgba(245,184,0,0.06)] border border-[rgba(245,184,0,0.25)]',
        red: 'bg-[rgba(255,71,87,0.06)] border border-[rgba(255,71,87,0.25)]',
        green: 'bg-[rgba(46,204,113,0.06)] border border-[rgba(46,204,113,0.25)]',
    };
    return (
        <div
            onClick={onClick}
            className={`rounded-2xl p-4 transition-all duration-200 ${variants[variant]} ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : ''} ${className}`}
        >
            {children}
        </div>
    );
};

// ── Badge ─────────────────────────────────
export const Badge = ({ children, variant = 'teal', className = '' }) => {
    const variants = {
        teal: 'bg-[rgba(0,201,177,0.15)] text-[#00C9B1] border border-[rgba(0,201,177,0.3)]',
        gold: 'bg-[rgba(245,184,0,0.15)] text-[#F5B800] border border-[rgba(245,184,0,0.3)]',
        red: 'bg-[rgba(255,71,87,0.15)] text-[#FF4757] border border-[rgba(255,71,87,0.3)]',
        green: 'bg-[rgba(46,204,113,0.15)] text-[#2ECC71] border border-[rgba(46,204,113,0.3)]',
        purple: 'bg-[rgba(142,92,228,0.15)] text-[#8E5CE4] border border-[rgba(142,92,228,0.3)]',
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// ── Button ────────────────────────────────
export const Button = ({ children, variant = 'primary', size = 'md', className = '', disabled, onClick, type = 'button', fullWidth }) => {
    const variants = {
        primary: 'bg-gradient-to-r from-[#00C9B1] to-[#00A896] text-[#0A1628] font-semibold hover:opacity-90 shadow-[0_4px_15px_rgba(0,201,177,0.3)]',
        gold: 'bg-gradient-to-r from-[#F5B800] to-[#E5A600] text-[#0A1628] font-semibold hover:opacity-90 shadow-[0_4px_15px_rgba(245,184,0,0.3)]',
        danger: 'bg-[#FF4757] text-white font-semibold hover:bg-[#E8394A] shadow-[0_4px_15px_rgba(255,71,87,0.3)]',
        ghost: 'bg-[rgba(0,201,177,0.12)] text-[#00C9B1] border border-[rgba(0,201,177,0.3)] hover:bg-[rgba(0,201,177,0.2)]',
        outline: 'bg-transparent text-[#8BA3B8] border border-[rgba(0,201,177,0.2)] hover:border-[rgba(0,201,177,0.4)] hover:text-[#E8F4F8]',
    };
    const sizes = {
        sm: 'px-4 py-2 text-sm rounded-xl',
        md: 'px-6 py-3 text-sm rounded-2xl',
        lg: 'px-8 py-4 text-base rounded-2xl',
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 transition-all duration-150 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        >
            {children}
        </button>
    );
};

// ── Input ─────────────────────────────────
export const Input = ({ label, error, icon, className = '', ...props }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        {label && <label className="text-xs font-medium text-[#8BA3B8] uppercase tracking-wide">{label}</label>}
        <div className="relative">
            {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8BA3B8]">{icon}</span>}
            <input
                className={`w-full bg-[#0d1e35] border border-[rgba(0,201,177,0.12)] rounded-xl px-4 py-3 text-[#E8F4F8] text-sm placeholder-[#4A6580] focus:outline-none focus:border-[#00C9B1] focus:ring-1 focus:ring-[rgba(0,201,177,0.2)] transition-colors ${icon ? 'pl-10' : ''} ${className}`}
                {...props}
            />
        </div>
        {error && <span className="text-xs text-[#FF4757]">{error}</span>}
    </div>
);

// ── Select ────────────────────────────────
export const Select = ({ label, children, className = '', ...props }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        {label && <label className="text-xs font-medium text-[#8BA3B8] uppercase tracking-wide">{label}</label>}
        <select
            className={`w-full bg-[#0d1e35] border border-[rgba(0,201,177,0.12)] rounded-xl px-4 py-3 text-[#E8F4F8] text-sm focus:outline-none focus:border-[#00C9B1] transition-colors ${className}`}
            {...props}
        >
            {children}
        </select>
    </div>
);

// ── Textarea ──────────────────────────────
export const Textarea = ({ label, className = '', ...props }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        {label && <label className="text-xs font-medium text-[#8BA3B8] uppercase tracking-wide">{label}</label>}
        <textarea
            className={`w-full bg-[#0d1e35] border border-[rgba(0,201,177,0.12)] rounded-xl px-4 py-3 text-[#E8F4F8] text-sm placeholder-[#4A6580] focus:outline-none focus:border-[#00C9B1] transition-colors resize-none ${className}`}
            {...props}
        />
    </div>
);

// ── Spinner ───────────────────────────────
export const Spinner = ({ size = 'md' }) => {
    const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return (
        <div className={`${sizes[size]} border-2 border-[rgba(0,201,177,0.2)] border-t-[#00C9B1] rounded-full animate-spin`} />
    );
};

// ── PageHeader ────────────────────────────
export const PageHeader = ({ label, title, subtitle }) => (
    <div className="pt-4 pb-3">
        {label && <p className="text-[10px] font-semibold text-[#00C9B1] uppercase tracking-widest mb-1">{label}</p>}
        <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-[#8BA3B8] text-sm mt-0.5">{subtitle}</p>}
    </div>
);

// ── StatCard ──────────────────────────────
export const StatCard = ({ icon, value, label, variant = 'default', className = '' }) => (
    <Card variant={variant} className={`text-center ${className}`}>
        <div className="text-2xl mb-1">{icon}</div>
        <div className="font-['Space_Grotesk'] text-xl font-bold">{value}</div>
        <div className="text-[10px] font-medium text-[#4A6580] uppercase tracking-wide mt-0.5">{label}</div>
    </Card>
);

// ── Skeleton ──────────────────────────────
export const Skeleton = ({ className = '' }) => (
    <div className={`animate-shimmer rounded-xl ${className}`} />
);

// ── Empty State ───────────────────────────
export const EmptyState = ({ icon, message }) => (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
        <div className="text-4xl opacity-30">{icon}</div>
        <p className="text-[#8BA3B8] text-sm">{message}</p>
    </div>
);

// ── Tab Row ───────────────────────────────
export const TabRow = ({ tabs, active, onChange }) => (
    <div className="flex gap-1 bg-[#132845] rounded-full p-1 mb-4">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold transition-all duration-150 ${active === tab.id ? 'bg-[#00C9B1] text-[#0A1628]' : 'text-[#4A6580] hover:text-[#8BA3B8]'}`}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

// ── Status Chip ───────────────────────────
export const StatusChip = ({ status }) => {
    const map = {
        open: { label: 'Open', variant: 'teal' },
        in_progress: { label: 'In Progress', variant: 'gold' },
        resolved: { label: 'Resolved', variant: 'green' },
        closed: { label: 'Closed', variant: 'purple' },
        assigned: { label: 'Assigned', variant: 'teal' },
        completed: { label: 'Completed', variant: 'green' },
        cancelled: { label: 'Cancelled', variant: 'red' },
        free: { label: 'Free', variant: 'green' },
        occupied: { label: 'Occupied', variant: 'red' },
        reserved: { label: 'Reserved', variant: 'gold' },
        disabled: { label: 'Disabled', variant: 'purple' },
    };
    const s = map[status] || { label: status, variant: 'teal' };
    return <Badge variant={s.variant}>{s.label}</Badge>;
};
