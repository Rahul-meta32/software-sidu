import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, API_BASE_URL } from '../api/demoSiteService';
import { Camera, Mail, Key, Loader2, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Avatar states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [serverAvatarUrl, setServerAvatarUrl] = useState('');

  // UI status
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch current admin profile info
  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authService.getProfile();
      if (res.success && res.data) {
        setEmail(res.data.email || '');
        
        if (res.data.profileImage) {
          const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
          const fullUrl = res.data.profileImage.startsWith('http') 
            ? res.data.profileImage 
            : `${serverUrl}/${res.data.profileImage}`;
          setServerAvatarUrl(fullUrl);
          setAvatarPreview(fullUrl);
          
          // Save avatar globally to update UI widgets
          localStorage.setItem('adminAvatar', fullUrl);
        } else {
          localStorage.removeItem('adminAvatar');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load profile. Please try reloading.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Cleanup local Object URL
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Handle avatar select
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Only image files are allowed for avatar!');
      return;
    }

    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Open file selector
  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('email', email.trim());
      
      if (password.trim() !== '') {
        formData.append('password', password);
      }

      if (avatarFile) {
        formData.append('profileImage', avatarFile);
      }

      const res = await authService.updateProfile(formData);
      if (res.success) {
        setSuccessMsg('Profile settings updated successfully!');
        setPassword('');
        setConfirmPassword('');
        setAvatarFile(null);
        
        // Re-read profile parameters to update layouts globally
        if (res.data.email) {
          localStorage.setItem('adminEmail', res.data.email);
        }
        
        if (res.data.profileImage) {
          const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
          const fullUrl = res.data.profileImage.startsWith('http') 
            ? res.data.profileImage 
            : `${serverUrl}/${res.data.profileImage}`;
          setServerAvatarUrl(fullUrl);
          setAvatarPreview(fullUrl);
          localStorage.setItem('adminAvatar', fullUrl);
        }

        // Trigger custom storage event to alert Layout/Header widgets to reload avatars
        window.dispatchEvent(new Event('storage'));
      } else {
        setErrorMsg(res.message || 'Update failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error occurred while saving profile settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading-spinner" style={{ minHeight: '60vh' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p>Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      {/* Page Header */}
      <div className="page-header-wrapper">
        <div className="page-title-section">
          <h2>Profile Settings</h2>
          <p>Update administrator credentials, security credentials, and avatar details</p>
        </div>
        <button className="btn btn-secondary icon-btn" onClick={() => navigate('/')} disabled={submitting}>
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>
      </div>

      {errorMsg && (
        <div className="form-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="form-success-toast" style={{
          background: 'rgba(0, 102, 255, 0.15)',
          border: '1px solid rgba(0, 102, 255, 0.35)',
          color: '#99c2ff',
          padding: '14px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="glass-card">
        <form onSubmit={handleSubmit} className="site-form">
          
          {/* Circular Avatar Section */}
          <div className="profile-avatar-section" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '32px',
            gap: '12px'
          }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Profile Avatar
            </label>
            <div 
              className="profile-avatar-circle-wrapper"
              onClick={triggerFileSelect}
              style={{
                position: 'relative',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: '2px solid var(--border-color)',
                cursor: 'pointer',
                overflow: 'hidden',
                background: 'rgba(15, 23, 42, 0.5)',
                transition: 'var(--transition)',
                boxShadow: '0 0 15px rgba(0,0,0,0.2)'
              }}
            >
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Admin avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  background: 'rgba(0, 102, 255, 0.05)'
                }}>
                  {email ? email.charAt(0).toUpperCase() : 'A'}
                </div>
              )}

              {/* Hover overlay */}
              <div className="avatar-hover-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(2, 6, 23, 0.75)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'var(--transition)',
                gap: '4px',
                color: 'var(--primary)'
              }}>
                <Camera size={20} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>CHANGE</span>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={submitting}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click avatar circle to upload image file
            </span>
          </div>

          {/* Email Settings */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input
                type="email"
                id="email"
                placeholder="admin@smartsoft.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div style={{
            margin: '24px 0 14px 0',
            fontSize: '0.9rem',
            color: 'var(--primary)',
            fontWeight: 700,
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '8px'
          }}>
            Change Password (Optional)
          </div>

          {/* New Password Settings */}
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <div style={{ position: 'relative' }}>
              <Key style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input
                type="password"
                id="password"
                placeholder="Leave blank to keep current"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          {/* Confirm Password Settings */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Key style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input
                type="password"
                id="confirmPassword"
                placeholder="Leave blank to keep current"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          {/* Save Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Updating...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
