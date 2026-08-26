import React, { useState, useEffect } from 'react';
import { demoSiteService, categoryService, homepageSectionService, API_BASE_URL } from '../api/demoSiteService';
import { 
  Loader2, Search, Star, CheckCircle2, AlertCircle, Save, 
  FolderOpen, ToggleLeft, ToggleRight, Sliders, Sparkles, Check
} from 'lucide-react';

const API_BASE = API_BASE_URL.replace(/\/api\/?$/, '');

const CustomCheckbox = ({ checked }) => {
  return (
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '4px',
      border: checked ? '2px solid #10b981' : '2px solid var(--border-color)',
      background: checked ? '#10b981' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      transition: 'all 0.15s ease',
      boxShadow: checked ? '0 0 6px rgba(16, 185, 129, 0.2)' : 'none'
    }}>
      {checked && <Check size={14} strokeWidth={3} />}
    </div>
  );
};

const WebsiteCms = () => {
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'featured' | 'explore'

  return (
    <div className="dashboard-page-wrapper">
      {/* Page Header section */}
      <div className="page-header-wrapper">
        <div className="page-title-section">
          <h2>Website CMS Console</h2>
          <p>Control center for managing homepage content, featured software grids, and category explorers</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '2px',
        marginBottom: '25px',
        marginTop: '15px'
      }}>
        <button
          onClick={() => setActiveTab('hero')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'hero' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'hero' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Sparkles size={16} />
          <span>Hero Section</span>
        </button>

        <button
          onClick={() => setActiveTab('featured')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'featured' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'featured' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Star size={16} fill={activeTab === 'featured' ? 'var(--primary)' : 'none'} />
          <span>Featured Software</span>
        </button>

        <button
          onClick={() => setActiveTab('explore')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'explore' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'explore' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <FolderOpen size={16} />
          <span>Category Explorer</span>
        </button>
      </div>

      {/* Dynamic Tab Views */}
      <div>
        {activeTab === 'hero' && <HeroTab />}
        {activeTab === 'featured' && <FeaturedTab />}
        {activeTab === 'explore' && <ExploreTab />}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS FOR EACH TAB ---

// 1. HERO SECTION CONFIG TAB
const HeroTab = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionId, setSectionId] = useState(null);
  
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [placeholder, setPlaceholder] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchHeroConfig = async () => {
    setLoading(true);
    try {
      const res = await homepageSectionService.getAll();
      if (res.success && res.data) {
        const hero = res.data.find(sec => sec.type === 'hero');
        if (hero) {
          setSectionId(hero._id);
          setTag(hero.metadata?.tag || 'MetaBlock Presentation Portal');
          setTitle(hero.title || 'Demonstrating Solutions That Drive Results');
          setSubtitle(hero.subtitle || 'A curated space of live demos and projects, built to showcase how technology solves real business problems.');
          setPlaceholder(hero.metadata?.placeholder || 'e.g. blockchain, game development, eCommerce platform...');
        } else {
          setMessage({ type: 'error', text: 'Hero Section configuration not found in database. Make sure the seeder has run.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to retrieve homepage layout configurations.' });
      }
    } catch (err) {
      console.error('Fetch hero config error:', err);
      setMessage({ type: 'error', text: 'Error connecting to database.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sectionId) return;

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const data = {
        title,
        subtitle,
        metadata: { tag, placeholder }
      };

      const res = await homepageSectionService.update(sectionId, data);
      if (res.success) {
        setMessage({ type: 'success', text: 'Hero Section updated successfully!' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update configuration.' });
      }
    } catch (err) {
      console.error('Update hero section error:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save configuration.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading-spinner" style={{ minHeight: '30vh' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p>Loading Hero Configuration...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '520px', padding: '24px 28px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div style={{ padding: '8px', background: 'rgba(0, 85, 255, 0.08)', color: 'var(--primary)', borderRadius: '8px' }}>
            <Sparkles size={20} />
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Edit Hero Presentation</h3>
        </div>

        {message.text && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '20px',
            background: message.type === 'success' ? 'rgba(34, 211, 160, 0.12)' : 'rgba(255, 77, 77, 0.12)',
            color: message.type === 'success' ? '#10b981' : '#ff4d4d',
            border: message.type === 'success' ? '1px solid rgba(34, 211, 160, 0.25)' : '1px solid rgba(255, 77, 77, 0.25)'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Section Tag / Category Tag</label>
            <input
              type="text"
              placeholder="e.g. METABLOCK PRESENTATION PORTAL"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              required
              disabled={saving}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: '#ffffff',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Main Title</label>
            <input
              type="text"
              placeholder="e.g. Demonstrating Solutions That Drive Results"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={saving}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: '#ffffff',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Description</label>
            <textarea
              rows={3}
              placeholder="e.g. A curated space of live demos and projects..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              required
              disabled={saving}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: '#ffffff',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>Search Placeholder Text</label>
            <input
              type="text"
              placeholder="e.g. e.g. blockchain, game development..."
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              required
              disabled={saving}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                background: '#ffffff',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={saving || !sectionId}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer',
              border: 'none',
              marginTop: '10px'
            }}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. FEATURED SOFTWARE GRID TAB
const FeaturedTab = () => {
  const [sites, setSites] = useState([]);
  const [featuredSection, setFeaturedSection] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sitesRes = await demoSiteService.getAll({ limit: 1000 });
      if (sitesRes.success) {
        setSites(sitesRes.data);
      }

      const sectionRes = await homepageSectionService.getAll();
      if (sectionRes.success) {
        const fSec = sectionRes.data.find(sec => sec.type === 'featured_grid');
        if (fSec) {
          setFeaturedSection(fSec);
          const initialIds = (fSec.items || []).map(item => 
            typeof item === 'object' && item._id ? item._id : item
          );
          setSelectedIds(initialIds);
        } else {
          setError('Featured softwares section not found in homepage configurations. Please seed the homepage database first.');
        }
      }
    } catch (err) {
      console.error('Fetch Featured Data Error:', err);
      setError('Failed to fetch demo sites or homepage configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSelect = (siteId) => {
    if (selectedIds.includes(siteId)) {
      setSelectedIds(prev => prev.filter(id => id !== siteId));
      setSuccess(null);
    } else {
      if (selectedIds.length >= 6) {
        setError('You can select a maximum of 6 featured software items. Deselect another item first.');
        setTimeout(() => setError(null), 4000);
        return;
      }
      setSelectedIds(prev => [...prev, siteId]);
      setSuccess(null);
    }
  };

  const handleSave = async () => {
    if (!featuredSection) {
      setError('No featured section available to update.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await homepageSectionService.update(featuredSection._id, {
        items: selectedIds
      });

      if (res.success) {
        setSuccess('Featured software updated successfully!');
        setFeaturedSection(res.data);
      }
    } catch (err) {
      console.error('Update Featured Error:', err);
      setError(err.response?.data?.message || 'Failed to update featured software.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSites = sites.filter(site => 
    site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (site.description && site.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (site.category?.name && site.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSiteImage = (site) => {
    if (site.images && site.images.length > 0) {
      const img = site.images[0];
      return img.startsWith('http') ? img : `${API_BASE}/${img}`;
    }
    return null;
  };

  const selectedSites = selectedIds
    .map(id => sites.find(s => s._id === id))
    .filter(Boolean);

  if (loading) {
    return (
      <div className="dashboard-loading-spinner" style={{ padding: '60px 0' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px auto' }} />
        <p>Loading catalog and configurations...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {error && (
        <div className="error-alert" style={{ 
          color: '#ff4d4d', 
          background: 'rgba(255, 77, 77, 0.08)', 
          border: '1px solid rgba(255, 77, 77, 0.18)', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-alert" style={{ 
          color: '#22d3a0', 
          background: 'rgba(34, 211, 160, 0.08)', 
          border: '1px solid rgba(34, 211, 160, 0.18)', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Quick Selection Tray */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            background: selectedIds.length > 0 ? 'rgba(0, 85, 255, 0.08)' : 'rgba(255,255,255,0.03)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: selectedIds.length > 0 ? 'var(--primary)' : 'var(--text-muted)'
          }}>
            <Star size={20} fill={selectedIds.length > 0 ? 'var(--primary)' : 'none'} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Featured Count: <span style={{ color: 'var(--primary)' }}>{selectedIds.length} / 6</span></h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {selectedIds.length === 0 
                ? 'No themes handpicked. System defaults to displaying the 6 latest templates.'
                : `Active configuration with ${selectedIds.length} curated templates.`
              }
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Selections...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Curated List</span>
            </>
          )}
        </button>
      </div>

      {/* Selected Cards Order Tray */}
      {selectedSites.length > 0 && (
        <div className="glass-card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>Curated order</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {selectedSites.map((site, index) => (
              <div 
                key={site._id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '8px 14px', 
                  background: 'rgba(0, 85, 255, 0.03)',
                  border: '1px solid rgba(0, 85, 255, 0.1)',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>#{index + 1}</span>
                {getSiteImage(site) ? (
                  <img 
                    src={getSiteImage(site)} 
                    alt="" 
                    style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Star size={10} style={{ color: 'var(--primary)' }} />
                  </div>
                )}
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{site.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection Grid Directory */}
      <div className="glass-card" style={{ padding: '24px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Demos Showcase Catalog</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Choose exactly 6 templates by checking the boxes on rows below</p>
          </div>
          
          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              placeholder="Search catalog by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                background: '#ffffff',
                color: 'var(--text-main)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {filteredSites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No templates match your search filter</p>
          </div>
        ) : (
          <div className="datagrid-container">
            <table className="datagrid-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Featured</th>
                  <th style={{ width: '100px' }}>Preview</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.map((site) => {
                  const isSelected = selectedIds.includes(site._id);
                  const imgUrl = getSiteImage(site);

                  return (
                    <tr 
                      key={site._id} 
                      onClick={() => handleToggleSelect(site._id)}
                      style={{ cursor: 'pointer' }}
                      className="datagrid-row"
                    >
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <CustomCheckbox checked={isSelected} />
                        </div>
                      </td>
                      <td>
                        <div className="demo-thumbnail-wrapper" style={{ width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                          {imgUrl ? (
                            <img src={imgUrl} alt={site.title} className="demo-thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 85, 255, 0.05)', color: 'var(--primary)' }}>
                              <Star size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{site.title}</strong>
                      </td>
                      <td>
                        {site.category?.name && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            color: 'var(--primary)', 
                            background: 'rgba(0, 85, 255, 0.08)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                          }}>
                            {site.category.name}
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: 'var(--text-muted)',
                          display: 'block',
                          maxWidth: '450px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }} title={site.description}>
                          {site.description || 'No description added yet.'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. CATEGORY EXPLORER TAB
const ExploreTab = () => {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [sites, setSites] = useState([]);
  const [originalSites, setOriginalSites] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const catRes = await categoryService.getAll();
      if (catRes.success) {
        setAllCategories(catRes.data);
        const mainCats = catRes.data.filter(cat => !cat.parentCategory);
        setCategories(mainCats);
        if (mainCats.length > 0) {
          setActiveCategoryId(mainCats[0]._id);
        }
      }

      const sitesRes = await demoSiteService.getAll({ limit: 1000 });
      if (sitesRes.success) {
        const normalized = sitesRes.data.map(site => ({
          ...site,
          showInExplorer: site.showInExplorer !== false
        }));
        setSites(normalized);
        setOriginalSites(JSON.parse(JSON.stringify(normalized)));
      }
    } catch (err) {
      console.error('Fetch Explore categories data error:', err);
      setError('Failed to fetch categories or demo sites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleExplore = (siteId) => {
    setSites(prev => prev.map(site => {
      if (site._id === siteId) {
        return { ...site, showInExplorer: !site.showInExplorer };
      }
      return site;
    }));
    setSuccess(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updates = [];
      sites.forEach(site => {
        const original = originalSites.find(o => o._id === site._id);
        if (original && original.showInExplorer !== site.showInExplorer) {
          const formData = new FormData();
          formData.append('showInExplorer', site.showInExplorer);
          updates.push(demoSiteService.update(site._id, formData));
        }
      });

      if (updates.length > 0) {
        await Promise.all(updates);
        setSuccess('Category Explorer selections saved successfully!');
        setOriginalSites(JSON.parse(JSON.stringify(sites)));
      } else {
        setSuccess('No changes to save.');
      }
    } catch (err) {
      console.error('Update Explore Error:', err);
      setError(err.response?.data?.message || 'Failed to save category explorer settings.');
    } finally {
      setSaving(false);
    }
  };

  const activeCategory = categories.find(cat => cat._id === activeCategoryId);

  const activeCategorySites = sites.filter(site => {
    if (!site.category) return false;
    const siteCatId = site.category._id 
      ? site.category._id.toString() 
      : site.category.toString();

    if (siteCatId === activeCategoryId) return true;

    const siteCat = allCategories.find(c => c._id === siteCatId);
    if (siteCat && siteCat.parentCategory) {
      const parentId = siteCat.parentCategory._id 
        ? siteCat.parentCategory._id.toString() 
        : siteCat.parentCategory.toString();
      return parentId === activeCategoryId;
    }
    return false;
  });

  const filteredSites = activeCategorySites.filter(site => 
    site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (site.description && site.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSiteImage = (site) => {
    if (site.images && site.images.length > 0) {
      const img = site.images[0];
      return img.startsWith('http') ? img : `${API_BASE}/${img}`;
    }
    return null;
  };

  const modifiedCount = sites.filter(site => {
    const original = originalSites.find(o => o._id === site._id);
    return original && original.showInExplorer !== site.showInExplorer;
  }).length;

  if (loading) {
    return (
      <div className="dashboard-loading-spinner" style={{ padding: '60px 0' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px auto' }} />
        <p>Loading category data...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {error && (
        <div className="error-alert" style={{ 
          color: '#ff4d4d', 
          background: 'rgba(255, 77, 77, 0.08)', 
          border: '1px solid rgba(255, 77, 77, 0.18)', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="success-alert" style={{ 
          color: '#22d3a0', 
          background: 'rgba(34, 211, 160, 0.08)', 
          border: '1px solid rgba(34, 211, 160, 0.18)', 
          padding: '12px 16px', 
          borderRadius: '8px', 
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Quick Selection Status Bar */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '10px', 
            background: modifiedCount > 0 ? 'rgba(0, 85, 255, 0.08)' : 'rgba(255,255,255,0.03)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: modifiedCount > 0 ? 'var(--primary)' : 'var(--text-muted)'
          }}>
            <FolderOpen size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>Unsaved Changes: <span style={{ color: modifiedCount > 0 ? 'var(--primary)' : 'inherit' }}>{modifiedCount}</span></h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {modifiedCount === 0 
                ? 'No modifications made. Select category and toggle checkboxes to configure explorer.'
                : 'You have unsaved changes. Click save changes to apply visibility configurations.'
              }
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Configuration...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Explorer Settings</span>
            </>
          )}
        </button>
      </div>

      {/* Category Tabs Selection */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '5px 0' }}>
        {categories.map(cat => (
          <button
            key={cat._id}
            onClick={() => {
              setActiveCategoryId(cat._id);
              setSuccess(null);
            }}
            className={`btn ${activeCategoryId === cat._id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '8px 18px',
              fontSize: '0.85rem',
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Grid display area */}
      <div className="glass-card" style={{ padding: '24px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Curated Demos for {activeCategory?.name}</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Check the boxes on template rows to show or hide them from Category Explorer</p>
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              placeholder="Search category list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                background: '#ffffff',
                color: 'var(--text-main)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {filteredSites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>No templates registered under this category yet</p>
          </div>
        ) : (
          <div className="datagrid-container">
            <table className="datagrid-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Visible</th>
                  <th style={{ width: '100px' }}>Preview</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredSites.map((site) => {
                  const isSelected = site.showInExplorer;
                  const imgUrl = getSiteImage(site);

                  return (
                    <tr 
                      key={site._id} 
                      onClick={() => handleToggleExplore(site._id)}
                      style={{ cursor: 'pointer', opacity: isSelected ? 1 : 0.6 }}
                      className="datagrid-row"
                    >
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <CustomCheckbox checked={isSelected} />
                        </div>
                      </td>
                      <td>
                        <div className="demo-thumbnail-wrapper" style={{ width: '60px', height: '40px', borderRadius: '4px', overflow: 'hidden' }}>
                          {imgUrl ? (
                            <img src={imgUrl} alt={site.title} className="demo-thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 85, 255, 0.05)', color: 'var(--primary)' }}>
                              <FolderOpen size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{site.title}</strong>
                      </td>
                      <td>
                        {site.category?.name && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            color: 'var(--primary)', 
                            background: 'rgba(0, 85, 255, 0.08)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                          }}>
                            {site.category.name}
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: 'var(--text-muted)',
                          display: 'block',
                          maxWidth: '450px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }} title={site.description}>
                          {site.description || 'No description added yet.'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteCms;
