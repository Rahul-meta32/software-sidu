import React, { useState } from 'react';
import { ExternalLink, Edit2, Trash2, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { demoSiteService, API_BASE_URL } from '../api/demoSiteService';

const DemoSiteCard = ({ site, onEdit, onDelete }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isActive, setIsActive] = useState(site.isActive);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try {
      const nextActive = !isActive;
      const formData = new FormData();
      formData.append('isActive', nextActive);
      
      const res = await demoSiteService.update(site._id, formData);
      if (res.success) {
        setIsActive(nextActive);
        site.isActive = nextActive;
      }
    } catch (err) {
      console.error('Failed to toggle active status:', err);
      alert('Failed to update status.');
    } finally {
      setToggling(false);
    }
  };

  // Compute server image/video paths
  const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');

  const hasImages = site.images && site.images.length > 0;
  const imageUrls = hasImages
    ? site.images.map(img => img.startsWith('http') ? img : `${serverUrl}/${img}`)
    : ['/placeholder-image.jpg']; // Fallback placeholder if no images uploaded

  const hasVideo = !!site.video;
  const videoUrl = hasVideo
    ? (site.video.startsWith('http') ? site.video : `${serverUrl}/${site.video}`)
    : null;

  // Next image in slider
  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  // Previous image in slider
  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  return (
    <div className="demo-site-card glass-card">
      {/* Media Header Section */}
      <div className="card-media-header">
        {showVideoPlayer && hasVideo ? (
          <div className="video-player-container">
            <video src={videoUrl} controls autoPlay className="card-video-element" />
            <button
              className="video-close-overlay"
              onClick={() => setShowVideoPlayer(false)}
            >
              Show Photos
            </button>
          </div>
        ) : (
          <div className="carousel-container">
            <img
              src={imageUrls[activeImageIndex]}
              alt={site.title}
              className="card-main-image"
            />
            
            {imageUrls.length > 1 && (
              <>
                <button className="carousel-nav-btn prev" onClick={prevImage}>
                  <ChevronLeft size={16} />
                </button>
                <button className="carousel-nav-btn next" onClick={nextImage}>
                  <ChevronRight size={16} />
                </button>
                <div className="carousel-dots">
                  {imageUrls.map((_, idx) => (
                    <span
                      key={idx}
                      className={`carousel-dot ${idx === activeImageIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Media Overlay Badges */}
            <div className="media-badges">
              {hasVideo && (
                <button
                  className="media-badge video-badge"
                  onClick={() => setShowVideoPlayer(true)}
                  title="Play video presentation"
                >
                  <Film size={12} />
                  <span>Play Video</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Description Content Section */}
      <div className="card-body">
        <h3 className="card-title">{site.title}</h3>
        <p className="card-description">{site.description}</p>
        
        {/* Admin-only Metadata info section */}
        {(site.serverCategory || site.scriptLink || site.date || site.developer) && (
          <div style={{ marginTop: '12px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', background: 'var(--bg-darker)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            {site.developer && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Developer: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{site.developer}</span>
              </div>
            )}
            {site.serverCategory && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Server: </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{site.serverCategory}</span>
              </div>
            )}
            {site.scriptLink && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Script: </span>
                <a href={site.scriptLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                  View Script
                </a>
              </div>
            )}
            {site.date && (
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Date: </span>
                <span style={{ color: 'var(--text-main)' }}>{new Date(site.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Actions Section */}
      <div className="card-footer">
        {(() => {
          const effectiveLiveLink = site.liveDemoLink || (site.frontendRoleCredentials && site.frontendRoleCredentials.find(r => r.liveDemoLink && r.liveDemoLink.trim())?.liveDemoLink) || site.adminLink || site.scriptLink || '';
          return effectiveLiveLink ? (
            <a
              href={effectiveLiveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-card-link"
            >
              <span>Live Demo</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No Live Link</span>
          );
        })()}

        <div className="card-admin-actions">
          <label 
            className="admin-toggle-switch" 
            title={isActive ? 'Status: ON (Visible to Clients)' : 'Status: OFF (Hidden / Feedback only)'}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isActive}
              onChange={handleToggle}
              disabled={toggling}
            />
            <span className="slider round"></span>
          </label>

          <button
            className="icon-btn edit-action-btn"
            onClick={() => onEdit(site)}
            title="Edit details"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="icon-btn delete-action-btn"
            onClick={() => onDelete(site._id)}
            title="Delete demo site"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoSiteCard;
