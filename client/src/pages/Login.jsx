import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const TypingText = () => {
  const words = ["Find your lost phone.", "Recover your wallet.", "Connect securely.", "Exclusive Campus App."];
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIdx];
    const speed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
      
      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000); // Pause at full word
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setWordIdx((prev) => (prev + 1) % words.length);
      }
    }, speed);
    
    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIdx, words]);

  return <div className="typing-box">{text}<span className="cursor"></span></div>;
};

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
      
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      console.error("Auth Error Logging:", err);
      const backendError = err.response?.data?.message;
      const networkError = err.message || 'Unknown network error occurred.';
      
      setError(backendError || `Login failed. Reason: ${networkError}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── IMMERSIVE SHOWCASE (LEFT) ── */}
      <div className="auth-showcase">
        <div className="auth-mesh"></div>
        
        {/* Floating Gimmick Cards */}
        <div className="gimmick-layer">
          <div className="gimmick-card g1">
            <div className="gc-icon">🔑</div>
            <div className="gc-text"><h4>Found Keys</h4><p>Academic Block • Just Now</p></div>
          </div>
          <div className="gimmick-card g2">
            <div className="gc-icon">📱</div>
            <div className="gc-text"><h4>Lost Phone</h4><p>Boys Hostel • Reward ₹500</p></div>
          </div>
          <div className="gimmick-card g3">
            Secure Campus Engine
          </div>
        </div>

        <div className="showcase-content">
          <div className="sc-brand-badge"><span>🌐</span> V2.0 Premium Platform</div>
          <h1 className="sc-title">
            Welcome Back to <br />
            <span className="sc-title-accent">LostFound.</span>
          </h1>
          <p className="sc-desc">Log in securely with your Bennett University credentials to access a centralized campus network for recovering what's yours.</p>
          <TypingText />
        </div>
      </div>

      {/* ── FORM PANEL (RIGHT) ── */}
      <div className="auth-panel">
        <div className="auth-orb orb1"></div>
        <div className="auth-orb orb2"></div>

        <div className="auth-form-wrapper">
          <div className="auth-mobile-header">
            <h1 className="sc-title sc-title-accent">LostFound.</h1>
          </div>

          <div className="auth-tabs">
            <div className="auth-tab active">Login</div>
            <Link to="/register" className="auth-tab">Register</Link>
          </div>

          {error && <div className="auth-error"><span>⚠️</span> {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-group" style={{ "--delay": 1 }}>
              <label className="auth-label">University Email</label>
              <div className="auth-input-wrap">
                <span className="auth-icon">✉️</span>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="yourname@bennett.edu.in"
                  required className="auth-input"
                />
              </div>
            </div>

            <div className="auth-group" style={{ "--delay": 2 }}>
              <label className="auth-label">Secure Password</label>
              <div className="auth-input-wrap">
                <span className="auth-icon">🔒</span>
                <input
                  type="password" name="password" value={formData.password}
                  onChange={handleChange} placeholder="••••••••"
                  required className="auth-input"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Authenticating...' : 'Secure Login →'}
            </button>
          </form>

          <div className="auth-bottom">
            Don't have a campus account? 
            <Link to="/register" className="auth-link">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
