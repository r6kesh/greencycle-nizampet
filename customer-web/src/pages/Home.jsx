import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const STATIC_CATEGORIES = [
    { _id: '1', name: 'Newspaper', icon: '📰', pricePerKg: 14, unit: 'per kg' },
    { _id: '2', name: 'Iron / Steel', icon: '⚙️', pricePerKg: 28, unit: 'per kg' },
    { _id: '3', name: 'Copper Wire', icon: '🔌', pricePerKg: 420, unit: 'per kg' },
    { _id: '4', name: 'Plastic Bottles', icon: '🍶', pricePerKg: 10, unit: 'per kg' },
    { _id: '5', name: 'Cardboard', icon: '📦', pricePerKg: 8, unit: 'per kg' },
    { _id: '6', name: 'Aluminium', icon: '🥫', pricePerKg: 90, unit: 'per kg' },
    { _id: '7', name: 'E-Waste', icon: '💻', pricePerKg: 60, unit: 'per kg' },
    { _id: '8', name: 'Glass Bottles', icon: '🍾', pricePerKg: 5, unit: 'per kg' },
];

const FEATURES = [
    { icon: '⚡', title: 'Same Day Pickup', desc: 'Book before 12 PM for same-day pickup' },
    { icon: '⚖️', title: 'Fair Weighing', desc: 'Digital scales with transparency guarantee' },
    { icon: '💸', title: 'Instant Payment', desc: 'Cash or UPI — paid on the spot' },
    { icon: '🌿', title: 'Eco Friendly', desc: 'All materials recycled responsibly' },
];

const STEPS = [
    { number: '01', icon: '📱', title: 'Book Pickup', desc: 'Schedule a free doorstep pickup at your convenience via app or website.' },
    { number: '02', icon: '🚚', title: 'Agent Arrives', desc: 'Our trained agent arrives on time with a digital weighing machine.' },
    { number: '03', icon: '⚖️', title: 'Fair Weighing', desc: 'Transparent weighing process — you see the weight live on the scale.' },
    { number: '04', icon: '💵', title: 'Instant Payment', desc: 'Receive instant payment in cash or UPI. No delays, no excuses.' },
];

export default function Home() {
    const [categories, setCategories] = useState(STATIC_CATEGORIES);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('gc_token');

    useEffect(() => {
        api.getCategories()
            .then(r => { if (r.data?.length) setCategories(r.data); })
            .catch(() => { });
    }, []);

    return (
        <>
            {/* ─── HERO ─────────────────────────────────── */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span>♻️</span> Hyderabad's #1 Scrap Collection Service
                        </div>
                        <h1>
                            Sell Your Scrap&nbsp;
                            <span className="highlight">at Best Prices</span><br />
                            — Doorstep Pickup
                        </h1>
                        <p className="hero-desc">
                            Book a free pickup in 30 seconds. Our agents arrive at your door,
                            weigh transparently, and pay instantly. Serving Nizampet &amp; all Hyderabad areas.
                        </p>
                        <div className="hero-actions">
                            <button className="btn btn-primary" onClick={() => navigate(isLoggedIn ? '/book' : '/login')}>
                                📅 Book Free Pickup
                            </button>
                            <a href="#how-it-works" className="btn btn-outline">How It Works ↓</a>
                        </div>
                        <div className="hero-stats">
                            {[
                                { num: '5,000+', label: 'Happy Customers' },
                                { num: '50 Tons', label: 'Scrap Collected' },
                                { num: '4.9 ★', label: 'App Rating' },
                                { num: '30 min', label: 'Avg Response' },
                            ].map(s => (
                                <div key={s.label}>
                                    <div className="hero-stat-num">{s.num}</div>
                                    <div className="hero-stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── FEATURES ─────────────────────────────── */}
            <section style={{ padding: '3rem 0', borderBottom: '1px solid var(--border)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                        {FEATURES.map(f => (
                            <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ fontSize: '2rem', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30,145,98,.12)', borderRadius: 12 }}>{f.icon}</div>
                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{f.title}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ────────────────────────── */}
            <section className="section" id="how-it-works">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-sub">4 simple steps to turn your scrap into cash</p>
                    <div className="steps-grid">
                        {STEPS.map(s => (
                            <div className="step-card" key={s.number}>
                                <div className="step-number">{s.number}</div>
                                <div className="step-icon">{s.icon}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── PRICE LIST ──────────────────────────── */}
            <section className="section" id="prices" style={{ background: 'linear-gradient(180deg, transparent, rgba(30,145,98,.04))' }}>
                <div className="container">
                    <h2 className="section-title">Today's Scrap Prices</h2>
                    <p className="section-sub">Live market rates — updated daily</p>
                    <div className="categories-grid">
                        {categories.map(c => (
                            <div className="cat-card" key={c._id}>
                                <div className="cat-icon">{c.icon || '♻️'}</div>
                                <div className="cat-name">{c.name}</div>
                                <div className="cat-price">₹{c.pricePerKg}</div>
                                <div className="cat-unit">{c.unit || 'per kg'}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '1.5rem', fontSize: '.85rem' }}>
                        * Prices vary slightly based on quantity and quality. Final price confirmed on pickup.
                    </p>
                </div>
            </section>

            {/* ─── CTA / DOWNLOAD ──────────────────────── */}
            <section className="section" id="download">
                <div className="container">
                    <div className="download-section">
                        <h2>Download the GreenCycle App</h2>
                        <p>Get exclusive app-only offers, track your pickups in real-time, and earn loyalty points on every booking.</p>
                        <div className="download-btns">
                            <a href="#" className="store-btn">
                                <span className="icon">🤖</span>
                                <div>
                                    <div className="sub">Get it on</div>
                                    <div className="main">Google Play</div>
                                </div>
                            </a>
                            <button className="btn btn-gold" onClick={() => navigate(isLoggedIn ? '/book' : '/login')}>
                                📅 Book on Website Instead
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── CONTACT ─────────────────────────────── */}
            <section className="section" id="contact">
                <div className="container" style={{ maxWidth: 680, textAlign: 'center' }}>
                    <h2 className="section-title">Contact Us</h2>
                    <p className="section-sub">We're here Monday–Saturday, 8 AM – 8 PM</p>
                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
                        <a href="tel:+918309108691" className="btn btn-primary">📞 Call +91 8309108691</a>
                        <a href="https://wa.me/918309108691" target="_blank" rel="noreferrer" className="btn btn-outline">💬 WhatsApp</a>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '2rem', fontSize: '.9rem' }}>
                        📍 Serving Nizampet, Bachupally, Miyapur, Kukatpally & surrounding areas, Hyderabad
                    </p>
                </div>
            </section>
        </>
    );
}
