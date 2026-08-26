import React, { useState, useEffect } from 'react';
import { db } from '../api/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Bell, Check, Loader2, Calendar, ClipboardList, Tag, User, Trash2, ExternalLink } from 'lucide-react';

const DemoRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'all' | 'pending' | 'done'
  const [actioningId, setActioningId] = useState(null);

  const getFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
    const serverBase = apiBase.replace(/\/api\/?$/, '');
    return `${serverBase}/${url}`;
  };

  useEffect(() => {
    const q = query(collection(db, 'demo_requests'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setRequests(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAsDone = async (requestId) => {
    if (!window.confirm('Are you sure you want to mark this demo request as completed and notify the user?')) {
      return;
    }

    setActioningId(requestId);
    try {
      const requestRef = doc(db, 'demo_requests', requestId);
      await updateDoc(requestRef, { 
        status: 'done',
        resolvedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Mark as done error:', error);
      alert('Failed to update request status.');
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this demo request? This action cannot be undone.')) {
      return;
    }

    setActioningId(requestId);
    try {
      const requestRef = doc(db, 'demo_requests', requestId);
      await deleteDoc(requestRef);
    } catch (error) {
      console.error('Delete request error:', error);
      alert('Failed to delete the demo request.');
    } finally {
      setActioningId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="dashboard-page-wrapper">
      <div className="page-header-wrapper">
        <div className="page-title-section">
          <h2>Demo Requests</h2>
          <p>Real-time list of custom demo requests submitted by showcase users</p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['pending', 'done', 'all'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`btn ${filter === type ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', fontSize: '0.85rem', textTransform: 'capitalize' }}
            >
              {type === 'done' ? 'Completed' : type}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {loading ? (
          <div className="dashboard-loading-spinner" style={{ minHeight: '40vh' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p>Loading demo requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ClipboardList size={44} style={{ opacity: 0.3, marginBottom: '16px', color: 'var(--primary)' }} />
            <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>No {filter !== 'all' ? filter : ''} requests found</p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>All caught up!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredRequests.map((item) => {
              const formattedDate = item.createdAt
                ? new Date(item.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Unknown Date';

              return (
                <div
                  key={item.id}
                  className="glass-card"
                  style={{
                    padding: '24px 30px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '20px',
                    alignItems: 'center',
                    borderLeft: item.status === 'pending' ? '4px solid #0066ff' : '4px solid #22d3a0'
                  }}
                >
                  {/* Left Side: Request Info */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                    <div style={{
                      padding: '12px',
                      background: item.status === 'pending' ? 'rgba(0, 102, 255, 0.08)' : 'rgba(34, 211, 160, 0.08)',
                      borderRadius: '10px',
                      color: item.status === 'pending' ? '#0066ff' : '#22d3a0'
                    }}>
                      <ClipboardList size={22} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{item.demoName}</h4>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          background: item.status === 'pending' ? 'rgba(0, 102, 255, 0.15)' : 'rgba(34, 211, 160, 0.15)',
                          color: item.status === 'pending' ? '#0066ff' : '#22d3a0'
                        }}>
                          {item.status === 'done' ? 'Completed' : item.status}
                        </span>
                      </div>

                      {item.details && (
                        <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                          {item.details}
                        </p>
                      )}

                      {item.docUrl && (
                        <div style={{ marginTop: '8px' }}>
                          <a
                            href={getFileUrl(item.docUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: 'rgba(0, 102, 255, 0.06)',
                              border: '1px solid rgba(0, 102, 255, 0.15)',
                              color: 'var(--primary)',
                              borderRadius: '20px',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              width: 'fit-content'
                            }}
                          >
                            <ExternalLink size={12} />
                            <span>View Reference Doc / PDF</span>
                          </a>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={13} />
                          Category: <strong>{item.categoryName}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={13} />
                          Requested By: <strong>{item.requestedBy}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleMarkAsDone(item.id)}
                        disabled={actioningId !== null}
                        className="btn btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '10px 18px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                        }}
                      >
                        {actioningId === item.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        <span>Mark Done</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteRequest(item.id)}
                      disabled={actioningId !== null}
                      className="btn"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 18px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 77, 77, 0.08)',
                        color: '#ff4d4d',
                        border: '1px solid rgba(255, 77, 77, 0.2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ff4d4d';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 77, 77, 0.08)';
                        e.currentTarget.style.color = '#ff4d4d';
                      }}
                    >
                      {actioningId === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoRequests;
