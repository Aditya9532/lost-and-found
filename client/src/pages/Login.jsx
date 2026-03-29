import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { loginUser }           = useAuth();
  const navigate                = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(formData);
      loginUser(res.data.token, res.data.user);

      // Admin → /admin, Normal user → /
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />

      <div className="auth-card">
        <div className="auth-logo-area">
          <div className="auth-logo-icon">🔍</div>
          <h1 className="auth-logo-title">LostFound</h1>
          <p className="auth-logo-sub">Bennett University Campus App</p>
        </div>

        <div className="auth-tabs">
          <div className="auth-tab active">Login</div>
          <Link to="/register" className="auth-tab">Register</Link>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email" name="email" value={formData.email}
              onChange={handleChange}
              placeholder="yourname@bennett.edu.in"
              required className="auth-input"
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">Password</label>
            <input
              type="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="••••••••"
              required className="auth-input"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Logging in...' : 'Login to Account'}
          </button>
        </form>

        <p className="auth-bottom-text">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
