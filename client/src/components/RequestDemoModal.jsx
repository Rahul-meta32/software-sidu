import React, { useState } from 'react';
import { X, Loader2, ClipboardList, Package, MessageSquare, Download } from 'lucide-react';

const RequestDemoModal = ({ isOpen, onClose, onSubmit, username }) => {
  const [demoName, setDemoName] = useState('');
  const [description, setDescription] = useState('');
  const [docFile, setDocFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!demoName.trim()) {
      setError('Please specify a demo name.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('categoryName', 'General');
      formData.append('demoName', demoName.trim());
      formData.append('details', description.trim());
      formData.append('requestedBy', username || 'Client User');
      if (docFile) {
        formData.append('docFile', docFile);
      }

      const successMsg = await onSubmit(formData);
      
      setSuccess(successMsg || 'Demo request submitted successfully!');
      setDemoName('');
      setDescription('');
      setDocFile(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error. Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-premium" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 22, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div className="glass-card-premium" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        border: '1px solid rgba(0, 85, 255, 0.1)',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(0, 85, 255, 0.08), 0 0 20px rgba(0, 85, 255, 0.02)',
        maxWidth: '520px',
        width: '100%',
        padding: '24px 28px',
        position: 'relative',
        boxSizing: 'border-box',
        color: '#0f172a'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 85, 255, 0.03)',
            border: '1px solid rgba(0, 85, 255, 0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(0, 85, 255, 0.08)', paddingBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(0, 85, 255, 0.08)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <ClipboardList size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Request a New Demo</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Request custom layout presentations or specific themes</p>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: '14px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginBottom: '14px', color: '#10b981', background: 'rgba(16, 185, 129, 0.08)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Demo Name Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>
              <ClipboardList size={14} style={{ color: 'var(--primary)' }} />
              <span>Demo Name <span style={{ color: '#ef4444' }}>*</span></span>
            </label>
            <input
              type="text"
              placeholder="e.g. Real Estate Agency Portal"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 85, 255, 0.15)',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Description Textarea */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>
              <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
              <span>Request Details</span>
            </label>
            <textarea
              placeholder="Specify requirements, layouts, features, or preferred colors..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 85, 255, 0.15)',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Reference Document Input */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>
              <Package size={14} style={{ color: 'var(--primary)' }} />
              <span>Reference Document (PDF / DOC / DOCX / TXT)</span>
            </label>
            <label 
              htmlFor="doc-file-upload" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '8px', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '2px dashed rgba(0, 85, 255, 0.25)', 
                background: 'rgba(0, 85, 255, 0.02)', 
                color: 'var(--primary)', 
                cursor: 'pointer', 
                fontWeight: 600, 
                fontSize: '0.85rem', 
                transition: 'all 0.2s ease', 
                textAlign: 'center',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 85, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(0, 85, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 85, 255, 0.02)';
                e.currentTarget.style.borderColor = 'rgba(0, 85, 255, 0.25)';
              }}
            >
              <Download size={16} />
              <span>Choose Document File</span>
            </label>
            <input
              id="doc-file-upload"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              key={docFile ? docFile.name : 'empty'}
              onChange={(e) => setDocFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            {docFile && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px 14px', 
                background: 'rgba(34, 211, 160, 0.08)', 
                border: '1px solid rgba(34, 211, 160, 0.2)', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '12px',
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', minWidth: 0, flex: 1 }}>
                  <Package size={16} style={{ color: '#22d3a0', flexShrink: 0 }} />
                  <span style={{ 
                    fontSize: '0.82rem', 
                    color: '#0f172a', 
                    fontWeight: 600, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                  }} title={docFile.name}>
                    {docFile.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', flexShrink: 0 }}>
                    ({(docFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setDocFile(null)} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#ef4444', 
                    cursor: 'pointer', 
                    padding: '2px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #0044cc 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 85, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Submitting Request...</span>
              </>
            ) : (
              <span>Submit Request</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestDemoModal;
