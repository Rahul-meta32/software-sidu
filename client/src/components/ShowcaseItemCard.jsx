import React, { useState } from 'react';
import { Film, ChevronLeft, ChevronRight, Layout } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/api\/?$/, '');

const ShowcaseItemCard = ({ site, onCardClick, onPreviewClick, onFeedbackClick }) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  const hasImages = site.images && site.images.length > 0;
  const imageUrls = hasImages
    ? site.images.map(img => img.startsWith('http') ? img : `${API_BASE}/${img}`)
    : [];

  const hasVideo = !!site.video;
  const videoUrl = hasVideo
    ? (site.video.startsWith('http') ? site.video : `${API_BASE}/${site.video}`)
    : null;

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImgIndex(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImgIndex(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleCardClick = () => {
    if (onCardClick) onCardClick(site);
  };

  return (
    <div
      className="market-item-card glass-card"
      onClick={handleCardClick}
      style={{ 
        cursor: 'pointer',
        ...(!site.isActive ? { border: '2px solid #ff4d4d', boxShadow: '0 8px 32px rgba(255, 77, 77, 0.08), 0 0 10px rgba(255, 77, 77, 0.15)' } : {})
      }}
    >

      {/* ── Media Section ── */}
      <div className="market-card-media">
        {showVideo && hasVideo ? (
          <div className="market-video-container">
            <video src={videoUrl} controls autoPlay className="market-card-video" />
            <button className="video-close-overlay" onClick={(e) => { e.stopPropagation(); setShowVideo(false); }}>
              Show Photos
            </button>
          </div>
        ) : (
          <div className="market-carousel-container">
            {imageUrls.length > 0 ? (
              <img
                src={imageUrls[activeImgIndex]}
                alt={`${site.title} – screenshot ${activeImgIndex + 1}`}
                className="market-card-image"
              />
            ) : (
              <div className="market-no-image">
                <Layout size={36} style={{ color: 'var(--primary)', opacity: 0.4 }} />
                <span>No Preview</span>
              </div>
            )}

            {imageUrls.length > 1 && (
              <>
                <button className="carousel-nav-btn prev" onClick={prevImage}><ChevronLeft size={16} /></button>
                <button className="carousel-nav-btn next" onClick={nextImage}><ChevronRight size={16} /></button>
                <div className="carousel-dots">
                  {imageUrls.map((_, idx) => (
                    <span key={idx} className={`carousel-dot ${idx === activeImgIndex ? 'active' : ''}`} />
                  ))}
                </div>
              </>
            )}

            {imageUrls.length > 1 && (
              <span className="market-img-counter">{activeImgIndex + 1}/{imageUrls.length}</span>
            )}

            {hasVideo && (
              <button className="media-overlay-play" onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}>
                <Film size={12} /><span>Play Demo</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="market-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '18px', flex: '1', justifyContent: 'space-between' }}>
        <div className="market-card-info" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h4 className="market-card-title" style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0066ff', margin: '0' }}>{site.title}</h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {site.description}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
          {site.isActive ? (
            onCardClick && (
              <button
                onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '9.5px 16px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                View Details
              </button>
            )
          ) : (
            onFeedbackClick && (
              <button
                onClick={(e) => { e.stopPropagation(); onFeedbackClick(site); }}
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '9.5px 16px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #ff4d4d 0%, #d32f2f 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(255, 77, 77, 0.3)'
                }}
              >
                Feedback
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ShowcaseItemCard;
