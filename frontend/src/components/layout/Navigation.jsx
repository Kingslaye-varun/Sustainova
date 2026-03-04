import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
    { to: '/', icon: '🏠', label: 'Home' },
    { to: '/parking', icon: '🚗', label: 'Parking' },
    { to: '/gym', icon: '🚴', label: 'Gym' },
    { to: '/aqi', icon: '🌿', label: 'AQI' },
    { to: '/support', icon: '❓', label: 'Support' },
];

const ADMIN_NAV = { to: '/admin', icon: '⚙️', label: 'Admin' };
const MAINT_NAV = { to: '/maintenance', icon: '🔧', label: 'Maintain' };

export const BottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();

    const items = [...NAV_ITEMS];
    if (user?.role === 'maintenance' || user?.role === 'admin') items.push(MAINT_NAV);
    if (user?.role === 'admin') items.push(ADMIN_NAV);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 h-[70px] bg-[rgba(10,22,40,0.96)] backdrop-blur-xl border-t border-[rgba(0,201,177,0.12)] flex items-center justify-around px-2">
            {items.map(({ to, icon, label }) => {
                const isActive = location.pathname === to;
                return (
                    <Link
                        key={to}
                        to={to}
                        className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all duration-150 ${isActive ? '' : 'opacity-50 hover:opacity-75'}`}
                    >
                        <span className={`text-xl transition-all duration-150 ${isActive ? 'drop-shadow-[0_0_6px_#00C9B1]' : ''}`}>
                            {icon}
                        </span>
                        <span className={`text-[9px] font-semibold leading-none ${isActive ? 'text-[#00C9B1]' : 'text-[#4A6580]'}`}>
                            {label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
};

export const Header = ({ aqiValue = 42 }) => {
    const { user } = useAuth();
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-[60px] bg-[rgba(10,22,40,0.92)] backdrop-blur-xl border-b border-[rgba(0,201,177,0.12)] flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <span className="text-xl">🏢</span>
                <div className="leading-none">
                    <div className="font-['Space_Grotesk'] font-bold text-[#00C9B1] text-base leading-tight">SUSTAINOVA</div>
                    <div className="text-[10px] text-[#4A6580] capitalize">{user?.role || 'Guest'}</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${aqiValue < 50 ? 'bg-[rgba(46,204,113,0.15)] text-[#2ECC71] border-[rgba(46,204,113,0.3)]' : aqiValue < 100 ? 'bg-[rgba(245,184,0,0.15)] text-[#F5B800] border-[rgba(245,184,0,0.3)]' : 'bg-[rgba(255,71,87,0.15)] text-[#FF4757] border-[rgba(255,71,87,0.3)]'}`}>
                    🌿 AQI {aqiValue}
                </span>
                <Link to="/profile">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00C9B1] to-[#00A896] flex items-center justify-center text-[#0A1628] text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
                        {initials}
                    </div>
                </Link>
            </div>
        </header>
    );
};
