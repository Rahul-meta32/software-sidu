import React, { useState } from 'react';
import { X, Loader2, AlertTriangle, MessageSquare } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, site, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !site) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!message.trim()) {
      setError('Please specify the issue or feedback description.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(site, message.trim());
      setSuccess('Feedback submitted successfully!');
      setMessage('');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error. Failed to submit feedback.');
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
        border: '1px solid rgba(239, 68, 68, 0.1)',
        borderRadius: '20px',
        boxShadow: '0 20px 50px rgba(239, 68, 68, 0.05), 0 0 20px rgba(239, 68, 68, 0.01)',
        maxWidth: '480px',
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
            background: 'rgba(239, 68, 68, 0.03)',
            border: '1px solid rgba(239, 68, 68, 0.1)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(239, 68, 68, 0.08)', paddingBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(239, 68, 68, 0.08)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444'
          }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Submit Feedback</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Report problems or request edits for "{site.title}"</p>
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
          {/* Description Textarea */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: 700, fontSize: '0.8rem', color: '#334155' }}>
              <MessageSquare size={14} style={{ color: '#ef4444' }} />
              <span>Describe the issue <span style={{ color: '#ef4444' }}>*</span></span>
            </label>
            <textarea
              placeholder="e.g. The database connection is failing, or spelling error on landing page..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.88rem',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
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
                <span>Submitting Feedback...</span>
              </>
            ) : (
              <span>Send Feedback</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
