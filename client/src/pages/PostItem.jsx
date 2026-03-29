import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../api/items';
import { useAuth } from '../context/AuthContext';
import './PostItem.css';

const CATEGORIES = [
  { value: 'electronics', label: 'Electronics', icon: '📱' },
  { value: 'keys',        label: 'Keys',        icon: '🔑' },
  { value: 'wallet',      label: 'Wallet',      icon: '👛' },
  { value: 'bag',         label: 'Bag',         icon: '🎒' },
  { value: 'clothing',    label: 'Clothing',    icon: '👕' },
  { value: 'pet',         label: 'Pet',         icon: '🐾' },
  { value: 'documents',   label: 'Documents',   icon: '📄' },
  { value: 'jewelry',     label: 'Jewelry',     icon: '💍' },
  { value: 'other',       label: 'Other',       icon: '📦' },
];

const PostItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState('lost');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    city: '',
    dateLostFound: '',
    reward: '',
    tags: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) { setError('Please select a category'); return; }
    if (!formData.dateLostFound) { setError('Please select a date'); return; }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('type', type);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('location[address]', formData.address);
      data.append('location[city]', formData.city);
      data.append('dateLostFound', formData.dateLostFound);
      data.append('reward', formData.reward || 0);
      if (formData.tags) {
        formData.tags.split(',').forEach(tag => data.append('tags[]', tag.trim()));
      }
      images.forEach(img => data.append('images', img));

      await createItem(data);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post item. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="post-root">
        <div className="post-success">
          <div className="success-icon">🎉</div>
          <h2>Item Posted Successfully!</h2>
          <p>Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-root">
      <div className="post-card">

        {/* Header */}
        <div className="post-header">
          <h1 className="post-title">Report an Item</h1>
          <p className="post-sub">Fill in the details below to post your item</p>
        </div>

        {/* Type Toggle */}
        <div className="type-toggle">
          <button
            type="button"
            className={`toggle-btn ${type === 'lost' ? 'active-lost' : ''}`}
            onClick={() => setType('lost')}
          >
            😟 I Lost Something
          </button>
          <button
            type="button"
            className={`toggle-btn ${type === 'found' ? 'active-found' : ''}`}
            onClick={() => setType('found')}
          >
            🙌 I Found Something
          </button>
        </div>

        {error && <div className="post-error">{error}</div>}

        <form onSubmit={handleSubmit} className="post-form">

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input
              type="text" name="title" value={formData.title}
              onChange={handleChange} required
              placeholder={type === 'lost' ? 'e.g. Black iPhone 14' : 'e.g. Brown leather wallet'}
              className="form-input"
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div className="category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value} type="button"
                  className={`cat-chip ${formData.category === cat.value ? 'cat-active' : ''}`}
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description" value={formData.description}
              onChange={handleChange} required rows={4}
              placeholder="Describe the item in detail — color, brand, size, any unique marks..."
              className="form-input form-textarea"
            />
          </div>

          {/* Location */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {type === 'lost' ? '📍 Where did you lose it? *' : '📍 Where did you find it? *'}
              </label>
              <input
                type="text" name="address" value={formData.address}
                onChange={handleChange} required
                placeholder="e.g. Main Library, 2nd Floor"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text" name="city" value={formData.city}
                onChange={handleChange} required
                placeholder="e.g. Delhi"
                className="form-input"
              />
            </div>
          </div>

          {/* Date */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {type === 'lost' ? '📅 Date Lost *' : '📅 Date Found *'}
              </label>
              <input
                type="date" name="dateLostFound" value={formData.dateLostFound}
                onChange={handleChange} required
                max={new Date().toISOString().split('T')[0]}
                className="form-input"
              />
            </div>
            {type === 'lost' && (
              <div className="form-group">
                <label className="form-label">💰 Reward Amount (₹)</label>
                <input
                  type="number" name="reward" value={formData.reward}
                  onChange={handleChange} min="0"
                  placeholder="0 = No reward"
                  className="form-input"
                />
              </div>
            )}
          </div>

          {/* Images */}
          <div className="form-group">
            <label className="form-label">📸 Add Photos (Max 5)</label>
            <div className="image-upload-area">
              {previews.map((src, i) => (
                <div key={i} className="image-preview">
                  <img src={src} alt={`preview-${i}`} />
                  <button type="button" className="remove-img" onClick={() => removeImage(i)}>✕</button>
                </div>
              ))}
              {previews.length < 5 && (
                <label className="upload-box">
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                  <span className="upload-icon">📷</span>
                  <span className="upload-text">Add Photo</span>
                </label>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">🏷 Tags (optional, comma separated)</label>
            <input
              type="text" name="tags" value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. black, apple, cracked screen"
              className="form-input"
            />
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className={`submit-btn ${type === 'lost' ? 'btn-lost' : 'btn-found'}`}
          >
            {loading ? 'Posting...' : type === 'lost' ? '📢 Post Lost Item' : '📢 Post Found Item'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default PostItem;
