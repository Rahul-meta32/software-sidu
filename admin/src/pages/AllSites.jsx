import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { demoSiteService, serverCategoryService, API_BASE_URL } from '../api/demoSiteService';
import { Plus, Search, ChevronLeft, ChevronRight, Loader2, Database, Globe, ExternalLink, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { db } from '../api/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

const AllSites = () => {
  const navigate = useNavigate();
  const { pendingComplaintSiteIds = [], pendingComplaints = [] } = useOutletContext() || {};
  const SERVER_BASE = API_BASE_URL.replace(/\/api\/?$/, '');

  // Sites list & pagination state
  const [demoSites, setDemoSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [togglingId, setTogglingId] = useState(null);
  const [selectedServer, setSelectedServer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState('');
  const [serverCategories, setServerCategories] = useState([]);

  // Load demo sites catalog with a limit of 10 items per page (cleaner for table format)
  const fetchDemoSites = async () => {
    setLoading(true);
    try {
      const data = await demoSiteService.getAll({
        page,
        limit: 10,
        search,
        serverCategory: selectedServer,
        isActive: selectedStatus,
        isClientDemo: false,
        categoryGroup: selectedCategoryGroup,
      });

      if (data.success) {
        setDemoSites(data.data);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error('Fetch Demo Sites Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoSites();
  }, [page, search, selectedServer, selectedStatus, selectedCategoryGroup]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await serverCategoryService.getAll();
        if (res.success) {
          setServerCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch server categories:', err);
      }
    };
    fetchServers();
  }, []);

  // Apply search query
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchVal.trim());
  };

  // Clear search filter
  const handleClearSearch = () => {
    setSearchVal('');
    setSearch('');
    setPage(1);
  };

  // Navigate to Edit Site Page
  const handleEditClick = (site) => {
    navigate(`/edit/${site._id}`);
  };

  // Status toggle handler
  const handleStatusToggle = async (siteId, currentActive) => {
    if (togglingId) return;
    setTogglingId(siteId);
    try {
      const nextActive = !currentActive;
      const formData = new FormData();
      formData.append('isActive', nextActive);
      
      const res = await demoSiteService.update(siteId, formData);
      if (res.success) {
        fetchDemoSites();
      }
    } catch (err) {
      console.error('Failed to toggle active status:', err);
      alert('Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete site handler
  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this website presentation and clean its media files from the disk?')) {
      try {
        const res = await demoSiteService.delete(id);
        if (res.success) {
          // If deleted last element on current page, shift page back if possible
          if (demoSites.length === 1 && page > 1) {
            setPage(prev => prev - 1);
          } else {
            fetchDemoSites();
          }
        }
      } catch (err) {
        console.error('Delete Site Error:', err);
        alert(err.response?.data?.message || 'Failed to delete demo site');
      }
    }
  };

  return (
    <div className="dashboard-page-wrapper">
      {/* Page Header section */}
      <div className="page-header-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div className="page-title-section">
          <h2>All Showcase Sites</h2>
          <p>Browse full interactive presentation records of registered demo sites</p>
        </div>
        <button
          onClick={() => navigate('/add')}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Plus size={18} />
          <span>Add Site</span>
        </button>
      </div>

      {/* Control Area: Search & Filters */}
      <div className="dashboard-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <form onSubmit={handleSearchSubmit} className="search-form-wrapper" style={{ margin: 0 }}>
          <div className="search-input-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search showcase sites by title..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            {search && (
              <button type="button" className="clear-search-btn" onClick={handleClearSearch}>
                Clear
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {/* Server Filter */}
          <select
            value={selectedServer}
            onChange={(e) => {
              setSelectedServer(e.target.value);
              setPage(1);
            }}
            style={{
              height: '32px',
              padding: '0 8px',
              borderRadius: '20px',
              border: '1.5px solid transparent',
              background: 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, linear-gradient(135deg, #22d3a0 0%, #0055ff 100%) border-box',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              minWidth: '95px',
              maxWidth: '120px',
              boxSizing: 'border-box',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          >
            <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Servers</option>
            {serverCategories.map((server) => (
              <option key={server._id} value={server.name} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>{server.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            style={{
              height: '32px',
              padding: '0 8px',
              borderRadius: '20px',
              border: '1.5px solid transparent',
              background: 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, linear-gradient(135deg, #22d3a0 0%, #0055ff 100%) border-box',
              color: 'var(--text-main)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              minWidth: '90px',
              maxWidth: '110px',
              boxSizing: 'border-box',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          >
            <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Status</option>
            <option value="true" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Active</option>
            <option value="false" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Inactive</option>
          </select>
        </div>
      </div>

      {/* Category Group Filters */}
      <div className="category-group-filters" style={{ display: 'flex', gap: '10px', marginTop: '-15px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            setSelectedCategoryGroup(prev => prev === 'game' ? '' : 'game');
            setPage(1);
          }}
          style={{
            height: '32px',
            padding: '0 16px',
            borderRadius: '20px',
            border: '1.5px solid transparent',
            background: selectedCategoryGroup === 'game'
              ? 'linear-gradient(135deg, #22d3a0 0%, #0055ff 100%)'
              : 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, linear-gradient(135deg, #22d3a0 0%, #0055ff 100%) border-box',
            color: selectedCategoryGroup === 'game' ? '#ffffff' : 'var(--text-main)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Game Websites</span>
        </button>
        <button
          onClick={() => {
            setSelectedCategoryGroup(prev => prev === 'software' ? '' : 'software');
            setPage(1);
          }}
          style={{
            height: '32px',
            padding: '0 16px',
            borderRadius: '20px',
            border: '1.5px solid transparent',
            background: selectedCategoryGroup === 'software'
              ? 'linear-gradient(135deg, #22d3a0 0%, #0055ff 100%)'
              : 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, linear-gradient(135deg, #22d3a0 0%, #0055ff 100%) border-box',
            color: selectedCategoryGroup === 'software' ? '#ffffff' : 'var(--text-main)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>Software Services</span>
        </button>
      </div>

      {/* Content display */}
      {loading ? (
        <div className="dashboard-loading-spinner" style={{ padding: '60px 20px' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p>Retrieving database records...</p>
        </div>
      ) : demoSites.length === 0 ? (
        <div className="empty-state glass-card">
          <Database className="empty-state-icon" size={48} />
          <h2>No Showcase Registered</h2>
          <p>
            {search 
              ? `No catalog matches found for search query "${search}".`
              : 'Add your first demo site presentation to get started.'}
          </p>
          {search && (
            <button className="btn btn-secondary" onClick={handleClearSearch}>
              Clear Filter
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Datagrid Table Section */}
          <div className="datagrid-section-wrapper glass-card" style={{ padding: '30px', marginTop: '20px' }}>
            <div className="datagrid-container">
              <table className="datagrid-table">
                <thead>
                  <tr>
                    <th>Demo Site Details</th>
                    <th>Server</th>
                    <th>Developer</th>
                    <th>Access Links</th>
                    <th>Script</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demoSites.map((site) => {
                    const hasImages = site.images && site.images.length > 0;
                    const firstImage = hasImages
                      ? (site.images[0].startsWith('http') ? site.images[0] : `${SERVER_BASE}/${site.images[0]}`)
                      : null;
                    const hasPendingFeedback = pendingComplaintSiteIds.includes(site._id);
                    return (
                      <tr key={site._id} className={`datagrid-row ${hasPendingFeedback ? 'feedback-pending' : ''}`}>
                        <td className="row-title-cell">
                          <div className="row-title-container">
                            <div className="demo-thumbnail-wrapper">
                              {firstImage ? (
                                <img src={firstImage} alt={site.title} className="demo-thumbnail" />
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 85, 255, 0.05)', color: 'var(--primary)' }}>
                                  <Globe size={16} />
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {hasPendingFeedback && (
                                  <AlertCircle 
                                    size={18} 
                                    style={{ 
                                      color: '#ef4444', 
                                      fill: 'rgba(239, 68, 68, 0.15)',
                                      filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))', 
                                      animation: 'pulse-badge 1.5s infinite alternate', 
                                      flexShrink: 0 
                                    }} 
                                    title="Pending Feedback Received!" 
                                  />
                                )}
                                <strong style={{ fontSize: '0.95rem' }}>{site.title}</strong>
                              </div>
                                <span className="row-desc-preview" title={site.description} style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  {site.description}
                                </span>
                                 {(() => {
                                  const matchingComplaints = pendingComplaints.filter(c => c.siteId === site._id);
                                  if (matchingComplaints.length === 0) return null;
                                  return (
                                    <div style={{ 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      gap: '5px', 
                                      marginTop: '6px', 
                                      background: 'rgba(239, 68, 68, 0.04)', 
                                      border: '1px dashed rgba(239, 68, 68, 0.2)', 
                                      padding: '6px 10px', 
                                      borderRadius: '6px',
                                      maxWidth: '300px'
                                    }}>
                                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Feedback:</span>
                                      {matchingComplaints.map((c, i) => (
                                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                                          <span style={{ fontSize: '0.76rem', color: '#ff4d4d', fontWeight: 500, wordBreak: 'break-word', flex: 1 }}>
                                            {matchingComplaints.length > 1 ? `${i + 1}. ` : ''}{c.message}
                                          </span>
                                          <button 
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              if (window.confirm('Delete this feedback permanently?')) {
                                                try {
                                                  await deleteDoc(doc(db, 'complaints', c.id));
                                                  alert('Feedback deleted successfully!');
                                                } catch (err) {
                                                  console.error(err);
                                                  alert('Failed to delete feedback');
                                                }
                                              }
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                            title="Delete Feedback Permanently"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                        </td>
                        <td>
                          <span style={{ color: site.serverCategory ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 600 }}>
                            {site.serverCategory || 'None'}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: site.developer ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 600 }}>
                            {site.developer || 'SmartSoft'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                            {(() => {
                              const frontLink = site.liveDemoLink || (site.frontendRoleCredentials && site.frontendRoleCredentials.find(r => r.liveDemoLink && r.liveDemoLink.trim())?.liveDemoLink) || site.scriptLink || '';
                              return frontLink ? (
                                <a 
                                  href={frontLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="datagrid-link-pill"
                                >
                                  <span>Frontend</span>
                                  <ExternalLink size={12} />
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No Frontend URL</span>
                              );
                            })()}
                            {site.adminLink ? (
                              <a 
                                href={site.adminLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="datagrid-link-pill"
                              >
                                <span>Admin</span>
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No Admin URL</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {site.scriptLink ? (
                            <a 
                              href={site.scriptLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="datagrid-link-pill"
                            >
                              <span>Script</span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>None</span>
                          )}
                        </td>
                        <td>
                          {site.date ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {new Date(site.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                                {new Date(site.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label 
                              className="admin-toggle-switch" 
                              title={site.isActive ? 'Status: ON (Visible to Clients)' : 'Status: OFF (Hidden / Feedback only)'}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={site.isActive}
                                onChange={() => handleStatusToggle(site._id, site.isActive)}
                                disabled={togglingId === site._id}
                              />
                              <span className="slider round"></span>
                            </label>
                            <span style={{ 
                              fontSize: '0.85rem', 
                              fontWeight: 700, 
                              color: site.isActive ? '#22d3a0' : '#f59e0b'
                            }}>
                              {site.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="row-actions">
                            <button
                              className="icon-btn edit-action-btn"
                              onClick={() => handleEditClick(site)}
                              title="Edit details"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="icon-btn delete-action-btn"
                              onClick={() => handleDeleteClick(site._id)}
                              title="Delete demo site"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="pagination-wrapper" style={{ marginTop: '20px' }}>
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <div className="pagination-info">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} items total)
              </div>

              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllSites;
