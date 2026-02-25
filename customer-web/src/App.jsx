import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import BookPickup from './pages/BookPickup';
import MyBookings from './pages/MyBookings';
import AIChatWidget from './components/AIChatWidget';
import './index.css';

function Navbar({ user, onLogout }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
                    <span className="logo-icon">♻️</span>
                    GreenCycle
                </Link>

                <ul className="navbar-links">
                    <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
                    <li><a href="/#prices">Prices</a></li>
                    <li><a href="/#how-it-works">How It Works</a></li>
                    <li><a href="/#contact">Contact</a></li>
                    {user && <li><NavLink to="/bookings" className={({ isActive }) => isActive ? 'active' : ''}>My Bookings</NavLink></li>}
                </ul>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <button className="btn btn-outline btn-sm" onClick={() => navigate('/book')}>📅 Book Pickup</button>
                            <button className="btn btn-sm" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)' }} onClick={onLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="btn btn-outline btn-sm">Login</NavLink>
                            <NavLink to="/login" className="btn btn-primary btn-sm">📅 Book Pickup</NavLink>
                        </>
                    )}
                </div>

                <button className="hamburger" onClick={() => setOpen(!open)}>☰</button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '1rem 1.25rem' }}>
                    {['/', '/#prices', '/#how-it-works', '/#contact'].map((href, i) => (
                        <a key={i} href={href} style={{ display: 'block', padding: '.6rem 0', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}
                            onClick={() => setOpen(false)}>
                            {['🏠 Home', '💰 Prices', '❓ How It Works', '📞 Contact'][i]}
                        </a>
                    ))}
                    {user
                        ? <><Link to="/bookings" style={{ display: 'block', padding: '.6rem 0', color: 'var(--text-muted)' }} onClick={() => setOpen(false)}>📋 My Bookings</Link>
                            <button onClick={() => { onLogout(); setOpen(false); }} style={{ color: 'var(--danger)', background: 'none', border: 'none', padding: '.6rem 0', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'left' }}>↩ Logout</button></>
                        : <Link to="/login" style={{ display: 'block', padding: '.6rem 0', color: 'var(--green-300)', fontWeight: 600 }} onClick={() => setOpen(false)}>🔐 Login / Register</Link>
                    }
                </div>
            )}
        </nav>
    );
}

function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <h4>♻️ GreenCycle</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', lineHeight: 1.7 }}>
                            Hyderabad's premium scrap collection service. We pick up from your doorstep,
                            weigh transparently, and pay instantly. Eco-friendly recycling guaranteed.
                        </p>
                    </div>
                    <div>
                        <h4>Quick Links</h4>
                        <ul className="footer-links">
                            <li><a href="/#how-it-works">How It Works</a></li>
                            <li><a href="/#prices">Scrap Prices</a></li>
                            <li><a href="/#download">Download App</a></li>
                            <li><a href="/#contact">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4>Contact</h4>
                        <ul className="footer-links">
                            <li><a href="tel:+918309108691">📞 +91 8309108691</a></li>
                            <li><a href="https://wa.me/918309108691" target="_blank" rel="noreferrer">💬 WhatsApp</a></li>
                            <li style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>📍 Nizampet, Hyderabad</li>
                            <li style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>⏰ Mon–Sat 8AM–8PM</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    © {new Date().getFullYear()} GreenCycle Premium Scrap Services. All rights reserved. 🌿
                </div>
            </div>
        </footer>
    );
}

function AppInner() {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('gc_user')); } catch { return null; }
    });

    const logout = () => {
        localStorage.removeItem('gc_token');
        localStorage.removeItem('gc_user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar user={user} onLogout={logout} />
            <main style={{ flex: 1 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/book" element={<BookPickup />} />
                    <Route path="/bookings" element={<MyBookings />} />
                    <Route path="*" element={
                        <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                            <div style={{ fontSize: '4rem' }}>404</div>
                            <h2>Page not found</h2>
                            <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>← Go Home</Link>
                        </div>
                    } />
                </Routes>
            </main>
            <AIChatWidget />
            <Footer />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppInner />
        </BrowserRouter>
    );
}
