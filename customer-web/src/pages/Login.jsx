import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [devOtp, setDevOtp] = useState(''); // shown in dev mode from backend
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Format phone: add +91 if not present
    const formatPhone = (p) => {
        const digits = p.replace(/\D/g, '');
        if (digits.length === 10) return `+91${digits}`;
        if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
        return p.trim();
    };

    const sendOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!phone.trim()) { setError('Please enter your phone number.'); return; }
        setLoading(true);
        try {
            const res = await api.sendOtp(formatPhone(phone));
            // In dev mode, backend returns OTP in response
            if (res.otp) setDevOtp(res.otp);
            setStep('otp');
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp.trim() || otp.length < 4) { setError('Enter the 6-digit OTP.'); return; }
        setLoading(true);
        try {
            const res = await api.verifyOtp(formatPhone(phone), otp, name || undefined);
            const token = res.token || res.data?.token;
            const user = res.user || res.data?.user;
            localStorage.setItem('gc_token', token);
            localStorage.setItem('gc_user', JSON.stringify(user));
            navigate('/');
            window.location.reload();
        } catch (err) {
            setError(err.message || 'Invalid OTP. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                {step === 'phone' ? (
                    <>
                        <h2>👋 Welcome to GreenCycle</h2>
                        <p className="subtitle">Enter your phone number to get a one-time password (OTP).</p>

                        <form onSubmit={sendOtp}>
                            <div className="form-group">
                                <label className="form-label">Your Name (optional)</label>
                                <input className="form-control" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input className="form-control" type="tel" placeholder="9876543210" value={phone}
                                    onChange={e => setPhone(e.target.value)} required maxLength={13} />
                                <p className="form-hint">We'll send a 6-digit OTP to this number</p>
                            </div>

                            {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</p>}

                            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                                {loading ? '⏳ Sending OTP...' : '→ Get OTP'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2>🔐 Enter OTP</h2>
                        <p className="subtitle">We sent a 6-digit code to <strong>{phone}</strong></p>

                        {/* Dev mode: show OTP returned by backend */}
                        {devOtp && (
                            <div style={{ background: 'rgba(245,200,66,.12)', border: '1px solid var(--gold)', borderRadius: 10, padding: '.75rem 1rem', marginBottom: '1.25rem', fontSize: '.9rem' }}>
                                🧪 <strong>Dev Mode OTP:</strong> <span style={{ color: 'var(--gold)', fontWeight: 800, letterSpacing: 2 }}>{devOtp}</span>
                            </div>
                        )}

                        <form onSubmit={verifyOtp}>
                            <div className="form-group">
                                <label className="form-label">6-Digit OTP</label>
                                <input className="form-control" type="number" placeholder="123456" value={otp}
                                    onChange={e => setOtp(e.target.value)} required maxLength={6}
                                    style={{ letterSpacing: 6, fontSize: '1.4rem', textAlign: 'center' }} />
                            </div>

                            {error && <p className="error-msg" style={{ marginBottom: '1rem' }}>⚠️ {error}</p>}

                            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
                                {loading ? '⏳ Verifying...' : '✅ Verify & Login'}
                            </button>
                        </form>

                        <div className="auth-switch">
                            <a href="#" onClick={e => { e.preventDefault(); setStep('phone'); setOtp(''); setError(''); setDevOtp(''); }}>
                                ← Change phone number
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
