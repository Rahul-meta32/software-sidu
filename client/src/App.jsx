import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import HomepageSections from './components/HomepageSections';
import ShowcaseItemCard from './components/ShowcaseItemCard';
import DemoSiteDetailPage from './components/DemoSiteDetailPage';
import RequestDemoModal from './components/RequestDemoModal';
import FeedbackModal from './components/FeedbackModal';
import { Loader2, Search, Database, Globe, ChevronLeft, ChevronRight, X, ExternalLink, Copy, Check, Download } from 'lucide-react';
import logoImg from './assets/smartsoft.png';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
const SERVER_BASE = API_BASE.replace(/\/api\/?$/, '');

const parseHash = () => {
  const hash = window.location.hash || '#/';
  const pathPart = hash.split('?')[0] || '#/';
  const queryPart = hash.split('?')[1] || '';
  
  const params = {};
  if (queryPart) {
    queryPart.split('&').forEach(param => {
      const [key, val] = param.split('=');
      if (key && val) {
        params[key] = decodeURIComponent(val);
      }
    });
  }

  return { path: pathPart, params };
};

// Labels shown on top of each hero card
const HERO_LABELS = [
  { text: '#1 TOP SELLER', color: 'var(--primary)' },
  { text: 'BESTSELLER',    color: '#ffc600' },
  { text: 'NEW ARRIVAL',   color: '#22d3a0' },
];

/* ── Extracts up to 3 site items from any section that has items ── */
const getHeroItems = (sections) => {
  const items = [];
  for (const sec of sections) {
    if (sec.items && sec.items.length > 0) {
      for (const item of sec.items) {
        if (items.length >= 3) break;
        if (item.images && item.images.length > 0) items.push(item);
      }
    }
    if (items.length >= 3) break;
  }
  return items;
};

/* ── Hero Card Stack: 3 floating cards with real backend images ── */
const HeroCardStack = ({ sections, onCardClick }) => {
  const items = getHeroItems(sections);

  // Fallback static cards if no backend data yet
  const fallback = [
    { title: 'WooCommerce Template',     sub: 'Build anything. No code required.' },
    { title: 'Modular React Admin Panel', sub: 'Curated with Plus Jakarta Sans UI.' },
    { title: 'Uncode Portfolio Theme',    sub: 'Trusted by 10,000+ creators.' },
  ];

  const handleCardClick = (item) => {
    if (item && onCardClick) {
      onCardClick(item);
    }
  };

  return (
    <div className="hero-right-visual">
      {[0, 1, 2].map((idx) => {
        const item = items[idx];
        const label = HERO_LABELS[idx];
        const imgPath = item?.images?.[0];
        const imgUrl = imgPath
          ? (imgPath.startsWith('http') ? imgPath : `${SERVER_BASE}/${imgPath}`)
          : null;
        const title = item?.title || fallback[idx].title;
        const sub   = item?.title ? 'MetaBlock Template' : fallback[idx].sub;

        return (
          <div
            key={idx}
            className={`hero-visual-card-stack card-${idx + 1}`}
            onClick={() => handleCardClick(item)}
            style={{ cursor: item && onCardClick ? 'pointer' : 'default' }}
          >
            {/* Real image background */}
            {imgUrl && (
              <img
                src={imgUrl}
                alt={title}
                className="hero-card-bg-image"
              />
            )}
            {/* Gradient overlay so text is readable */}
            <div className="hero-card-overlay" />
            {/* Text content */}
            <div className="hero-card-content">
              <span className="hero-card-badge" style={{ color: label.color }}>
                {label.text}
              </span>
              <strong className="hero-card-title">{title}</strong>
              <span className="hero-card-sub">{sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const parseCredentials = (cred) => {
  if (!cred) return { username: '', password: '', apkFile: null };
  if (typeof cred === 'object') {
    return {
      username: cred.username || '',
      password: cred.password || '',
      apkFile: cred.apkFile || null
    };
  }
  try {
    const parsed = JSON.parse(cred);
    if (parsed && typeof parsed === 'object') {
      return {
        username: parsed.username || '',
        password: parsed.password || '',
        apkFile: parsed.apkFile || null
      };
    }
  } catch (e) {
    // ignore
  }
  
  const str = String(cred);
  if (str.includes('/')) {
    const parts = str.split('/');
    let u = parts[0].trim();
    let p = parts[1].trim();
    u = u.replace(/^(user|username|email|id):\s*/i, '');
    p = p.replace(/^(pass|password):\s*/i, '');
    return { username: u, password: p, apkFile: null };
  }
  
  return { username: str, password: '', apkFile: null };
};

const CredentialBlock = ({ username, password, onCopyUser, isUserCopied, onCopyPass, isPassCopied }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, width: '100%' }}>
      {username && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Username / Email</span>
          <div style={{
            background: 'var(--bg-darker)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s ease'
          }}>
            <span style={{ 
              fontSize: '0.78rem', 
              color: 'var(--text-main)', 
              fontFamily: 'monospace', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
              wordBreak: 'break-all'
            }} title={username}>
              {username}
            </span>
            <button
              onClick={onCopyUser}
              style={{
                background: isUserCopied ? 'rgba(34, 211, 160, 0.15)' : 'var(--secondary)',
                border: isUserCopied ? '1px solid rgba(34, 211, 160, 0.3)' : '1px solid var(--border-color)',
                color: isUserCopied ? '#22d3a0' : 'var(--text-main)',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              {isUserCopied ? <Check size={12} /> : <Copy size={12} />}
              <span>{isUserCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}
      {password && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Password</span>
          <div style={{
            background: 'var(--bg-darker)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s ease'
          }}>
            <span style={{ 
              fontSize: '0.78rem', 
              color: 'var(--text-main)', 
              fontFamily: 'monospace', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0,
              wordBreak: 'break-all'
            }} title={password}>
              {password}
            </span>
            <button
              onClick={onCopyPass}
              style={{
                background: isPassCopied ? 'rgba(34, 211, 160, 0.15)' : 'var(--secondary)',
                border: isPassCopied ? '1px solid rgba(34, 211, 160, 0.3)' : '1px solid var(--border-color)',
                color: isPassCopied ? '#22d3a0' : 'var(--text-main)',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                transition: 'all 0.2s ease'
              }}
            >
              {isPassCopied ? <Check size={12} /> : <Copy size={12} />}
              <span>{isPassCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  const lastProcessedHashRef = useRef('');
  const [token, setToken] = useState(localStorage.getItem('clientToken') || '');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('clientUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleClientLogin = async (username, password) => {
    const res = await axios.post(`${API_BASE}/admin/client/login`, { username, password });
    if (res.data.success) {
      localStorage.setItem('clientToken', res.data.token);
      localStorage.setItem('clientUser', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, message: res.data.message };
  };

  const handleClientLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    setToken('');
    setUser(null);
    window.location.reload();
  };

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalSite, setModalSite] = useState(null);
  const [copiedFront, setCopiedFront] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);
  const [copiedFrontUser, setCopiedFrontUser] = useState(false);
  const [copiedFrontPass, setCopiedFrontPass] = useState(false);
  const [copiedAdminUser, setCopiedAdminUser] = useState(false);
  const [copiedAdminPass, setCopiedAdminPass] = useState(false);
  const [copiedKeys, setCopiedKeys] = useState({});

  const handleRegisterFeedback = (site) => {
    setFeedbackSite(site);
    setIsFeedbackModalOpen(true);
  };

  const handleFeedbackModalSubmit = async (site, message) => {
    const res = await axios.post(`${API_BASE}/demo-sites/${site._id}/feedback`, { message });
    if (res.data.success) {
      if (res.data.data && res.data.data.id) {
        handleFeedbackSubmitted(site._id, site.title, res.data.data.id);
      }
      return true;
    } else {
      throw new Error(res.data.message || 'Feedback submission failed');
    }
  };

  // Search & Category view states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSubcategory, setActiveSubcategory] = useState('All Items');
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showClientDemos, setShowClientDemos] = useState(false);

  // Detail page state
  const [selectedSite, setSelectedSite] = useState(null);
  const [isRequestDemoModalOpen, setIsRequestDemoModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackSite, setFeedbackSite] = useState(null);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('demo_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [toasts, setToasts] = useState([]);

  // Unlock AudioContext for mobile/desktop browser autoplay policies
  useEffect(() => {
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
        console.log('Client Audio Context unlocked successfully.');
      } catch (e) {
        console.warn('Failed to unlock client audio:', e);
      }
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Request browser notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playChime = (freq, startTime, duration, vol) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(vol, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      // Premium ascending arpeggio chime (Ting-ting-ting-RING!)
      playChime(523.25, now, 0.25, 0.5);        // C5 (Ting)
      playChime(659.25, now + 0.08, 0.25, 0.5); // E5 (ting)
      playChime(783.99, now + 0.16, 0.25, 0.5); // G5 (ting)
      playChime(1046.50, now + 0.24, 0.6, 0.75); // C6 (RING!)
    } catch (err) {
      console.warn('AudioContext failed:', err);
    }
  };

  // Track user submissions
  const handleFeedbackSubmitted = (siteId, siteTitle, complaintId) => {
    if (!complaintId) return;
    try {
      const saved = localStorage.getItem('submitted_feedbacks');
      const list = saved ? JSON.parse(saved) : [];
      if (!list.includes(complaintId)) {
        list.push(complaintId);
        localStorage.setItem('submitted_feedbacks', JSON.stringify(list));
      }
    } catch (e) {
      console.error('Localstorage error:', e);
    }
  };

  // Check backend for resolved feedback
  useEffect(() => {
    const checkResolved = async () => {
      try {
        const savedFeedbacks = localStorage.getItem('submitted_feedbacks');
        if (!savedFeedbacks) return;
        const complaintIds = JSON.parse(savedFeedbacks);
        if (!Array.isArray(complaintIds) || complaintIds.length === 0) return;

        const res = await axios.post(`${API_BASE}/feedback/check-resolved`, { complaintIds });
        if (res.data.success && res.data.data.length > 0) {
          let updatedNotifs = [...notifications];
          let updated = false;

          res.data.data.forEach((item) => {
            // If we don't have a notification for this unique complaint id yet
            if (!updatedNotifs.some((n) => n.id === item.id)) {
              updatedNotifs.unshift({
                id: item.id, // Unique complaint document ID
                siteId: item.siteId,
                siteTitle: item.siteTitle,
                message: `🎉 "${item.siteTitle}" problem solved! Now live.`,
                read: false,
                timestamp: new Date().toISOString()
              });
              updated = true;

              // Play arpeggio sound chime
              playNotificationSound();

              // Add sliding visual toast card
              setToasts((prev) => [
                ...prev,
                {
                  id: item.id, // Unique toast card id
                  siteId: item.siteId,
                  siteTitle: item.siteTitle,
                  message: `"${item.siteTitle}" is now live!`,
                  desc: 'The administrator has resolved the issue and activated the template.',
                },
              ]);

              // Auto-remove visual toast card after 10 seconds
              setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== item.id));
              }, 10000);

              // Trigger native browser notification
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification('Problem Solved! 🛠️', {
                    body: `"${item.siteTitle}" is now live! The admin has resolved the issue.`,
                    icon: '/favicon.png',
                  });
                } catch (err) {
                  console.error('Browser Notification trigger error:', err);
                }
              }
            }
          });

          if (updated) {
            setNotifications(updatedNotifs);
            localStorage.setItem('demo_notifications', JSON.stringify(updatedNotifs));
          }
        }
      } catch (err) {
        console.error('Check resolved error:', err);
      }
    };

    // Poll every 8 seconds
    checkResolved(); // initial check
    const interval = setInterval(checkResolved, 8000);
    return () => clearInterval(interval);
  }, [notifications]);

  const handleRequestDemoSubmit = async (requestData) => {
    const res = await axios.post(`${API_BASE}/demo-requests`, requestData);
    if (res.data.success) {
      try {
        const saved = localStorage.getItem('submitted_demo_requests');
        const list = saved ? JSON.parse(saved) : [];
        const newItem = {
          id: res.data.data.id,
          demoName: res.data.data.demoName,
        };
        list.push(newItem);
        localStorage.setItem('submitted_demo_requests', JSON.stringify(list));
      } catch (e) {
        console.error('LocalStorage error:', e);
      }
      return res.data.message;
    } else {
      throw new Error(res.data.message || 'Submission failed');
    }
  };

  // Check status of submitted demo requests
  useEffect(() => {
    const checkDemoRequestsStatus = async () => {
      try {
        const savedRequests = localStorage.getItem('submitted_demo_requests');
        if (!savedRequests) return;
        const list = JSON.parse(savedRequests);
        if (!Array.isArray(list) || list.length === 0) return;

        const requestIds = list.map(item => item.id);
        const res = await axios.post(`${API_BASE}/demo-requests/check-status`, { requestIds });
        if (res.data.success && res.data.data.length > 0) {
          let updatedNotifs = [...notifications];
          let updated = false;

          res.data.data.forEach((item) => {
            // Find and remove from localStorage list
            const idx = list.findIndex(r => r.id === item.id);
            if (idx !== -1) {
              list.splice(idx, 1);
            }

            // Push notification to notifications menu
            if (!updatedNotifs.some((n) => n.id === item.id)) {
              updatedNotifs.unshift({
                id: item.id,
                message: `🎉 Your requested demo "${item.demoName}" is live now!`,
                read: false,
                timestamp: new Date().toISOString()
              });
              updated = true;

              playNotificationSound();

              setToasts((prev) => [
                ...prev,
                {
                  id: item.id,
                  message: `Your requested demo "${item.demoName}" is live now!`,
                  desc: 'The template is now registered and active on the showcase page.',
                },
              ]);

              setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== item.id));
              }, 10000);

              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification('Demo Request Live! 🚀', {
                    body: `Your requested demo "${item.demoName}" is now live.`,
                    icon: '/favicon.png',
                  });
                } catch (err) {
                  console.error('Browser Notification trigger error:', err);
                }
              }
            }
          });

          localStorage.setItem('submitted_demo_requests', JSON.stringify(list));

          if (updated) {
            setNotifications(updatedNotifs);
            localStorage.setItem('demo_notifications', JSON.stringify(updatedNotifs));
          }
        }
      } catch (err) {
        console.error('Check demo requests status error:', err);
      }
    };

    checkDemoRequestsStatus();
    const interval = setInterval(checkDemoRequestsStatus, 8000);
    return () => clearInterval(interval);
  }, [notifications]);

  const handleNotificationClick = async (notif) => {
    // Mark as read
    const updated = notifications.map((n) =>
      n.id === notif.id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('demo_notifications', JSON.stringify(updated));

    // Clear matching toast if visible
    setToasts((prev) => prev.filter((t) => t.id !== notif.id));

    // Fetch latest active details of the site
    try {
      const res = await axios.get(`${API_BASE}/demo-sites/${notif.siteId}`);
      if (res.data.success) {
        handleOpenDetail(res.data.data);
      }
    } catch (err) {
      console.error('Fetch resolved site error:', err);
    }
  };

  const handleClearNotifications = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('demo_notifications', JSON.stringify(updated));
  };

  const handleOpenDetail = (site) => {
    window.location.hash = `#/demo/${site._id}`;
  };

  const handleCloseDetail = () => {
    if (window.location.hash.startsWith('#/demo/')) {
      window.history.back();
    } else {
      window.location.hash = '#/';
    }
  };

  // Pagination for search/filter list view
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch dynamic homepage sections on mount
  const fetchHomepageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/homepage`);
      if (res.data.success) {
        setSections(res.data.data);
      } else {
        setError('Failed to retrieve homepage layout.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to backend server. Make sure MERN API is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories in client:', err);
    }
  };

  const fetchCategoryTree = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories/tree`);
      if (res.data.success) {
        setCategoryTree(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load category tree:', err);
    }
  };

  // Hash change routing synchronizer
  useEffect(() => {
    const handleHashChange = async () => {
      const currentHash = window.location.hash || '#/';
      if (currentHash === lastProcessedHashRef.current) {
        return;
      }
      lastProcessedHashRef.current = currentHash;

      const { path, params } = parseHash();

      if (path.startsWith('#/demo/')) {
        const id = path.replace('#/demo/', '');
        if (!selectedSite || selectedSite._id !== id) {
          setLoading(true);
          try {
            const res = await axios.get(`${API_BASE}/demo-sites/${id}`);
            if (res.data.success) {
              setSelectedSite(res.data.data);
            } else {
              setSelectedSite(null);
            }
          } catch (err) {
            console.error('Hash routing fetch error:', err);
            setSelectedSite(null);
          } finally {
            setLoading(false);
          }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSelectedSite(null);

        if (path === '#/client-demos') {
          const p = parseInt(params.page) || 1;
          setShowClientDemos(true);
          setShowAllProducts(false);
          setSearchQuery('');
          setActiveCategory('');
          setActiveSubcategory('All Items');
          setPage(p);
          fetchClientDemos(p);
        } else if (path === '#/products') {
          const p = parseInt(params.page) || 1;
          setShowClientDemos(false);
          setShowAllProducts(true);
          setSearchQuery('');
          setActiveCategory('');
          setActiveSubcategory('All Items');
          setPage(p);
          fetchFilteredItems('', 'All Items', 'All Items', p);
        } else if (path === '#/search') {
          const q = params.q || '';
          const p = parseInt(params.page) || 1;
          setShowClientDemos(false);
          setShowAllProducts(false);
          setSearchQuery(q);
          setActiveCategory('');
          setActiveSubcategory('All Items');
          setPage(p);
          fetchFilteredItems(q, '', 'All Items', p);
        } else if (path === '#/category') {
          const cat = params.name || '';
          const p = parseInt(params.page) || 1;
          setShowClientDemos(false);
          setShowAllProducts(false);
          setSearchQuery('');
          setActiveCategory(cat);
          setActiveSubcategory(cat);
          setPage(p);
          fetchFilteredItems('', cat, cat, p);
        } else {
          // Home '#/'
          setShowClientDemos(false);
          setShowAllProducts(false);
          setSearchQuery('');
          setActiveCategory('');
          setActiveSubcategory('All Items');
          setPage(1);
          fetchHomepageData();
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on initial mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedSite]); // Add selectedSite so that clicking details page links forces updates properly

  useEffect(() => {
    fetchCategories();
    fetchCategoryTree();
  }, []);

  // Fetch catalog item listings for search or category filtering
  const fetchFilteredItems = async (currentQuery = searchQuery, currentCategory = activeCategory, currentSub = activeSubcategory, currentPage = page) => {
    setItemsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 9,
      };

      if (currentQuery) {
        params.search = currentQuery;
      }
      
      const cat = currentSub !== 'All Items' ? currentSub : (currentCategory && currentCategory !== 'All Items' ? currentCategory : '');
      if (cat) {
        params.category = cat;
      }

      const res = await axios.get(`${API_BASE}/demo-sites`, { params });

      if (res.data.success) {
        setFilteredItems(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
  };

  const fetchClientDemos = async (currentPage = page) => {
    setItemsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 9,
        isClientDemo: true,
        isActive: true
      };

      const res = await axios.get(`${API_BASE}/demo-sites`, { params });

      if (res.data.success) {
        setFilteredItems(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalCount(res.data.pagination.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
  };

  // Triggered when searching from Hero Search Bar
  const handleSearch = (query) => {
    if (query) {
      window.location.hash = `#/search?q=${encodeURIComponent(query)}&page=1`;
    } else {
      window.location.hash = '#/';
    }
  };

  // Triggered when selecting top navigation category tabs
  const handleCategoryChange = (category) => {
    if (category && category !== 'All Items') {
      window.location.hash = `#/category?name=${encodeURIComponent(category)}&page=1`;
    } else {
      window.location.hash = '#/';
    }
  };

  // Triggered when selecting subcategory pills
  const handleSubcategoryChange = (sub) => {
    if (sub && sub !== 'All Items') {
      window.location.hash = `#/category?name=${encodeURIComponent(sub)}&page=1`;
    } else {
      window.location.hash = '#/';
    }
  };

  // Reset filters to load default homepage layout sections
  const handleResetFilters = () => {
    window.location.hash = '#/';
  };

  // Triggered when user clicks "Our Products" in Header
  const handleShowAllProducts = () => {
    window.location.hash = '#/products?page=1';
  };

  // Triggered when user clicks "Client Demos" in Header
  const handleShowClientDemos = () => {
    window.location.hash = '#/client-demos?page=1';
  };

  // Handle page shifts in list grid
  const handlePageChange = (newPage) => {
    const { path, params } = parseHash();
    if (path === '#/products') {
      window.location.hash = `#/products?page=${newPage}`;
    } else if (path === '#/client-demos') {
      window.location.hash = `#/client-demos?page=${newPage}`;
    } else if (path === '#/search') {
      window.location.hash = `#/search?q=${encodeURIComponent(params.q || '')}&page=${newPage}`;
    } else if (path === '#/category') {
      window.location.hash = `#/category?name=${encodeURIComponent(params.name || '')}&page=${newPage}`;
    } else {
      window.location.hash = `#/products?page=${newPage}`;
    }
  };

  // Determine if showing listing results vs dynamic homepage sections
  const isListView = showAllProducts || showClientDemos || !!searchQuery || (activeCategory && activeCategory !== 'All Items') || activeSubcategory !== 'All Items';

  if (!token) {
    return (
      <div className="login-page-container" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
      }}>
        {/* Glow circles */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 85, 255, 0.08) 0%, transparent 70%)',
          top: '-15%',
          right: '-10%',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 85, 255, 0.06) 0%, transparent 70%)',
          bottom: '-15%',
          left: '-10%',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div className="login-card" style={{
          padding: '40px',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '400px',
          background: '#ffffff',
          border: '1px solid rgba(0, 85, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 85, 255, 0.06)',
          textAlign: 'center',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Custom MetaBlock Logo Image */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img 
              src={logoImg} 
              alt="MetaBlock" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block' }} 
            />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Client Portal Login</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '30px' }}>
            Enter your credentials to access the portfolio showcase
          </p>

          {loginError && (
            <div style={{
              background: 'rgba(255, 77, 77, 0.08)',
              border: '1px solid rgba(255, 77, 77, 0.18)',
              borderRadius: '8px',
              padding: '10px 15px',
              color: '#ff4d4d',
              fontSize: '0.85rem',
              textAlign: 'left',
              marginBottom: '20px',
              fontWeight: 500
            }}>
              {loginError}
            </div>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault();
            setLoginError('');
            setLoginLoading(true);
            try {
              const res = await handleClientLogin(loginUsername, loginPassword);
              if (res.success) {
                window.location.hash = '#/';
              } else {
                setLoginError(res.message || 'Invalid username or password.');
              }
            } catch (err) {
              setLoginError(err.response?.data?.message || 'Failed to connect to backend service.');
            } finally {
              setLoginLoading(false);
            }
          }} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Username or Email
              </label>
              <input
                type="text"
                placeholder="superadmin or client_metablock"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <button type="submit" disabled={loginLoading} style={{
              width: '100%',
              padding: '14px',
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background 0.2s'
            }}>
              {loginLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Entering Showcase...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Dynamic Header & Category bars */}
      <Header 
        user={user}
        onLogout={handleClientLogout}
        menuData={categoryTree} 
        onSearch={handleSearch} 
        onShowAllProducts={handleShowAllProducts} 
        onShowClientDemos={handleShowClientDemos}
        onProductClick={handleOpenDetail} 
        onLogoClick={handleResetFilters}
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
        onClearNotifications={handleClearNotifications}
        onRequestDemoClick={() => setIsRequestDemoModalOpen(true)}
      />


      <main style={{ flex: '1' }}>
        {/* ── DETAIL PAGE VIEW ── */}
        {selectedSite ? (
          <DemoSiteDetailPage 
            site={selectedSite} 
            onBack={handleCloseDetail} 
            onPreviewClick={setModalSite} 
            onFeedbackClick={handleRegisterFeedback}
          />
        ) : loading ? (
          <div className="spinner-wrapper">
            <Loader2 className="spinner" size={48} />
            <p style={{ fontWeight: '600' }}>
              {window.location.hash.startsWith('#/demo/') 
                ? 'Retrieving template details...' 
                : 'Retrieving dynamic homepage layouts...'}
            </p>
          </div>
        ) : error ? (
          <div className="homepage-container" style={{ padding: '80px 40px', textAlign: 'center' }}>
            <div className="glass-card" style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
              <Database size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <h2 style={{ marginBottom: '10px' }}>Connection Error</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{error}</p>
              <button onClick={fetchHomepageData} className="btn btn-primary">
                Try Reconnecting
              </button>
            </div>
          </div>
        ) : isListView ? (
          /* LIST RESULTS GRID VIEW (Search / Filter Active) */
          <div className="homepage-container" style={{ padding: '60px 40px' }}>
            <div className="featured-grid-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
                <div>
                  <span className="section-tag">MetaBlock Showcase Catalog</span>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
                    {searchQuery 
                      ? `Search Results for "${searchQuery}"` 
                      : (showClientDemos ? `Client Demos` : (activeCategory ? `${activeCategory} templates` : `Listing matching items`))}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
                    {showClientDemos 
                      ? 'Explore our collection of custom client demos and presentations.'
                      : `Found ${totalCount} professional presentations matching criteria.`}
                  </p>
                </div>
                <button onClick={handleResetFilters} className="btn btn-primary">
                  Back to Homepage
                </button>
              </div>

              {itemsLoading ? (
                <div className="spinner-wrapper" style={{ minHeight: '40vh' }}>
                  <Loader2 className="spinner" size={40} />
                  <p>Retrieving catalog matches...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="glass-card" style={{ padding: '80px 40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
                  <Search size={40} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                  <h3>No Matching Presentations Found</h3>
                  <p style={{ color: 'var(--text-muted)', margin: '8px 0 24px 0' }}>
                    No demo sites match the query "{searchQuery || activeCategory || activeSubcategory}".
                  </p>
                  <button onClick={handleResetFilters} className="btn btn-primary">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* 3-Column Listings Grid */}
                  <div className="featured-items-grid">
                    {filteredItems.map((item) => (
                      <ShowcaseItemCard 
                        key={item._id} 
                        site={item} 
                        onCardClick={handleOpenDetail} 
                        onPreviewClick={setModalSite}
                        onFeedbackClick={handleRegisterFeedback}
                      />
                    ))}
                  </div>

                  {/* Listing Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination-wrapper" style={{ marginTop: '50px' }}>
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft size={16} />
                        <span>Prev</span>
                      </button>
                      <div className="pagination-info">
                        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                      </div>
                      <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >
                        <span>Next</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* DEFAULT HOMEPAGE SECTIONS VIEW (Fully Dynamic from DB) */
          <>
            {/* 1. Dynamic Hero Search section */}
            {(() => {
              const heroSec = (sections || []).find(sec => sec.type === 'hero');
              const heroTag = heroSec?.metadata?.tag || 'MetaBlock Presentation Portal';
              const heroTitle = heroSec?.title || 'Demonstrating Solutions That Drive Results';
              const heroDesc = heroSec?.subtitle || 'A curated space of live demos and projects, built to showcase how technology solves real business problems.';
              const heroPlaceholder = heroSec?.metadata?.placeholder || 'e.g. blockchain, game development, eCommerce platform...';

              return (
                <section className="hero-search-section">
                  <div className="hero-search-content reveal-up revealed">
                    <span className="section-tag">{heroTag}</span>
                    <h1 className="hero-title">{heroTitle}</h1>
                    <p className="hero-description">{heroDesc}</p>

                    {/* Hero Form Search widget */}
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const val = e.target.search.value;
                      if (val.trim()) handleSearch(val.trim());
                    }} className="search-bar-form">
                      <input
                        type="text"
                        name="search"
                        className="search-input"
                        placeholder={heroPlaceholder}
                      />
                      <button type="submit" className="search-btn">
                        <Search size={18} />
                        <span>Search</span>
                      </button>
                    </form>
                  </div>

                  {/* Dynamic Hero Card Stack — real images from backend */}
                  <HeroCardStack sections={sections} onCardClick={handleOpenDetail} />
                </section>
              );
            })()}

            {/* 2. Custom dynamic content sections populated from MERN */}
            <HomepageSections 
              sections={sections} 
              categories={categories}
              onCategorySelect={handleCategoryChange}
              onSearchClear={handleResetFilters}
              onCardClick={handleOpenDetail}
              onShowAllProducts={handleShowAllProducts}
              onPreviewClick={setModalSite}
              onFeedbackClick={handleRegisterFeedback}
            />
          </>
        )}
      </main>

      {/* MetaBlock Theme-aligned Footer */}
      <footer className="client-footer">
        <div className="footer-top">
          <div className="footer-desc-column">
            <img 
              src={logoImg} 
              alt="MetaBlock" 
              style={{ height: '42px', width: 'auto', objectFit: 'contain', marginBottom: '16px' }} 
            />
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6' }}>
              MetaBlock delivers advanced blockchain, dynamic Web3 templates, and custom React demonstration layers for enterprise administrators. We empower companies to deploy portfolio presentations that wow clients instantly.
            </p>
          </div>

          <div className="footer-links-column">
            <h4 className="footer-column-title">Products</h4>
            {categories.filter(cat => !cat.parentCategory).map((cat) => (
              <a
                key={cat._id}
                href={`#${cat.name.toLowerCase()}`}
                className="footer-link"
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedSite(null);
                  handleCategoryChange(cat.name);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {cat.name}
              </a>
            ))}
          </div>

          <div className="footer-links-column">
            <h4 className="footer-column-title">Official Site</h4>
            <a href="#" className="footer-link">Schedule Google Meet</a>
            <a href="#" className="footer-link">WhatsApp Live Chat</a>
            <a href="tel:+919358593003" className="footer-link">Call +91-93585-93003</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} MetaBlock Technology Development Ltd. All rights reserved.</span>
          <span>MetaBlock, theme, code, and graphic presentations are properties of MetaBlock Tech.</span>
        </div>
      </footer>

      {/* Access Credentials & Portals Modal */}
      {modalSite && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(3, 6, 11, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div className="credentials-modal-content glass-card" style={{
            maxWidth: '850px',
            width: '92%',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
            border: '1px solid rgba(0, 85, 255, 0.15)',
            boxShadow: '0 24px 70px rgba(15, 23, 42, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            padding: '24px 28px',
            position: 'relative',
            boxSizing: 'border-box',
            animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              .portal-col-premium {
                background: #ffffff;
                border: 1px solid rgba(15, 23, 42, 0.08);
                border-radius: 16px;
                padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 20px;
                justify-content: space-between;
                box-sizing: border-box;
                min-width: 0;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
              }
              .portal-col-premium:hover {
                background: #ffffff;
                border-color: rgba(0, 85, 255, 0.3);
                transform: translateY(-2px);
                box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
              }
              .launch-btn-premium {
                width: 100%; 
                margin: 0; 
                padding: 12px 24px; 
                font-size: 0.85rem;
                border: none;
                color: #fff;
                border-radius: 10px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.25s ease;
              }
              .launch-btn-premium.frontend {
                background: linear-gradient(135deg, #0066ff 0%, #0044cc 100%);
                box-shadow: 0 4px 15px rgba(0, 102, 255, 0.35);
              }
              .launch-btn-premium.frontend:hover {
                background: linear-gradient(135deg, #3385ff 0%, #005eff 100%);
                box-shadow: 0 6px 20px rgba(0, 102, 255, 0.5);
                transform: scale(1.02);
              }
              .launch-btn-premium.admin {
                background: linear-gradient(135deg, #0066ff 0%, #0044cc 100%);
                box-shadow: 0 4px 15px rgba(0, 102, 255, 0.35);
              }
              .launch-btn-premium.admin:hover {
                background: linear-gradient(135deg, #3385ff 0%, #005eff 100%);
                box-shadow: 0 6px 20px rgba(0, 102, 255, 0.5);
                transform: scale(1.02);
              }
              .launch-btn-premium.apk {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
              }
              .launch-btn-premium.apk:hover {
                background: linear-gradient(135deg, #34d399 0%, #059669 100%);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
                transform: scale(1.02);
              }
              .credentials-list-scroll::-webkit-scrollbar {
                width: 4px;
              }
              .credentials-list-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .credentials-list-scroll::-webkit-scrollbar-thumb {
                background: rgba(15, 23, 42, 0.1);
                border-radius: 2px;
              }
              .credentials-list-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(15, 23, 42, 0.25);
              }
              .credentials-modal-content::-webkit-scrollbar {
                width: 6px;
              }
              .credentials-modal-content::-webkit-scrollbar-track {
                background: transparent;
              }
              .credentials-modal-content::-webkit-scrollbar-thumb {
                background: rgba(15, 23, 42, 0.12);
                border-radius: 3px;
              }
              .credentials-modal-content::-webkit-scrollbar-thumb:hover {
                background: rgba(15, 23, 42, 0.25);
              }
            `}</style>
 
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid var(--border-color)', paddingBottom: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Demo Access Portals</h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Copy credentials and launch the live application segment</p>
              </div>
              <button 
                onClick={() => setModalSite(null)}
                style={{
                  background: 'var(--secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--secondary)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: modalSite.adminLink ? 'repeat(2, minmax(0, 1fr))' : '1fr', gap: '24px' }}>
              
              <div className="portal-col-premium">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 8px var(--primary)' }}></span>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Frontend Site</h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Client interface and user-facing experience</p>
                  
                  {modalSite.frontendRoleCredentials && modalSite.frontendRoleCredentials.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Access Credentials (Role-Based):</span>
                      <div className="credentials-list-scroll" style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '6px' }}>
                        {modalSite.frontendRoleCredentials.map((roleCred, idx) => {
                          const parsed = roleCred.username || roleCred.password ? { username: roleCred.username || '', password: roleCred.password || '' } : parseCredentials(roleCred.credentials);
                          const hasRoleSpecificUrls = modalSite.frontendRoleCredentials.some(r => r.liveDemoLink && r.liveDemoLink.trim() !== '');
                          const currentLink = roleCred.liveDemoLink?.trim() || modalSite.liveDemoLink?.trim() || modalSite.adminLink?.trim() || modalSite.scriptLink?.trim();
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-darker)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.02em' }}>{roleCred.role}</span>
                              <CredentialBlock 
                                username={parsed.username}
                                password={parsed.password}
                                onCopyUser={() => {
                                  navigator.clipboard.writeText(parsed.username);
                                  setCopiedKeys(prev => ({ ...prev, [`role_user_${idx}`]: true }));
                                  setTimeout(() => setCopiedKeys(prev => ({ ...prev, [`role_user_${idx}`]: false })), 2000);
                                }}
                                isUserCopied={copiedKeys[`role_user_${idx}`]}
                                onCopyPass={() => {
                                  navigator.clipboard.writeText(parsed.password);
                                  setCopiedKeys(prev => ({ ...prev, [`role_pass_${idx}`]: true }));
                                  setTimeout(() => setCopiedKeys(prev => ({ ...prev, [`role_pass_${idx}`]: false })), 2000);
                                }}
                                isPassCopied={copiedKeys[`role_pass_${idx}`]}
                              />
                              {currentLink && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Portal Link</span>
                                  <a 
                                    href={currentLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all', textDecoration: 'none' }}
                                  >
                                    <span>{currentLink}</span>
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                {roleCred.apkFile && (
                                  <a
                                    href={roleCred.apkFile.startsWith('http') ? roleCred.apkFile : `${SERVER_BASE}/${roleCred.apkFile}`}
                                    download={`${(modalSite?.title || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-')}${roleCred.role ? '-' + roleCred.role.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''}.apk`}
                                    className="launch-btn-premium apk"
                                    style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'fit-content', textDecoration: 'none' }}
                                  >
                                    <Download size={12} />
                                    <span>Download APK</span>
                                  </a>
                                )}
                                {hasRoleSpecificUrls && currentLink && (
                                  <a
                                    href={currentLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="launch-btn-premium frontend"
                                    style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'fit-content', textDecoration: 'none' }}
                                  >
                                    <ExternalLink size={12} />
                                    <span>Launch Site</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (modalSite.frontendCredentials && (parseCredentials(modalSite.frontendCredentials).username || parseCredentials(modalSite.frontendCredentials).password)) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Access Credentials:</span>
                      {(() => {
                        const parsed = parseCredentials(modalSite.frontendCredentials);
                        const effectiveLink = modalSite.liveDemoLink?.trim() || modalSite.adminLink?.trim() || modalSite.scriptLink?.trim();
                        return (
                          <>
                            <CredentialBlock 
                              username={parsed.username}
                              password={parsed.password}
                              onCopyUser={() => {
                                navigator.clipboard.writeText(parsed.username);
                                setCopiedFrontUser(true);
                                setTimeout(() => setCopiedFrontUser(false), 2000);
                              }}
                              isUserCopied={copiedFrontUser}
                              onCopyPass={() => {
                                navigator.clipboard.writeText(parsed.password);
                                setCopiedFrontPass(true);
                                setTimeout(() => setCopiedFrontPass(false), 2000);
                              }}
                              isPassCopied={copiedFrontPass}
                            />
                            {effectiveLink && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Portal Link</span>
                                <a 
                                  href={effectiveLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all', textDecoration: 'none' }}
                                >
                                  <span>{effectiveLink}</span>
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-darker)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                      No login credentials required
                    </div>
                  )}
                </div>

                {(() => {
                  const effectiveLink = modalSite.liveDemoLink?.trim() || (modalSite.frontendRoleCredentials && modalSite.frontendRoleCredentials.find(r => r.liveDemoLink && r.liveDemoLink.trim())?.liveDemoLink) || modalSite.adminLink?.trim() || modalSite.scriptLink?.trim();
                  return (!modalSite.frontendRoleCredentials || modalSite.frontendRoleCredentials.length === 0 || !modalSite.frontendRoleCredentials.some(r => r.liveDemoLink && r.liveDemoLink.trim() !== '')) && effectiveLink ? (
                    <a
                      href={effectiveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="launch-btn-premium frontend"
                      style={{ marginTop: '16px' }}
                    >
                      <ExternalLink size={14} />
                      <span>Launch Site</span>
                    </a>
                  ) : null;
                })()}
              </div>

              {modalSite.adminLink && (
                <div className="portal-col-premium">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ width: '8px', height: '8px', background: '#ff4d4d', borderRadius: '50%', boxShadow: '0 0 8px #ff4d4d' }}></span>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>Admin Site</h4>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Management console and analytics control</p>
                    
                    {(modalSite.adminCredentials && (parseCredentials(modalSite.adminCredentials).username || parseCredentials(modalSite.adminCredentials).password || parseCredentials(modalSite.adminCredentials).apkFile)) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Access Credentials:</span>
                        {(() => {
                          const parsed = parseCredentials(modalSite.adminCredentials);
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <CredentialBlock 
                                username={parsed.username}
                                password={parsed.password}
                                onCopyUser={() => {
                                  navigator.clipboard.writeText(parsed.username);
                                  setCopiedAdminUser(true);
                                  setTimeout(() => setCopiedAdminUser(false), 2000);
                                }}
                                isUserCopied={copiedAdminUser}
                                onCopyPass={() => {
                                  navigator.clipboard.writeText(parsed.password);
                                  setCopiedAdminPass(true);
                                  setTimeout(() => setCopiedAdminPass(false), 2000);
                                }}
                                isPassCopied={copiedAdminPass}
                              />
                              {modalSite.adminLink && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Portal Link</span>
                                  <a 
                                    href={modalSite.adminLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all', textDecoration: 'none' }}
                                  >
                                    <span>{modalSite.adminLink}</span>
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              )}
                              {parsed.apkFile && (
                                <a
                                  href={parsed.apkFile.startsWith('http') ? parsed.apkFile : `${SERVER_BASE}/${parsed.apkFile}`}
                                  download={`${(modalSite?.title || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-admin.apk`}
                                  className="launch-btn-premium apk"
                                  style={{ marginTop: '4px', padding: '6px 12px', fontSize: '0.75rem', height: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'fit-content', textDecoration: 'none' }}
                                >
                                  <Download size={12} />
                                  <span>Download APK</span>
                                </a>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-darker)', padding: '12px', borderRadius: '10px', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                          No login credentials required
                        </div>
                        {modalSite.adminLink && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Portal Link</span>
                            <a 
                              href={modalSite.adminLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all', textDecoration: 'none' }}
                            >
                              <span>{modalSite.adminLink}</span>
                              <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
 
                  <a
                    href={modalSite.adminLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="launch-btn-premium admin"
                    style={{ marginTop: '20px' }}
                  >
                    <ExternalLink size={14} />
                    <span>Launch Admin</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Demo Modal Overlay */}
      <RequestDemoModal
        isOpen={isRequestDemoModalOpen}
        onClose={() => setIsRequestDemoModalOpen(false)}
        onSubmit={handleRequestDemoSubmit}
        username={user?.username}
      />

      {/* Feedback Modal Overlay */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        site={feedbackSite}
        onSubmit={handleFeedbackModalSubmit}
      />

      {/* Visual Floating Toast Notifications */}
      {toasts.length > 0 && (
        <div className="client-toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className="client-toast-card">
              <div className="client-toast-header">
                <div className="client-toast-title-row">
                  <span className="client-toast-dot"></span>
                  <span className="client-toast-title">Problem Solved! 🛠️</span>
                </div>
                <button 
                  className="client-toast-close" 
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                >
                  &times;
                </button>
              </div>
              <div className="client-toast-body">
                <h5 className="client-toast-msg">{toast.message}</h5>
                <p className="client-toast-desc">{toast.desc}</p>
              </div>
              <div className="client-toast-actions">
                <button 
                  onClick={async () => {
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                    // Fetch latest active details and open detail view
                    try {
                      const res = await axios.get(`${API_BASE}/demo-sites/${toast.siteId}`);
                      if (res.data.success) {
                        handleOpenDetail(res.data.data);
                      }
                    } catch (err) {
                      console.error('Fetch resolved site error:', err);
                    }
                  }}
                  className="client-toast-btn"
                >
                  View Live Site
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
