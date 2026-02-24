import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const statusColor = (s) => {
    const map = { pending: 'badge-pending', confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled' };
    return map[s?.toLowerCase()] || 'badge-pending';
};

const fmt = (dateStr) => {
    if (!dateStr) return '—';
    try { return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return dateStr; }
};

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('gc_token')) { navigate('/login'); return; }
        api.getMyBookings()
            .then(r => setBookings(r.data || []))
            .catch(err => setError(err.message || 'Failed to load bookings'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <div className="page-hero">
                <div className="container">
                    <h1>📋 My Bookings</h1>
                    <p>Track all your scrap pickup requests</p>
                </div>
            </div>

            <section className="section">
                <div className="container" style={{ maxWidth: 760 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/book')}>+ New Pickup</button>
                    </div>

                    {loading && <div className="spinner" />}

                    {error && (
                        <div className="card" style={{ textAlign: 'center', color: 'var(--danger)' }}>
                            ⚠️ {error}
                            <br />
                            <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>Retry</button>
                        </div>
                    )}

                    {!loading && !error && bookings.length === 0 && (
                        <div className="empty-state card">
                            <div className="emoji">📦</div>
                            <h3>No bookings yet</h3>
                            <p>Schedule your first free scrap pickup and start earning!</p>
                            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/book')}>
                                📅 Book First Pickup
                            </button>
                        </div>
                    )}

                    {!loading && bookings.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {bookings.map(b => (
                                <div className="booking-card" key={b._id}>
                                    <div className="booking-info">
                                        <h4>
                                            {b.items?.map(i => i.categoryName || 'Item').join(', ') || 'Scrap Pickup'}
                                        </h4>
                                        <p>📅 {fmt(b.scheduledDate)} · ⏰ {b.timeSlot || 'TBD'}</p>
                                        <p style={{ marginTop: '.25rem' }}>📍 {b.address?.fullAddress || '—'}</p>
                                    </div>
                                    <div className="booking-meta">
                                        <span className={`badge ${statusColor(b.status)}`}>{b.status || 'pending'}</span>
                                        {(b.finalAmount || b.estimatedAmount) > 0 && (
                                            <p style={{ color: 'var(--gold)', fontWeight: 700, marginTop: '.5rem', fontSize: '.95rem' }}>
                                                ₹{b.finalAmount || b.estimatedAmount}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
