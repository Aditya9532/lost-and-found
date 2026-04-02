import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getItems } from '../api/items';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';
import './Home.css';

const CATEGORY_ICONS = {
  electronics: '📱', keys: '🔑', wallet: '👛', bag: '🎒',
  clothing: '👕', pet: '🐾', documents: '📄', jewelry: '💍', other: '📦'
};

// College block groups for filter
const BLOCK_FILTER_GROUPS = [
  { label: '🏫 Academic', blocks: ['A', 'B', 'N', 'P'] },
  { label: '🏠 Boys Hostel', blocks: ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12'] },
  { label: '🏠 Girls Hostel', blocks: ['D1','D2','D3','D4','D5','D6'] },
  { label: '🏅 Sports', blocks: ['K'] },
];

const BLOCK_LABELS = {
  A: 'Block A', B: 'Block B', N: 'Block N', P: 'Block P',
  K: 'Sports Block',
};
const getBlockLabel = (b) => BLOCK_LABELS[b] || `Block ${b}`;

const SkeletonCard = () => (
  <div className="item-card skeleton-card">
    <div className="card-image skeleton-img" />
    <div className="card-body">
      <div className="skeleton-line skel-sm" />
      <div className="skeleton-line skel-lg" />
      <div className="skeleton-line skel-md" />
      <div className="skeleton-footer" />
    </div>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [category, setCategory]     = useState('all');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Advanced filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [blockFilter, setBlockFilter]   = useState('all');
  const [rewardOnly, setRewardOnly]     = useState(false);
  const [dateFrom, setDateFrom]         = useState('');
  const [dateTo, setDateTo]             = useState('');
  const [sortBy, setSortBy]             = useState('newest');

  const [stats, setStats] = useState({ total: 0, lost: 0, found: 0, resolved: 0 });

  const activeFilterCount = [
    blockFilter !== 'all',
    rewardOnly,
    dateFrom !== '',
    dateTo !== '',
    sortBy !== 'newest',
  ].filter(Boolean).length;

  const clearAdvanced = () => {
    setBlockFilter('all');
    setRewardOnly(false);
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
  };

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 12, status: 'active' };
    if (filter !== 'all')       params.type       = filter;
    if (category !== 'all')     params.category   = category;
    if (search.trim())          params.search     = search.trim();
    if (blockFilter !== 'all')  params.block      = blockFilter;
    if (rewardOnly)             params.rewardOnly = 'true';
    if (dateFrom)               params.dateFrom   = dateFrom;
    if (dateTo)                 params.dateTo     = dateTo;
    if (sortBy !== 'newest')    params.sortBy     = sortBy;

    getItems(params)
      .then(res => {
        setItems(res.data.items);
        setTotalPages(res.data.pages);
        setTotalCount(res.data.total);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter, category, page, blockFilter, rewardOnly, dateFrom, dateTo, sortBy]);

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
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(1);
  };

  return (
    <div className="home-root">

      {/* HERO */}
      <section className="hero">
        <div className="hero-particles">
          {[...Array(12)].map((_, i) => <div key={i} className="particle" style={{ '--i': i }} />)}
        </div>
        <div className="hero-bg-blob hero-blob1" />
        <div className="hero-bg-blob hero-blob2" />
        <div className="hero-content">
          <div className="hero-badge">🔍 Your Campus Lost &amp; Found</div>
          <h1 className="hero-title">
            Reunite With<br />
            <span className="hero-title-accent">Your Belongings</span>
          </h1>
          <p className="hero-sub">
            Post lost or found items across campus blocks — help your college community reconnect.
          </p>

          {/* Search */}
          <form className="hero-search" onSubmit={handleSearch}>
            <span className="search-icon">🔎</span>
            <input
              className="search-input"
              placeholder="Search by item name or description..."
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

      {/* STATS */}
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
          <div className="items-header-right">
            <div className="type-filters">
              {['all', 'lost', 'found'].map(f => (
                <button
                  key={f}
                  className={`type-btn ${filter === f ? 'active' : ''} type-btn-${f}`}
                  onClick={() => { handleFilterChange(setFilter)(f); }}
                >
                  {f === 'all' ? '🗂 All' : f === 'lost' ? '😟 Lost' : '🙌 Found'}
                </button>
              ))}
            </div>
            <button
              className={`advanced-toggle ${showAdvanced ? 'adv-open' : ''} ${activeFilterCount > 0 ? 'adv-active' : ''}`}
              onClick={() => setShowAdvanced(v => !v)}
            >
              ⚙ Filters {activeFilterCount > 0 && <span className="adv-badge">{activeFilterCount}</span>}
              <span className="adv-arrow">{showAdvanced ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="category-filters">
          {['all','electronics','keys','wallet','bag','pet','documents','clothing','jewelry','other'].map(cat => (
            <button
              key={cat}
              className={`cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => handleFilterChange(setCategory)(cat)}
            >
              {cat === 'all' ? '🌐 All' : `${CATEGORY_ICONS[cat]} ${cat.charAt(0).toUpperCase()+cat.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Advanced Filters Panel */}
        <div className={`advanced-panel ${showAdvanced ? 'adv-panel-open' : ''}`}>
          <div className="adv-panel-inner">

            {/* Block Filter */}
            <div className="adv-section">
              <p className="adv-section-label">🏢 Location Block</p>
              <div className="adv-block-selector">
                <button
                  className={`adv-block-chip ${blockFilter === 'all' ? 'adv-block-active' : ''}`}
                  onClick={() => handleFilterChange(setBlockFilter)('all')}
                >All Blocks</button>
                {BLOCK_FILTER_GROUPS.map(group => (
                  <div key={group.label} className="adv-block-group">
                    <span className="adv-block-group-label">{group.label}</span>
                    {group.blocks.map(b => (
                      <button
                        key={b}
                        className={`adv-block-chip ${blockFilter === b ? 'adv-block-active' : ''}`}
                        onClick={() => handleFilterChange(setBlockFilter)(b)}
                      >{b}</button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="adv-row">
              {/* Sort By */}
              <div className="adv-section">
                <p className="adv-section-label">↕ Sort By</p>
                <div className="adv-sort-pills">
                  {[
                    { val: 'newest', label: 'Newest Post' },
                    { val: 'oldest', label: 'Oldest Post' },
                    { val: 'recent', label: 'Date Lost/Found' },
                    { val: 'reward', label: 'Highest Reward' },
                  ].map(s => (
                    <button
                      key={s.val}
                      className={`adv-sort-pill ${sortBy === s.val ? 'adv-sort-active' : ''}`}
                      onClick={() => { setSortBy(s.val); setPage(1); }}
                    >{s.label}</button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="adv-section">
                <p className="adv-section-label">📅 Date Range (Lost/Found)</p>
                <div className="adv-date-row">
                  <input type="date" className="adv-date-input" value={dateFrom}
                    max={dateTo || new Date().toISOString().split('T')[0]}
                    onChange={e => { setDateFrom(e.target.value); setPage(1); }}
                    placeholder="From"
                  />
                  <span className="adv-date-sep">→</span>
                  <input type="date" className="adv-date-input" value={dateTo}
                    min={dateFrom} max={new Date().toISOString().split('T')[0]}
                    onChange={e => { setDateTo(e.target.value); setPage(1); }}
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            {/* Reward toggle + clear */}
            <div className="adv-footer">
              <label className="reward-toggle">
                <input
                  type="checkbox" checked={rewardOnly}
                  onChange={e => { setRewardOnly(e.target.checked); setPage(1); }}
                />
                <span className="reward-toggle-track">
                  <span className="reward-toggle-thumb" />
                </span>
                <span className="reward-toggle-label">💰 Reward items only</span>
              </label>
              {activeFilterCount > 0 && (
                <button className="adv-clear-btn" onClick={() => { clearAdvanced(); setPage(1); }}>
                  ✕ Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="active-filters">
            {blockFilter !== 'all' && (
              <span className="filter-badge">
                🏢 {getBlockLabel(blockFilter)}
                <button onClick={() => handleFilterChange(setBlockFilter)('all')}>✕</button>
              </span>
            )}
            {rewardOnly && (
              <span className="filter-badge">
                💰 With Reward
                <button onClick={() => { setRewardOnly(false); setPage(1); }}>✕</button>
              </span>
            )}
            {dateFrom && (
              <span className="filter-badge">
                From {dateFrom}
                <button onClick={() => { setDateFrom(''); setPage(1); }}>✕</button>
              </span>
            )}
            {dateTo && (
              <span className="filter-badge">
                To {dateTo}
                <button onClick={() => { setDateTo(''); setPage(1); }}>✕</button>
              </span>
            )}
            {sortBy !== 'newest' && (
              <span className="filter-badge">
                ↕ {sortBy === 'oldest' ? 'Oldest' : sortBy === 'recent' ? 'By Date' : 'By Reward'}
                <button onClick={() => { setSortBy('newest'); setPage(1); }}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="items-grid">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No items found</h3>
            <p>Try adjusting your filters or be the first to post!</p>
            <Link to={user ? '/post' : '/register'}
              className="cta-btn cta-primary"
              style={{ display: 'inline-block', marginTop: '1rem' }}>
              + Post an Item
            </Link>
          </div>
        ) : (
          <>
            <p className="results-count">{totalCount} item{totalCount !== 1 ? 's' : ''} found</p>
            <div className="items-grid">
              {items.map((item, idx) => (
                <Link to={`/items/${item._id}`} key={item._id} className="item-card glass-shine" style={{ '--card-idx': idx }}>
                  <div className="card-image">
                    {item.images && item.images.length > 0 ? (
                      <img src={getImageUrl(item.images[0].url)} alt={item.title} className="card-img" />
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
                      <span className="meta-item">🏢 Block {item.location?.block}</span>
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
            <p>Post your lost item and let the campus community help you!</p>
          </div>
          <Link to={user ? '/post' : '/register'} className="cta-btn cta-primary hover-float">
            + Post an Item
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
