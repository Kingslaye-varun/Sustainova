import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sn_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('sn_token');
            localStorage.removeItem('sn_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ── Auth ──
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
};

// ── Users ──
export const userAPI = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    update: (id, d) => api.put(`/users/${id}`, d),
    deactivate: (id) => api.delete(`/users/${id}`),
};

// ── Tickets ──
export const ticketAPI = {
    getAll: (params) => api.get('/tickets', { params }),
    getStats: () => api.get('/tickets/stats'),
    create: (data) => api.post('/tickets', data),
    update: (id, d) => api.put(`/tickets/${id}`, d),
};

// ── Parking ──
export const parkingAPI = {
    getSlots: (params) => api.get('/parking', { params }),
    getStats: () => api.get('/parking/stats'),
    reserve: (slotId, data) => api.post(`/parking/${slotId}/reserve`, data),
    free: (slotId) => api.delete(`/parking/${slotId}/reserve`),
    seed: () => api.post('/parking/seed'),
};

// ── Gym ──
export const gymAPI = {
    getCycles: () => api.get('/gym/cycles'),
    updateCycle: (cycleId, data) => api.patch(`/gym/cycles/${cycleId}`, data),
    getEnergy: () => api.get('/gym/energy'),
};

// ── Maintenance ──
export const maintenanceAPI = {
    getTasks: (params) => api.get('/maintenance', { params }),
    create: (data) => api.post('/maintenance', data),
    update: (id, d) => api.put(`/maintenance/${id}`, d),
};

// ── Announcements ──
export const announcementAPI = {
    getAll: () => api.get('/announcements'),
    create: (data) => api.post('/announcements', data),
    delete: (id) => api.delete(`/announcements/${id}`),
};

export default api;
