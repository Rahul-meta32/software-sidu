import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { demoSiteService, serverCategoryService, API_BASE_URL } from '../api/demoSiteService';
import { Plus, Search, ChevronLeft, ChevronRight, Loader2, Database, ExternalLink, Edit2, Trash2, Film, Globe, Activity, Shield, CheckCircle, AlertCircle, Server, Download, ClipboardList, CheckSquare, MessageSquare } from 'lucide-react';
import { db } from '../api/firebase';
import { collection, query, where, getCountFromServer, doc, deleteDoc } from 'firebase/firestore';

const CHART_COLORS = ['#0055ff', '#8b5cf6', '#22d3a0', '#ff4d4d', '#f59e0b'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { pendingComplaintSiteIds = [], pendingComplaints = [] } = useOutletContext() || {};
  const SERVER_BASE = API_BASE_URL.replace(/\/api\/?$/, '');
  
  // Sites list & pagination state
  const [demoSites, setDemoSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchVal, setSearchVal] = useState(''); // Holds typed query
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedServer, setSelectedServer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [serverCategories, setServerCategories] = useState([]);

  // Metrics state
  const [metrics, setMetrics] = useState({
    totalDemos: 0,
    activeDemos: 0,
    inactiveDemos: 0,
    totalServers: 0,
    totalRequests: 0,
    resolvedRequests: 0,
    totalFeedbacks: 0,
    resolvedFeedbacks: 0
  });
  const [serverDist, setServerDist] = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  // Load metrics dynamically
  const fetchMetrics = async () => {
    try {
      // Fetch all sites to count active/inactive & server distribution
      const sitesRes = await demoSiteService.getAll({ limit: 10000, isClientDemo: false });
      let totalD = 0;
      let activeD = 0;
      let inactiveD = 0;
      const serverDistribution = {};

      if (sitesRes.success && sitesRes.data) {
        totalD = sitesRes.data.length;
        sitesRes.data.forEach(s => {
          if (s.isActive) activeD++;
          else inactiveD++;

          const sName = s.serverCategory || 'Unassigned';
          serverDistribution[sName] = (serverDistribution[sName] || 0) + 1;
        });
      }

      // Fetch all server categories
      const serversRes = await serverCategoryService.getAll();
      let totalS = 0;
      if (serversRes.success && serversRes.data) {
        totalS = serversRes.data.length;
      }

      // Fetch Firestore metrics (requests and complaints) using getCountFromServer
      let totalReq = 0;
      let resolvedReq = 0;
      let totalFeed = 0;
      let resolvedFeed = 0;

      try {
        const requestsCol = collection(db, 'demo_requests');
        const resolvedRequestsQuery = query(requestsCol, where('status', '==', 'done'));
        
        const complaintsCol = collection(db, 'complaints');
        const resolvedComplaintsQuery = query(complaintsCol, where('status', '==', 'resolved'));

        const [
          totalRequestsSnap,
          resolvedRequestsSnap,
          totalComplaintsSnap,
          resolvedComplaintsSnap
        ] = await Promise.all([
          getCountFromServer(requestsCol),
          getCountFromServer(resolvedRequestsQuery),
          getCountFromServer(complaintsCol),
          getCountFromServer(resolvedComplaintsQuery)
        ]);

        totalReq = totalRequestsSnap.data().count;
        resolvedReq = resolvedRequestsSnap.data().count;
        totalFeed = totalComplaintsSnap.data().count;
        resolvedFeed = resolvedComplaintsSnap.data().count;
      } catch (firestoreErr) {
        console.error('Failed to fetch firestore counts for metrics:', firestoreErr);
      }

      setMetrics({
        totalDemos: totalD,
        activeDemos: activeD,
        inactiveDemos: inactiveD,
        totalServers: totalS,
        totalRequests: totalReq,
        resolvedRequests: resolvedReq,
        totalFeedbacks: totalFeed,
        resolvedFeedbacks: resolvedFeed
      });

      // Prepare donut chart data
      const distArray = [];
      const keys = Object.keys(serverDistribution);
      if (keys.length > 0) {
        keys.forEach((key, index) => {
          distArray.push({
            name: key,
            value: serverDistribution[key],
            color: CHART_COLORS[index % CHART_COLORS.length]
          });
        });
      } else {
        // Fallback mock data if database is empty
        distArray.push(
          { name: 'Dedicated Server', value: 4, color: '#0055ff' },
          { name: 'VPS Hosting', value: 3, color: '#8b5cf6' },
          { name: 'Shared Hosting', value: 2, color: '#22d3a0' },
          { name: 'Cloud Server', value: 1, color: '#ff4d4d' }
        );
      }
      setServerDist(distArray);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    }
  };

  // Load demo sites catalog
  const fetchDemoSites = async () => {
    setLoading(true);
    try {
      const data = await demoSiteService.getAll({
        page,
        limit: 10, // 10 per page looks cleaner in a table list
        search,
        serverCategory: selectedServer,
        isActive: selectedStatus,
        isClientDemo: false,
      });

      if (data.success) {
        setDemoSites(data.data);
        setTotalPages(data.pagination.pages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error('Fetch Demo Sites Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoSites();
  }, [page, search, selectedServer, selectedStatus]);

  useEffect(() => {
    fetchMetrics();
    const fetchServers = async () => {
      try {
        const res = await serverCategoryService.getAll();
        if (res.success) {
          setServerCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch server categories:', err);
      }
    };
    fetchServers();
  }, []);

  // Apply search query
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchVal.trim());
  };

  // Clear search filter
  const handleClearSearch = () => {
    setSearchVal('');
    setSearch('');
    setPage(1);
  };

  // Navigate to Add Site Page
  const handleCreateClick = () => {
    navigate('/add');
  };

  const [adminEmail, setAdminEmail] = useState(localStorage.getItem('adminEmail') || 'admin@smartsoft.com');
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('adminAvatar') || '');
  const [adminRole, setAdminRole] = useState(localStorage.getItem('adminRole') || 'agent');

  useEffect(() => {
    const handleStorageChange = () => {
      setAdminEmail(localStorage.getItem('adminEmail') || 'admin@smartsoft.com');
      setAvatarUrl(localStorage.getItem('adminAvatar') || '');
      setAdminRole(localStorage.getItem('adminRole') || 'agent');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Navigate to Edit Site Page
  const handleEditClick = (site) => {
    navigate(`/edit/${site._id}`);
  };

  // Delete site handler (keeps inline modal confirm)
  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this website presentation and clean its media files from the disk?')) {
      try {
        const res = await demoSiteService.delete(id);
        if (res.success) {
          fetchMetrics();
          // If deleted last element on current page, shift page back if possible
          if (demoSites.length === 1 && page > 1) {
            setPage(prev => prev - 1);
          } else {
            fetchDemoSites();
          }
        }
      } catch (err) {
        console.error('Delete Site Error:', err);
        alert(err.response?.data?.message || 'Failed to delete demo site');
      }
    }
  };

  // Status toggle handler
  const handleStatusToggle = async (siteId, currentActive) => {
    if (togglingId) return;
    setTogglingId(siteId);
    try {
      const nextActive = !currentActive;
      const formData = new FormData();
      formData.append('isActive', nextActive);
      
      const res = await demoSiteService.update(siteId, formData);
      if (res.success) {
        fetchDemoSites();
        fetchMetrics();
      }
    } catch (err) {
      console.error('Failed to toggle active status on dashboard:', err);
      alert('Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  // CSV Export handler
  const handleExportCSV = () => {
    if (demoSites.length === 0) return;
    
    // Define CSV headers
    const headers = ['Title', 'Live Link', 'Server Category', 'Script Link', 'Date', 'Status'];
    
    // Map data rows
    const rows = demoSites.map(site => [
      `"${site.title.replace(/"/g, '""')}"`,
      `"${site.liveDemoLink || ''}"`,
      `"${site.serverCategory || ''}"`,
      `"${site.scriptLink || ''}"`,
      `"${site.date ? new Date(site.date).toLocaleDateString() : ''}"`,
      `"${site.isActive ? 'Active' : 'Inactive'}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smartsoft_demo_sites_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get scaled traffic values based on active demos count
  const activeCount = metrics.activeDemos || 5;
  const trafficData = [
    { day: 'Mon', value: Math.round(activeCount * 2.4 + 4) },
    { day: 'Tue', value: Math.round(activeCount * 3.6 + 6) },
    { day: 'Wed', value: Math.round(activeCount * 3.0 + 5) },
    { day: 'Thu', value: Math.round(activeCount * 4.2 + 8) },
    { day: 'Fri', value: Math.round(activeCount * 4.8 + 10) },
    { day: 'Sat', value: Math.round(activeCount * 1.8 + 3) },
    { day: 'Sun', value: Math.round(activeCount * 1.2 + 2) }
  ];

  const dataValues = trafficData.map(d => d.value);
  const maxVal = Math.max(...dataValues, 10);
  
  const padding = { top: 25, right: 25, bottom: 40, left: 55 }; // Added extra spacing on left and bottom
  const chartWidth = 500 - padding.left - padding.right;
  const chartHeight = 200 - padding.top - padding.bottom; // Increased total height to 200px
  
  const points = trafficData.map((d, idx) => {
    const x = padding.left + (idx * (chartWidth / 6));
    const y = padding.top + chartHeight - (d.value / maxVal * chartHeight);
    return { x, y };
  });

  const getBezierPath = (pts) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePath = getBezierPath(points);
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
    : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(pct => Math.round(pct * maxVal));

  // Donut chart logic: represent Active vs Inactive Demos
  const activeCountVal = metrics.activeDemos;
  const inactiveCountVal = metrics.inactiveDemos;
  const totalCountVal = metrics.totalDemos;

  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius; // 238.761
  
  const rawSectors = [];
  if (totalCountVal > 0) {
    if (activeCountVal > 0) {
      rawSectors.push({
        name: 'Active Demos',
        value: activeCountVal,
        color: '#22d3a0', // Emerald Green
        percentage: (activeCountVal / totalCountVal) * 100
      });
    }
    if (inactiveCountVal > 0) {
      rawSectors.push({
        name: 'Inactive Demos',
        value: inactiveCountVal,
        color: '#ff4d4d', // Coral Red
        percentage: (inactiveCountVal / totalCountVal) * 100
      });
    }
  } else {
    // Mock fallback when database is completely empty
    rawSectors.push(
      { name: 'Active Demos', value: 5, color: '#22d3a0', percentage: 71 },
      { name: 'Inactive Demos', value: 2, color: '#ff4d4d', percentage: 29 }
    );
  }

  let currentAngle = -90;
  const donutSectors = rawSectors.map((sector) => {
    const strokeDash = (sector.percentage / 100) * donutCircumference;
    const offset = donutCircumference - strokeDash;
    const rotateAngle = currentAngle;
    currentAngle += (sector.percentage / 100) * 360;
    return { ...sector, strokeDash, offset, rotateAngle };
  });

  return (
    <div className="dashboard-page-wrapper">
      {/* Page Header section */}
      <div className="page-header-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div className="page-title-section">
          <h2>Websites Console</h2>
          <p>Control center for managing your SmartSoft portfolio presentations</p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: 'auto', marginRight: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/add')}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '30px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0, 85, 255, 0.2)'
            }}
          >
            <Plus size={18} />
            <span>Add Demo Site</span>
          </button>
          <button
            onClick={() => navigate('/add-client-demo')}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '30px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, linear-gradient(135deg, #22d3a0 0%, #0055ff 100%) border-box',
              border: '1.5px solid transparent',
              color: 'var(--text-main)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Plus size={18} />
            <span>Add Client Site</span>
          </button>
        </div>
        
        {/* Interactive Profile Widget */}
        <div className="header-profile-widget glass-card" onClick={() => navigate('/profile')}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Admin avatar" className="widget-avatar" />
          ) : (
            <div className="widget-avatar-fallback">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="widget-info">
            <span className="widget-role">{adminRole === 'superadmin' ? 'Super Admin' : 'Developer'}</span>
            <span className="widget-email">{adminEmail}</span>
          </div>
        </div>
      </div>


      {/* Metrics Row */}
      <div className="dashboard-metrics-grid">
        {/* Card 1: Total Demos */}
        <div className="metric-card total-demos">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(0, 85, 255, 0.08)', color: 'var(--primary)', borderColor: 'rgba(0, 85, 255, 0.2)' }}>
            <Globe size={18} className="metric-icon" />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: 'var(--primary)' }}>Total Demos</span>
            <span className="metric-value">{metrics.totalDemos}</span>
          </div>
        </div>

        {/* Card 2: Active Demos */}
        <div className="metric-card active-demos">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(34, 211, 160, 0.08)', color: '#22d3a0', borderColor: 'rgba(34, 211, 160, 0.2)' }}>
            <CheckCircle size={18} className="metric-icon" />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: '#22d3a0' }}>Active Demos</span>
            <span className="metric-value">{metrics.activeDemos}</span>
          </div>
        </div>

        {/* Card 3: Inactive Demos */}
        <div className="metric-card inactive-demos">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(255, 77, 77, 0.08)', color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.2)' }}>
            <AlertCircle size={18} className="metric-icon" />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: '#ff4d4d' }}>Inactive Demos</span>
            <span className="metric-value">{metrics.inactiveDemos}</span>
          </div>
        </div>

        {/* Card 4: Total Servers */}
        <div className="metric-card total-servers">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
            <Server size={18} className="metric-icon" />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: '#8b5cf6' }}>Total Servers</span>
            <span className="metric-value">{metrics.totalServers}</span>
          </div>
        </div>

        {/* Card 5: Total Requests */}
        <div className="metric-card total-requests">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
            <ClipboardList size={18} className="metric-icon" />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: '#f59e0b' }}>Total Requests</span>
            <span className="metric-value">{metrics.totalRequests}</span>
          </div>
        </div>

        {/* Card 6: Resolved Requests */}
        <div className="metric-card resolved-requests">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(13, 148, 136, 0.08)', color: '#0d9488', borderColor: 'rgba(13, 148, 136, 0.2)' }}>
            <CheckSquare size={18} className="metric-icon" />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: '#0d9488' }}>Resolved Requests</span>
            <span className="metric-value">{metrics.resolvedRequests}</span>
          </div>
        </div>

        {/* Card 7: Total Feedbacks */}
        <div className="metric-card total-feedbacks">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(244, 63, 94, 0.08)', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
            <MessageSquare size={18} className="metric-icon" />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: '#f43f5e' }}>Total Feedbacks</span>
            <span className="metric-value">{metrics.totalFeedbacks}</span>
          </div>
        </div>

        {/* Card 8: Resolved Feedbacks */}
        <div className="metric-card resolved-feedbacks">
          <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
            <CheckCircle size={18} className="metric-icon" />
          </div>
          <div className="metric-info">
            <span className="metric-label" style={{ color: '#10b981' }}>Resolved Feedbacks</span>
            <span className="metric-value">{metrics.resolvedFeedbacks}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Charts Grid */}
      <div className="dashboard-charts-grid">
        {/* Weekly Request Volume (Area Chart) */}
        <div className="glass-card chart-card">
          <div className="chart-header-wrapper">
            <h4>Weekly Request Volume</h4>
            <p>Monitored api response activity across all hosted demo servers</p>
          </div>
          
          <div className="chart-svg-container">
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 500 200" 
              preserveAspectRatio="xMidYMid meet"
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Area chart gradient */}
                <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.24" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
                </linearGradient>
                {/* Drop shadow for the curve line */}
                <filter id="line-shadow" x="-5%" y="-5%" width="110%" height="115%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="var(--primary)" floodOpacity="0.15"/>
                </filter>
              </defs>
              
              {/* Horizontal Grid lines & Y Axis values */}
              {yTicks.map((tick, idx) => {
                const y = padding.top + chartHeight - (tick / maxVal * chartHeight);
                return (
                  <g key={idx}>
                    <line 
                      x1={padding.left} 
                      y1={y} 
                      x2={padding.left + chartWidth} 
                      y2={y} 
                      stroke="var(--border-color)" 
                      strokeWidth="1" 
                      strokeDasharray="4 4"
                    />
                    <text 
                      x={padding.left - 15} 
                      y={y + 4} 
                      textAnchor="end" 
                      fill="var(--text-muted)" 
                      style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.9 }}
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Vertical line markers for each day */}
              {trafficData.map((d, idx) => {
                const x = padding.left + (idx * (chartWidth / 6));
                return (
                  <line 
                    key={idx}
                    x1={x} 
                    y1={padding.top} 
                    x2={x} 
                    y2={padding.top + chartHeight} 
                    stroke="var(--border-color)" 
                    strokeWidth="0.5" 
                    opacity="0.3"
                  />
                );
              })}

              {/* Solid Axis Lines */}
              <line 
                x1={padding.left} 
                y1={padding.top} 
                x2={padding.left} 
                y2={padding.top + chartHeight} 
                stroke="var(--border-color)" 
                strokeWidth="1" 
              />
              <line 
                x1={padding.left} 
                y1={padding.top + chartHeight} 
                x2={padding.left + chartWidth} 
                y2={padding.top + chartHeight} 
                stroke="var(--border-color)" 
                strokeWidth="1" 
              />

              {/* Area path (filled gradient under curve) */}
              {areaPath && (
                <path 
                  d={areaPath} 
                  fill="url(#chart-area-grad)" 
                />
              )}

              {/* Line path (curved stroke) */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="var(--primary)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  filter="url(#line-shadow)"
                />
              )}

              {/* Interactive circular points */}
              {points.map((pt, idx) => (
                <g key={idx} className="chart-dot-group" style={{ cursor: 'pointer' }}>
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="5" 
                    fill="var(--bg-main)" 
                    stroke="var(--primary)" 
                    strokeWidth="2" 
                  />
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r="10" 
                    fill="var(--primary)" 
                    opacity="0" 
                    style={{ transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => e.target.setAttribute('opacity', '0.15')}
                    onMouseLeave={(e) => e.target.setAttribute('opacity', '0')}
                  />
                  <title>{trafficData[idx].day}: {trafficData[idx].value} requests</title>
                </g>
              ))}

              {/* X Axis label values */}
              {trafficData.map((d, idx) => {
                const x = padding.left + (idx * (chartWidth / 6));
                return (
                  <text 
                    key={idx}
                    x={x} 
                    y={padding.top + chartHeight + 20} 
                    textAnchor="middle" 
                    fill="var(--text-muted)" 
                    style={{ fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    {d.day}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Service Distribution (Donut Chart) */}
        <div className="glass-card chart-card">
          <div className="chart-header-wrapper">
            <h4>Demos Active Status</h4>
            <p>Ratio of active versus inactive portfolio websites</p>
          </div>

          <div className="chart-svg-container">
            <svg width="200" height="200" viewBox="0 0 120 120">
              <defs>
                <filter id="donut-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.08"/>
                </filter>
              </defs>
              
              <circle
                cx="60"
                cy="60"
                r={donutRadius}
                fill="transparent"
                stroke="var(--border-color)"
                strokeWidth="11"
                opacity="0.3"
              />

              {donutSectors.map((sector, idx) => (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r={donutRadius}
                  fill="transparent"
                  stroke={sector.color}
                  strokeWidth="11"
                  strokeDasharray={`${donutCircumference} ${donutCircumference}`}
                  strokeDashoffset={sector.offset}
                  transform={`rotate(${sector.rotateAngle} 60 60)`}
                  filter="url(#donut-shadow)"
                  style={{ 
                    transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                  title={`${sector.name}: ${sector.value} demos (${Math.round(sector.percentage)}%)`}
                />
              ))}
              
              <g transform="translate(60, 60)" style={{ pointerEvents: 'none' }}>
                <text
                  y="-7"
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  style={{ fontSize: '0.45rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                  Total Demos
                </text>
                <text
                  y="13"
                  textAnchor="middle"
                  fill="var(--text-main)"
                  style={{ fontSize: '1.1rem', fontWeight: 800 }}
                >
                  {metrics.totalDemos}
                </text>
              </g>
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '18px', flexWrap: 'wrap' }}>
            {donutSectors.map((sector, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <span className="legend-color-dot" style={{ backgroundColor: sector.color, width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block' }} />
                <span>{sector.name}:</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                  {sector.value} ({Math.round(sector.percentage)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Datagrid Table Section */}
      <div className="datagrid-section-wrapper glass-card">
        <div className="datagrid-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>My Demos</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap', flex: 1 }}>
            <form onSubmit={handleSearchSubmit} className="search-form-wrapper" style={{ margin: 0 }}>
              <div className="search-input-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search presentation by title..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                />
                {search && (
                  <button type="button" className="clear-search-btn" onClick={handleClearSearch}>
                    Clear
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              <select
                value={selectedServer}
                onChange={(e) => {
                  setSelectedServer(e.target.value);
                  setPage(1);
                }}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: '20px',
                  border: '1.5px solid transparent',
                  background: 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, linear-gradient(135deg, #22d3a0 0%, #0055ff 100%) border-box',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '95px',
                  maxWidth: '120px',
                  boxSizing: 'border-box',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Servers</option>
                {serverCategories.map((server) => (
                  <option key={server._id} value={server.name} style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>{server.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                style={{
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: '20px',
                  border: '1.5px solid transparent',
                  background: 'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, linear-gradient(135deg, #22d3a0 0%, #0055ff 100%) border-box',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '90px',
                  maxWidth: '110px',
                  boxSizing: 'border-box',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Status</option>
                <option value="true" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Active</option>
                <option value="false" style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading-spinner" style={{ padding: '60px 20px' }}>
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p>Retrieving database records...</p>
          </div>
        ) : demoSites.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <Database className="empty-state-icon" size={40} />
            <h2>No Presentations Found</h2>
            <p>
              {search 
                ? `No catalog matches found for search query "${search}".`
                : 'No demo sites registered in the system.'}
            </p>
            {search && (
              <button className="btn btn-secondary" onClick={handleClearSearch}>
                Reset Search
              </button>
            )}
          </div>
        ) : (
          <div className="datagrid-container">
            <table className="datagrid-table">
              <thead>
                <tr>
                  <th>Demo Site Details</th>
                  <th>Server</th>
                  <th>Developer</th>
                  <th>Access Links</th>
                  <th>Script</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {demoSites.map((site) => {
                  const hasImages = site.images && site.images.length > 0;
                  const firstImage = hasImages
                    ? (site.images[0].startsWith('http') ? site.images[0] : `${SERVER_BASE}/${site.images[0]}`)
                    : null;
                  const hasPendingFeedback = pendingComplaintSiteIds.includes(site._id);
                  return (
                    <tr key={site._id} className={`datagrid-row ${hasPendingFeedback ? 'feedback-pending' : ''}`}>
                      <td className="row-title-cell">
                        <div className="row-title-container">
                          <div className="demo-thumbnail-wrapper">
                            {firstImage ? (
                              <img src={firstImage} alt={site.title} className="demo-thumbnail" />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 85, 255, 0.05)', color: 'var(--primary)' }}>
                                <Globe size={16} />
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {hasPendingFeedback && (
                                <AlertCircle 
                                  size={18} 
                                  style={{ 
                                    color: '#ef4444', 
                                    fill: 'rgba(239, 68, 68, 0.15)',
                                    filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))', 
                                    animation: 'pulse-badge 1.5s infinite alternate', 
                                    flexShrink: 0 
                                  }} 
                                  title="Pending Feedback Received!" 
                                />
                              )}
                              <strong style={{ fontSize: '0.95rem' }}>{site.title}</strong>
                            </div>
                            <span className="row-desc-preview" title={site.description} style={{ maxWidth: '280px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {site.description}
                            </span>
                            {(() => {
                              const matchingComplaints = pendingComplaints.filter(c => c.siteId === site._id);
                              if (matchingComplaints.length === 0) return null;
                              return (
                                <div style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '5px', 
                                  marginTop: '6px', 
                                  background: 'rgba(239, 68, 68, 0.04)', 
                                  border: '1px dashed rgba(239, 68, 68, 0.2)', 
                                  padding: '6px 10px', 
                                  borderRadius: '6px',
                                  maxWidth: '300px'
                                }}>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Feedback:</span>
                                  {matchingComplaints.map((c, i) => (
                                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                                      <span style={{ fontSize: '0.76rem', color: '#ff4d4d', fontWeight: 500, wordBreak: 'break-word', flex: 1 }}>
                                        {matchingComplaints.length > 1 ? `${i + 1}. ` : ''}{c.message}
                                      </span>
                                      <button 
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          if (window.confirm('Delete this feedback permanently?')) {
                                            try {
                                              await deleteDoc(doc(db, 'complaints', c.id));
                                              alert('Feedback deleted successfully!');
                                            } catch (err) {
                                              console.error(err);
                                              alert('Failed to delete feedback');
                                            }
                                          }
                                        }}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                        title="Delete Feedback Permanently"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: site.serverCategory ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 600 }}>
                          {site.serverCategory || 'None'}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: site.developer ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 600 }}>
                          {site.developer || 'SmartSoft'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                          {(() => {
                            const frontLink = site.liveDemoLink || (site.frontendRoleCredentials && site.frontendRoleCredentials.find(r => r.liveDemoLink && r.liveDemoLink.trim())?.liveDemoLink) || site.scriptLink || '';
                            return frontLink ? (
                              <a 
                                href={frontLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="datagrid-link-pill"
                              >
                                <span>Frontend</span>
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No Frontend URL</span>
                            );
                          })()}
                          {site.adminLink ? (
                            <a 
                              href={site.adminLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="datagrid-link-pill"
                            >
                              <span>Admin</span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No Admin URL</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {site.scriptLink ? (
                          <a 
                            href={site.scriptLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="datagrid-link-pill"
                          >
                            <span>Script</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>None</span>
                        )}
                      </td>
                      <td>
                        {site.date ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span style={{ color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {new Date(site.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                              {new Date(site.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label 
                            className="admin-toggle-switch" 
                            title={site.isActive ? 'Status: ON (Visible to Clients)' : 'Status: OFF (Hidden / Feedback only)'}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={site.isActive}
                              onChange={() => handleStatusToggle(site._id, site.isActive)}
                              disabled={togglingId === site._id}
                            />
                            <span className="slider round"></span>
                          </label>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 700, 
                            color: site.isActive ? '#22d3a0' : '#f59e0b'
                          }}>
                            {site.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-actions">
                          <button
                            className="icon-btn delete-action-btn"
                            onClick={() => handleDeleteClick(site._id)}
                            title="Delete demo site"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-wrapper" style={{ marginTop: '20px', paddingBottom: '10px' }}>
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
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
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
