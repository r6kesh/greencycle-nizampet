const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
    const token = localStorage.getItem('gc_token');
    return {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

const handleRes = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
};

export const api = {
    // Auth - OTP based
    sendOtp: (phone) =>
        fetch(`${API_BASE}/auth/send-otp`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ phone }) }).then(handleRes),
    verifyOtp: (phone, otp, name, address) =>
        fetch(`${API_BASE}/auth/verify-otp`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ phone, otp, name, address }) }).then(handleRes),

    // Categories
    getCategories: () =>
        fetch(`${API_BASE}/categories`, { headers: getHeaders() }).then(handleRes),

    // Bookings
    createBooking: (body) =>
        fetch(`${API_BASE}/bookings`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleRes),
    getMyBookings: () =>
        fetch(`${API_BASE}/bookings/my`, { headers: getHeaders() }).then(handleRes),
    getBooking: (id) =>
        fetch(`${API_BASE}/bookings/${id}`, { headers: getHeaders() }).then(handleRes),
};

export default api;
