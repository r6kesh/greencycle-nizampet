const API_BASE = '/api';

const getHeaders = () => {
    const token = localStorage.getItem('gc_admin_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

const handleResponse = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
};

const api = {
    // Auth
    login: (phone, password) =>
        fetch(`${API_BASE}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        }).then(handleResponse),

    getProfile: () =>
        fetch(`${API_BASE}/auth/profile`, { headers: getHeaders() }).then(handleResponse),

    // Analytics
    getDashboard: () =>
        fetch(`${API_BASE}/analytics/dashboard`, { headers: getHeaders() }).then(handleResponse),

    getRevenue: (period) =>
        fetch(`${API_BASE}/analytics/revenue?period=${period}`, { headers: getHeaders() }).then(handleResponse),

    exportCSV: (params) =>
        fetch(`${API_BASE}/analytics/export?${new URLSearchParams(params)}`, { headers: getHeaders() }),

    // Bookings
    getBookings: (params = {}) =>
        fetch(`${API_BASE}/bookings/all?${new URLSearchParams(params)}`, { headers: getHeaders() }).then(handleResponse),

    updateBookingStatus: (id, status) =>
        fetch(`${API_BASE}/bookings/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        }).then(handleResponse),

    assignAgent: (bookingId, agentId) =>
        fetch(`${API_BASE}/bookings/${bookingId}/assign`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ agentId })
        }).then(handleResponse),

    // Categories
    getCategories: () =>
        fetch(`${API_BASE}/categories/all`, { headers: getHeaders() }).then(handleResponse),

    createCategory: (data) =>
        fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),

    updateCategory: (id, data) =>
        fetch(`${API_BASE}/categories/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),

    deleteCategory: (id) =>
        fetch(`${API_BASE}/categories/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        }).then(handleResponse),

    // Users
    getUsers: (params = {}) =>
        fetch(`${API_BASE}/users?${new URLSearchParams(params)}`, { headers: getHeaders() }).then(handleResponse),

    toggleUser: (id) =>
        fetch(`${API_BASE}/users/${id}/toggle-active`, {
            method: 'PUT',
            headers: getHeaders()
        }).then(handleResponse),

    // Agents
    getAgents: () =>
        fetch(`${API_BASE}/agents`, { headers: getHeaders() }).then(handleResponse),

    createAgent: (data) =>
        fetch(`${API_BASE}/agents`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse),

    // Notifications
    sendNotification: (data) =>
        fetch(`${API_BASE}/notifications/send`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        }).then(handleResponse)
};

export default api;
