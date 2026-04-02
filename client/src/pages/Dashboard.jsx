import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyItems, deleteItem, updateItem } from '../api/items';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';
import './Dashboard.css';

const CATEGORY_ICONS = {
  electronics: '📱', keys: '🔑', wallet: '👛', bag: '🎒',
  clothing: '👕', pet: '🐾', documents: '📄', jewelry: '💍', other: '📦'
};

const Dashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [deleting, setDeleting] = useState(null);
  const [resolving, setResolving] = useState(null);

  useEffect(() => {
    getMyItems()
      .then(res => setItems(res.data.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeleting(id);
    try {
      await deleteItem(id);
      setItems(items.filter(i => i._id !== id));
    } catch {
      alert('Failed to delete. Try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleResolve = async (id) => {
    setResolving(id);
    try {
      await updateItem(id, { status: 'resolved' });
      setItems(items.map(i => i._id === id ? { ...i, status: 'resolved' } : i));
    } catch {
      alert('Failed to update. Try again.');
    } finally {
      setResolving(null);
    }
  };

  const filtered = filter === 'all' ? items : items.filter(i =>
    filter === 'lost' || filter === 'found' ? i.type === filter : i.status === filter
  );

  const stats = {
    total:    items.length,
    lost:     items.filter(i => i.type === 'lost').length,
    found:    items.filter(i => i.type === 'found').length,
    resolved: items.filter(i => i.status === 'resolved').length,
    active:   items.filter(i => i.status === 'active').length,
    pending:  items.filter(i => i.status === 'pending').length,
  };

  return (
    <div className="dash-root">
      <div className="dash-container">

        {/* Profile Header */}
        <div className="dash-profile-card">
          <div className="profile-avatar">
            {user?.avatar
              ? <img src={user.avatar} alt="avatar" />
              : <span>{user?.name?.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            {user?.phone && <p className="profile-phone">📞 {user.phone}</p>}
          </div>
          <div className="profile-actions">
            <Link to="/post" className="dash-btn btn-post">+ Post Item</Link>
            <button className="dash-btn btn-logout" onClick={() => { logoutUser(); navigate('/'); }}>
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="stat-card">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Total Posts</span>
          </div>
          <div className="stat-card stat-lost">
            <span className="stat-num">{stats.lost}</span>
            <span className="stat-label">Lost Items</span>
          </div>
          <div className="stat-card stat-found">
            <span className="stat-num">{stats.found}</span>
            <span className="stat-label">Found Items</span>
          </div>
          <div className="stat-card stat-resolved">
            <span className="stat-num">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
          <div className="stat-card stat-active">
            <span className="stat-num">{stats.active}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        {/* My Items */}
        <div className="dash-items-section">
          <div className="dash-items-header">
            <h3 className="dash-section-title">My Posted Items</h3>
            <div className="dash-filters">
              {[
                { val: 'all',      label: '🗂 All' },
                { val: 'lost',     label: '😟 Lost' },
                { val: 'found',    label: '🙌 Found' },
                { val: 'active',   label: '🟢 Active' },
                { val: 'pending',  label: '⏳ Pending' },
                { val: 'resolved', label: '✅ Resolved' },
              ].map(f => (
                <button
                  key={f.val}
                  className={`dash-filter-btn ${filter === f.val ? 'active' : ''}`}
                  onClick={() => setFilter(f.val)}
                >{f.label}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="dash-loading">
              <div className="loading-spinner"></div>
              <p>Loading your items...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="dash-empty">
              <div className="empty-icon">📭</div>
              <h3>No items here</h3>
              <p>{filter === 'all' ? "You haven't posted anything yet!" : `No ${filter} items found.`}</p>
              {filter === 'all' && (
                <Link to="/post" className="dash-btn btn-post" style={{ display: 'inline-block', marginTop: '1rem' }}>
                  + Post Your First Item
                </Link>
              )}
            </div>
          ) : (
            <div className="dash-grid">
              {filtered.map(item => (
                <div key={item._id} className="dash-item-card">

                  {/* Image */}
                  <div className="dash-card-image">
                    {item.images && item.images.length > 0 ? (
                      <img src={getImageUrl(item.images[0].url)} alt={item.title} />
                    ) : (
                      <div className="dash-no-img">
                        <span>{CATEGORY_ICONS[item.category] || '📦'}</span>
                      </div>
                    )}
                    <div className={`dash-type-badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                      {item.type === 'lost' ? '😟 Lost' : '🙌 Found'}
                    </div>
                    <div className={`dash-status-badge status-${item.status}`}>
                      {item.status === 'active' ? '🟢 Active'
                        : item.status === 'pending' ? '⏳ Pending Approval'
                        : item.status === 'claimed' ? '🟡 Claimed'
                        : item.status === 'resolved' ? '✅ Resolved'
                        : item.status === 'rejected' ? '❌ Rejected'
                        : item.status}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="dash-card-body">
                    <div className="dash-card-category">
                      {CATEGORY_ICONS[item.category]} {item.category}
                    </div>
                    <h4 className="dash-card-title">{item.title}</h4>
                    <p className="dash-card-desc">{item.description}</p>
                    <div className="dash-card-meta">
                      <span>🏢 Block {item.location?.block}</span>
                      <span>📅 {new Date(item.dateLostFound).toLocaleDateString('en-IN')}</span>
                      {item.reward > 0 && <span>💰 ₹{item.reward}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="dash-card-actions">
                    <Link to={`/items/${item._id}`} className="dash-action-btn btn-view">
                      👁 View
                    </Link>
                    {item.status === 'active' && (
                      <button
                        className="dash-action-btn btn-resolve"
                        onClick={() => handleResolve(item._id)}
                        disabled={resolving === item._id}
                      >
                        {resolving === item._id ? '...' : '✅ Resolve'}
                      </button>
                    )}
                    <button
                      className="dash-action-btn btn-delete"
                      onClick={() => handleDelete(item._id)}
                      disabled={deleting === item._id}
                    >
                      {deleting === item._id ? '...' : '🗑 Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
