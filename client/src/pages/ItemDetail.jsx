import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItem, updateItem, claimItem } from '../api/items';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';
import './ItemDetail.css';

const CATEGORY_ICONS = {
  electronics: '📱', keys: '🔑', wallet: '👛', bag: '🎒',
  clothing: '👕', pet: '🐾', documents: '📄', jewelry: '💍', other: '📦'
};

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    getItem(id)
      .then(res => setItem(res.data.item))
      .catch(() => setError('Item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!user) { navigate('/login'); return; }
    setMsgLoading(true);
    try {
      await sendMessage({ receiverId: item.postedBy._id, itemId: item._id, content: message });
      setMsgSent(true);
      setMessage('');
    } catch {
      setError('Failed to send message. Try again.');
    } finally {
      setMsgLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user) { navigate('/login'); return; }
    setClaiming(true);
    setError('');
    try {
      const res = await claimItem(id);
      setClaimed(true);
      setItem({ ...item, status: 'claimed', claimedBy: res.data.item.claimedBy });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to claim item. Try again.';
      setError(msg);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return (
    <div className="detail-root">
      <div className="detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading item details...</p>
      </div>
    </div>
  );

  if (error && !item) return (
    <div className="detail-root">
      <div className="detail-error-page">
        <div className="error-icon">😕</div>
        <h2>Item Not Found</h2>
        <p>This item may have been removed or resolved.</p>
        <Link to="/" className="back-btn">← Back to Home</Link>
      </div>
    </div>
  );

  const isOwner = user && item.postedBy._id === user._id;
  const isResolved = item.status === 'claimed' || item.status === 'resolved';

  return (
    <div className="detail-root">
      <div className="detail-container">

        {/* Back Button */}
        <button className="back-link" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="detail-grid">

          {/* LEFT — Images */}
          <div className="detail-left">
            <div className="main-image">
              {item.images && item.images.length > 0 ? (
                <img src={getImageUrl(item.images[activeImg]?.url)} alt={item.title} />
              ) : (
                <div className="no-image">
                  <span>{CATEGORY_ICONS[item.category] || '📦'}</span>
                </div>
              )}
              <div className={`status-badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                {item.type === 'lost' ? '😟 Lost' : '🙌 Found'}
              </div>
              {isResolved && (
                <div className="resolved-overlay">✅ Resolved</div>
              )}
            </div>

            {/* Thumbnails */}
            {item.images && item.images.length > 1 && (
              <div className="thumbnails">
                {item.images.map((img, i) => (
                  <img
                    key={i} src={getImageUrl(img.url)} alt={`thumb-${i}`}
                    className={`thumb ${activeImg === i ? 'thumb-active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}

            {/* Item Stats */}
            <div className="item-stats">
              <div className="stat">
                <span className="stat-icon">👁</span>
                <span>{item.views} views</span>
              </div>
              <div className="stat">
                <span className="stat-icon">📅</span>
                <span>{new Date(item.dateLostFound).toLocaleDateString('en-IN')}</span>
              </div>
              <div className="stat">
                <span className="stat-icon">🏷</span>
                <span>{item.category}</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="detail-right">

            {/* Title & Category */}
            <div className="detail-category">
              {CATEGORY_ICONS[item.category]} {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </div>
            <h1 className="detail-title">{item.title}</h1>

            {/* Reward */}
            {item.reward > 0 && (
              <div className="reward-badge">
                💰 ₹{item.reward} Reward Offered
              </div>
            )}

            {/* Location */}
            <div className="detail-info-card">
              <div className="info-row">
                <span className="info-icon">📍</span>
                <div>
                  <div className="info-label">Location</div>
                  <div className="info-value">
                    <span className="block-tag">🏢 Block {item.location?.block}</span>
                    {item.location?.address && (
                      <span className="address-sub"> — {item.location.address}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">📅</span>
                <div>
                  <div className="info-label">{item.type === 'lost' ? 'Date Lost' : 'Date Found'}</div>
                  <div className="info-value">{new Date(item.dateLostFound).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">🔵</span>
                <div>
                  <div className="info-label">Status</div>
                  <div className={`info-value status-${item.status}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="detail-section">
              <h3 className="section-title">Description</h3>
              <p className="detail-desc">{item.description}</p>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="detail-tags">
                {item.tags.map((tag, i) => (
                  <span key={i} className="tag">#{tag}</span>
                ))}
              </div>
            )}

            {/* Posted By */}
            <div className="detail-section">
              <h3 className="section-title">Posted By</h3>
              <div className="poster-card">
                <div className="poster-avatar">
                  {item.postedBy?.avatar
                    ? <img src={item.postedBy.avatar} alt="avatar" />
                    : <span>{item.postedBy?.name?.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div className="poster-info">
                  <div className="poster-name">{item.postedBy?.name}</div>
                  <div className="poster-joined">Verified Student</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isOwner && (
              <div className="detail-actions">
                {!isResolved && item.type === 'found' && (
                  <button
                    className={`action-btn btn-claim ${claimed ? 'btn-claimed' : ''}`}
                    onClick={handleClaim} disabled={claiming || claimed}
                  >
                    {claimed ? '✅ Claimed!' : claiming ? 'Claiming...' : '🙋 Claim This Item'}
                  </button>
                )}

                {!msgSent ? (
                  <form onSubmit={handleSendMessage} className="message-form">
                    <h3 className="section-title">💬 Contact Poster</h3>
                    <textarea
                      value={message} onChange={e => setMessage(e.target.value)}
                      placeholder={item.type === 'lost'
                        ? 'I think I found your item...'
                        : 'I think this is my item, I can identify it by...'}
                      className="msg-input" rows={3} required
                    />
                    <button type="submit" className="action-btn btn-message" disabled={msgLoading}>
                      {msgLoading ? 'Sending...' : '📨 Send Message'}
                    </button>
                  </form>
                ) : (
                  <div className="msg-sent-box">
                    ✅ Message sent! Check your inbox for reply.
                    <Link to="/messages" className="inbox-link">Go to Inbox →</Link>
                  </div>
                )}
              </div>
            )}

            {/* Owner Actions */}
            {isOwner && (
              <div className="owner-actions">
                <div className="owner-badge">✏️ This is your post</div>
                <button
                  className="action-btn btn-resolve"
                  onClick={() => updateItem(id, { status: 'resolved' }).then(() => navigate('/'))}
                >
                  ✅ Mark as Resolved
                </button>
                <Link to="/" className="action-btn btn-back-home">← Back to Home</Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
