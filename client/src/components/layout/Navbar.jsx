import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInbox } from '../../api/messages';
import io from 'socket.io-client';
import './Navbar.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const socketRef = useRef(null);

  const [unread, setUnread]         = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif]   = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const notifRef = useRef(null);

  // Fetch unread count
  const fetchUnread = () => {
    if (!user) return;
    getInbox()
      .then(res => {
        const unreadMsgs = res.data.messages.filter(
          m => !m.read && m.receiver?._id === user._id
        );
        setUnread(unreadMsgs.length);
        // Latest 5 notifications
        const latest = unreadMsgs.slice(0, 5).map(m => ({
          id: m._id,
          from: m.sender?.name || 'Someone',
          item: m.item?.title || 'an item',
          content: m.content,
          time: m.createdAt,
          itemId: m.item?._id,
        }));
        setNotifications(latest);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUnread();
  }, [user, location.pathname]);

  // Socket — live notification
  useEffect(() => {
    if (!user) return;
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('receive_message', (data) => {
      if (data.receiver === user._id || data.receiver?._id === user._id) {
        setUnread(prev => prev + 1);
        setNotifications(prev => [{
          id: Date.now(),
          from: data.sender?.name || 'Someone',
          item: data.item?.title || 'an item',
          content: data.content,
          time: new Date().toISOString(),
          itemId: data.item?._id,
        }, ...prev].slice(0, 5));
        // Browser notification
        if (Notification.permission === 'granted') {
          new Notification('New Message — LostFound', {
            body: `${data.sender?.name || 'Someone'}: ${data.content}`,
            icon: '/favicon.ico',
          });
        }
      }
    });
    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return () => socketRef.current?.disconnect();
  }, [user]);

  // Close notif on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    setMenuOpen(false);
  };

  const formatTime = (date) => {
    const diff = new Date() - new Date(date);
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(date).toLocaleDateString('en-IN');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="nav-brand">
        <span className="brand-icon">🔍</span>
        <span className="brand-name">LostFound</span>
      </Link>

      {/* Desktop Links */}
      <div className="nav-links">
        <Link to="/" className={`nav-link ${isActive('/') ? 'nav-active' : ''}`}>Browse</Link>
        {user && (
          <>
            <Link to="/post" className={`nav-link ${isActive('/post') ? 'nav-active' : ''}`}>
              + Post Item
            </Link>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'nav-active' : ''}`}>
              My Items
            </Link>
          </>
        )}
      </div>

      {/* Right Side */}
      <div className="nav-right">
        {user ? (
          <>
            {/* Messages Link */}
            <Link to="/messages" className={`nav-link ${isActive('/messages') ? 'nav-active' : ''}`}>
              Chat
            </Link>

            {/* Notification Bell */}
            <div className="notif-wrap" ref={notifRef}>
              <button
                className="notif-btn"
                onClick={() => setShowNotif(!showNotif)}
              >
                🔔
                {unread > 0 && (
                  <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotif && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span className="notif-title">Notifications</span>
                    {unread > 0 && <span className="notif-count">{unread} new</span>}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <span>🎉</span>
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    <div className="notif-list">
                      {notifications.map((n, i) => (
                        <div
                          key={i}
                          className="notif-item"
                          onClick={() => {
                            setShowNotif(false);
                            navigate('/messages');
                          }}
                        >
                          <div className="notif-dot" />
                          <div className="notif-body">
                            <p className="notif-text">
                              <strong>{n.from}</strong> messaged about <strong>{n.item}</strong>
                            </p>
                            <p className="notif-preview">"{n.content}"</p>
                            <span className="notif-time">{formatTime(n.time)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="notif-footer">
                    <Link
                      to="/messages"
                      className="notif-see-all"
                      onClick={() => { setShowNotif(false); setUnread(0); }}
                    >
                      See all messages →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="user-menu-wrap">
              <button className="user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="user-avatar">
                  {user.avatar
                    ? <img src={user.avatar} alt="av" />
                    : <span>{user.name?.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
                <span className="user-arrow">{menuOpen ? '▲' : '▼'}</span>
              </button>

              {menuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <p className="ud-name">{user.name}</p>
                    <p className="ud-email">{user.email}</p>
                  </div>
                  <Link to="/dashboard" className="ud-item" onClick={() => setMenuOpen(false)}>
                    📊 My Items
                  </Link>
                  <Link to="/messages" className="ud-item" onClick={() => setMenuOpen(false)}>
                    💬 Messages {unread > 0 && <span className="ud-badge">{unread}</span>}
                  </Link>
                  <Link to="/post" className="ud-item" onClick={() => setMenuOpen(false)}>
                    + Post Item
                  </Link>
                  <div className="ud-divider" />
                  <button className="ud-item ud-logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="auth-btns">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-register">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
