import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getItem, updateItem, claimItem } from '../api/items';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';
import './ItemDetail.css';

const CATEGORY_ICONS = {
  electronics: '📱', keys: '🔑', wallet: '👛', bag: '🎒',
  clothing: '👕', pet: '🐾', documents: '📄', jewelry: '💍', other: '📦',
};

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [message, setMessage]     = useState('');
  const [msgSent, setMsgSent]     = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // ── Claim state ──
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimProof, setClaimProof]         = useState('');
  const [claimConfirmed, setClaimConfirmed] = useState(false);
  const [claiming, setClaiming]             = useState(false);
  const [claimed, setClaimed]               = useState(false);
  const [claimError, setClaimError]         = useState('');

  const modalRef = useRef(null);

  // ── Load item ──
  useEffect(() => {
    getItem(id)
      .then(res => setItem(res.data.item))
      .catch(() => setError('Item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Close modal on outside click ──
  useEffect(() => {
    if (!showClaimModal) return;
    const handle = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowClaimModal(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showClaimModal]);

  // ── Close modal on Escape ──
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') setShowClaimModal(false); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  const openClaimModal = () => {
    if (!user) { navigate('/login'); return; }
    setClaimProof('');
    setClaimConfirmed(false);
    setClaimError('');
    setShowClaimModal(true);
  };

  const handleClaim = async () => {
    if (!claimProof.trim()) { setClaimError('Please describe how you can identify this item.'); return; }
    if (!claimConfirmed)    { setClaimError('Please confirm you are the rightful owner.');      return; }
    setClaiming(true);
    setClaimError('');
    try {
      const res = await claimItem(id, { claimMessage: claimProof });
      setClaimed(true);
      setItem(prev => ({ ...prev, status: 'claimed', claimedBy: res.data.item.claimedBy }));
      setShowClaimModal(false);
    } catch (err) {
      setClaimError(err?.response?.data?.message || 'Failed to claim item. Try again.');
    } finally {
      setClaiming(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!user) { navigate('/login'); return; }
    setMsgLoading(true);
    try {
      setMsgSent(true);
      setMessage('');
    } catch {
      setError('Failed to send message. Try again.');
    } finally {
      setMsgLoading(false);
    }
  };

  // ── Loading / Error screens ──
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

  const isOwner    = user && item.postedBy._id === user._id;
  const isResolved = item.status === 'claimed' || item.status === 'resolved';

  return (
    <div className="detail-root">
      <div className="detail-container">

        {/* Back */}
        <button className="back-link" onClick={() => navigate(-1)}>← Back</button>

        {/* ── Claim Success Banner ── */}
        {claimed && (
          <div className="claim-success-banner">
            <div className="claim-success-icon">🎉</div>
            <div>
              <div className="claim-success-title">Item Claimed Successfully!</div>
              <div className="claim-success-sub">
                The poster has been notified by email. They'll contact you shortly to arrange handover.
              </div>
            </div>
          </div>
        )}

        <div className="detail-grid">

          {/* ── LEFT — Images ── */}
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
                <div className="resolved-overlay">
                  ✅ {item.status === 'claimed' ? 'Claimed' : 'Resolved'}
                </div>
              )}
            </div>

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

            <div className="item-stats">
              <div className="stat"><span className="stat-icon">👁</span><span>{item.views} views</span></div>
              <div className="stat"><span className="stat-icon">📅</span><span>{new Date(item.dateLostFound).toLocaleDateString('en-IN')}</span></div>
              <div className="stat"><span className="stat-icon">🏷</span><span>{item.category}</span></div>
            </div>
          </div>

          {/* ── RIGHT — Details ── */}
          <div className="detail-right">
            <div className="detail-category">
              {CATEGORY_ICONS[item.category]} {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </div>
            <h1 className="detail-title">{item.title}</h1>

            {item.reward > 0 && (
              <div className="reward-badge">💰 ₹{item.reward} Reward Offered</div>
            )}

            <div className="detail-info-card">
              <div className="info-row">
                <span className="info-icon">📍</span>
                <div>
                  <div className="info-label">Location</div>
                  <div className="info-value">
                    <span className="block-tag">🏢 Block {item.location?.block}</span>
                    {item.location?.address && <span className="address-sub"> — {item.location.address}</span>}
                  </div>
                </div>
              </div>
              <div className="info-row">
                <span className="info-icon">📅</span>
                <div>
                  <div className="info-label">{item.type === 'lost' ? 'Date Lost' : 'Date Found'}</div>
                  <div className="info-value">
                    {new Date(item.dateLostFound).toLocaleDateString('en-IN', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </div>
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

            <div className="detail-section">
              <h3 className="section-title">Description</h3>
              <p className="detail-desc">{item.description}</p>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="detail-tags">
                {item.tags.map((tag, i) => <span key={i} className="tag">#{tag}</span>)}
              </div>
            )}

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

            {/* ── Non-owner Actions ── */}
            {!isOwner && (
              <div className="detail-actions">
                {!isResolved && !claimed && item.type === 'found' && (
                  <button className="action-btn btn-claim" onClick={openClaimModal} id="claim-item-btn">
                    🙋 Claim This Item
                  </button>
                )}
                {(isResolved || claimed) && item.type === 'found' && (
                  <div className="claimed-notice">✅ This item has already been claimed</div>
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
                    ✅ Message sent! The poster will contact you.
                    <Link to="/messages" className="inbox-link">Go to Inbox →</Link>
                  </div>
                )}
              </div>
            )}

            {/* ── Owner Actions ── */}
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

      {/* ══ Claim Modal ══ */}
      {showClaimModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="claim-modal-title">
          <div className="modal-box" ref={modalRef}>
            <button className="modal-close" onClick={() => setShowClaimModal(false)} aria-label="Close">✕</button>

            <div className="modal-header">
              <div className="modal-icon">🙋</div>
              <h2 id="claim-modal-title" className="modal-title">Claim This Item</h2>
              <p className="modal-sub">
                Describe how you can prove it's yours — this message is sent to the finder for verification.
              </p>
            </div>

            {/* Mini item card */}
            <div className="modal-item-summary">
              <span className="modal-item-icon">{CATEGORY_ICONS[item.category] || '📦'}</span>
              <div>
                <div className="modal-item-name">{item.title}</div>
                <div className="modal-item-loc">📍 Block {item.location?.block}</div>
              </div>
            </div>

            {/* Proof textarea */}
            <div className="modal-field">
              <label className="modal-label" htmlFor="claim-proof">
                How can you prove this is yours? <span className="modal-required">*</span>
              </label>
              <textarea
                id="claim-proof"
                className={`modal-textarea ${claimError && !claimProof.trim() ? 'input-error' : ''}`}
                rows={4}
                value={claimProof}
                onChange={e => { setClaimProof(e.target.value); setClaimError(''); }}
                placeholder="e.g. My name is written inside the case, it has a red sticker on the back, serial number is AB-1234…"
              />
              <div className="modal-hint">
                💡 Be specific — the more detail you give, the easier it is for the finder to verify.
              </div>
            </div>

            {/* Confirmation checkbox */}
            <label className={`modal-checkbox-label ${claimError && !claimConfirmed ? 'checkbox-error' : ''}`}>
              <input
                type="checkbox"
                checked={claimConfirmed}
                onChange={e => { setClaimConfirmed(e.target.checked); setClaimError(''); }}
                className="modal-checkbox"
              />
              <span>I confirm this item genuinely belongs to me and I'm not making a false claim.</span>
            </label>

            {claimError && <div className="modal-error">⚠️ {claimError}</div>}

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowClaimModal(false)}>Cancel</button>
              <button
                className="modal-btn-confirm"
                onClick={handleClaim}
                disabled={claiming}
                id="confirm-claim-btn"
              >
                {claiming
                  ? <span className="btn-spinner-row"><span className="btn-spinner"></span> Submitting…</span>
                  : '✅ Confirm Claim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
