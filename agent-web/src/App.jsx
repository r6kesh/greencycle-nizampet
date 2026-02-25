import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
    LayoutDashboard, Truck, LogOut, CheckCircle, Clock,
    MapPin, Phone, Package, RefreshCw, AlertCircle
} from 'lucide-react';
import api from './api';

// ═══════════════════════════════════════════════
// Auth Hook
// ═══════════════════════════════════════════════
const useAuth = () => {
    const [user, setUser] = useState(() => {
        const saved = sessionStorage.getItem('gc_agent_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => sessionStorage.getItem('gc_agent_token'));

    const login = useCallback(async (phone, password) => {
        const res = await api.login(phone, password);
        sessionStorage.setItem('gc_agent_token', res.data.token);
        sessionStorage.setItem('gc_agent_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        return res;
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem('gc_agent_token');
        sessionStorage.removeItem('gc_agent_user');
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        if (token) {
            api.getProfile().then(r => setUser(r.data)).catch(() => logout());
        }
    }, [token, logout]);

    return { user, token, login, logout, isAuthenticated: !!token };
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
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '3rem' }}>🚛</div>
                    <h2 style={{ marginTop: '1rem' }}>GreenCycle Agent</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Log in to view your tasks</p>
                </div>

                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Phone Number</label>
                    <input type="text" placeholder="+91..." value={phone} onChange={e => setPhone(e.target.value)} required />

                    <label style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>Password</label>
                    <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />

                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════
// Task Dashboard
// ═══════════════════════════════════════════════
const TaskDashboard = ({ user, onLogout }) => {
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const refreshTasks = async () => {
        setRefreshing(true);
        try {
            const res = await api.getTasks();
            setTasks(res.data || []);
        } catch (err) {
            console.error(err);
        }
        setRefreshing(false);
        setLoading(false);
    };

    useEffect(() => { refreshTasks(); }, []);

    const startPickup = async (id) => {
        try {
            await api.updateTaskStatus(id, 'out_for_pickup');
            refreshTasks();
        } catch (err) { alert(err.message); }
    };

    const handleComplete = (task) => {
        setSelectedTask(JSON.parse(JSON.stringify(task))); // Deep copy
        setShowCompleteModal(true);
    };

    const submitCompletion = async () => {
        setSubmitting(true);
        try {
            const finalAmount = selectedTask.items.reduce((sum, item) => sum + (item.actualWeight * (item.pricePerKg || 0)), 0);
            await api.completeTask(selectedTask._id, finalAmount, selectedTask.items);
            setShowCompleteModal(false);
            refreshTasks();
        } catch (err) {
            alert(err.message);
        }
        setSubmitting(false);
    };

    const updateWeight = (index, weight) => {
        const newItems = [...selectedTask.items];
        newItems[index].actualWeight = Number(weight);
        setSelectedTask({ ...selectedTask, items: newItems });
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <nav className="nav">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ background: 'var(--emerald-500)', color: 'black', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {(user?.name || 'A')[0]}
                    </div>
                    <div>
                        <h4 style={{ fontSize: 14 }}>{user?.name}</h4>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Collection Agent</p>
                    </div>
                </div>
                <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <LogOut size={20} />
                </button>
            </nav>

            <div className="container animate-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>📋 My Pickups</h3>
                    <button onClick={refreshTasks} style={{ background: 'none', border: 'none', color: 'var(--emerald-500)', cursor: 'pointer' }}>
                        <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
                    </button>
                </div>

                {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading tasks...</div> : null}

                {!loading && tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--card-dark)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>😴</div>
                        <p style={{ color: 'var(--text-secondary)' }}>No active pickups assigned to you.</p>
                        <p style={{ fontSize: 12, marginTop: 4 }}>Check back later or contact Admin.</p>
                    </div>
                )}

                {tasks.map(task => (
                    <div className="task-card animate-in" key={task._id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h4 style={{ color: 'var(--emerald-400)', fontSize: 13, marginBottom: 4 }}>#{task.bookingId}</h4>
                                <span className={`badge badge-${task.status}`}>
                                    {task.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 13, fontWeight: 600 }}>{new Date(task.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                <p style={{ fontSize: 11, color: 'var(--gold)' }}>{task.timeSlot}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <MapPin size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                <p style={{ fontSize: 14 }}>{task.address?.fullAddress}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <Phone size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                <a href={`tel:${task.user?.phone}`} style={{ color: 'var(--emerald-400)', textDecoration: 'none', fontSize: 14 }}>{task.user?.phone}</a>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <Package size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                                <p style={{ fontSize: 14 }}>{(task.items || []).map(i => i.categoryName).join(', ')}</p>
                            </div>
                        </div>

                        <div className="action-bar">
                            {task.status === 'assigned' && (
                                <button className="btn btn-primary" onClick={() => startPickup(task._id)}>
                                    <Truck size={18} /> Start Pickup
                                </button>
                            )}
                            {task.status === 'out_for_pickup' && (
                                <button className="btn" style={{ background: 'var(--gold)', color: 'black' }} onClick={() => handleComplete(task)}>
                                    <CheckCircle size={18} /> Mark Completed
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {showCompleteModal && selectedTask && (
                    <div className="modal-overlay">
                        <div className="modal animate-in">
                            <h3 style={{ marginBottom: '1rem' }}>Final Deal Reporting</h3>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                Enter the weights collected for each category.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginBottom: '2rem' }}>
                                {selectedTask.items.map((item, idx) => (
                                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>{item.categoryName}</p>
                                            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Est: {item.estimatedWeight}kg | Rate: ₹{item.pricePerKg}/kg</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <input
                                                type="number"
                                                placeholder="Weight"
                                                value={item.actualWeight || ''}
                                                onChange={(e) => updateWeight(idx, e.target.value)}
                                                style={{ width: 80, padding: 8, textAlign: 'center' }}
                                            />
                                            <span style={{ fontSize: 13 }}>kg</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                    <span>Calculated Payout:</span>
                                    <span style={{ color: 'var(--emerald-400)' }}>
                                        ₹{selectedTask.items.reduce((sum, item) => sum + ((item.actualWeight || 0) * (item.pricePerKg || 0)), 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn" style={{ flex: 1 }} onClick={() => setShowCompleteModal(false)} disabled={submitting}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 2 }} onClick={submitCompletion} disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Confirm & Complete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .badge-assigned { background: rgba(167, 139, 250, 0.1); color: #a78bfa; }
                .badge-out_for_pickup { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
                
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.85);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .modal {
                    background: #111827;
                    padding: 1.5rem;
                    border-radius: var(--radius);
                    width: 100%;
                    max-width: 400px;
                    border: 1px solid var(--border);
                }
            `}</style>
        </div>
    );
};

// ═══════════════════════════════════════════════
// Main App
// ═══════════════════════════════════════════════
const App = () => {
    const { user, isAuthenticated, login, logout } = useAuth();

    if (!isAuthenticated) {
        return <LoginPage onLogin={login} />;
    }

    if (user && user.role !== 'agent') {
        return (
            <div className="login-container">
                <div className="login-card" style={{ textAlign: 'center' }}>
                    <h2>⚠️ Access Denied</h2>
                    <p style={{ margin: '1rem 0' }}>This panel is for Agents only. Please use the Admin Panel.</p>
                    <button className="btn btn-primary" onClick={logout}>Login as Agent</button>
                </div>
            </div>
        );
    }

    return <TaskDashboard user={user} onLogout={logout} />;
};

export default App;
