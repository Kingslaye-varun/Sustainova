import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const token = localStorage.getItem('sn_token');
        const saved = localStorage.getItem('sn_user');
        if (token && saved) {
            try {
                setUser(JSON.parse(saved));
                // Verify token is still valid
                authAPI.getMe()
                    .then(res => setUser(res.data.user))
                    .catch(() => { logout(); })
                    .finally(() => setLoading(false));
            } catch {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const res = await authAPI.login(credentials);
        const { token, user: userData } = res.data;
        localStorage.setItem('sn_token', token);
        localStorage.setItem('sn_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const register = async (data) => {
        const res = await authAPI.register(data);
        const { token, user: userData } = res.data;
        localStorage.setItem('sn_token', token);
        localStorage.setItem('sn_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        authAPI.logout().catch(() => { });
        localStorage.removeItem('sn_token');
        localStorage.removeItem('sn_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin', isMaintenance: user?.role === 'maintenance' }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
