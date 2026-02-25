import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your backend URL
// const API_BASE = 'http://15.20.81.26:5000/api'; // Official Local IP
// const API_BASE = 'http://10.0.2.2:5000/api'; // Android emulator
const API_BASE = 'https://greencycle-api.onrender.com/api'; // Production

const getToken = async () => {
    return await AsyncStorage.getItem('gc_token');
};

const getHeaders = async () => {
    const token = await getToken();
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
    sendOTP: async (phone) => {
        const res = await fetch(`${API_BASE}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        });
        return handleResponse(res);
    },

    verifyOTP: async (phone, otp) => {
        const res = await fetch(`${API_BASE}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp })
        });
        return handleResponse(res);
    },

    getProfile: async () => {
        const res = await fetch(`${API_BASE}/auth/profile`, { headers: await getHeaders() });
        return handleResponse(res);
    },

    updateProfile: async (data) => {
        const res = await fetch(`${API_BASE}/auth/profile`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    addAddress: async (data) => {
        const res = await fetch(`${API_BASE}/auth/address`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    deleteAddress: async (addressId) => {
        const res = await fetch(`${API_BASE}/auth/address/${addressId}`, {
            method: 'DELETE',
            headers: await getHeaders()
        });
        return handleResponse(res);
    },

    // Categories
    getCategories: async () => {
        const res = await fetch(`${API_BASE}/categories`);
        return handleResponse(res);
    },

    // Bookings
    createBooking: async (data) => {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    getMyBookings: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${API_BASE}/bookings/my?${query}`, { headers: await getHeaders() });
        return handleResponse(res);
    },

    getBooking: async (id) => {
        const res = await fetch(`${API_BASE}/bookings/${id}`, { headers: await getHeaders() });
        return handleResponse(res);
    },

    cancelBooking: async (id, reason) => {
        const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify({ reason })
        });
        return handleResponse(res);
    },

    rateBooking: async (id, rating, feedback) => {
        const res = await fetch(`${API_BASE}/bookings/${id}/rate`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify({ rating, feedback })
        });
        return handleResponse(res);
    },

    // Payments
    createPaymentOrder: async (bookingId, amount) => {
        const res = await fetch(`${API_BASE}/payments/create-order`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify({ bookingId, amount })
        });
        return handleResponse(res);
    },

    getPaymentHistory: async () => {
        const res = await fetch(`${API_BASE}/payments/history`, { headers: await getHeaders() });
        return handleResponse(res);
    },

    // Notifications
    getNotifications: async () => {
        const res = await fetch(`${API_BASE}/notifications/my`, { headers: await getHeaders() });
        return handleResponse(res);
    },

    markNotificationRead: async (id) => {
        const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
            method: 'PUT',
            headers: await getHeaders()
        });
        return handleResponse(res);
    },

    // Business Info
    getBusinessInfo: async () => {
        const res = await fetch(`${API_BASE}/business-info`);
        return handleResponse(res);
    },

    // Agent endpoints
    getAgentPickups: async (status) => {
        const query = status ? `?status=${status}` : '';
        const res = await fetch(`${API_BASE}/agents/pickups${query}`, { headers: await getHeaders() });
        return handleResponse(res);
    },

    startPickup: async (id) => {
        const res = await fetch(`${API_BASE}/agents/pickups/${id}/start`, {
            method: 'PUT',
            headers: await getHeaders()
        });
        return handleResponse(res);
    },

    completePickup: async (id, data) => {
        const res = await fetch(`${API_BASE}/agents/pickups/${id}/complete`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    }
};

export default api;
