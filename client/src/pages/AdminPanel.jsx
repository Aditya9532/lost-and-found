import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [tab, setTab]           = useState('stats');
  const [stats, setStats]       = useState(null);
  const [items, setItems]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [deleting, setDeleting] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/');
    if (!user) navigate('/login');
  }, [user]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { if (tab === 'items') fetchItems(); }, [tab, filter]);
  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch { navigate('/'); }
    finally { setLoading(false); }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/admin/items${params}`);
      setItems(res.data.items);
    } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } finally { setLoading(false); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item permanently?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/items/${id}`);
      setItems(items.filter(i => i._id !== id));
    } finally { setDeleting(null); }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/admin/items/${id}`, { status });
    setItems(items.map(i => i._id === id ? { ...i, status } : i));
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(users.filter(u => u._id !== id));
  };

  const makeAdmin = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role });
    setUsers(users.map(u => u._id === id ? { ...u, role } : u));
  };

  if (loading && !stats) return (
    <div className="admin-root">
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    </div>
  );

  return (
    <div className="admin-root">
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">🛡️ Admin Panel</h1>
            <p className="admin-sub">Manage all items and users</p>
          </div>
          <div className="admin-badge">Admin: {user?.name}</div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {[
            { key: 'stats', label: '📊 Stats' },
            { key: 'items', label: '📦 Items' },
            { key: 'users', label: '👥 Users' },
          ].map(t => (
            <button
              key={t.key}
              className={`admin-tab ${tab === t.key ? 'tab-active' : ''}`}
              onClick={() => setTab(t.key)}
            >{t.label}</button>
          ))}
        </div>

        {/* ── STATS TAB ── */}
        {tab === 'stats' && stats && (
          <div className="stats-grid">
            {[
              { label: 'Total Users',    value: stats.totalUsers,    color: 'purple', icon: '👥' },
              { label: 'Total Items',    value: stats.totalItems,    color: 'blue',   icon: '📦' },
              { label: 'Lost Items',     value: stats.lostItems,     color: 'red',    icon: '😟' },
              { label: 'Found Items',    value: stats.foundItems,    color: 'green',  icon: '🙌' },
              { label: 'Active Items',   value: stats.activeItems,   color: 'amber',  icon: '🟢' },
              { label: 'Resolved Items', value: stats.resolvedItems, color: 'teal',   icon: '✅' },
            ].map((s, i) => (
              <div key={i} className={`admin-stat-card stat-${s.color}`}>
                <span className="stat-icon">{s.icon}</span>
                <span className="stat-val">{s.value}</span>
                <span className="stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── ITEMS TAB ── */}
        {tab === 'items' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="section-title">All Items ({items.length})</h2>
              <div className="filter-row">
                {['all','pending','active','claimed','resolved','expired'].map(f => (
                  <button
                    key={f}
                    className={`filter-btn ${filter === f ? 'filter-active' : ''}`}
                    onClick={() => setFilter(f)}
                  >{f.charAt(0).toUpperCase()+f.slice(1)}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="admin-loading"><div className="loading-spinner"></div></div>
            ) : items.length === 0 ? (
              <div className="admin-empty">
                <span>📭</span><p>No items found</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Posted By</th>
                      <th>Block</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item._id}>
                        <td className="item-title-cell">
                          <span className="item-name">{item.title}</span>
                          <span className="item-desc">{item.description?.substring(0,40)}...</span>
                        </td>
                        <td>
                          <span className={`type-pill ${item.type === 'lost' ? 'pill-lost' : 'pill-found'}`}>
                            {item.type === 'lost' ? '😟 Lost' : '🙌 Found'}
                          </span>
                        </td>
                        <td className="td-muted">{item.category}</td>
                        <td className="td-muted">
                          <div>{item.postedBy?.name}</div>
                          <div className="td-email">{item.postedBy?.email}</div>
                        </td>
                        <td className="td-muted">Block {item.location?.block}</td>
                        <td className="td-muted">{new Date(item.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <select
                            className="status-select"
                            value={item.status}
                            onChange={e => updateStatus(item._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="claimed">Claimed</option>
                            <option value="resolved">Resolved</option>
                            <option value="expired">Expired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                        <td>
                          {item.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                className="del-btn" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}
                                onClick={() => updateStatus(item._id, 'active')}
                              >✅</button>
                              <button 
                                className="del-btn" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                                onClick={() => updateStatus(item._id, 'rejected')}
                              >❌</button>
                              <button
                                className="del-btn"
                                onClick={() => deleteItem(item._id)}
                                disabled={deleting === item._id}
                                title="Delete Permanently"
                              >
                                {deleting === item._id ? '...' : '🗑'}
                              </button>
                            </div>
                          ) : (
                            <button
                              className="del-btn"
                              onClick={() => deleteItem(item._id)}
                              disabled={deleting === item._id}
                            >
                              {deleting === item._id ? '...' : '🗑 Delete'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="section-title">All Users ({users.length})</h2>
            </div>

            {loading ? (
              <div className="admin-loading"><div className="loading-spinner"></div></div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-av">{u.name?.charAt(0).toUpperCase()}</div>
                            <span className="item-name">{u.name}</span>
                          </div>
                        </td>
                        <td className="td-muted">{u.email}</td>
                        <td className="td-muted">{u.phone || '—'}</td>
                        <td>
                          <span className={`role-pill ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                            {u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                          </span>
                        </td>
                        <td className="td-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="action-cell">
                          {u._id !== user._id && (
                            <>
                              <button
                                className={`role-btn ${u.role === 'admin' ? 'btn-demote' : 'btn-promote'}`}
                                onClick={() => makeAdmin(u._id, u.role === 'admin' ? 'user' : 'admin')}
                              >
                                {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                              </button>
                              <button className="del-btn" onClick={() => deleteUser(u._id)}>
                                🗑 Delete
                              </button>
                            </>
                          )}
                          {u._id === user._id && <span className="td-muted">You</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
