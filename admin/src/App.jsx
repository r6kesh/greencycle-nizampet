import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, Calendar, Users, Truck, BarChart3,
    Bell, LogOut, Settings, Search, ChevronDown, Menu, X,
    TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle,
    Plus, Edit, Trash2, Eye, Download, Send, RefreshCw,
    Phone, MapPin, Star, Filter, MoreVertical, FileText, Megaphone
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from './api';

// ═══════════════════════════════════════════════
// Auth Context
// ═══════════════════════════════════════════════
const useAuth = () => {
    const [user, setUser] = useState(() => {
        const saved = sessionStorage.getItem('gc_admin_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => sessionStorage.getItem('gc_admin_token'));

    const login = useCallback(async (phone, password) => {
        const res = await api.login(phone, password);
        sessionStorage.setItem('gc_admin_token', res.data.token);
        sessionStorage.setItem('gc_admin_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        return res;
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem('gc_admin_token');
        sessionStorage.removeItem('gc_admin_user');
        setToken(null);
        setUser(null);
    }, []);

    // Session verification & Strict Refresh Policy
    useEffect(() => {
        // Enforce re-auth on refresh as requested
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0 && navEntries[0].type === 'reload') {
            logout();
            return;
        }

        if (token) {
            api.getProfile()
                .then(res => setUser(res.data))
                .catch(() => logout());
        }
    }, [token, logout]);

    return { user, token, login, logout, isAuthenticated: !!token };
};

// ═══════════════════════════════════════════════
// Toast Component
// ═══════════════════════════════════════════════
const Toast = ({ message, type, onClose }) => {
    if (!message) return null;
    setTimeout(onClose, 3000);
    return <div className={`toast ${type}`}>{message}</div>;
};

// ═══════════════════════════════════════════════
// Login Page
// ═══════════════════════════════════════════════
const LoginPage = ({ onLogin }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await onLogin(phone, password);
        } catch (err) {
            setError(err.message || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card animate-in">
                <div className="login-logo">
                    <div className="login-logo-icon">♻️</div>
                    <h2>GreenCycle</h2>
                    <p>Admin Dashboard</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="+919876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════
// Dashboard Page
// ═══════════════════════════════════════════════
const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getDashboard().then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return <LoadingState />;
    if (!data) return <EmptyState icon="📊" title="Unable to load dashboard" />;

    const statusColors = {
        pending: '#f59e0b',
        confirmed: '#3b82f6',
        assigned: '#a78bfa',
        out_for_pickup: '#10b981',
        completed: '#34d399',
        cancelled: '#ef4444'
    };

    const pieData = (data.statusDistribution || []).map(s => ({
        name: s._id,
        value: s.count,
        fill: statusColors[s._id] || '#64748b'
    }));

    return (
        <div className="animate-in">
            <div className="stats-grid">
                <StatCard icon={<Calendar size={20} />} iconClass="emerald" label="Total Bookings" value={data.totalBookings} trend="+12%" up />
                <StatCard icon={<Clock size={20} />} iconClass="gold" label="Today's Bookings" value={data.todayBookings} />
                <StatCard icon={<AlertCircle size={20} />} iconClass="red" label="Pending" value={data.pendingBookings} />
                <StatCard icon={<CheckCircle size={20} />} iconClass="emerald" label="Completed" value={data.completedBookings} />
                <StatCard icon={<Users size={20} />} iconClass="blue" label="Total Customers" value={data.totalUsers} trend="+8%" up />
                <StatCard icon={<Truck size={20} />} iconClass="gold" label="Active Agents" value={data.totalAgents} />
                <StatCard icon={<DollarSign size={20} />} iconClass="emerald" label="Monthly Revenue" value={`₹${(data.monthlyRevenue || 0).toLocaleString()}`} trend="+15%" up />
                <StatCard icon={<TrendingUp size={20} />} iconClass="gold" label="Today's Revenue" value={`₹${(data.todayRevenue || 0).toLocaleString()}`} />
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="chart-container premium-chart">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 className="card-title">📈 Growth Analytics</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Last 7 Days</div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.weeklyTrend || []}>
                            <defs>
                                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="_id" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: '#10b981' }}
                            />
                            <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-container premium-chart">
                    <h3 className="card-title" style={{ marginBottom: 20 }}>📊 Operations Split</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={60}
                                paddingAngle={5}
                                stroke="none"
                            >
                                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pie-legend">
                        {pieData.map((s, i) => (
                            <div key={i} className="legend-item">
                                <span className="legend-dot" style={{ background: s.fill }} />
                                <span className="legend-label">{s.name}</span>
                                <span className="legend-value">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3 className="table-title">🕐 Recent Bookings</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data.recentBookings || []).map(b => (
                            <tr key={b._id}>
                                <td style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>{b.bookingId}</td>
                                <td>{b.user?.name || 'N/A'}<br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.user?.phone}</span></td>
                                <td>{new Date(b.scheduledDate).toLocaleDateString()}<br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.timeSlot}</span></td>
                                <td><span className={`status-badge ${b.status}`}><span className="status-dot" />{b.status.replace(/_/g, ' ')}</span></td>
                                <td style={{ fontWeight: 600 }}>₹{b.finalAmount || b.estimatedAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const StatCard = ({ icon, iconClass, label, value, trend, up }) => (
    <div className="stat-card">
        <div className="stat-card-header">
            <div className={`stat-icon ${iconClass}`}>{icon}</div>
            {trend && <span className={`stat-trend ${up ? 'up' : 'down'}`}>{trend}</span>}
        </div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
    </div>
);

const LoadingState = () => (
    <div className="empty-state">
        <div style={{ animation: 'pulse 1.5s infinite' }}>
            <RefreshCw size={32} style={{ color: 'var(--emerald-500)' }} />
        </div>
        <p style={{ marginTop: 12 }}>Loading...</p>
    </div>
);

const EmptyState = ({ icon, title }) => (
    <div className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <h3>{title}</h3>
    </div>
);

// ═══════════════════════════════════════════════
// Bookings Page
// ═══════════════════════════════════════════════
const BookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState({ message: '', type: '' });
    const [viewDeal, setViewDeal] = useState(null);
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        loadBookings();
        api.getAgents().then(res => setAgents(res.data || [])).catch(() => { });
    }, []);

    const loadBookings = async (params = {}) => {
        try {
            const res = await api.getBookings({ status: statusFilter !== 'all' ? statusFilter : undefined, search, ...params });
            setBookings(res.data || []);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const updateStatus = async (id, status) => {
        try {
            await api.updateBookingStatus(id, status);
            setToast({ message: `Status updated to ${status}`, type: 'success' });
            loadBookings();
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
    };

    const assignAgent = async (bookingId, agentId) => {
        try {
            await api.assignAgent(bookingId, agentId);
            setToast({ message: 'Agent assigned', type: 'success' });
            setSelectedBooking(null);
            loadBookings();
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
    };

    return (
        <div className="animate-in">
            <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />

            <div className="table-container">
                <div className="table-header">
                    <h3 className="table-title">📦 All Bookings</h3>
                    <div className="table-actions">
                        <input
                            className="search-input"
                            placeholder="Search by ID or address..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadBookings()}
                        />
                        <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); loadBookings({ status: e.target.value !== 'all' ? e.target.value : undefined }); }}>
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="assigned">Assigned</option>
                            <option value="out_for_pickup">Out for Pickup</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <button className="btn btn-secondary btn-sm" onClick={() => loadBookings()}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Customer</th>
                            <th>Address</th>
                            <th>Items</th>
                            <th>Schedule</th>
                            <th>Status</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7"><LoadingState /></td></tr>
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan="7"><EmptyState icon="📦" title="No bookings found" /></td></tr>
                        ) : bookings.map(b => (
                            <tr key={b._id}>
                                <td style={{ color: 'var(--emerald-400)', fontWeight: 600, fontFamily: 'monospace' }}>{b.bookingId}</td>
                                <td>
                                    <strong style={{ color: 'var(--text-primary)' }}>{b.user?.name || 'N/A'}</strong>
                                    <br /><span style={{ fontSize: 11 }}>{b.user?.phone}</span>
                                </td>
                                <td style={{ maxWidth: 200, fontSize: 13, color: 'var(--text-secondary)' }}>
                                    <MapPin size={12} style={{ marginRight: 4, display: 'inline' }} />
                                    {b.address?.fullAddress || 'N/A'}
                                </td>
                                <td>
                                    {(b.items || []).map((item, i) => (
                                        <span key={i} style={{ fontSize: 12, display: 'block' }}>
                                            {item.categoryName} ({item.estimatedWeight}kg)
                                        </span>
                                    ))}
                                </td>
                                <td>
                                    {new Date(b.scheduledDate).toLocaleDateString('en-IN')}
                                    <br /><span style={{ fontSize: 11, color: 'var(--gold-500)' }}>{b.timeSlot}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${b.status}`}>
                                        <span className="status-dot" />{b.status.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600, fontFamily: 'Poppins' }}>₹{b.finalAmount || b.estimatedAmount}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        {b.status === 'pending' && (
                                            <>
                                                <button className="btn btn-sm btn-primary" onClick={() => updateStatus(b._id, 'confirmed')}>✓</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => updateStatus(b._id, 'cancelled')}>✕</button>
                                            </>
                                        )}
                                        {b.status === 'confirmed' && (
                                            <button className="btn btn-sm btn-gold" onClick={() => setSelectedBooking(b)}>
                                                <Truck size={12} /> Assign
                                            </button>
                                        )}
                                        {b.status === 'assigned' && (
                                            <button className="btn btn-sm btn-primary" onClick={() => updateStatus(b._id, 'out_for_pickup')}>🚛 Start</button>
                                        )}
                                        {b.status === 'completed' && (
                                            <button className="btn btn-sm btn-secondary" onClick={() => setViewDeal(b)}>
                                                <Eye size={12} /> Deal
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Deal Detail Modal */}
            {viewDeal && (
                <div className="modal-overlay" onClick={() => setViewDeal(null)}>
                    <div className="modal deal-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 style={{ fontSize: 18 }}>🤝 Transaction Breakdown</h3>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Booking: {viewDeal.bookingId}</p>
                            </div>
                            <button className="btn-icon" onClick={() => setViewDeal(null)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="deal-summary-cards">
                                <div className="deal-card estimate">
                                    <label>Initial Estimate</label>
                                    <div className="value">₹{viewDeal.estimatedAmount}</div>
                                </div>
                                <div className="deal-card actual">
                                    <label>Final Payout</label>
                                    <div className="value">₹{viewDeal.finalAmount}</div>
                                </div>
                                <div className={`deal-card variance ${viewDeal.finalAmount >= viewDeal.estimatedAmount ? 'up' : 'down'}`}>
                                    <label>Variance</label>
                                    <div className="value">
                                        {viewDeal.finalAmount >= viewDeal.estimatedAmount ? '+' : ''}
                                        {(viewDeal.finalAmount - viewDeal.estimatedAmount).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            <div className="deal-table">
                                <h4 style={{ marginBottom: 12, fontSize: 14 }}>Itemized Details</h4>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Est. Weight</th>
                                            <th>Actual Weight</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {viewDeal.items?.map(item => (
                                            <tr key={item._id}>
                                                <td>{item.categoryName}</td>
                                                <td>{item.estimatedWeight}kg</td>
                                                <td style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>{item.actualWeight || 0}kg</td>
                                                <td>₹{item.pricePerKg}</td>
                                                <td style={{ fontWeight: 600 }}>₹{item.amount || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {viewDeal.agent && (
                                <div style={{ marginTop: 20, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gold)', color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {viewDeal.agent?.name?.[0] || 'A'}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Collected By</p>
                                        <p style={{ fontSize: 14, fontWeight: 600 }}>{viewDeal.agent?.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Agent Modal */}
            {selectedBooking && (
                <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Assign Agent — {selectedBooking.bookingId}</h3>
                            <button className="btn-icon" onClick={() => setSelectedBooking(null)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                                📍 {selectedBooking.address?.fullAddress}
                            </p>
                            {agents.length === 0 ? (
                                <EmptyState icon="🚛" title="No agents available" />
                            ) : agents.map(agent => (
                                <div key={agent._id} className="category-card" style={{ cursor: 'pointer', marginBottom: 8 }}
                                    onClick={() => assignAgent(selectedBooking._id, agent._id)}>
                                    <div className="category-emoji">🚛</div>
                                    <div>
                                        <h3>{agent.name}</h3>
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{agent.phone} • {agent.agentArea}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                            <Star size={12} style={{ color: 'var(--gold-400)' }} />
                                            <span style={{ fontSize: 12, color: 'var(--gold-400)' }}>{agent.agentRating}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════
// Categories Page
// ═══════════════════════════════════════════════
const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [form, setForm] = useState({ name: '', icon: '📦', pricePerKg: '', description: '', color: '#10b981' });
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => { loadCategories(); }, []);

    const loadCategories = async () => {
        try {
            const res = await api.getCategories();
            setCategories(res.data || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const openCreate = () => {
        setEditItem(null);
        setForm({ name: '', icon: '📦', pricePerKg: '', description: '', color: '#10b981' });
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditItem(cat);
        setForm({ name: cat.name, icon: cat.icon, pricePerKg: cat.pricePerKg, description: cat.description || '', color: cat.color || '#10b981' });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (editItem) {
                await api.updateCategory(editItem._id, { ...form, pricePerKg: Number(form.pricePerKg) });
                setToast({ message: 'Category updated!', type: 'success' });
            } else {
                await api.createCategory({ ...form, pricePerKg: Number(form.pricePerKg) });
                setToast({ message: 'Category created!', type: 'success' });
            }
            setShowModal(false);
            loadCategories();
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this category?')) return;
        try {
            await api.deleteCategory(id);
            setToast({ message: 'Category deleted', type: 'success' });
            loadCategories();
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
    };

    return (
        <div className="animate-in">
            <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h3 style={{ fontFamily: 'Poppins', fontSize: 18, fontWeight: 600 }}>Scrap Categories</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Manage scrap prices and categories</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <Plus size={16} /> Add Category
                </button>
            </div>

            {loading ? <LoadingState /> : (
                <div className="category-grid">
                    {categories.map(cat => (
                        <div key={cat._id} className="category-card">
                            <div className="category-emoji" style={{ background: `${cat.color}15` }}>{cat.icon}</div>
                            <div className="category-info">
                                <h3>{cat.name}</h3>
                                <div className="category-price">₹{cat.pricePerKg} <span>/ {cat.unit}</span></div>
                            </div>
                            <div className="category-actions">
                                <button className="btn-icon" onClick={() => openEdit(cat)}><Edit size={14} /></button>
                                <button className="btn-icon" onClick={() => handleDelete(cat._id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editItem ? 'Edit Category' : 'Add Category'}</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Newspaper" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Icon (Emoji)</label>
                                <input className="form-input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="📰" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price per KG (₹)</label>
                                <input className="form-input" type="number" value={form.pricePerKg} onChange={e => setForm({ ...form, pricePerKg: e.target.value })} placeholder="14" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════
// Users Page
// ═══════════════════════════════════════════════
const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async (params = {}) => {
        try {
            const res = await api.getUsers({ search, role: roleFilter || undefined, ...params });
            setUsers(res.data || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const toggleUser = async (id) => {
        try {
            await api.toggleUser(id);
            setToast({ message: 'User status updated', type: 'success' });
            loadUsers();
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
    };

    return (
        <div className="animate-in">
            <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />

            <div className="table-container">
                <div className="table-header">
                    <h3 className="table-title">👥 Users</h3>
                    <div className="table-actions">
                        <input className="search-input" placeholder="Search name or phone..." value={search}
                            onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadUsers()} />
                        <select className="filter-select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); loadUsers({ role: e.target.value || undefined }); }}>
                            <option value="">All Roles</option>
                            <option value="customer">Customer</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Points</th>
                            <th>Pickups</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7"><LoadingState /></td></tr>
                        ) : users.map(u => (
                            <tr key={u._id}>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.name || 'No Name'}</td>
                                <td>{u.phone}</td>
                                <td><span className={`status-badge ${u.role === 'admin' ? 'completed' : u.role === 'agent' ? 'assigned' : 'confirmed'}`}>{u.role}</span></td>
                                <td style={{ color: 'var(--gold-400)' }}>{u.loyaltyPoints || 0}</td>
                                <td>{u.totalPickups || 0}</td>
                                <td>
                                    <span className={`status-badge ${u.isActive ? 'completed' : 'cancelled'}`}>
                                        <span className="status-dot" />{u.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-primary'}`}
                                        onClick={() => toggleUser(u._id)}>
                                        {u.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════
// Agents Page
// ═══════════════════════════════════════════════
const AgentsPage = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', password: '', agentArea: '', agentVehicle: '' });
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => { loadAgents(); }, []);

    const loadAgents = async () => {
        try {
            const res = await api.getAgents();
            setAgents(res.data || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const createAgent = async () => {
        if (form.password.length < 6) return setToast({ message: 'Password must be at least 6 characters', type: 'error' });
        try {
            await api.createAgent(form);
            setToast({ message: 'Agent created!', type: 'success' });
            setShowModal(false);
            setForm({ name: '', phone: '', password: '', agentArea: '', agentVehicle: '' });
            loadAgents();
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
    };

    return (
        <div className="animate-in">
            <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h3 style={{ fontFamily: 'Poppins', fontSize: 18, fontWeight: 600 }}>Pickup Agents</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Manage your delivery team</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> Add Agent
                </button>
            </div>

            {loading ? <LoadingState /> : (
                <div className="category-grid">
                    {agents.map(agent => (
                        <div key={agent._id} className="category-card">
                            <div className="category-emoji" style={{ background: 'rgba(16,185,129,0.1)' }}>🚛</div>
                            <div className="category-info">
                                <h3>{agent.name}</h3>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    <Phone size={10} /> {agent.phone}
                                </span>
                                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                    <span style={{ fontSize: 11, color: 'var(--emerald-400)' }}><MapPin size={10} /> {agent.agentArea || 'N/A'}</span>
                                    <span style={{ fontSize: 11, color: 'var(--gold-400)' }}><Star size={10} /> {agent.agentRating}</span>
                                </div>
                            </div>
                            <span className={`status-badge ${agent.isActive ? 'completed' : 'cancelled'}`} style={{ marginLeft: 'auto' }}>
                                {agent.isActive ? 'Active' : 'Offline'}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Agent</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91..." />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Area</label>
                                <input className="form-input" value={form.agentArea} onChange={e => setForm({ ...form, agentArea: e.target.value })} placeholder="Nizampet" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Vehicle Type</label>
                                <input className="form-input" value={form.agentVehicle} onChange={e => setForm({ ...form, agentVehicle: e.target.value })} placeholder="Auto Rickshaw" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={createAgent}>Create Agent</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════
// Revenue Page
// ═══════════════════════════════════════════════
const RevenuePage = () => {
    const [data, setData] = useState(null);
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await api.getRevenue(p || period);
            setData(res.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    }, [period]);

    useEffect(() => { loadData(); }, [loadData]);

    const exportData = async () => {
        try {
            const res = await api.exportCSV({});
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bookings-export.csv';
            a.click();
        } catch (err) { console.error(err); }
    };

    const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#fbbf24', '#f59e0b', '#3b82f6', '#a78bfa', '#ef4444'];

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h3 style={{ fontFamily: 'Poppins', fontSize: 18, fontWeight: 600 }}>Revenue Analytics</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Track your business performance</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <select className="filter-select" value={period} onChange={e => { setPeriod(e.target.value); loadData(e.target.value); }}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    <button className="btn btn-gold" onClick={exportData}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {loading ? <LoadingState /> : data && (
                <>
                    <div className="chart-container" style={{ marginBottom: 24 }}>
                        <h3 className="card-title" style={{ marginBottom: 16 }}>💰 Revenue Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={(data.revenue || []).reverse()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a2f" />
                                <XAxis dataKey="_id" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} />
                                <Tooltip contentStyle={{ background: '#151d19', border: '1px solid #1e3a2f', borderRadius: 8 }} />
                                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                                <Line type="monotone" dataKey="bookings" stroke="#C5A55A" strokeWidth={2} dot={{ fill: '#C5A55A', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                        <h3 className="card-title" style={{ marginBottom: 16 }}>📊 Category-wise Revenue</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.categoryRevenue || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a2f" />
                                <XAxis type="number" stroke="#64748b" fontSize={11} />
                                <YAxis type="category" dataKey="_id" stroke="#64748b" fontSize={11} width={100} />
                                <Tooltip contentStyle={{ background: '#151d19', border: '1px solid #1e3a2f', borderRadius: 8 }} />
                                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                                    {(data.categoryRevenue || []).map((_, i) => (
                                        <Cell key={i} fill={colors[i % colors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════
// Announcements Page
// ═══════════════════════════════════════════════
const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', target: 'all', priority: 'medium' });
    const [toast, setToast] = useState({ message: '', type: '' });

    const loadAnnouncements = useCallback(async () => {
        try {
            const res = await api.getAnnouncements();
            setAnnouncements(res.data || []);
        } catch (err) { console.error(err); }
        setLoading(false);
    }, []);

    useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

    const handleCreate = async () => {
        try {
            await api.createAnnouncement(form);
            setToast({ message: 'Announcement broadcasted!', type: 'success' });
            setShowModal(false);
            setForm({ title: '', content: '', target: 'all', priority: 'medium' });
            loadAnnouncements();
        } catch (err) { setToast({ message: err.message, type: 'error' }); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Stop this announcement?')) return;
        try {
            await api.deleteAnnouncement(id);
            setToast({ message: 'Announcement stopped', type: 'success' });
            loadAnnouncements();
        } catch (err) { setToast({ message: err.message, type: 'error' }); }
    };

    return (
        <div className="animate-in">
            <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>📢 System Announcements</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Broadcast messages to Users or Agents</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} /> New Broadcast
                </button>
            </div>

            {loading ? <LoadingState /> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
                    {announcements.map(a => (
                        <div key={a._id} className="announcement-item" style={{ borderLeft: `4px solid var(--${a.priority === 'high' || a.priority === 'critical' ? 'danger' : 'emerald-500'})` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span className={`badge priority-${a.priority}`}>{a.priority.toUpperCase()}</span>
                                <span className={`badge target-${a.target}`}>{a.target.toUpperCase()}</span>
                            </div>
                            <h4 style={{ marginBottom: 4 }}>{a.title}</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{a.content}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                                <span>Published: {new Date(a.createdAt).toLocaleDateString()}</span>
                                <button className="btn-icon" onClick={() => handleDelete(a._id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                    {announcements.length === 0 && (
                        <div style={{ gridColumn: '1/-1' }}>
                            <EmptyState icon="📢" title="No active announcements" />
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create Broadcast</h3>
                            <button className="btn-icon" onClick={() => setShowModal(false)}><X size={16} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Broadcast Title</label>
                                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Holiday Notice" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Target Audience</label>
                                <select className="form-input" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })}>
                                    <option value="all">Everyone</option>
                                    <option value="users">Customers Only</option>
                                    <option value="agents">Agents Only</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Content</label>
                                <textarea className="form-textarea" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your message here..." style={{ height: 100 }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {['low', 'medium', 'high'].map(p => (
                                        <button
                                            key={p}
                                            className={`btn ${form.priority === p ? 'btn-primary' : 'btn-secondary'}`}
                                            style={{ flex: 1, textTransform: 'capitalize' }}
                                            onClick={() => setForm({ ...form, priority: p })}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={!form.title || !form.content}>
                                <Send size={14} /> Send Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════
// Notifications Page
// ═══════════════════════════════════════════════
const NotificationsPage = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [toast, setToast] = useState({ message: '', type: '' });
    const [sending, setSending] = useState(false);

    const sendNotification = async () => {
        if (!title || !body) return setToast({ message: 'Title and body required', type: 'error' });
        setSending(true);
        try {
            await api.sendNotification({ title, body, targetRole: targetRole || undefined });
            setToast({ message: 'Notification sent!', type: 'success' });
            setTitle('');
            setBody('');
        } catch (err) {
            setToast({ message: err.message, type: 'error' });
        }
        setSending(false);
    };

    return (
        <div className="animate-in">
            <Toast {...toast} onClose={() => setToast({ message: '', type: '' })} />

            <div className="card" style={{ maxWidth: 600 }}>
                <div className="card-header">
                    <h3 className="card-title">🔔 Send Notification</h3>
                </div>
                <div className="form-group">
                    <label className="form-label">Target Audience</label>
                    <select className="form-select" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                        <option value="">All Users (Broadcast)</option>
                        <option value="customer">Customers Only</option>
                        <option value="agent">Agents Only</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="🎉 Special Offer!" />
                </div>
                <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea className="form-textarea" value={body} onChange={e => setBody(e.target.value)} placeholder="Get 20% extra on your next scrap pickup!" rows={4} />
                </div>
                <button className="btn btn-primary" onClick={sendNotification} disabled={sending}>
                    <Send size={16} /> {sending ? 'Sending...' : 'Send Notification'}
                </button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════
// Sidebar Component
// ═══════════════════════════════════════════════
const Sidebar = ({ onLogout }) => {
    const navItems = [
        { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/bookings', icon: <Calendar size={18} />, label: 'Bookings' },
        { to: '/categories', icon: <Package size={18} />, label: 'Categories' },
        { to: '/users', icon: <Users size={18} />, label: 'Users' },
        { to: '/agents', icon: <Truck size={18} />, label: 'Agents' },
        { to: '/revenue', icon: <BarChart3 size={18} />, label: 'Revenue' },
        { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications' },
        { to: '/announcements', icon: <Megaphone size={18} />, label: 'Announcements' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">♻️</div>
                <div>
                    <h1>GreenCycle</h1>
                    <span>Admin Panel</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-title">Main Menu</div>
                {navItems.map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        {item.label}
                    </NavLink>
                ))}

                <div className="sidebar-section-title" style={{ marginTop: 16 }}>Account</div>
                <button className="sidebar-link" onClick={onLogout}>
                    <LogOut size={18} />
                    Logout
                </button>
            </nav>
        </aside>
    );
};

// ═══════════════════════════════════════════════
// Header Component
// ═══════════════════════════════════════════════
const Header = ({ title, subtitle, user }) => (
    <header className="header">
        <div className="header-left">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="header-right">
            <button className="header-btn">
                <Bell size={18} />
                <span className="notif-dot" />
            </button>
            <div className="user-avatar">
                {(user?.name || 'A')[0].toUpperCase()}
            </div>
        </div>
    </header>
);

// ═══════════════════════════════════════════════
// Main App Component
// ═══════════════════════════════════════════════
const App = () => {
    const { user, isAuthenticated, login, logout } = useAuth();

    if (!isAuthenticated) {
        return <LoginPage onLogin={login} />;
    }

    const pageTitles = {
        '/dashboard': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your business overview.' },
        '/bookings': { title: 'Bookings', subtitle: 'Manage all scrap pickup bookings.' },
        '/categories': { title: 'Categories', subtitle: 'Manage scrap types and pricing.' },
        '/users': { title: 'Users', subtitle: 'Manage customers and their accounts.' },
        '/agents': { title: 'Agents', subtitle: 'Manage your pickup agent team.' },
        '/revenue': { title: 'Revenue', subtitle: 'Track earnings and export reports.' },
        '/notifications': { title: 'Notifications', subtitle: 'Send promotional messages to users.' },
        '/announcements': { title: 'Announcements', subtitle: 'Broadcast system-wide alerts.' },
    };

    return (
        <BrowserRouter>
            <div className="app-layout">
                <Sidebar onLogout={logout} />
                <main className="main-content">
                    <Routes>
                        <Route path="/dashboard" element={<><Header {...pageTitles['/dashboard']} user={user} /><div className="page-container"><DashboardPage /></div></>} />
                        <Route path="/bookings" element={<><Header {...pageTitles['/bookings']} user={user} /><div className="page-container"><BookingsPage /></div></>} />
                        <Route path="/categories" element={<><Header {...pageTitles['/categories']} user={user} /><div className="page-container"><CategoriesPage /></div></>} />
                        <Route path="/users" element={<><Header {...pageTitles['/users']} user={user} /><div className="page-container"><UsersPage /></div></>} />
                        <Route path="/agents" element={<><Header {...pageTitles['/agents']} user={user} /><div className="page-container"><AgentsPage /></div></>} />
                        <Route path="/revenue" element={<><Header {...pageTitles['/revenue']} user={user} /><div className="page-container"><RevenuePage /></div></>} />
                        <Route path="/notifications" element={<><Header {...pageTitles['/notifications']} user={user} /><div className="page-container"><NotificationsPage /></div></>} />
                        <Route path="/announcements" element={<><Header {...pageTitles['/announcements']} user={user} /><div className="page-container"><AnnouncementsPage /></div></>} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
