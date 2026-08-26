import React, { useState, useEffect } from 'react';
import { db } from '../api/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { demoSiteService, serverCategoryService } from '../api/demoSiteService';
import { Bell, ShieldAlert, Check, ToggleRight, Loader2, Calendar, Globe, Key, X, Trash2 } from 'lucide-react';

const Notifications = () => {
  const adminRole = localStorage.getItem('adminRole') || 'agent';
  const adminEmail = localStorage.getItem('adminEmail') || '';
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'all' | 'pending' | 'resolved'
  const [actioningId, setActioningId] = useState(null);

  const handleDeleteNotification = async (complaintId) => {
    if (window.confirm('Are you sure you want to permanently delete this notification?')) {
      setActioningId(complaintId);
      try {
        const complaintRef = doc(db, 'complaints', complaintId);
        await deleteDoc(complaintRef);
        alert('Notification deleted successfully!');
      } catch (error) {
        console.error('Delete notification error:', error);
        alert('Failed to delete notification.');
      } finally {
        setActioningId(null);
      }
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setComplaints(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleActivateSite = async (siteId, complaintId) => {
    if (!siteId) return;
    setActioningId(complaintId);
    try {
      // Create FormData to send update
      const formData = new FormData();
      formData.append('isActive', true);

      // Call API to activate site in MongoDB
      const res = await demoSiteService.update(siteId, formData);
      if (res.success) {
        // Resolve in Firestore
        const complaintRef = doc(db, 'complaints', complaintId);
        await updateDoc(complaintRef, { status: 'resolved' });
        alert('Website activated and feedback resolved successfully!');
      } else {
        alert('Failed to activate site: ' + res.message);
      }
    } catch (error) {
      console.error('Activate site error:', error);
      alert('Error updating site details.');
    } finally {
      setActioningId(null);
    }
  };

  const handleResolveComplaint = async (complaintId) => {
    setActioningId(complaintId);
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      await updateDoc(complaintRef, { status: 'resolved' });
    } catch (error) {
      console.error('Resolve complaint error:', error);
      alert('Failed to resolve feedback.');
    } finally {
      setActioningId(null);
    }
  };

  const handleApprovePasswordRequest = async (requestId, complaintId, item) => {
    if (!requestId) return;
    setActioningId(complaintId);
    try {
      const res = await serverCategoryService.approvePasswordRequest(requestId);
      if (res.success) {
        const complaintRef = doc(db, 'complaints', complaintId);
        await updateDoc(complaintRef, { status: 'resolved' });

        // Parse server name from original message
        const serverName = item.message?.match(/"([^"]+)"/)?.[1] || 'Server';

        // Add approval notification document for target developer
        await addDoc(collection(db, 'complaints'), {
          siteId: item.siteId || '',
          siteTitle: "Password Request Approved",
          message: `Your password request for Server "${serverName}" has been approved!`,
          status: "pending",
          createdAt: new Date().toISOString(),
          type: "password_approved",
          agentName: item.agentName || ''
        });

        alert('Password request approved successfully!');
      } else {
        alert('Failed to approve password request: ' + res.message);
      }
    } catch (error) {
      console.error('Approve password request error:', error);
      alert(error.response?.data?.message || 'Error approving password request.');
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectPasswordRequest = async (requestId, complaintId, item) => {
    if (!requestId) return;
    setActioningId(complaintId);
    try {
      const res = await serverCategoryService.rejectPasswordRequest(requestId);
      if (res.success) {
        const complaintRef = doc(db, 'complaints', complaintId);
        await updateDoc(complaintRef, { status: 'resolved' });

        // Parse server name from original message
        const serverName = item.message?.match(/"([^"]+)"/)?.[1] || 'Server';

        // Add rejection notification document for target developer
        await addDoc(collection(db, 'complaints'), {
          siteId: item.siteId || '',
          siteTitle: "Password Request Rejected",
          message: `Your password request for Server "${serverName}" has been rejected.`,
          status: "pending",
          createdAt: new Date().toISOString(),
          type: "password_rejected",
          agentName: item.agentName || ''
        });

        alert('Password request rejected successfully!');
      } else {
        alert('Failed to reject password request: ' + res.message);
      }
    } catch (error) {
      console.error('Reject password request error:', error);
      alert(error.response?.data?.message || 'Error rejecting password request.');
    } finally {
      setActioningId(null);
    }
  };

  const isNotificationRelevant = (data, role, email) => {
    if (data.type === 'password_request') {
      return role === 'superadmin';
    }
    if (data.type === 'password_approved' || data.type === 'password_rejected') {
      return role === 'agent' && data.agentName === email;
    }
    if (data.type === 'server_expiry') {
      return role === 'superadmin' || (role === 'agent' && data.allowedEmails?.includes(email));
    }
    return true;
  };

  const filteredComplaints = complaints
    .filter((c) => isNotificationRelevant(c, adminRole, adminEmail))
    .filter((c) => {
      if (filter === 'all') return true;
      return c.status === filter;
    });

  return (
    <div className="dashboard-page-wrapper">
      <div className="page-header-wrapper">
        <div className="page-title-section">
          <h2>Website Feedback</h2>
          <p>Real-time notifications of user feedback and inactive link checks</p>
        </div>

        {/* Filter controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['pending', 'resolved', 'all'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`btn ${filter === type ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', fontSize: '0.85rem', textTransform: 'capitalize' }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {loading ? (
          <div className="dashboard-loading-spinner" style={{ minHeight: '40vh' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p>Subscribing to live updates...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={44} style={{ opacity: 0.3, marginBottom: '16px', color: 'var(--primary)' }} />
            <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>No {filter !== 'all' ? filter : ''} feedback found</p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Everything is running smoothly!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredComplaints.map((item) => {
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
                    borderLeft: item.type === 'password_approved'
                      ? '4px solid #22d3a0'
                      : (item.status === 'pending' ? '4px solid #ff4d4d' : '4px solid #22d3a0')
                  }}
                >
                  {/* Left Side: Info Details */}
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                    <div style={{
                      padding: '12px',
                      background: item.type === 'password_approved'
                        ? 'rgba(34, 211, 160, 0.08)'
                        : (item.status === 'pending' ? 'rgba(255, 77, 77, 0.08)' : 'rgba(34, 211, 160, 0.08)'),
                      borderRadius: '10px',
                      color: item.type === 'password_approved'
                        ? '#22d3a0'
                        : (item.status === 'pending' ? '#ff4d4d' : '#22d3a0')
                    }}>
                       {['password_request', 'password_approved', 'password_rejected'].includes(item.type) ? <Key size={22} /> : (item.type === 'server_expiry' ? <Calendar size={22} /> : <ShieldAlert size={22} />)}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{item.siteTitle}</h4>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          background: item.type === 'password_approved'
                            ? 'rgba(34, 211, 160, 0.15)'
                            : (item.status === 'pending' ? 'rgba(255, 77, 77, 0.15)' : 'rgba(34, 211, 160, 0.15)'),
                          color: item.type === 'password_approved'
                            ? '#22d3a0'
                            : (item.status === 'pending' ? '#ff4d4d' : '#22d3a0')
                        }}>
                          {item.type === 'password_approved' ? 'approved' : (item.type === 'password_rejected' ? 'rejected' : item.status)}
                        </span>
                      </div>

                      {item.message && (
                        <p style={{ margin: '4px 0 8px 0', fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                          {['password_request', 'password_approved', 'password_rejected'].includes(item.type) ? 'Request Details:' : (item.type === 'server_expiry' ? 'Expiry Warning:' : 'Feedback Description:')}{' '}
                          <span style={{
                            color: item.type === 'password_approved'
                              ? '#22d3a0'
                              : (item.type === 'password_rejected' ? '#ff4d4d' : (item.type === 'password_request' ? 'var(--primary)' : (item.type === 'server_expiry' ? '#ffaa00' : '#ff4d4d'))),
                            fontWeight: 600
                          }}>
                            "{item.message}"
                          </span>
                        </p>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} />
                          {formattedDate}
                        </span>
                        {item.liveDemoLink && (
                          <a
                            href={item.liveDemoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', textDecoration: 'underline' }}
                          >
                            <Globe size={13} />
                            <span>Visit Link</span>
                          </a>
                        )}
                        <span>ID: {item.siteId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {item.status === 'pending' && (
                      item.type === 'password_request' ? (
                        <>
                          <button
                            onClick={() => handleApprovePasswordRequest(item.requestId, item.id, item)}
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
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectPasswordRequest(item.requestId, item.id, item)}
                            disabled={actioningId !== null}
                            className="btn btn-secondary"
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
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        ['password_approved', 'password_rejected', 'server_expiry'].includes(item.type) ? (
                          <button
                            onClick={() => handleResolveComplaint(item.id)}
                            disabled={actioningId !== null}
                            className="btn btn-secondary"
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
                            <Check size={14} />
                            <span>Dismiss</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleActivateSite(item.siteId, item.id)}
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
                                <ToggleRight size={14} />
                              )}
                              <span>Activate Site</span>
                            </button>
                            <button
                              onClick={() => handleResolveComplaint(item.id)}
                              disabled={actioningId !== null}
                              className="btn btn-secondary"
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
                              <Check size={14} />
                              <span>Resolve</span>
                            </button>
                          </>
                        )
                      )
                    )}

                    {/* Permanent Delete Button */}
                    <button
                      onClick={() => handleDeleteNotification(item.id)}
                      disabled={actioningId !== null}
                      className="btn btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        cursor: 'pointer'
                      }}
                      title="Delete Permanently"
                    >
                      <Trash2 size={16} />
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

export default Notifications;
