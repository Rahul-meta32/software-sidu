import React, { useState, useEffect } from 'react';
import { scriptSiteService } from '../api/demoSiteService';
import { Loader2, Plus, Globe, ExternalLink, Trash2, Edit2 } from 'lucide-react';

const ScriptSites = () => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Fetch script sites
  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await scriptSiteService.getAll();
      if (res.success) {
        setSites(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch script sites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !link.trim()) {
      setErrorMsg('Please enter both name and link fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update mode
        const res = await scriptSiteService.update(editingId, {
          name: name.trim(),
          link: link.trim(),
        });
        if (res.success) {
          setName('');
          setLink('');
          setEditingId(null);
          fetchSites();
        } else {
          setErrorMsg(res.message || 'Failed to update script site.');
        }
      } else {
        // Create mode
        const res = await scriptSiteService.create({
          name: name.trim(),
          link: link.trim(),
        });
        if (res.success) {
          setName('');
          setLink('');
          fetchSites();
        } else {
          setErrorMsg(res.message || 'Failed to add script site.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  // Populate form for Edit
  const handleEditInit = (site) => {
    setName(site.name);
    setLink(site.link);
    setEditingId(site._id);
    setErrorMsg('');
  };

  // Cancel Edit mode
  const handleCancelEdit = () => {
    setName('');
    setLink('');
    setEditingId(null);
    setErrorMsg('');
  };

  // Delete site Handler
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this script site entry?')) {
      try {
        const res = await scriptSiteService.delete(id);
        if (res.success) {
          fetchSites();
        }
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to delete script site.');
      }
    }
  };

  return (
    <div className="dashboard-page-wrapper">
      {/* Page Header */}
      <div className="page-header-wrapper">
        <div className="page-title-section">
          <h2>Script Sites</h2>
          <p>Register and manage external web portals with script injection integrations</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: 700 }}>
          {editingId ? 'Edit Script Details' : 'Add New Script'}
        </h3>
        {errorMsg && <div className="form-error" style={{ marginBottom: '16px' }}>{errorMsg}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <label htmlFor="script-site-name" style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Site Name *</label>
            <input
              type="text"
              id="script-site-name"
              placeholder="E.g., Client Portal Beta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ flex: '1.5', minWidth: '300px' }}>
            <label htmlFor="script-site-link" style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Site URL / Link *</label>
            <input
              type="url"
              id="script-site-link"
              placeholder="https://example.com/site"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: '8px',
                height: '46px',
                cursor: 'pointer',
                minWidth: '140px',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Plus size={16} />
                  <span>{editingId ? 'Update Script' : 'Add Script'}</span>
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  height: '46px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-main)'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Datagrid List Section */}
      <div className="datagrid-section-wrapper glass-card" style={{ padding: '30px' }}>
        {loading ? (
          <div className="dashboard-loading-spinner" style={{ padding: '60px 20px' }}>
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p>Fetching script sites...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="empty-state glass-card" style={{ boxShadow: 'none', border: 'none', background: 'transparent' }}>
            <Globe size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h2>No Script Sites Registered</h2>
            <p style={{ color: 'var(--text-muted)' }}>Use the form above to add your first external script site portal.</p>
          </div>
        ) : (
          <div className="datagrid-container">
            <table className="datagrid-table">
              <thead>
                <tr>
                  <th>Script Site Name</th>
                  <th>Target Link</th>
                  <th>Date Added</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site._id} className="datagrid-row">
                    <td>
                      <div className="row-title-container" style={{ paddingLeft: '8px' }}>
                        <div className="demo-thumbnail-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 85, 255, 0.05)', color: 'var(--primary)', borderRadius: '6px' }}>
                          <Globe size={16} />
                        </div>
                        <strong style={{ fontSize: '0.95rem', marginLeft: '12px' }}>{site.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <a
                          href={site.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="datagrid-link-pill"
                          title={site.link}
                        >
                          <span>Open Link</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                    <td>
                      {site.createdAt ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {new Date(site.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                            {new Date(site.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingRight: '8px' }}>
                        <button
                          onClick={() => handleEditInit(site)}
                          className="action-icon-btn edit"
                          title="Edit Script"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(site._id)}
                          className="action-icon-btn delete"
                          title="Delete Script Site"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptSites;
