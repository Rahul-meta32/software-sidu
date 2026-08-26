import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { demoSiteService, serverCategoryService, API_BASE_URL } from '../api/demoSiteService';
import { Plus, Search, ChevronLeft, ChevronRight, Loader2, Globe, ExternalLink, Edit2, Trash2 } from 'lucide-react';

const AllClientSites = () => {
  const navigate = useNavigate();
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

  // Load client sites catalog with a limit of 10 items per page
  const fetchDemoSites = async () => {
    setLoading(true);
    try {
      const data = await demoSiteService.getAll({
        page,
        limit: 10,
        search,
        serverCategory: selectedServer,
        isActive: selectedStatus,
        isClientDemo: true, // Fetch client sites
        categoryGroup: selectedCategoryGroup,
      });

      if (data.success) {
        setDemoSites(data.data);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error('Fetch Client Sites Error:', err);
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

  // Navigate to Edit Client Demo/Site Page
  const handleEditClick = (site) => {
    navigate(`/edit-client-demo/${site._id}`);
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
    if (window.confirm('Are you sure you want to delete this client site and clean its media files from the disk?')) {
      try {
        const res = await demoSiteService.delete(id);
        if (res.success) {
          if (demoSites.length === 1 && page > 1) {
            setPage(prev => prev - 1);
          } else {
            fetchDemoSites();
          }
        }
      } catch (err) {
        console.error('Delete Site Error:', err);
        alert(err.response?.data?.message || 'Failed to delete client site');
      }
    }
  };

  return (
    <div className="dashboard-page-wrapper">
      <div className="page-header-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div className="page-title-section">
          <h2>All Client Sites</h2>
          <p>Browse full interactive presentation records of registered client-specific sites</p>
        </div>
        <button
          onClick={() => navigate('/add-client-demo')}
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
          <Plus size={16} />
          <span>Add Client Site</span>
        </button>
      </div>

      {/* Control Area: Search & Filters */}
      <div className="dashboard-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <form onSubmit={handleSearchSubmit} className="search-form-wrapper" style={{ margin: 0 }}>
          <div className="search-input-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search client sites by title..."
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

      <div className="datagrid-section-wrapper glass-card" style={{ padding: '30px', marginTop: '20px' }}>
        {loading ? (
          <div className="dashboard-loading-spinner" style={{ padding: '60px 20px' }}>
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p>Fetching client sites...</p>
          </div>
        ) : demoSites.length === 0 ? (
          <div className="empty-state glass-card" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
            <Globe size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h2>No Client Sites Found</h2>
            <p style={{ color: 'var(--text-muted)' }}>Get started by adding a client-specific site to the portal.</p>
          </div>
        ) : (
          <div className="datagrid-container">
            <table className="datagrid-table">
              <thead>
                <tr>
                  <th>Client Website Details</th>
                  <th>Access Links</th>
                  <th>Date Added</th>
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
                  return (
                    <tr key={site._id} className="datagrid-row">
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
                            <strong style={{ fontSize: '0.95rem' }}>{site.title}</strong>
                            <span className="row-desc-preview" title={site.description} style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {site.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                          {(() => {
                            const liveLink = site.liveDemoLink || (site.frontendRoleCredentials && site.frontendRoleCredentials.find(r => r.liveDemoLink && r.liveDemoLink.trim())?.liveDemoLink) || site.adminLink || site.scriptLink || '';
                            return liveLink ? (
                              <a 
                                href={liveLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="datagrid-link-pill"
                              >
                                <span>Live Site</span>
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No URL</span>
                            );
                          })()}
                        </div>
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
                            title={site.isActive ? 'Status: ON (Visible to Clients)' : 'Status: OFF (Hidden)'}
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
                            color: site.isActive ? 'var(--primary)' : 'var(--text-muted)' 
                          }}>
                            {site.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => handleEditClick(site)}
                            className="action-icon-btn edit"
                            title="Edit Details"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(site._id)}
                            className="action-icon-btn delete"
                            title="Delete Site"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && !loading && (
          <div className="pagination-wrapper" style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              className="pagination-btn"
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>
            <div className="pagination-info" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total {totalCount} items)
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
      </div>
    </div>
  );
};

export default AllClientSites;
