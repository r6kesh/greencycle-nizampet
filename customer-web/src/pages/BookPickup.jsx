import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const TIME_SLOTS = [
    '8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM',
];

const STATIC_CATEGORIES = [
    { _id: '1', name: 'Newspaper', icon: '📰' },
    { _id: '2', name: 'Iron / Steel', icon: '⚙️' },
    { _id: '3', name: 'Copper Wire', icon: '🔌' },
    { _id: '4', name: 'Plastic Bottles', icon: '🍶' },
    { _id: '5', name: 'Cardboard', icon: '📦' },
    { _id: '6', name: 'Aluminium', icon: '🥫' },
    { _id: '7', name: 'E-Waste', icon: '💻' },
    { _id: '8', name: 'Glass Bottles', icon: '🍾' },
];

// Get tomorrow's date as default
const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
};

export default function BookPickup() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState(STATIC_CATEGORIES);
    const [form, setForm] = useState({
        pickupDate: tomorrow(),
        timeSlot: TIME_SLOTS[0],
        address: '',
        items: [],
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('gc_token')) { navigate('/login'); return; }
        api.getCategories().then(r => { if (r.data?.length) setCategories(r.data); }).catch(() => { });
    }, []);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const toggleItem = (id) => {
        setForm(p => ({
            ...p,
            items: p.items.includes(id) ? p.items.filter(x => x !== id) : [...p.items, id],
        }));
    };

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.address.trim()) { setError('Please enter your pickup address.'); return; }
        if (form.items.length === 0) { setError('Please select at least one scrap category.'); return; }
        setLoading(true);
        try {
            await api.createBooking({
                scheduledDate: form.pickupDate,
                timeSlot: form.timeSlot,
                address: { fullAddress: form.address },  // backend expects {fullAddress: string}
                items: form.items.map(id => ({
                    category: id,
                    estimatedWeight: 1
                })),
                notes: form.notes,
                paymentMethod: 'cash',
            });
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to book. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 style={{ color: 'var(--green-300)', marginBottom: '.75rem' }}>Booking Confirmed!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Your scrap pickup has been scheduled. Our agent will contact you before arriving.
                        Payment will be made on the spot after weighing.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={() => navigate('/bookings')}>📋 View My Bookings</button>
                        <button className="btn btn-outline" onClick={() => { setSuccess(false); setForm({ pickupDate: tomorrow(), timeSlot: TIME_SLOTS[0], address: '', items: [], notes: '' }); }}>
                            + Book Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-hero">
                <div className="container">
                    <h1>📅 Book a Pickup</h1>
                    <p>Schedule a free doorstep scrap collection — we come to you!</p>
                </div>
            </div>

            <section className="section">
                <div className="container" style={{ maxWidth: 680 }}>
                    <form className="card" onSubmit={submit}>

                        {/* Date & Time */}
                        <h3 style={{ marginBottom: '1.25rem', color: 'var(--green-300)' }}>📅 When should we come?</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Pickup Date</label>
                                <input type="date" className="form-control" value={form.pickupDate} min={tomorrow()}
                                    onChange={e => set('pickupDate', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Time Slot</label>
                                <select className="form-control" value={form.timeSlot} onChange={e => set('timeSlot', e.target.value)}>
                                    {TIME_SLOTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Address */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '.5rem' }}>
                            <h3 style={{ marginBottom: '1.25rem', color: 'var(--green-300)' }}>📍 Your Address</h3>
                            <div className="form-group">
                                <label className="form-label">Full Pickup Address</label>
                                <textarea className="form-control" rows={3} placeholder="House no, street, area, landmark..."
                                    value={form.address} onChange={e => set('address', e.target.value)} required />
                            </div>
                        </div>

                        {/* Scrap Categories */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '.5rem' }}>
                            <h3 style={{ marginBottom: '1.25rem', color: 'var(--green-300)' }}>♻️ What scrap do you have?</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', marginBottom: '1rem' }}>Select all that apply:</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '.75rem' }}>
                                {categories.map(c => {
                                    const sel = form.items.includes(c._id);
                                    return (
                                        <button
                                            key={c._id}
                                            type="button"
                                            onClick={() => toggleItem(c._id)}
                                            style={{
                                                background: sel ? 'rgba(30,145,98,.2)' : 'var(--bg3)',
                                                border: `2px solid ${sel ? 'var(--green-500)' : 'var(--border)'}`,
                                                borderRadius: 10,
                                                padding: '.75rem',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                color: 'var(--text)',
                                                transition: 'all .2s',
                                            }}
                                        >
                                            <div style={{ fontSize: '1.5rem' }}>{c.icon || '♻️'}</div>
                                            <div style={{ fontSize: '.8rem', fontWeight: 600, marginTop: 4 }}>{c.name}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Notes */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Additional Notes (optional)</label>
                                <textarea className="form-control" rows={2} placeholder="Any special instructions, quantity estimate..."
                                    value={form.notes} onChange={e => set('notes', e.target.value)} />
                            </div>
                        </div>

                        {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</p>}

                        <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: '.5rem' }}>
                            {loading ? '⏳ Booking...' : '✅ Confirm Booking'}
                        </button>

                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '.82rem', marginTop: '1rem' }}>
                            Free service · No charges · Paid on pickup
                        </p>
                    </form>
                </div>
            </section>
        </>
    );
}
