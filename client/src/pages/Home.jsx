import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getItems } from '../api/items';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const CATEGORY_ICONS = {
  electronics: '📱', keys: '🔑', wallet: '👛', bag: '🎒',
  clothing: '👕', pet: '🐾', documents: '📄', jewelry: '💍', other: '📦'
};

const Home = () => {
  const { user } = useAuth();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [category, setCategory] = useState('all');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Real stats from DB
  const [stats, setStats] = useState({
    total: 0,
    lost: 0,
    found: 0,
    resolved: 0,
  });

  const fetchItems = () => {
    setLoading(true);
    const params = { page, limit: 12, status: 'active' };
    if (filter !== 'all')   params.type     = filter;
    if (category !== 'all') params.category = category;
    if (search.trim())      params.search   = search.trim();

    getItems(params)
      .then(res => {
        setItems(res.data.items);
        setTotalPages(res.data.pages);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  // Fetch real stats
  const fetchStats = () => {
    Promise.all([
      getItems({ limit: 1 }),
      getItems({ limit: 1, type: 'lost' }),
      getItems({ limit: 1, type: 'found' }),
      getItems({ limit: 1, status: 'resolved' }),
    ]).then(([all, lost, found, resolved]) => {
      setStats({
        total:    all.data.total    || 0,
        lost:     lost.data.total   || 0,
        found:    found.data.total  || 0,
        resolved: resolved.data.total || 0,
      });
    }).catch(() => {});
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchItems(); }, [filter, category, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  return (
    <div className="home-root">

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-blob hero-blob1" />
        <div className="hero-bg-blob hero-blob2" />
        <div className="hero-content">
          <div className="hero-badge">🔍 Lost Something? Found Something?</div>
          <h1 className="hero-title">
            Reunite People With<br />
            <span className="hero-title-accent">Their Belongings</span>
          </h1>
          <p className="hero-sub">
            Post lost or found items and help your community reconnect with what matters most.
          </p>

          {/* Search */}
          <form className="hero-search" onSubmit={handleSearch}>
            <span className="search-icon">🔎</span>
            <input
              className="search-input"
              placeholder="Search by item name or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="search-clear"
                onClick={() => { setSearch(''); setPage(1); }}>✕</button>
            )}
            <button type="submit" className="search-btn">Search</button>
          </form>

          {/* CTAs */}
          <div className="hero-ctas">
            <Link to={user ? '/post' : '/register'} className="cta-btn cta-primary">
              + Report Lost Item
            </Link>
            <Link to={user ? '/post' : '/register'} className="cta-btn cta-secondary">
              📢 Post Found Item
            </Link>
          </div>
        </div>
      </section>

      {/* REAL STATS from database */}
      <section className="stats-bar">
        <div className="stat-item">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">Items Posted</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">{stats.resolved}</span>
          <span className="stat-label">Items Recovered</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">{stats.lost}</span>
          <span className="stat-label">Lost Reports</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-num">{stats.found}</span>
          <span className="stat-label">Found Reports</span>
        </div>
      </section>

      {/* ITEMS SECTION */}
      <section className="items-section">
        <div className="items-header">
          <h2 className="items-title">Recent Reports</h2>
          <div className="type-filters">
            {['all', 'lost', 'found'].map(f => (
              <button
                key={f}
                className={`type-btn ${filter === f ? 'active' : ''} type-btn-${f}`}
                onClick={() => { setFilter(f); setPage(1); }}
              >
                {f === 'all' ? '🗂 All' : f === 'lost' ? '😟 Lost' : '🙌 Found'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filters">
          {['all','electronics','keys','wallet','bag','pet','documents','clothing','jewelry','other'].map(cat => (
            <button
              key={cat}
              className={`cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => { setCategory(cat); setPage(1); }}
            >
              {cat === 'all' ? '🌐 All' : `${CATEGORY_ICONS[cat]} ${cat.charAt(0).toUpperCase()+cat.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="items-loading">
            <div className="loading-spinner"></div>
            <p>Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No items found</h3>
            <p>Be the first to post! Click "Report Lost Item" above.</p>
            <Link to={user ? '/post' : '/register'}
              className="cta-btn cta-primary"
              style={{ display: 'inline-block', marginTop: '1rem' }}>
              + Post an Item
            </Link>
          </div>
        ) : (
          <>
            <p className="results-count">{items.length} item{items.length !== 1 ? 's' : ''} found</p>
            <div className="items-grid">
              {items.map(item => (
                <Link to={`/items/${item._id}`} key={item._id} className="item-card">
                  <div className="card-image">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0].url} alt={item.title} className="card-img" />
                    ) : (
                      <div className="card-image-placeholder">
                        <span>{CATEGORY_ICONS[item.category] || '📦'}</span>
                      </div>
                    )}
                    <div className={`card-badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                      {item.type === 'lost' ? '😟 Lost' : '🙌 Found'}
                    </div>
                    {item.reward > 0 && (
                      <div className="card-reward">💰 ₹{item.reward}</div>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="card-category">
                      {CATEGORY_ICONS[item.category]} {item.category.charAt(0).toUpperCase()+item.category.slice(1)}
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-desc">{item.description}</p>
                    <div className="card-meta">
                      <span className="meta-item">📍 {item.location?.city}</span>
                      <span className="meta-item">📅 {new Date(item.dateLostFound).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="card-footer">
                      <span className="card-poster">{item.postedBy?.name || 'Unknown'}</span>
                      <span className="card-contact">View Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button className="page-btn" disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}

        {/* Bottom CTA */}
        <div className="post-cta-box">
          <div className="post-cta-text">
            <h3>Can't find what you're looking for?</h3>
            <p>Post your lost item and let the community help you!</p>
          </div>
          <Link to={user ? '/post' : '/register'} className="cta-btn cta-primary">
            + Post an Item
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
