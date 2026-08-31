import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Film, Globe,
  Calendar, Image as ImageIcon, ExternalLink, ArrowLeft, Play, X, Download
} from 'lucide-react';

const SERVER_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/api\/?$/, '');

const getUrl = (p) => !p ? null : p.startsWith('http') ? p : `${SERVER_BASE}/${p}`;

/* ── Scroll-reveal hook ── */
const useReveal = (delay = 0) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add('revealed'), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
};

const DemoSiteDetailPage = ({ site, onBack, onPreviewClick, onFeedbackClick }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const handleLivePreviewClick = (e) => {
    // Check if there are any valid credentials or links that require showing the modal
    const hasFrontCreds = site.frontendCredentials && (
      typeof site.frontendCredentials === 'object'
        ? (site.frontendCredentials.username || site.frontendCredentials.password)
        : site.frontendCredentials
    );
    const hasAdminCreds = site.adminCredentials && (
      typeof site.adminCredentials === 'object'
        ? (site.adminCredentials.username || site.adminCredentials.password)
        : site.adminCredentials
    );
    const hasRoleCreds = site.frontendRoleCredentials && site.frontendRoleCredentials.length > 0;

    if (site.adminLink || hasFrontCreds || hasAdminCreds || hasRoleCreds) {
      e.preventDefault();
      onPreviewClick && onPreviewClick(site);
    }
  };

  const handleFeedback = () => {
    onFeedbackClick && onFeedbackClick(site);
  };

  const imageUrls = site.images?.length > 0 ? site.images.map(getUrl) : [];
  const videoUrl  = site.video ? getUrl(site.video) : null;
  const total     = imageUrls.length;

  const prev = () => setActiveIdx(i => (i === 0 ? total - 1 : i - 1));
  const next = () => setActiveIdx(i => (i === total - 1 ? 0 : i + 1));

  const headRef = useReveal(0);
  const infoRef = useReveal(120);

  const createdDate = site.createdAt
    ? new Date(site.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Recently Added';

  const lastUpdatedDate = site.updatedAt
    ? new Date(site.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : (site.createdAt ? new Date(site.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently Updated');

  const lastUpdatedTime = site.updatedAt
    ? new Date(site.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : (site.createdAt ? new Date(site.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : null);

  return (
    <div className="detail-page-wrapper">

      {/* ── Breadcrumb Back Bar ── */}
      <div className="detail-breadcrumb">
        <button className="detail-back-btn" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Showcase</span>
        </button>
        <div className="detail-breadcrumb-path">
          <span>Home</span>
          <ChevronRight size={13} />
          <span>Web Demos</span>
          <ChevronRight size={13} />
          <span className="detail-breadcrumb-active">{site.title}</span>
        </div>
      </div>

      {/* ── Page Title ── */}
      <div ref={headRef} className="detail-title-section reveal-up">
        {site.category && (
          <div className="detail-subcategory-badge">
            {site.category.name}
          </div>
        )}
        <h1 className="detail-main-title">{site.title}</h1>
        <div className="detail-meta-row">
          <span className="detail-meta-item">
            <span className="section-tag" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{site.developer || 'SmartSoft'}</span>
          </span>
          <span className="detail-meta-item">
            <Calendar size={13} />
            {createdDate}
          </span>
          {imageUrls.length > 0 && (
            <span className="detail-meta-item">
              <ImageIcon size={13} />
              {imageUrls.length} Screenshot{imageUrls.length > 1 ? 's' : ''}
            </span>
          )}
          {videoUrl && (
            <span className="detail-meta-item">
              <Film size={13} />
              Demo Video Available
            </span>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="detail-body-grid">

        {/* LEFT — Media + Description */}
        <div className="detail-left-col">

          {/* Main Image / Video Viewer */}
          <div className="detail-media-viewer glass-card">
            {showVideo && videoUrl ? (
              <div className="detail-video-wrapper">
                <video src={videoUrl} controls autoPlay className="detail-video" />
                <button className="detail-video-close" onClick={() => setShowVideo(false)}>
                  <X size={14} /> Show Photos
                </button>
              </div>
            ) : (
              <div className="detail-image-stage">
                {imageUrls.length > 0 ? (
                  <>
                    <img
                      src={imageUrls[activeIdx]}
                      alt={`${site.title} screenshot ${activeIdx + 1}`}
                      className="detail-main-image"
                    />
                    {total > 1 && (
                      <>
                        <button className="detail-nav-btn prev" onClick={prev}><ChevronLeft size={20} /></button>
                        <button className="detail-nav-btn next" onClick={next}><ChevronRight size={20} /></button>
                        <span className="detail-img-counter">{activeIdx + 1} / {total}</span>
                      </>
                    )}
                    {videoUrl && (
                      <button className="detail-play-badge" onClick={() => setShowVideo(true)}>
                        <Play size={13} fill="currentColor" /> Play Demo Video
                      </button>
                    )}
                  </>
                ) : (
                  <div className="detail-no-image">
                    <Globe size={48} style={{ opacity: 0.3, color: 'var(--primary)' }} />
                    <p>No preview images uploaded</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {imageUrls.length > 1 && (
            <div className="detail-thumbnail-strip">
              {imageUrls.map((url, i) => (
                <button
                  key={i}
                  className={`detail-thumb ${i === activeIdx ? 'active' : ''}`}
                  onClick={() => { setActiveIdx(i); setShowVideo(false); }}
                >
                  <img src={url} alt={`thumb ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div ref={infoRef} className="detail-description-box glass-card reveal-up">
            <h3 className="detail-section-heading">About This Demo</h3>
            <p className="detail-description-text">{site.description}</p>
          </div>
        </div>

        {/* RIGHT — CTA Sidebar */}
        <div className="detail-right-sidebar">
          <div className="detail-sidebar-card glass-card">

            {/* Live Preview / Feedback CTA container */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(() => {
                const effectiveLiveLink = site.liveDemoLink || (site.frontendRoleCredentials && site.frontendRoleCredentials.find(r => r.liveDemoLink && r.liveDemoLink.trim())?.liveDemoLink) || site.adminLink || site.scriptLink || '';
                return site.isActive && effectiveLiveLink ? (
                  <a
                    href={effectiveLiveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-preview-btn"
                    onClick={handleLivePreviewClick}
                    style={{ textDecoration: 'none' }}
                  >
                    <ExternalLink size={16} />
                    <span>Live Preview</span>
                  </a>
                ) : null;
              })()}
              
                <button
                  className="detail-preview-btn btn-feedback"
                  onClick={handleFeedback}
                  style={{
                    background: 'rgba(0, 102, 255, 0.05)',
                    color: '#0066ff',
                    border: '1px solid rgba(0, 102, 255, 0.3)',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>Feedback</span>
                </button>
              </div>



            {/* Info list */}
            <div className="detail-info-list">
              <div className="detail-info-row" style={{ alignItems: 'flex-start' }}>
                <span className="detail-info-label">Last Updated</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span className="detail-info-value">{lastUpdatedDate}</span>
                  {lastUpdatedTime && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {lastUpdatedTime}
                    </span>
                  )}
                </div>
              </div>
              {imageUrls.length > 0 && (
                <div className="detail-info-row">
                  <span className="detail-info-label">Screenshots</span>
                  <span className="detail-info-value">{imageUrls.length} images</span>
                </div>
              )}
              {videoUrl && (
                <div className="detail-info-row">
                  <span className="detail-info-label">Demo Video</span>
                  <span className="detail-info-value" style={{ color: '#22d3a0' }}>Available ✓</span>
                </div>
              )}
              {(site.apkFile || 
                (site.adminCredentials && (
                  typeof site.adminCredentials === 'object' 
                    ? site.adminCredentials.apkFile 
                    : (() => { try { return JSON.parse(site.adminCredentials).apkFile; } catch { return false; } })()
                )) || 
                (site.frontendRoleCredentials && site.frontendRoleCredentials.some(r => r.apkFile))
              ) && (
                <div className="detail-info-row">
                  <span className="detail-info-label">Android App (APK)</span>
                  <span className="detail-info-value" style={{ color: '#10b981' }}>Available ✓</span>
                </div>
              )}
              <div className="detail-info-row">
                <span className="detail-info-label">Status</span>
                <span className="detail-info-value" style={{ color: site.isActive ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                  {site.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="detail-info-row">
                <span className="detail-info-label">Developer</span>
                <span className="detail-info-value" style={{ color: 'var(--primary)' }}>{site.developer || 'SmartSoft'}</span>
              </div>
            </div>

            {/* Live link chip */}
            {(() => {
              const effectiveLiveLink = site.liveDemoLink || (site.frontendRoleCredentials && site.frontendRoleCredentials.find(r => r.liveDemoLink && r.liveDemoLink.trim())?.liveDemoLink) || site.adminLink || site.scriptLink || '';
              return site.isActive && effectiveLiveLink ? (
                <a
                  href={effectiveLiveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-link-chip"
                  onClick={handleLivePreviewClick}
                >
                  <Globe size={13} />
                  <span className="detail-link-url">{effectiveLiveLink}</span>
                  <ExternalLink size={11} />
                </a>
              ) : null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoSiteDetailPage;
