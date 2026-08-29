import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authService } from '../api/demoSiteService';
import { db } from '../api/firebase';
import { doc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { LayoutDashboard, PlusCircle, LogOut, Layers, Tag, Server, HelpCircle, Bell, Grid, Image, UserPlus, Users, Star, Layout as LayoutIcon, ClipboardList, Sliders, Settings as SettingsIcon, Code } from 'lucide-react';
import logoImg from '../assets/smartsoft.png';

const isNotificationRelevant = (data, role, email) => {
  if (data.type === 'password_request') {
    return role === 'superadmin';
  }
  if (data.type === 'password_approved' || data.type === 'password_rejected') {
    return role === 'agent' && data.agentName === email;
  }
  return true;
};

const Layout = () => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('adminEmail') || 'admin@metablock.com');
  const [adminRole, setAdminRole] = useState(localStorage.getItem('adminRole') || 'agent');
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('adminAvatar') || '');
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingComplaintSiteIds, setPendingComplaintSiteIds] = useState([]);
  const [pendingComplaints, setPendingComplaints] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const isInitial = useRef(true);

  // Helper to convert base64 VAPID public key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Subscribe user for push notifications
  const subscribeUser = async (registration) => {
    try {
      const vapidPublicKey = 'BKaunp2aYpmPuMm8ODHCx9Pijhj196IXJGnP6PdkLKylX9zUcHFV2QBLuP0SDKuOBaxGQo-s6OY8TyESVUieVWA';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
        console.log('New push subscription created:', subscription);
      }

      const subscriptionJSON = JSON.parse(JSON.stringify(subscription));
      const subId = btoa(subscriptionJSON.endpoint).replace(/[^a-zA-Z0-9]/g, '').slice(-50);
      const subRef = doc(db, 'push_subscriptions', subId);

      await setDoc(subRef, {
        subscription: subscriptionJSON,
        updatedAt: new Date().toISOString()
      });
      console.log('Push subscription stored in Firestore.');
    } catch (error) {
      console.error('Failed to subscribe user to push notifications:', error);
    }
  };

  // Register service worker
  const registerPush = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);

        // Wait for service worker to activate
        if (Notification.permission === 'granted') {
          await subscribeUser(registration);
        }
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  };

  // Play notification chime using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Force resume if suspended by Chrome Autoplay policy
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const playChime = (freq, startTime, duration, vol = 0.6) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = 'triangle'; // Triangle is very rich and clean for bell-like tones
        osc.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(vol, startTime);
        // Clean exponential decay for a pluck/bell sound
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;

      // Premium ascending arpeggio chime (Ting-ting-ting-RING!)
      playChime(523.25, now, 0.25, 0.6);        // C5 (Ting)
      playChime(659.25, now + 0.08, 0.25, 0.6); // E5 (ting)
      playChime(783.99, now + 0.16, 0.25, 0.6); // G5 (ting)
      playChime(1046.50, now + 0.24, 0.6, 0.85); // C6 (RING!) - louder final ringing note
    } catch (err) {
      console.warn('AudioContext failed:', err);
    }
  };

  const addToast = (complaint) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, ...complaint }]);
    setTimeout(() => {
      removeToast(id);
    }, 10000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Autoplay Policy audio unlocker helper
    const unlockAudio = () => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);

        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        console.log('Audio Context unlocked successfully.');
      } catch (e) {
        console.warn('Failed to unlock audio context:', e);
      }
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    const initNotifications = async () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            await registerPush();
          }
        } else if (Notification.permission === 'granted') {
          await registerPush();
        }
      }
    };
    initNotifications();

    const q = query(collection(db, 'complaints'), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      const siteIds = [];
      const complaintsList = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (isNotificationRelevant(data, adminRole, adminEmail)) {
          count++;
          if (data.siteId) {
            siteIds.push(data.siteId);
            complaintsList.push({
              id: docSnap.id,
              siteId: data.siteId,
              message: data.message || 'No description provided'
            });
          }
        }
      });
      setPendingCount(count);
      setPendingComplaintSiteIds(siteIds);
      setPendingComplaints(complaintsList);

      // Only trigger notification on new documents (ignore initial load items)
      if (!isInitial.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const complaint = change.doc.data();
            if (isNotificationRelevant(complaint, adminRole, adminEmail)) {
              addToast(complaint);
              playNotificationSound();

              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  let title = 'New Website Feedback! ⚠️';
                  let body = `Feedback received for site: "${complaint.siteTitle || 'a demo site'}"`;
                  
                  if (complaint.type === 'password_approved') {
                    title = 'Password Request Approved! 🔑';
                    body = complaint.message;
                  } else if (complaint.type === 'password_rejected') {
                    title = 'Password Request Rejected! ❌';
                    body = complaint.message;
                  } else if (complaint.type === 'password_request') {
                    title = 'New Password Request! 🔑';
                    body = complaint.message;
                  }

                  new Notification(title, {
                    body: body,
                    icon: '/favicon.svg',
                  });
                } catch (err) {
                  console.error('Browser Notification trigger error:', err);
                }
              }
            }
          }
        });
      }
      isInitial.current = false;
    }, (error) => {
      console.error('Failed to listen to pending complaints:', error);
    });
    const qRequests = query(collection(db, 'demo_requests'), where('status', '==', 'pending'));
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      setPendingRequestsCount(snapshot.size);
    }, (error) => {
      console.error('Failed to listen to pending demo requests:', error);
    });

    return () => {
      unsubscribe();
      unsubscribeRequests();
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setAdminEmail(localStorage.getItem('adminEmail') || 'admin@metablock.com');
      setAdminRole(localStorage.getItem('adminRole') || 'agent');
      setAvatarUrl(localStorage.getItem('adminAvatar') || '');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      {/* Persistent Left Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-main-content">
          {/* Brand Logo with Image */}
          <NavLink to="/" className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '10px 8px' }}>
            <img
              src={logoImg}
              alt="SmartSoft Technologies"
              style={{ height: '40px', maxWidth: '180px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </NavLink>

          {/* Navigation Menu */}
          <nav>
            <ul className="sidebar-menu">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `menu-item-link ${isActive ? 'active' : ''}`
                  }
                  end
                >
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/all-sites"
                  className={({ isActive }) =>
                    `menu-item-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Layers size={20} />
                  <span>All Site</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/all-client-sites"
                  className={({ isActive }) =>
                    `menu-item-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Layers size={20} />
                  <span>All Client Sites</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/website-cms"
                  className={({ isActive }) =>
                    `menu-item-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Sliders size={20} />
                  <span>Website CMS</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/script-sites"
                  className={({ isActive }) =>
                    `menu-item-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Code size={20} />
                  <span>Add Script Sites</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/demo-requests"
                  className={({ isActive }) =>
                    `menu-item-link ${isActive ? 'active' : ''}`
                  }
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ClipboardList size={20} />
                    <span>Demo Requests</span>
                  </div>
                  {pendingRequestsCount > 0 && (
                    <span style={{
                      background: 'var(--primary)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      padding: '2px 8px',
                      boxShadow: '0 0 10px rgba(0, 102, 255, 0.4)',
                    }}>
                      {pendingRequestsCount}
                    </span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/notifications"
                  className={({ isActive }) =>
                    `menu-item-link ${isActive ? 'active' : ''}`
                  }
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={20} />
                    <span>Feedback</span>
                  </div>
                  {pendingCount > 0 && (
                    <span style={{
                      background: '#ff4d4d',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      padding: '2px 8px',
                      boxShadow: '0 0 10px rgba(255, 77, 77, 0.4)',
                    }}>
                      {pendingCount}
                    </span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `menu-item-link ${isActive ? 'active' : ''}`
                  }
                >
                  <SettingsIcon size={20} />
                  <span>Settings</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/guide"
                  className={({ isActive }) =>
                    `menu-item-link ${isActive ? 'active' : ''}`
                  }
                >
                  <HelpCircle size={20} />
                  <span>Guide</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-profile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }} onClick={() => navigate('/profile')}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="sidebar-avatar" style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid var(--border-color)'
              }} />
            ) : (
              <div className="sidebar-avatar-fallback" style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(0, 102, 255, 0.05)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 700,
                border: '1px solid var(--border-color)'
              }}>
                {adminEmail.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="user-profile-info" style={{ overflow: 'hidden' }}>
              <span className="role-label" style={{ display: 'block' }}>{adminRole === 'superadmin' ? 'Super Admin' : 'Developer'}</span>
              <span className="user-email" title={adminEmail} style={{
                display: 'block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                {adminEmail}
              </span>
            </div>
          </div>
          <button className="btn btn-logout icon-btn" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main-content">
        <Outlet context={{ pendingComplaintSiteIds, pendingComplaints }} />
      </div>

      {/* Floating In-App Toast List */}
      <div className="in-app-toast-container" style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}>
        <style>{`
          @keyframes slideInRight {
            from {
              transform: translateX(120%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
        {toasts.map((toast) => {
          let themeColor = '#ff4d4d'; // Red default for feedback
          let badgeText = 'Feedback Received';
          let bgColor = 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)';
          let borderColor = 'rgba(255, 77, 77, 0.25)';

          if (toast.type === 'password_approved') {
            themeColor = '#22d3a0'; // Green
            badgeText = 'Access Approved';
            bgColor = 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)';
            borderColor = 'rgba(34, 211, 160, 0.25)';
          } else if (toast.type === 'password_rejected') {
            themeColor = '#ff4d4d'; // Red
            badgeText = 'Access Rejected';
            bgColor = 'linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)';
            borderColor = 'rgba(255, 77, 77, 0.25)';
          } else if (toast.type === 'password_request') {
            themeColor = 'var(--primary)'; // Blue
            badgeText = 'Password Request';
            bgColor = 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)';
            borderColor = 'rgba(0, 102, 255, 0.25)';
          }

          return (
            <div key={toast.id} className="in-app-toast-card glass-card" style={{
              pointerEvents: 'auto',
              background: bgColor,
              border: `1px solid ${borderColor}`,
              boxShadow: `0 8px 32px rgba(15, 23, 42, 0.08), 0 0 15px ${themeColor}10`,
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              backdropFilter: 'blur(12px)',
              animation: 'slideInRight 0.3s ease-out forwards',
              color: 'var(--text-main)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    background: themeColor,
                    borderRadius: '50%',
                    display: 'inline-block',
                    boxShadow: `0 0 8px ${themeColor}`
                  }}></span>
                  <span style={{ fontWeight: 700, color: themeColor, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {badgeText}
                  </span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0 4px',
                    lineHeight: 1,
                    marginTop: '-4px'
                  }}
                >
                  &times;
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h5 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-main)' }}>{toast.siteTitle}</h5>
                {toast.liveDemoLink ? (
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={toast.liveDemoLink}>
                    URL: {toast.liveDemoLink}
                  </p>
                ) : toast.message ? (
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                    {toast.message}
                  </p>
                ) : null}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  onClick={() => {
                    removeToast(toast.id);
                    navigate('/notifications');
                  }}
                  className="btn btn-primary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Layout;
