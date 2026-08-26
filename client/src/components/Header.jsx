import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronRight, Layout, Bell, LogOut } from 'lucide-react';
import logoImg from '../assets/metablock_logo_with_icon.avif';

const Header = ({ 
  user,
  onLogout,
  menuData = [], 
  onSearch, 
  onShowAllProducts, 
  onShowClientDemos,
  onProductClick, 
  onLogoClick,
  notifications = [],
  onNotificationClick,
  onClearNotifications,
  onRequestDemoClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Filter out Game Development from Software Services, and find it separately
  const softwareServicesMenuData = menuData.filter(
    main => main.name?.trim().toLowerCase() !== 'game development'
  );
  const gameDevMainCat = menuData.find(
    main => main.name?.trim().toLowerCase() === 'game development'
  );

  // Active category states for mega-menu
  const [activeMainId, setActiveMainId] = useState(null);
  const [activeSubId, setActiveSubId] = useState(null);
  const [activeGameSubId, setActiveGameSubId] = useState(null);
  const [isGameHovered, setIsGameHovered] = useState(false);

  // Set default active categories when menuData changes
  useEffect(() => {
    if (menuData && menuData.length > 0) {
      // Initialize Software Services active states
      if (softwareServicesMenuData.length > 0) {
        const firstMain = softwareServicesMenuData[0];
        setActiveMainId(firstMain._id);
        if (firstMain.subcategories && firstMain.subcategories.length > 0) {
          setActiveSubId(firstMain.subcategories[0]._id);
        } else {
          setActiveSubId(null);
        }
      }

      // Initialize Game Development active states
      if (gameDevMainCat && gameDevMainCat.subcategories && gameDevMainCat.subcategories.length > 0) {
        setActiveGameSubId(gameDevMainCat.subcategories[0]._id);
      } else {
        setActiveGameSubId(null);
      }
    }
  }, [menuData]);

  const handleMainHover = (mainId) => {
    setActiveMainId(mainId);
    const mainCat = softwareServicesMenuData.find(m => m._id === mainId);
    if (mainCat && mainCat.subcategories && mainCat.subcategories.length > 0) {
      setActiveSubId(mainCat.subcategories[0]._id);
    } else {
      setActiveSubId(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  // Find currently active main and sub category details for Software Services
  const activeMainCat = softwareServicesMenuData.find(m => m._id === activeMainId);
  const activeSubCat = activeMainCat?.subcategories?.find(s => s._id === activeSubId);
  const activeProducts = activeSubCat?.products || [];

  // Find currently active Game Development subcategory products
  const activeGameSubCat = gameDevMainCat?.subcategories?.find(s => s._id === activeGameSubId);
  const activeGameProducts = activeGameSubCat?.products || [];

  return (
    <header>

      {/* Main Header Bar */}
      <div className="main-brand-header" style={{ position: 'relative' }}>
        
        {/* Logo and Services dropdown container on the left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/" className="header-left" onClick={(e) => {
            e.preventDefault();
            if (onLogoClick) {
              onLogoClick();
            } else if (onShowAllProducts) {
              onShowAllProducts();
            }
          }} style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={logoImg} 
              alt="MetaBlock" 
              style={{ height: '48px', width: 'auto', objectFit: 'contain', display: 'block' }} 
            />
          </a>

          {/* Services Dropdown (Opens mega-menu on hover) */}
          <div 
            className="services-nav-item" 
            style={{ position: 'static' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <a 
              href="#services" 
              className="header-link" 
              onClick={(e) => e.preventDefault()}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '16px 0' }}
            >
              <span>Software Services</span>
              <ChevronDown size={14} />
            </a>

            {/* The 4-Column Mega Menu Dropdown */}
            <div className={`mega-menu-dropdown ${isHovered ? 'show' : ''}`}>
              {/* Column 1: Feature Card */}
              <div className="mega-menu-col">
                <div className="menu-feature-card">
                  <div className="menu-feature-glow" />
                  <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="menu-feature-svg" xmlns="http://www.w3.org/2000/svg">
                    <rect x="12" y="32" width="40" height="12" rx="2" fill="#0c1020" stroke="#0066ff" strokeWidth="2.5" />
                    <rect x="12" y="16" width="40" height="12" rx="2" fill="#0c1020" stroke="#0066ff" strokeWidth="2.5" />
                    <circle cx="20" cy="22" r="2.5" fill="#00ffcc" />
                    <circle cx="28" cy="22" r="2.5" fill="#00ffcc" />
                    <circle cx="20" cy="38" r="2.5" fill="#00ffcc" />
                    <circle cx="28" cy="38" r="2.5" fill="#00ffcc" />
                    <path d="M16 10C24 6 40 6 48 10" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M32 28V32" stroke="#00ffcc" strokeWidth="2" />
                  </svg>
                  <h4 className="menu-feature-title">Services</h4>
                  <p className="menu-feature-desc">
                    We help businesses transform and evolve continuously with premium, dynamic technology.
                  </p>
                </div>
              </div>

              {/* Column 2: Level 1 Categories */}
              <div className="mega-menu-col">
                <span className="menu-list-title">Main Categories</span>
                <ul className="menu-item-list">
                  {(!softwareServicesMenuData || softwareServicesMenuData.length === 0) ? (
                    <li style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No categories registered</li>
                  ) : (
                    softwareServicesMenuData.map((main) => (
                      <li key={main._id}>
                        <button
                          className={`menu-list-btn ${activeMainId === main._id ? 'active' : ''}`}
                          onMouseEnter={() => handleMainHover(main._id)}
                          onClick={() => handleMainHover(main._id)}
                        >
                          <span>{main.name}</span>
                          <ChevronRight size={14} className="chevron-right-icon" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Column 3: Level 2 Subcategories */}
              <div className="mega-menu-col">
                <span className="menu-list-title">Subcategories</span>
                <ul className="menu-item-list">
                  {!activeMainCat || !activeMainCat.subcategories || activeMainCat.subcategories.length === 0 ? (
                    <li style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No subcategories</li>
                  ) : (
                    activeMainCat.subcategories.map((sub) => (
                      <li key={sub._id}>
                        <button
                          className={`menu-list-btn ${activeSubId === sub._id ? 'active' : ''}`}
                          onMouseEnter={() => setActiveSubId(sub._id)}
                          onClick={() => setActiveSubId(sub._id)}
                        >
                          <span>{sub.name}</span>
                          <ChevronRight size={14} className="chevron-right-icon" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Column 4: Level 3 Products */}
              <div className="mega-menu-col">
                <span className="menu-list-title">Demo Templates</span>
                <div className="menu-products-grid">
                  {activeProducts.length === 0 ? (
                    <span style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No products registered</span>
                  ) : (
                    activeProducts.map((prod) => (
                      <a
                        key={prod._id}
                        href={`#product-${prod._id}`}
                        className="menu-product-link"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsHovered(false);
                          if (onProductClick) onProductClick(prod);
                        }}
                      >
                        <div className="menu-product-icon-wrapper">
                          <Layout size={14} />
                        </div>
                        <div className="menu-product-info">
                          <span className="menu-product-title">{prod.title}</span>
                          <span className="menu-product-tag">Live Template</span>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Game Development Dropdown (Standalone Menu Item next to Software Services) */}
          {gameDevMainCat && (
            <div 
              className="services-nav-item" 
              style={{ position: 'static' }}
              onMouseEnter={() => setIsGameHovered(true)}
              onMouseLeave={() => setIsGameHovered(false)}
            >
              <a 
                href="#game-development" 
                className="header-link" 
                onClick={(e) => e.preventDefault()}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '16px 0' }}
              >
                <span>Game Development</span>
                <ChevronDown size={14} />
              </a>

              {/* Mega Menu Dropdown for Game Development */}
              <div className={`mega-menu-dropdown ${isGameHovered ? 'show' : ''}`}>
                {/* Column 1: Feature Card */}
                <div className="mega-menu-col">
                  <div className="menu-feature-card">
                    <div className="menu-feature-glow" />
                    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" className="menu-feature-svg" xmlns="http://www.w3.org/2000/svg">
                      <rect x="12" y="32" width="40" height="12" rx="2" fill="#0c1020" stroke="#0066ff" strokeWidth="2.5" />
                      <rect x="12" y="16" width="40" height="12" rx="2" fill="#0c1020" stroke="#0066ff" strokeWidth="2.5" />
                      <circle cx="20" cy="22" r="2.5" fill="#00ffcc" />
                      <circle cx="28" cy="22" r="2.5" fill="#00ffcc" />
                      <circle cx="20" cy="38" r="2.5" fill="#00ffcc" />
                      <circle cx="28" cy="38" r="2.5" fill="#00ffcc" />
                      <path d="M16 10C24 6 40 6 48 10" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M32 28V32" stroke="#00ffcc" strokeWidth="2" />
                    </svg>
                    <h4 className="menu-feature-title">Game Dev</h4>
                    <p className="menu-feature-desc">
                      Create immersive gaming experiences and virtual worlds with advanced development solutions.
                    </p>
                  </div>
                </div>

                {/* Column 2: Subcategories */}
                <div className="mega-menu-col">
                  <span className="menu-list-title">Subcategories</span>
                  <ul className="menu-item-list">
                    {!gameDevMainCat.subcategories || gameDevMainCat.subcategories.length === 0 ? (
                      <li style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No subcategories</li>
                    ) : (
                      gameDevMainCat.subcategories.map((sub) => (
                        <li key={sub._id}>
                          <button
                            className={`menu-list-btn ${activeGameSubId === sub._id ? 'active' : ''}`}
                            onMouseEnter={() => setActiveGameSubId(sub._id)}
                            onClick={() => setActiveGameSubId(sub._id)}
                          >
                            <span>{sub.name}</span>
                            <ChevronRight size={14} className="chevron-right-icon" />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Column 3 & 4 (span 2): Products grid with 2-column layout */}
                <div className="mega-menu-col" style={{ gridColumn: 'span 2' }}>
                  <span className="menu-list-title">Demo Templates</span>
                  <div className="menu-products-grid grid-layout">
                    {activeGameProducts.length === 0 ? (
                      <span style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No products registered</span>
                    ) : (
                      activeGameProducts.map((prod) => (
                        <a
                          key={prod._id}
                          href={`#product-${prod._id}`}
                          className="menu-product-link"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsGameHovered(false);
                            if (onProductClick) onProductClick(prod);
                          }}
                        >
                          <div className="menu-product-icon-wrapper">
                            <Layout size={14} />
                          </div>
                          <div className="menu-product-info">
                            <span className="menu-product-title">{prod.title}</span>
                            <span className="menu-product-tag">Live Template</span>
                          </div>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Request Demo Button */}
          <button
            onClick={onRequestDemoClick}
            className="request-demo-btn"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #0044cc 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '50px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 85, 255, 0.2)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 85, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 85, 255, 0.2)';
            }}
          >
            <span>Request Demo</span>
          </button>
        </div>

        {/* Inline Search (hidden, hero handles it) */}
        <form onSubmit={handleSearchSubmit} className="search-bar-form" style={{ flex: '0 1 500px', margin: '0 20px', display: 'none' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            <Search size={16} />
          </button>
        </form>

        <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Original Our Products link */}
          <a
            href="#products"
            className="header-link"
            onClick={(e) => {
              e.preventDefault();
              if (onShowAllProducts) onShowAllProducts();
            }}
          >
            Our Products
          </a>

          <a
            href="#client-demos"
            className="header-link"
            onClick={(e) => {
              e.preventDefault();
              if (onShowClientDemos) onShowClientDemos();
            }}
          >
            Client Demos
          </a>

          {user && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px', 
              borderLeft: '1px solid var(--border-color)', 
              paddingLeft: '20px'
            }}>
              {/* Profile Pill Wrapper */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 12px',
                background: 'rgba(0, 85, 255, 0.03)',
                border: '1px solid rgba(0, 85, 255, 0.1)',
                borderRadius: '50px',
                boxShadow: '0 2px 8px rgba(0, 85, 255, 0.02)'
              }}>
                {/* Avatar Fallback */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #0044cc 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0, 85, 255, 0.2)',
                  textTransform: 'uppercase'
                }}>
                  {user.username.charAt(0)}
                </div>
                {/* User Details */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 700, 
                    color: 'var(--text-main)',
                    textTransform: 'capitalize',
                    lineHeight: 1.2
                  }}>
                    {user.username}
                  </span>
                  <span style={{ 
                    fontSize: '0.62rem', 
                    fontWeight: 700, 
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    lineHeight: 1
                  }}>
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={onLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  padding: '8px 16px',
                  borderRadius: '50px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.background = '#ef4444'; 
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.06)'; 
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Bell Icon Notification Button */}
          <div ref={bellRef} className="notification-bell-container" style={{ position: 'relative' }}>
            <button 
              className="bell-icon-btn" 
              onClick={() => setIsBellOpen(!isBellOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isBellOpen ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => { if (!isBellOpen) e.currentTarget.style.color = 'var(--text-main)'; }}
              onMouseLeave={(e) => { if (!isBellOpen) e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Bell size={20} className={unreadCount > 0 ? "bell-animation" : ""} />
              {unreadCount > 0 && (
                <span className="bell-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {isBellOpen && (
              <div className="bell-dropdown glass-card">
                <div className="bell-dropdown-header">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <button onClick={onClearNotifications} className="clear-all-btn">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="bell-dropdown-list">
                  {notifications.length === 0 ? (
                    <div className="bell-empty-state">
                      <Bell size={28} style={{ opacity: 0.3, marginBottom: '10px' }} />
                      <p>No notifications yet</p>
                      <span>Feedback resolve alerts appear here</span>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`bell-notif-item ${notif.read ? 'read' : 'unread'}`}
                        onClick={() => {
                          setIsBellOpen(false);
                          onNotificationClick && onNotificationClick(notif);
                        }}
                      >
                        <span className="notif-dot"></span>
                        <div className="notif-content">
                          <p className="notif-msg">{notif.message}</p>
                          <span className="notif-time">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
