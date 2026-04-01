import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const TypingText = () => {
  const words = ["Create an account.", "Join your batchmates.", "Search the campus.", "Recover lost items."];
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

  const validateEmail = (email) => email.endsWith('@bennett.edu.in');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) return setError('Only Bennett University email (@bennett.edu.in) is allowed!');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match!');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters!');

    setLoading(true);
    try {
      const res = await register({
        name: formData.name, email: formData.email, phone: formData.phone, password: formData.password
      });
      loginUser(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      console.error("Auth Error Logging:", err);
      // Give the specific backend error if available, else show the broad network error
      const backendError = err.response?.data?.message;
      const networkError = err.message || 'Unknown network error occurred.';
      
      setError(backendError || `Registration failed. Reason: ${networkError}`);
    } finally {
      setLoading(false);
    }
  };

  const emailValid = formData.email === '' || formData.email.endsWith('@bennett.edu.in');

  return (
    <div className="auth-root">
      {/* ── IMMERSIVE SHOWCASE (LEFT) ── */}
      <div className="auth-showcase">
        <div className="auth-mesh"></div>
        
        {/* Floating Gimmick Cards */}
        <div className="gimmick-layer">
          <div className="gimmick-card g1">
            <div className="gc-icon">🎓</div>
            <div className="gc-text"><h4>Verified Student</h4><p>New Joiner • Just Now</p></div>
          </div>
          <div className="gimmick-card g2">
            <div className="gc-icon">📦</div>
            <div className="gc-text"><h4>Found Item</h4><p>Academic Block • Waiting</p></div>
          </div>
          <div className="gimmick-card g3">
            Bennett Campus Exclusive
          </div>
        </div>

        <div className="showcase-content">
          <div className="sc-brand-badge"><span>✨</span> Join The Network</div>
          <h1 className="sc-title">
            Unlock the <br />
            <span className="sc-title-accent">Campus Hub.</span>
          </h1>
          <p className="sc-desc">Create your student profile today. Help batchmates register lost items, claim found gear, and secure campus networking.</p>
          <TypingText />
        </div>
      </div>

      {/* ── FORM PANEL (RIGHT) ── */}
      <div className="auth-panel">
        <div className="auth-orb orb1"></div>
        <div className="auth-orb orb2"></div>

        <div className="auth-form-wrapper" style={{ maxWidth: '440px' }}>
          <div className="auth-mobile-header">
            <h1 className="sc-title sc-title-accent">LostFound.</h1>
          </div>

          <div className="auth-tabs">
            <Link to="/login" className="auth-tab">Login</Link>
            <div className="auth-tab active">Register</div>
          </div>

          <div className="college-notice">
            <span>🛡️</span> Only verified <strong>@bennett.edu.in</strong> accounts are authorized.
          </div>

          {error && <div className="auth-error"><span>⚠️</span> {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            
            <div className="auth-group" style={{ "--delay": 1 }}>
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-icon">🧑‍🎓</span>
                <input
                  type="text" name="name" value={formData.name}
                  onChange={handleChange} placeholder="First Last"
                  required className="auth-input"
                />
              </div>
            </div>

            <div className="auth-group" style={{ "--delay": 2 }}>
              <label className="auth-label">University Email</label>
              <div className="auth-input-wrap">
                <span className="auth-icon">✉️</span>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="yourname@bennett.edu.in"
                  required
                  className={`auth-input ${formData.email && !emailValid ? 'input-error' : ''} ${formData.email && emailValid ? 'input-success' : ''}`}
                />
              </div>
              {formData.email && !emailValid && <span className="field-error">❌ Must be @bennett.edu.in email</span>}
              {formData.email && emailValid && <span className="field-success">✅ Format correct</span>}
            </div>

            <div className="auth-group" style={{ "--delay": 3 }}>
              <label className="auth-label">Phone Number <span style={{opacity:0.5,textTransform:'lowercase'}}> (optional)</span></label>
              <div className="auth-input-wrap">
                <span className="auth-icon">📞</span>
                <input
                  type="tel" name="phone" value={formData.phone}
                  onChange={handleChange} placeholder="+91 98765 43210"
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-group" style={{ "--delay": 4 }}>
              <label className="auth-label">Secure Password</label>
              <div className="auth-input-wrap">
                <span className="auth-icon">🔒</span>
                <input
                  type="password" name="password" value={formData.password}
                  onChange={handleChange} placeholder="Min 6 chars"
                  required className="auth-input"
                />
              </div>
            </div>

            <div className="auth-group" style={{ "--delay": 5 }}>
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <span className="auth-icon">🔐</span>
                <input
                  type="password" name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} placeholder="••••••••"
                  required
                  className={`auth-input ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'input-error' : ''} ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'input-success' : ''}`}
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && <span className="field-error">❌ Passwords do not match</span>}
            </div>

            <button type="submit" disabled={loading || !emailValid} className="auth-btn">
              {loading ? 'Processing...' : 'Create Verified Account →'}
            </button>

          </form>

          <div className="auth-bottom">
            Already registered? 
            <Link to="/login" className="auth-link">Login securely</Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
