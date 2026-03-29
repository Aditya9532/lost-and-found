import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateEmail = (email) => {
    return email.endsWith('@bennett.edu.in');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    if (!validateEmail(formData.email)) {
      setError('Only Bennett University email (@bennett.edu.in) is allowed!');
      return;
    }

    // Password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      loginUser(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Live email check — show hint while typing
  const emailValid = formData.email === '' || formData.email.endsWith('@bennett.edu.in');

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
          <Link to="/login" className="auth-tab">Login</Link>
          <div className="auth-tab active">Register</div>
        </div>

        {/* College notice */}
        <div className="college-notice">
          🎓 Only <strong>@bennett.edu.in</strong> emails allowed
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="auth-group">
            <label className="auth-label">Full Name</label>
            <input
              type="text" name="name" value={formData.name}
              onChange={handleChange} placeholder="Your full name"
              required className="auth-input"
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">University Email</label>
            <input
              type="email" name="email" value={formData.email}
              onChange={handleChange}
              placeholder="yourname@bennett.edu.in"
              required
              className={`auth-input ${formData.email && !emailValid ? 'input-error' : ''} ${formData.email && emailValid ? 'input-success' : ''}`}
            />
            {formData.email && !emailValid && (
              <span className="field-error">❌ Must be @bennett.edu.in email</span>
            )}
            {formData.email && emailValid && (
              <span className="field-success">✅ Valid university email</span>
            )}
          </div>

          <div className="auth-group">
            <label className="auth-label">Phone Number</label>
            <input
              type="tel" name="phone" value={formData.phone}
              onChange={handleChange} placeholder="+91 98765 43210"
              className="auth-input"
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">Password</label>
            <input
              type="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="Min 6 characters"
              required className="auth-input"
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">Confirm Password</label>
            <input
              type="password" name="confirmPassword" value={formData.confirmPassword}
              onChange={handleChange} placeholder="••••••••"
              required
              className={`auth-input ${
                formData.confirmPassword && formData.password !== formData.confirmPassword
                  ? 'input-error' : ''
              } ${
                formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'input-success' : ''
              }`}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <span className="field-error">❌ Passwords do not match</span>
            )}
          </div>

          <button
            type="submit" disabled={loading || !emailValid}
            className="auth-btn"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-bottom-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
