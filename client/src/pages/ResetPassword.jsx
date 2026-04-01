import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetPassword } from '../api/auth';
import './Auth.css';

const ResetPassword = () => {
  const { token }                           = useParams();
  const navigate                            = useNavigate();
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [done, setDone]                     = useState(false);

  const passwordsMatch = confirmPassword === '' || password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      setDone(true);
      toast.success('Password updated! Please log in.', { autoClose: 4000 });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link is invalid or expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root" style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* Ambient Orbs */}
      <div className="auth-orb orb1" style={{ position: 'fixed' }}></div>
      <div className="auth-orb orb2" style={{ position: 'fixed' }}></div>

      <div className="auth-panel" style={{ flex: 'none', width: '100%' }}>
        <div className="auth-form-wrapper">

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 className="sc-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
              <span className="sc-title-accent">Back2U.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Bennett University Campus Network</p>
          </div>

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '2px solid rgba(16,185,129,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', fontSize: '32px'
              }}>🔓</div>
              <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Password Updated!</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '2rem' }}>
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.3rem' }}>Create New Password</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.5 }}>
                  Choose a strong password for your campus account.
                </p>
              </div>

              {error && (
                <div className="auth-error">
                  <span>⚠️</span>
                  <div>
                    {error}
                    {error.includes('invalid or expired') && (
                      <div style={{ marginTop: '8px' }}>
                        <Link to="/forgot-password" style={{ color: '#f59e0b', fontWeight: 600 }}>
                          Request a new reset link →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-group" style={{ '--delay': 1 }}>
                  <label className="auth-label">New Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-icon">🔒</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Min 6 characters"
                      required
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="auth-group" style={{ '--delay': 2 }}>
                  <label className="auth-label">Confirm New Password</label>
                  <div className="auth-input-wrap">
                    <span className="auth-icon">🔐</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                      placeholder="Must match above"
                      required
                      className={`auth-input ${confirmPassword && !passwordsMatch ? 'input-error' : ''} ${confirmPassword && passwordsMatch ? 'input-success' : ''}`}
                    />
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <span className="field-error">❌ Passwords do not match</span>
                  )}
                </div>

                <button type="submit" disabled={loading || !passwordsMatch} className="auth-btn">
                  {loading ? 'Updating...' : 'Update Password →'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
