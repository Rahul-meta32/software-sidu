import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { demoSiteService, categoryService, serverCategoryService, API_BASE_URL } from '../api/demoSiteService';
import { Upload, X, Film, Loader2, ArrowLeft } from 'lucide-react';

const AddClientDemo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [frontendRoleCredentials, setFrontendRoleCredentials] = useState([{ role: '', username: '', password: '', apkFile: null, localFile: null, liveDemoLink: '' }]);
  const [serverCategory, setServerCategory] = useState('');
  const [serverCategories, setServerCategories] = useState([]);
  const [scriptLink, setScriptLink] = useState('');
  const [date, setDate] = useState('');
  const [isActive, setIsActive] = useState(true);


  // File uploads
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');

  // APK Upload States
  const [uploadingApkIndex, setUploadingApkIndex] = useState(null);
  const [apkUploadProgress, setApkUploadProgress] = useState(0);

  // States
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUploadRoleApk = async (index, file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.apk')) {
      setErrorMsg('Only .apk files are allowed!');
      return;
    }
    setErrorMsg('');
    setUploadingApkIndex(index);
    setApkUploadProgress(0);

    try {
      const res = await demoSiteService.uploadApk(file, (percent) => {
        setApkUploadProgress(percent);
      });

      if (res.success && res.apkUrl) {
        const newCreds = [...frontendRoleCredentials];
        newCreds[index].apkFile = res.apkUrl;
        newCreds[index].localFile = null;
        setFrontendRoleCredentials(newCreds);
      } else {
        setErrorMsg(res.message || 'APK Upload failed');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error occurred while uploading APK');
    } finally {
      setUploadingApkIndex(null);
      setApkUploadProgress(0);
    }
  };


  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getAll();
        if (res.success) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    const fetchServerCats = async () => {
      try {
        const res = await serverCategoryService.getAll();
        if (res.success) {
          setServerCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load server categories:', err);
      }
    };
    fetchCats();
    fetchServerCats();
  }, []);

  // Fetch client demo data if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchSiteData = async () => {
        setLoading(true);
        try {
          const res = await demoSiteService.getById(id);
          if (res.success && res.data) {
            setTitle(res.data.title || '');
            setDescription(res.data.description || '');
            setServerCategory(res.data.serverCategory || '');
            setScriptLink(res.data.scriptLink || '');
            setIsActive(res.data.isActive !== false);

            let catId = '';
            let parentCatId = '';
            if (res.data.category) {
              if (typeof res.data.category === 'object') {
                catId = res.data.category._id || '';
                if (res.data.category.parentCategory) {
                  parentCatId = typeof res.data.category.parentCategory === 'object'
                    ? res.data.category.parentCategory._id || ''
                    : res.data.category.parentCategory || '';
                }
              } else {
                catId = res.data.category;
              }
            }

            if (parentCatId) {
              setMainCategory(parentCatId);
              setSubcategory(catId);
            } else {
              setMainCategory(catId);
              setSubcategory('');
            }

            const roles = (res.data.frontendRoleCredentials || []).map(r => {
              const apk = r.apkFile || null;
              return {
                role: r.role || '',
                username: r.username || '',
                password: r.password || '',
                apkFile: apk,
                localFile: null,
                liveDemoLink: r.liveDemoLink || ''
              };
            });
            setFrontendRoleCredentials(roles.length > 0 ? roles : [{ role: '', username: '', password: '', apkFile: null, localFile: null, liveDemoLink: '' }]);

            if (res.data.date) {
              const formattedDate = new Date(res.data.date).toISOString().split('T')[0];
              setDate(formattedDate);
            } else {
              setDate('');
            }

            const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
            if (res.data.images && res.data.images.length > 0) {
              setImagePreviews(res.data.images.map(img => img.startsWith('http') ? img : `${serverUrl}/${img}`));
            }
            if (res.data.video) {
              setVideoPreview(res.data.video.startsWith('http') ? res.data.video : `${serverUrl}/${res.data.video}`);
            }
          } else {
            setErrorMsg('Could not find client demo details.');
          }
        } catch (err) {
          console.error(err);
          setErrorMsg(err.response?.data?.message || 'Failed to fetch client demo details.');
        } finally {
          setLoading(false);
        }
      };
      fetchSiteData();
    }
  }, [isEditMode, id]);


  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      if (videoPreview && videoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [imagePreviews, videoPreview]);

  // Handle images selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validImages = files.filter(file => file.type.startsWith('image/'));
    if (validImages.length !== files.length) {
      setErrorMsg('Some files were rejected. Only images are allowed.');
    }

    const newPreviews = validImages.map(file => URL.createObjectURL(file));
    setImageFiles(prev => [...prev, ...validImages]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  // Handle video selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Rejected! Only video files are allowed.');
      return;
    }

    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  // Remove a selected image preview
  const removeImage = (indexToRemove) => {
    const previewToRemove = imagePreviews[indexToRemove];
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    if (previewToRemove.startsWith('blob:')) {
      let rawFileIndex = 0;
      for (let i = 0; i < indexToRemove; i++) {
        if (imagePreviews[i].startsWith('blob:')) {
          rawFileIndex++;
        }
      }
      setImageFiles(prev => prev.filter((_, idx) => idx !== rawFileIndex));
      URL.revokeObjectURL(previewToRemove);
    }
  };

  // Remove selected video preview
  const removeVideo = () => {
    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview('');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      const finalCat = subcategory || mainCategory || '';
      formData.append('category', finalCat);
      formData.append('serverCategory', serverCategory);
      formData.append('scriptLink', scriptLink.trim());
      formData.append('date', date);
      formData.append('isClientDemo', 'true');
      formData.append('isActive', isActive ? 'true' : 'false');
      formData.append('showInExplorer', 'false'); // Hide from standard exploration catalog


      // Map role credentials and append files matching their indices
      const filteredRolesForUpload = frontendRoleCredentials
        .filter(c => c.role.trim() !== '' && ((c.username || '').trim() !== '' || (c.password || '').trim() !== '' || c.apkFile || c.localFile || (c.liveDemoLink || '').trim() !== ''));

      const roleCredentialsData = filteredRolesForUpload.map((c, index) => {
        if (c.localFile) {
          formData.append(`roleApk_${index}`, c.localFile);
        }
        return {
          role: c.role.trim(),
          username: (c.username || '').trim(),
          password: (c.password || '').trim(),
          apkFile: c.apkFile || null,
          liveDemoLink: (c.liveDemoLink || '').trim()
        };
      });
      formData.append('frontendRoleCredentials', JSON.stringify(roleCredentialsData));

      const fallbackLiveDemoLink = roleCredentialsData.find(r => r.liveDemoLink && r.liveDemoLink.trim())?.liveDemoLink 
        || scriptLink.trim() 
        || '';
      formData.append('liveDemoLink', fallbackLiveDemoLink);

      const remainingExistingImages = imagePreviews
        .filter(url => !url.startsWith('blob:'))
        .map(url => {
          const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
          if (url.startsWith(serverUrl + '/')) {
            return url.replace(serverUrl + '/', '');
          }
          return url;
        });
      formData.append('existingImages', JSON.stringify(remainingExistingImages));

      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      if (videoFile) {
        formData.append('video', videoFile);
      }

      let res;
      if (isEditMode) {
        res = await demoSiteService.update(id, formData);
      } else {
        res = await demoSiteService.create(formData);
      }

      if (res.success) {
        navigate('/all-client-sites', { replace: true });
      } else {
        setErrorMsg(res.message || 'Saving failed.');
      }
    } catch (err) {
      console.error(err);
      const mainMsg = err.response?.data?.message || 'Error occurred while saving.';
      const detailMsg = err.response?.data?.error ? ` (${err.response.data.error})` : '';
      setErrorMsg(mainMsg + detailMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading-spinner" style={{ minHeight: '60vh' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
        <p>Fetching client demo information...</p>
      </div>
    );
  }

  return (
    <div className="form-page-container">
      <div className="page-header-wrapper">
        <div className="page-title-section">
          <h2>{isEditMode ? 'Edit Client Demo' : 'Add New Client Demo'}</h2>
          <p>{isEditMode ? 'Update demo details, screenshots, and configuration' : 'Publish a new client demo site to the Client Demos section'}</p>
        </div>
        <button className="btn btn-secondary icon-btn" onClick={() => navigate('/all-client-sites')} disabled={submitting}>
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>
      </div>

      {errorMsg && <div className="form-error">{errorMsg}</div>}

      <div className="glass-card">
        <form onSubmit={handleSubmit} className="site-form">
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label htmlFor="mainCategory">Select Main Category</label>
              <select
                id="mainCategory"
                value={mainCategory}
                onChange={(e) => {
                  setMainCategory(e.target.value);
                  setSubcategory('');
                }}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Main Category...</option>
                {categories.filter(c => !c.parentCategory).map((cat) => (
                  <option key={cat._id} value={cat._id} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subcategory">Select Subcategory</label>
              <select
                id="subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                disabled={submitting || !mainCategory}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Subcategory...</option>
                {categories.filter(c => c.parentCategory && (c.parentCategory._id === mainCategory || c.parentCategory === mainCategory)).map((cat) => (
                  <option key={cat._id} value={cat._id} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="serverCategory">Select Server Category</label>
            <select
              id="serverCategory"
              value={serverCategory}
              onChange={(e) => setServerCategory(e.target.value)}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              <option value="">Select Server Category (None)</option>
              {serverCategories.map((cat) => (
                <option key={cat._id} value={cat.name} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="title">Website Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., MetaBlock Pharmacy Platform"
              required
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Website Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a summary outlining technology stack, features, and user capabilities..."
              rows={5}
              required
              disabled={submitting}
            />
          </div>


          <div className="form-group" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.01)', marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 600 }}> Frontend Credentials</label>
            
            {frontendRoleCredentials.map((item, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                
                {/* Inputs Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: '1', minWidth: '150px' }}>
                    <input
                      type="text"
                      placeholder="Role (e.g. Vendor, Client)"
                      value={item.role}
                      onChange={(e) => {
                        const newCreds = [...frontendRoleCredentials];
                        newCreds[index].role = e.target.value;
                        setFrontendRoleCredentials(newCreds);
                      }}
                      disabled={submitting}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div style={{ flex: '1.2', minWidth: '150px' }}>
                    <input
                      type="text"
                      placeholder="Username / Email"
                      value={item.username || ''}
                      onChange={(e) => {
                        const newCreds = [...frontendRoleCredentials];
                        newCreds[index].username = e.target.value;
                        setFrontendRoleCredentials(newCreds);
                      }}
                      disabled={submitting}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div style={{ flex: '1.2', minWidth: '150px' }}>
                    <input
                      type="text"
                      placeholder="Password"
                      value={item.password || ''}
                      onChange={(e) => {
                        const newCreds = [...frontendRoleCredentials];
                        newCreds[index].password = e.target.value;
                        setFrontendRoleCredentials(newCreds);
                      }}
                      disabled={submitting}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div style={{ flex: '1.5', minWidth: '200px' }}>
                    <input
                      type="url"
                      placeholder="Frontend URL / Demo Link (Optional)"
                      value={item.liveDemoLink || ''}
                      onChange={(e) => {
                        const newCreds = [...frontendRoleCredentials];
                        newCreds[index].liveDemoLink = e.target.value;
                        setFrontendRoleCredentials(newCreds);
                      }}
                      disabled={submitting}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFrontendRoleCredentials(frontendRoleCredentials.filter((_, i) => i !== index));
                    }}
                    disabled={submitting}
                    style={{
                      background: '#ff4d4d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Remove Role
                  </button>
                </div>

                {/* Role Specific APK Upload Row */}
                <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>
                    Android App (APK) for {item.role || 'this role'} (Optional)
                  </span>
                  
                  {uploadingApkIndex === index ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '220px' }}>
                      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${apkUploadProgress}%`, background: 'var(--primary)', transition: 'width 0.2s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, minWidth: '40px' }}>
                        {apkUploadProgress}%
                      </span>
                    </div>
                  ) : !item.apkFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label htmlFor={`role-apk-input-${index}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        <Upload size={12} style={{ color: 'var(--primary)' }} />
                        <span>Upload APK</span>
                      </label>
                      <input
                        type="file"
                        id={`role-apk-input-${index}`}
                        accept=".apk"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleUploadRoleApk(index, file);
                          }
                          e.target.value = '';
                        }}
                        disabled={submitting || uploadingApkIndex !== null}
                        style={{ display: 'none' }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        ✓ Uploaded: {item.apkFile.split('/').pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const newCreds = [...frontendRoleCredentials];
                          newCreds[index].localFile = null;
                          newCreds[index].apkFile = null;
                          setFrontendRoleCredentials(newCreds);
                        }}
                        disabled={submitting || uploadingApkIndex !== null}
                        style={{ color: '#ff4d4d', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}
                      >
                        Remove APK
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                setFrontendRoleCredentials([...frontendRoleCredentials, { role: '', username: '', password: '', apkFile: null, localFile: null, liveDemoLink: '' }]);
              }}
              disabled={submitting}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
            >
              + Add More Role
            </button>
          </div>

          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label htmlFor="scriptLink">Script Link (Optional)</label>
              <input
                type="url"
                id="scriptLink"
                value={scriptLink}
                onChange={(e) => setScriptLink(e.target.value)}
                placeholder="https://example.com/injection.js"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-light)',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '20px' }}>
            <label>Screenshots / Showcase Images</label>
            <div className="file-upload-zone">
              <label htmlFor="image-input" className="file-upload-label">
                <Upload size={24} style={{ color: 'var(--primary)' }} />
                <span>Upload Screenshots</span>
                <span className="file-hint">Select multiple screenshots (PNG, JPG, WEBP)</span>
              </label>
              <input
                type="file"
                id="image-input"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={submitting}
                style={{ display: 'none' }}
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="image-previews-grid" style={{ marginTop: '15px' }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="preview-card glass-card">
                    <img src={preview} alt={`Screenshot preview ${index + 1}`} />
                    <button
                      type="button"
                      className="preview-remove-btn"
                      onClick={() => removeImage(index)}
                      disabled={submitting}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Video Showcase Clip (Optional)</label>
            {!videoPreview ? (
              <div className="file-upload-zone">
                <label htmlFor="video-input" className="file-upload-label">
                  <Film size={24} style={{ color: 'var(--primary)' }} />
                  <span>Upload Video Clip</span>
                  <span className="file-hint">Single video display up to 100MB (MP4, WebM)</span>
                </label>
                <input
                  type="file"
                  id="video-input"
                  accept="video/*"
                  onChange={handleVideoChange}
                  disabled={submitting}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="video-preview-wrapper glass-card" style={{ padding: '10px' }}>
                <video src={videoPreview} controls className="video-preview-player" />
                <button
                  type="button"
                  className="video-remove-btn icon-btn"
                  onClick={removeVideo}
                  disabled={submitting}
                >
                  <X size={16} /> Remove Video
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/all-client-sites')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                'Save Client Demo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClientDemo;
