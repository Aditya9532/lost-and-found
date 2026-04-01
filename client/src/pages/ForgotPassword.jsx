import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@bennett.edu.in')) {
      return setError('Only @bennett.edu.in emails are allowed.');
    }
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      console.error('Forgot password error:', err);
      const backendMsg = err.response?.data?.message;
      const networkMsg = err.message || 'Unknown error';
      if (backendMsg) {
        setError(backendMsg);
      } else {
        setError(`Request failed. Reason: ${networkMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root" style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* Ambient orbs */}
      <div className="auth-orb orb1" style={{ position: 'fixed' }}></div>
      <div className="auth-orb orb2" style={{ position: 'fixed' }}></div>

      <div className="auth-panel" style={{ flex: 'none', width: '100%' }}>
        <div className="auth-form-wrapper">

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="sc-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
              <span className="sc-title-accent">LostFound.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Bennett University Campus Network</p>
          </div>

          {/* Success State */}
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '2px solid rgba(16,185,129,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', fontSize: '32px'
              }}>✅</div>
              <h2 style={{ color: '#fff', marginBottom: '0.75rem', fontSize: '1.4rem' }}>Check your inbox!</h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.6, marginBottom: '2rem' }}>
                We've sent a password reset link to <strong style={{ color: '#f59e0b' }}>{email}</strong>.<br />
                The link expires in <strong style={{ color: '#f59e0b' }}>1 hour</strong>.
              </p>
              <Link to="/login" className="auth-btn" style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                padding: '14px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #ff6b35, #f59e0b)',
                color: '#fff', fontWeight: 700, fontFamily: "'Syne', sans-serif"
              }}>
                Back to Login →
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Forgot your password?</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.5 }}>
                  Enter your Bennett email address and we'll send you a secure reset link.
                </p>
              </div>

              {error && (
                <div className="auth-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-group" style={{ '--delay': 1 }}>
                  <label className="auth-label">University Email</label>
                  <div className="auth-input-wrap">
                    <span className="auth-icon">✉️</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="yourname@bennett.edu.in"
                      required
                      className="auth-input"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-btn">
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </form>

              <div className="auth-bottom">
                Remember your password?
                <Link to="/login" className="auth-link"> Login here</Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
