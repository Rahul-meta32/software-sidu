import React, { useState, useEffect } from 'react';
import { demoSiteService } from '../api/demoSiteService';
import { Upload, X, Film, Image as ImageIcon, Loader2 } from 'lucide-react';

const DemoSiteForm = ({ site, onClose, onRefresh }) => {
  const isEditMode = !!site;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [liveDemoLink, setLiveDemoLink] = useState('');
  const [developer, setDeveloper] = useState('');
  
  // File states
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load existing data if in Edit Mode
  useEffect(() => {
    if (isEditMode && site) {
      setTitle(site.title || '');
      setDescription(site.description || '');
      setLiveDemoLink(site.liveDemoLink || '');
      setDeveloper(site.developer || '');
      
      // If there are existing images/videos on the server
      const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5500/api';
      // Determine root URL (removes "/api" suffix to get files route e.g., http://localhost:5050/uploads/...)
      const serverUrl = API_BASE.replace(/\/api\/?$/, '');

      if (site.images && site.images.length > 0) {
        setImagePreviews(site.images.map(img => `${serverUrl}/${img}`));
      }
      if (site.video) {
        setVideoPreview(`${serverUrl}/${site.video}`);
      }
    }
  }, [isEditMode, site]);

  // Clean up Object URLs to prevent memory leaks
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

  // Handle image selections
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter image files
    const validImages = files.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length !== files.length) {
      setErrorMsg('Some files were rejected. Only images are allowed.');
    }

    const newPreviews = validImages.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...validImages]);
    setImagePreviews(prev => {
      // If in edit mode and user uploads new files, we clear server-side previews to show only new selections
      const userSelected = prev.filter(url => url.startsWith('blob:'));
      return [...userSelected, ...newPreviews];
    });
  };

  // Handle video selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Rejected! Only video files are allowed.');
      return;
    }

    // Revoke old blob URL if any
    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  // Remove a selected image
  const removeImage = (indexToRemove) => {
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    
    // Check if the image to remove is a new blob or old server image
    const previewToRemove = imagePreviews[indexToRemove];
    if (previewToRemove.startsWith('blob:')) {
      // Find the index in the raw file list
      // Count how many blob URLs existed before this index to map it to the raw file array
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

  // Clear selected video
  const removeVideo = () => {
    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview('');
  };

  // Form Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim() || !description.trim() || !liveDemoLink.trim()) {
      setErrorMsg('Please fill in all required text fields.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('liveDemoLink', liveDemoLink.trim());
      formData.append('developer', developer.trim());

      // Append new image files
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      // Append new video file if uploaded
      if (videoFile) {
        formData.append('video', videoFile);
      }

      let res;
      if (isEditMode) {
        res = await demoSiteService.update(site._id, formData);
      } else {
        res = await demoSiteService.create(formData);
      }

      if (res.success) {
        onRefresh();
        onClose();
      } else {
        setErrorMsg(res.message || 'Action failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || 
        'An error occurred while saving the demo site.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Demo Site' : 'Create Demo Site'}</h2>
          <button className="icon-btn close-btn" onClick={onClose} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        {errorMsg && <div className="form-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="site-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Crypto Portfolio Tracker"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the application features, tech stack, and goals..."
              rows={4}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="liveDemoLink">Live Demo Link *</label>
            <input
              type="url"
              id="liveDemoLink"
              value={liveDemoLink}
              onChange={(e) => setLiveDemoLink(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="developer">Developer Name</label>
            <input
              type="text"
              id="developer"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              placeholder="Who is taking this site live (defaults to MetaBlock)"
              disabled={isLoading}
            />
          </div>

          {/* Image Upload Grid */}
          <div className="form-group">
            <label>Images (Multiple)</label>
            <div className="file-upload-zone">
              <label htmlFor="image-input" className="file-upload-label">
                <Upload size={24} />
                <span>Upload Images</span>
                <span className="file-hint">Drag & drop or click (PNG, JPG, WEBP)</span>
              </label>
              <input
                type="file"
                id="image-input"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                disabled={isLoading}
                style={{ display: 'none' }}
              />
            </div>

            {imagePreviews.length > 0 && (
              <div className="image-previews-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="preview-card">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="preview-remove-btn"
                      onClick={() => removeImage(index)}
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Upload Field */}
          <div className="form-group">
            <label>Video Demo (Single file)</label>
            {!videoPreview ? (
              <div className="file-upload-zone">
                <label htmlFor="video-input" className="file-upload-label">
                  <Film size={24} />
                  <span>Upload Video</span>
                  <span className="file-hint">MP4, WebM up to 100MB</span>
                </label>
                <input
                  type="file"
                  id="video-input"
                  accept="video/*"
                  onChange={handleVideoChange}
                  disabled={isLoading}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="video-preview-wrapper">
                <video src={videoPreview} controls className="video-preview-player" />
                <button
                  type="button"
                  className="video-remove-btn icon-btn"
                  onClick={removeVideo}
                  disabled={isLoading}
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
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                'Save Demo Site'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemoSiteForm;
