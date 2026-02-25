const API_BASE = 'https://greencycle-api.onrender.com/api';

const getHeaders = () => {
    const token = localStorage.getItem('gc_agent_token');
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
            headers: getHeaders(),
            body: JSON.stringify({ phone, password })
        }).then(handleResponse),

    getProfile: () =>
        fetch(`${API_BASE}/auth/profile`, { headers: getHeaders() }).then(handleResponse),

    // Tasks (Bookings assigned to this agent)
    getTasks: () =>
        fetch(`${API_BASE}/agents/pickups`, { headers: getHeaders() }).then(handleResponse),

    updateTaskStatus: (id, status) => {
        const route = status === 'out_for_pickup' ? 'start' : 'complete';
        return fetch(`${API_BASE}/agents/pickups/${id}/${route}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        }).then(handleResponse);
    },

    completeTask: (id, finalAmount, items) =>
        fetch(`${API_BASE}/agents/pickups/${id}/complete`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ finalAmount, items })
        }).then(handleResponse)
};

export default api;
