import React, { useState, useEffect } from 'react';
import { authService, categoryService, serverCategoryService, API_BASE_URL } from '../api/demoSiteService';
import { db } from '../api/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { 
  Plus, Users, Loader2, UserPlus, ShieldAlert, Edit2, Trash2, X, 
  Layers, Tag, Server, Settings as SettingsIcon, Grid, Key, Eye, EyeOff
} from 'lucide-react';

const API_BASE = API_BASE_URL.replace(/\/api\/?$/, '');

const Settings = () => {
  const adminRole = localStorage.getItem('adminRole') || 'agent';
  const [activeTab, setActiveTab] = useState(adminRole === 'superadmin' ? 'user' : 'main-category');

  return (
    <div className="dashboard-page-wrapper">
      {/* Page Header section */}
      <div className="page-header-wrapper">
        <div className="page-title-section">
          <h2>Console Settings</h2>
          <p>Configure user roles, developer accounts, main and subcategory lists, and server directories</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '2px',
        marginBottom: '25px',
        marginTop: '15px',
        flexWrap: 'wrap'
      }}>
        {adminRole === 'superadmin' && (
          <>
            <button
              onClick={() => setActiveTab('user')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'user' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                color: activeTab === 'user' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <UserPlus size={16} />
              <span>Create User</span>
            </button>

            <button
              onClick={() => setActiveTab('developer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'developer' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                color: activeTab === 'developer' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Users size={16} />
              <span>Create Developer</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('main-category')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'main-category' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'main-category' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Grid size={16} />
          <span>Main Category</span>
        </button>

        <button
          onClick={() => setActiveTab('sub-category')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'sub-category' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
            color: activeTab === 'sub-category' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Tag size={16} />
          <span>Sub Category</span>
        </button>

        {adminRole === 'superadmin' ? (
          <button
            onClick={() => setActiveTab('server-category')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'server-category' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeTab === 'server-category' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Server size={16} />
            <span>Server</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('server-credentials')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'server-credentials' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeTab === 'server-credentials' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Key size={16} />
            <span>Server Credentials</span>
          </button>
        )}
      </div>

      {/* Dynamic Tab Views */}
      <div>
        {activeTab === 'user' && adminRole === 'superadmin' && <UserTab />}
        {activeTab === 'developer' && adminRole === 'superadmin' && <DeveloperTab />}
        {activeTab === 'main-category' && <MainCategoryTab />}
        {activeTab === 'sub-category' && <SubCategoryTab />}
        {activeTab === 'server-category' && adminRole === 'superadmin' && <ServerCategoryTab />}
        {activeTab === 'server-credentials' && adminRole !== 'superadmin' && <ServerCredentialsTab />}
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS FOR EACH TAB ---

// 1. CREATE USER TAB
const UserTab = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authService.getUsersAndAgents();
      if (res.success) {
        const clientUsers = res.data.filter(u => u.role === 'user');
        setUsers(clientUsers);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStartEdit = (u) => {
    setEditingId(u._id);
    setUsername(u.username);
    setPassword(u.rawPassword || '');
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setUsername('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the user account "${name}"?`)) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const res = await authService.deleteUserOrAgent(id);
      if (res.success) {
        setSuccess(`User "${name}" deleted successfully!`);
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchUsers();
      } else {
        setError(res.message || 'Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error. Failed to delete user.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!editingId && !password.trim()) {
      setError('Password is required.');
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await authService.updateUserOrAgent(editingId, username.trim(), password);
        if (res.success) {
          setSuccess(`Client user updated successfully!`);
          handleCancelEdit();
          fetchUsers();
        } else {
          setError(res.message || 'Failed to update user.');
        }
      } else {
        const res = await authService.createUser(username.trim(), password);
        if (res.success) {
          setSuccess(`Client user "${username}" created successfully!`);
          setUsername('');
          setPassword('');
          fetchUsers();
        } else {
          setError(res.message || 'Failed to create user.');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error. Failed to process request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="glass-card" style={{ padding: '20px 24px', maxWidth: '480px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserPlus size={18} style={{ color: 'var(--primary)' }} />
          <span>{editingId ? 'Edit Client Account' : 'New Client Account'}</span>
        </h3>

        {error && (
          <div className="error-alert" style={{ marginBottom: '12px', color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="success-alert" style={{ marginBottom: '12px', color: '#22d3a0', background: 'rgba(34, 211, 160, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Username <span style={{ color: 'var(--primary)' }}>*</span></label>
            <input
              type="text"
              placeholder="e.g. client_smartsoft"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>
              Password {editingId ? <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-muted)' }}>(leave blank to keep unchanged)</span> : <span style={{ color: 'var(--primary)' }}>*</span>}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editingId}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingId ? 'Updating Account...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                  <span>{editingId ? 'Update User' : 'Create User'}</span>
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={20} style={{ color: 'var(--primary)' }} />
          <span>Showcase Client Accounts</span>
        </h3>

        {loading ? (
          <div className="dashboard-loading-spinner" style={{ padding: '40px 0', textAlign: 'center' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px auto' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading client users...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <ShieldAlert size={36} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p>No client users created yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Username</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Password</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Role</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Date Created</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '15px', fontWeight: 600, color: 'var(--text-main)' }}>{u.username}</td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{u.rawPassword || '—'}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: 'rgba(0, 85, 255, 0.08)',
                        color: 'var(--primary)'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()} at {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          onClick={() => handleStartEdit(u)}
                          style={{
                            background: 'rgba(34, 211, 160, 0.1)',
                            color: '#22d3a0',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                          title="Edit User"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.username)}
                          style={{
                            background: 'rgba(255, 77, 77, 0.1)',
                            color: '#ff4d4d',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
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

// 2. CREATE DEVELOPER TAB
const DeveloperTab = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [developers, setDevelopers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const res = await authService.getUsersAndAgents();
      if (res.success) {
        const adminDevelopers = res.data.filter(u => u.role === 'agent');
        setDevelopers(adminDevelopers);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve developer accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleStartEdit = (d) => {
    setEditingId(d._id);
    setUsername(d.username);
    setPassword(d.rawPassword || '');
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setUsername('');
    setPassword('');
    setError('');
    setSuccess('');
  };

  const handleDeleteDeveloper = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the developer account "${name}"?`)) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const res = await authService.deleteUserOrAgent(id);
      if (res.success) {
        setSuccess(`Developer "${name}" deleted successfully!`);
        if (editingId === id) {
          handleCancelEdit();
        }
        fetchDevelopers();
      } else {
        setError(res.message || 'Failed to delete developer.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error. Failed to delete developer.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!editingId && !password.trim()) {
      setError('Password is required.');
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await authService.updateUserOrAgent(editingId, username.trim(), password);
        if (res.success) {
          setSuccess(`Developer user updated successfully!`);
          handleCancelEdit();
          fetchDevelopers();
        } else {
          setError(res.message || 'Failed to update developer.');
        }
      } else {
        const res = await authService.createAgent(username.trim(), password);
        if (res.success) {
          setSuccess(`Developer user "${username}" created successfully!`);
          setUsername('');
          setPassword('');
          fetchDevelopers();
        } else {
          setError(res.message || 'Failed to create developer.');
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error. Failed to process request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="glass-card" style={{ padding: '20px 24px', maxWidth: '480px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserPlus size={18} style={{ color: 'var(--primary)' }} />
          <span>{editingId ? 'Edit Developer Account' : 'New Developer Account'}</span>
        </h3>

        {error && (
          <div className="error-alert" style={{ marginBottom: '12px', color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="success-alert" style={{ marginBottom: '12px', color: '#22d3a0', background: 'rgba(34, 211, 160, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Username <span style={{ color: 'var(--primary)' }}>*</span></label>
            <input
              type="text"
              placeholder="e.g. developer_demo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>
              Password {editingId ? <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-muted)' }}>(leave blank to keep unchanged)</span> : <span style={{ color: 'var(--primary)' }}>*</span>}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editingId}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingId ? 'Updating Account...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                  <span>{editingId ? 'Update Developer' : 'Create Developer'}</span>
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={20} style={{ color: 'var(--primary)' }} />
          <span>Active Developers</span>
        </h3>

        {loading ? (
          <div className="dashboard-loading-spinner" style={{ padding: '40px 0', textAlign: 'center' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px auto' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading developer accounts...</p>
          </div>
        ) : developers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <ShieldAlert size={36} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p>No developers created yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: '15px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Username</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Password</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Role</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Date Created</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {developers.map((d) => (
                  <tr key={d._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '15px', fontWeight: 600, color: 'var(--text-main)' }}>{d.username}</td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{d.rawPassword || '—'}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: 'rgba(139, 92, 246, 0.08)',
                        color: '#8b5cf6'
                      }}>
                        developer
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(d.createdAt).toLocaleDateString()} at {new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          onClick={() => handleStartEdit(d)}
                          style={{
                            background: 'rgba(34, 211, 160, 0.1)',
                            color: '#22d3a0',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                          title="Edit Developer"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDeveloper(d._id, d.username)}
                          style={{
                            background: 'rgba(255, 77, 77, 0.1)',
                            color: '#ff4d4d',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                          title="Delete Developer"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
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

// 3. MAIN CATEGORY TAB
const MainCategoryTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchMainCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      if (data.success) {
        const mainCats = data.data.filter(cat => !cat.parentCategory);
        setCategories(mainCats);
      }
    } catch (err) {
      console.error('Fetch Main Categories Error:', err);
      setError('Failed to fetch main categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMainCategories();
  }, []);

  const handleStartEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageFile(null);
    setImagePreview(cat.image ? (cat.image.startsWith('http') ? cat.image : `${API_BASE}/${cat.image}`) : '');
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImageFile(null);
    setImagePreview('');
    setError(null);
    setSuccess(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('parentCategory', ''); 
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (editingId && !imagePreview) {
        formData.append('imageUrl', '');
      }

      let res;
      if (editingId) {
        res = await categoryService.update(editingId, formData);
      } else {
        res = await categoryService.create(formData);
      }

      if (res.success) {
        setSuccess(editingId ? 'Main Category updated successfully.' : 'Main Category added successfully.');
        setName('');
        setDescription('');
        setImageFile(null);
        setImagePreview('');
        setEditingId(null);
        fetchMainCategories();
      }
    } catch (err) {
      console.error('Create/Update Main Category Error:', err);
      setError(err.response?.data?.message || 'Failed to save main category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" Main Category? All subcategories under it will lose their parent link.`)) {
      try {
        const data = await categoryService.delete(id);
        if (data.success) {
          fetchMainCategories();
        }
      } catch (err) {
        console.error('Delete Main Category Error:', err);
        alert(err.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="glass-card" style={{ padding: '20px 24px', maxWidth: '480px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={18} style={{ color: 'var(--primary)' }} />
          <span>{editingId ? 'Edit Main Category' : 'Add Main Category'}</span>
        </h3>

        {error && <div className="error-alert" style={{ marginBottom: '12px', color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>{error}</div>}
        {success && <div className="success-alert" style={{ marginBottom: '12px', color: '#22d3a0', background: 'rgba(34, 211, 160, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>{success}</div>}

        <form onSubmit={handleFormSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Category Name <span style={{ color: 'var(--primary)' }}>*</span></label>
            <input
              type="text"
              placeholder="e.g. Web & Software Development"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Description (Optional)</label>
            <textarea
              placeholder="Short description of this main category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', resize: 'vertical', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Category Cover Image</label>
            
            {imagePreview && (
              <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                  style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255, 77, 77, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.65rem' }}
                >
                  ✕
                </button>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
              style={{ width: '100%', fontSize: '0.85rem', color: 'var(--text-muted)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingId ? 'Updating Main Category...' : 'Adding Main Category...'}</span>
                </>
              ) : (
                <>
                  {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                  <span>{editingId ? 'Update Main Category' : 'Add Main Category'}</span>
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} style={{ color: 'var(--primary)' }} />
          <span>Active Main Categories</span>
        </h3>

        {loading ? (
          <div className="dashboard-loading-spinner" style={{ padding: '40px 0' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px auto' }} />
            <p>Loading main categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Tag size={40} style={{ opacity: 0.3, marginBottom: '15px' }} />
            <p>No main categories added yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, width: '80px' }}>Image</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Category Name</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', width: '120px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '10px 15px' }}>
                      {cat.image ? (
                        <img
                          src={cat.image.startsWith('http') ? cat.image : `${API_BASE}/${cat.image}`}
                          alt={cat.name}
                          style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: 'rgba(0, 85, 255, 0.05)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                          No Img
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '15px', fontWeight: 600, color: 'var(--text-main)' }}>{cat.name}</td>
                    <td style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cat.description || '—'}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleStartEdit(cat)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#22d3a0',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '4px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Edit Category"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff4d4d',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '4px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
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

// 4. SUB CATEGORY TAB
const SubCategoryTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Fetch Categories Error:', err);
      setError('Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!parentCategory) {
      setError('Please select a Parent Main Category.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await categoryService.create({
        name: name.trim(),
        description: description.trim(),
        parentCategory: parentCategory,
      });

      if (data.success) {
        setSuccess('Subcategory added successfully.');
        setName('');
        setDescription('');
        setParentCategory('');
        fetchCategories();
      }
    } catch (err) {
      console.error('Create Subcategory Error:', err);
      setError(err.response?.data?.message || 'Failed to create subcategory.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" subcategory?`)) {
      try {
        const data = await categoryService.delete(id);
        if (data.success) {
          fetchCategories();
        }
      } catch (err) {
        console.error('Delete Category Error:', err);
        alert(err.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  const mainCategories = categories.filter(c => !c.parentCategory);
  const subcategories = categories.filter(c => c.parentCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="glass-card" style={{ padding: '20px 24px', maxWidth: '480px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={18} style={{ color: 'var(--primary)' }} />
          <span>Add Subcategory</span>
        </h3>

        {error && <div className="error-alert" style={{ marginBottom: '12px', color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>{error}</div>}
        {success && <div className="success-alert" style={{ marginBottom: '12px', color: '#22d3a0', background: 'rgba(34, 211, 160, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>{success}</div>}

        <form onSubmit={handleCreateSubcategory}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Parent Main Category <span style={{ color: 'var(--primary)' }}>*</span></label>
            <select
              value={parentCategory}
              onChange={(e) => setParentCategory(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', boxSizing: 'border-box', fontSize: '0.9rem' }}
            >
              <option value="" disabled style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Select Main Category...</option>
              {mainCategories.map((cat) => (
                <option key={cat._id} value={cat._id} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Subcategory Name <span style={{ color: 'var(--primary)' }}>*</span></label>
            <input
              type="text"
              placeholder="e.g. ERP Software Development"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Description (Optional)</label>
            <textarea
              placeholder="Short description of this subcategory..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', resize: 'vertical', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Adding Subcategory...</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Add Subcategory</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} style={{ color: 'var(--primary)' }} />
          <span>Active Subcategories</span>
        </h3>

        {loading ? (
          <div className="dashboard-loading-spinner" style={{ padding: '40px 0' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px auto' }} />
            <p>Loading subcategories...</p>
          </div>
        ) : subcategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Tag size={40} style={{ opacity: 0.3, marginBottom: '15px' }} />
            <p>No subcategories added yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Subcategory Name</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Parent Main Category</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', width: '80px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map((cat) => (
                  <tr key={cat._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '15px', fontWeight: 600, color: 'var(--text-main)' }}>{cat.name}</td>
                    <td style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                      {cat.parentCategory ? cat.parentCategory.name : '—'}
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cat.description || '—'}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ff4d4d',
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '4px',
                          transition: 'all 0.2s',
                        }}
                        title="Delete Subcategory"
                      >
                        <Trash2 size={18} />
                      </button>
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

// 5. SERVER CATEGORY TAB (SUPERADMIN ONLY)
const ServerCategoryTab = () => {
  const [categories, setCategories] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [serverType, setServerType] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [allowedDevelopers, setAllowedDevelopers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchCategoriesAndDevs = async () => {
    setLoading(true);
    try {
      const data = await serverCategoryService.getAll();
      if (data.success) {
        setCategories(data.data);
      }
      
      const devRes = await authService.getUsersAndAgents();
      if (devRes.success) {
        const devs = devRes.data.filter(u => u.role === 'agent');
        setDevelopers(devs);
      }
    } catch (err) {
      console.error('Fetch Server Categories or Devs Error:', err);
      setError('Failed to fetch configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndDevs();
  }, []);

  const handleStartEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setServerType(cat.serverType || '');
    setDescription(cat.description || '');
    setEmail(cat.email || '');
    setPassword(cat.password || '');
    const formattedExpiryDate = cat.expiryDate ? new Date(cat.expiryDate).toISOString().split('T')[0] : '';
    setExpiryDate(formattedExpiryDate);
    
    // Normalize allowedDevelopers to array of strings (Ids)
    const devIds = (cat.allowedDevelopers || []).map(dev => 
      typeof dev === 'object' && dev._id ? dev._id : dev
    );
    setAllowedDevelopers(devIds);
    
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setServerType('');
    setDescription('');
    setEmail('');
    setPassword('');
    setExpiryDate('');
    setAllowedDevelopers([]);
    setError(null);
    setSuccess(null);
  };

  const handleToggleDeveloper = (devId) => {
    setAllowedDevelopers(prev => {
      if (prev.includes(devId)) {
        return prev.filter(id => id !== devId);
      } else {
        return [...prev, devId];
      }
    });
  };

  const handleCreateOrUpdateCategory = async (e) => {
    e.preventDefault();
    if (!name.trim() || !serverType.trim() || !description.trim() || !email.trim() || !expiryDate) {
      setError('Please fill in all required fields (Name, Type, Description, Email, Expiry Date).');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      name: name.trim(),
      serverType: serverType.trim(),
      description: description.trim(),
      email: email.trim(),
      password: password.trim(),
      expiryDate: expiryDate,
      allowedDevelopers: allowedDevelopers
    };

    try {
      let res;
      if (editingId) {
        res = await serverCategoryService.update(editingId, payload);
      } else {
        res = await serverCategoryService.create(payload);
      }

      if (res.success) {
        setSuccess(editingId ? 'Server category updated successfully.' : 'Server category added successfully.');
        setName('');
        setServerType('');
        setDescription('');
        setEmail('');
        setPassword('');
        setExpiryDate('');
        setAllowedDevelopers([]);
        setEditingId(null);
        
        // Refresh listings
        const refreshData = await serverCategoryService.getAll();
        if (refreshData.success) {
          setCategories(refreshData.data);
        }
      }
    } catch (err) {
      console.error('Save Server Category Error:', err);
      setError(err.response?.data?.message || 'Failed to save server category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" server category?`)) {
      try {
        const data = await serverCategoryService.delete(id);
        if (data.success) {
          if (editingId === id) {
            handleCancelEdit();
          }
          
          const refreshData = await serverCategoryService.getAll();
          if (refreshData.success) {
            setCategories(refreshData.data);
          }
        }
      } catch (err) {
        console.error('Delete Server Category Error:', err);
        alert(err.response?.data?.message || 'Failed to delete server category.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div className="glass-card" style={{ padding: '20px 24px', maxWidth: '480px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus size={18} style={{ color: 'var(--primary)' }} />
          <span>{editingId ? 'Edit Server Category' : 'Add New Server Category'}</span>
        </h3>

        {error && <div className="error-alert" style={{ marginBottom: '12px', color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>{error}</div>}
        {success && <div className="success-alert" style={{ marginBottom: '12px', color: '#22d3a0', background: 'rgba(34, 211, 160, 0.1)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>{success}</div>}

        <form onSubmit={handleCreateOrUpdateCategory}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Server Name <span style={{ color: 'var(--primary)' }}>*</span></label>
            <input
              type="text"
              placeholder="e.g. Server US-East, Hostinger, AWS Main"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Description <span style={{ color: 'var(--primary)' }}>*</span></label>
            <input
              type="text"
              placeholder="Short description of this server environment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Server Email <span style={{ color: 'var(--primary)' }}>*</span></label>
              <input
                type="email"
                placeholder="e.g. host@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Server Password (Optional)</label>
              <input
                type="text"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Server Type <span style={{ color: 'var(--primary)' }}>*</span></label>
              <input
                type="text"
                placeholder="e.g. AWS, Hostinger, GCP"
                value={serverType}
                onChange={(e) => setServerType(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Expiry Date <span style={{ color: 'var(--primary)' }}>*</span></label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', boxSizing: 'border-box', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Allowed Developers List */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem' }}>Assign Developers Access</label>
            {developers.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No developer accounts created yet.</p>
            ) : (
              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {developers.map((dev) => {
                  const isChecked = allowedDevelopers.includes(dev._id);
                  return (
                    <label key={dev._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleToggleDeveloper(dev._id)}
                        style={{ width: '14px', height: '14px', accentColor: 'var(--primary)' }}
                      />
                      <span>{dev.username}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{editingId ? 'Saving Changes...' : 'Adding Server...'}</span>
                </>
              ) : (
                <>
                  {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                  <span>{editingId ? 'Save Changes' : 'Add Server'}</span>
                </>
              )}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Server size={20} style={{ color: 'var(--primary)' }} />
          <span>Active Server Categories</span>
        </h3>

        {loading ? (
          <div className="dashboard-loading-spinner" style={{ padding: '40px 0' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px auto' }} />
            <p>Loading server categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <Tag size={40} style={{ opacity: 0.3, marginBottom: '15px' }} />
            <p>No server categories added yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Server Name</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Password</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Expiry Date</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Access</th>
                  <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', width: '120px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '15px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat.name}</span>
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {cat.description || '—'}
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)'
                      }}>
                        {cat.serverType || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontSize: '0.9rem' }}>{cat.email || '—'}</td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontSize: '0.9rem', fontFamily: 'monospace' }}>{cat.password || '—'}</td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {cat.expiryDate ? new Date(cat.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(cat.allowedDevelopers || []).length === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No developer access</span>
                        ) : (
                          cat.allowedDevelopers.map(dev => (
                            <span key={dev._id || dev} style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(0, 85, 255, 0.08)',
                              color: 'var(--primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {dev.username || 'dev'}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleStartEdit(cat)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#22d3a0',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Edit Server"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff4d4d',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Delete Server"
                        >
                          <Trash2 size={16} />
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

// 6. SERVER CREDENTIALS TAB (AGENT/DEVELOPER ONLY)
const ServerCredentialsTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [revealedIds, setRevealedIds] = useState([]);

  const fetchAllowedServers = async () => {
    setLoading(true);
    try {
      const res = await serverCategoryService.getAll();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load allowed servers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowedServers();
  }, []);

  const handleRequestPassword = async (cat) => {
    if (!window.confirm(`Are you sure you want to request password access for Server "${cat.name}"?`)) {
      return;
    }

    setActioningId(cat._id);
    try {
      // 1. Backend REST request to register password request
      const res = await serverCategoryService.requestPassword(cat._id);
      if (res.success) {
        // 2. Write document to Firestore complaints to notify Superadmin
        const currentAgentName = localStorage.getItem('adminEmail') || 'Agent/Developer';
        await addDoc(collection(db, 'complaints'), {
          siteId: cat._id,
          siteTitle: "Server Password Request",
          message: `${currentAgentName} wants to access password for Server "${cat.name}"`,
          status: "pending",
          createdAt: new Date().toISOString(),
          type: "password_request",
          requestId: res.data._id, // Store MERN request ID for easy reference
          agentName: currentAgentName
        });

        alert('Access request submitted successfully. Superadmin has been notified.');
        fetchAllowedServers();
      }
    } catch (err) {
      console.error('Request password error:', err);
      alert(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setActioningId(null);
    }
  };

  const handleToggleReveal = (catId) => {
    setRevealedIds(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Key size={20} style={{ color: 'var(--primary)' }} />
        <span>Your Assigned Server Credentials</span>
      </h3>

      {loading ? (
        <div className="dashboard-loading-spinner" style={{ padding: '40px 0' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 10px auto' }} />
          <p>Loading assigned server category list...</p>
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <ShieldAlert size={40} style={{ opacity: 0.3, marginBottom: '15px' }} />
          <p>No server categories assigned to your developer account yet.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>Contact Superadmin to grant you access permissions.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Server Name</th>
                <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Description</th>
                <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Password</th>
                <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600 }}>Expiry Date</th>
                <th style={{ padding: '12px 15px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', width: '180px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const isApproved = cat.passwordRequestStatus === 'approved';
                const isPending = cat.passwordRequestStatus === 'pending';
                const isRevealed = revealedIds.includes(cat._id);

                return (
                  <tr key={cat._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '15px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cat.name}</span>
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {cat.description || '—'}
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)'
                      }}>
                        {cat.serverType || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {cat.email || '—'}
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                      {isApproved ? (
                        isRevealed ? cat.password : '••••••••'
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Obscured (Locked)</span>
                      )}
                    </td>
                    <td style={{ padding: '15px', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {cat.expiryDate ? new Date(cat.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      {isApproved ? (
                        <button
                          onClick={() => handleToggleReveal(cat._id)}
                          className="btn btn-secondary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRequestPassword(cat)}
                          disabled={isPending || actioningId !== null}
                          className={isPending ? "btn" : "btn btn-primary"}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            cursor: isPending ? 'not-allowed' : 'pointer',
                            opacity: isPending ? 0.6 : 1,
                            border: isPending ? '1px solid var(--border-color)' : 'none',
                            background: isPending ? 'transparent' : 'var(--primary)',
                            color: isPending ? 'var(--text-muted)' : '#ffffff'
                          }}
                        >
                          {actioningId === cat._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <span>{isPending ? 'Request Pending' : 'Request Password'}</span>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Settings;
