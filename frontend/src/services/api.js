import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
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

// ── Gate Passes ──
export const gatePassAPI = {
    // Visitor
    createVisitor: (data) => api.post('/gate-pass/visitor', data),
    listVisitors:  (params) => api.get('/gate-pass/visitor', { params }),
    revokeVisitor: (id) => api.delete(`/gate-pass/visitor/${id}`),
    verifyVisitor: (code) => api.get(`/gate-pass/visitor/verify/${code}`),

    // Staff (maintenance)
    createStaffUser: (formData) => api.post('/gate-pass/staff/create-staff', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    listStaff:  () => api.get('/gate-pass/staff'),
    verifyStaff: (code) => api.get(`/gate-pass/staff/verify/${code}`),
};

// ── Healthcare (Gemini / NOVA AI) ──
export const healthcareAPI = {
    chat:   (data) => api.post('/healthcare/chat', data),
    getDailyTip: () => api.get('/healthcare/tip'),
};

export default api;

