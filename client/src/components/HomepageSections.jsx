import React, { useState, useEffect, useRef } from 'react';
import ShowcaseItemCard from './ShowcaseItemCard';
import {
  Layout, Check, HelpCircle, Shield, ArrowRight,
  Server, Database, Code, ChevronLeft, ChevronRight
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/api\/?$/, '');

const getImageUrl = (p) => !p ? null : p.startsWith('http') ? p : `${API_BASE}/${p}`;

/* ── Scroll-reveal hook ── */
const useReveal = (delay = 0) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => el.classList.add('revealed'), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return ref;
};

/* ── Mini carousel card (proper component so hooks are valid) ── */
const MiniCarouselCard = ({ item, delay = 0, onCardClick, onPreviewClick, onFeedbackClick, isStatistics }) => {
  const [idx, setIdx] = useState(0);
  const ref = useReveal(delay);

  const urls = item.images?.length > 0 ? item.images.map(getImageUrl) : [];
  const total = urls.length;
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i === 0 ? total - 1 : i - 1)); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i === total - 1 ? 0 : i + 1)); };

  const handleCardClick = () => {
    if (onCardClick) onCardClick(item);
  };

  return (
    <div
      ref={ref}
      className="small-showcase-card glass-card reveal-scale"
      onClick={handleCardClick}
      style={{ cursor: onCardClick ? 'pointer' : 'default' }}
    >
      <div className="small-card-media">
        {total > 0 ? (
          <>
            <img src={urls[idx]} alt={item.title} className="small-card-img" />
            {total > 1 && (
              <>
                <button className="small-carousel-btn prev" onClick={prev}><ChevronLeft size={12} /></button>
                <button className="small-carousel-btn next" onClick={next}><ChevronRight size={12} /></button>
                <span className="small-img-counter">{idx + 1}/{total}</span>
                <div className="small-carousel-dots">
                  {urls.map((_, i) => <span key={i} className={`small-carousel-dot ${i === idx ? 'active' : ''}`} />)}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="small-card-no-image">
            <Layout size={22} style={{ color: 'var(--primary)', opacity: 0.5 }} />
          </div>
        )}
      </div>
      <div className="small-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', flex: '1', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h4 className="small-card-title" style={{ fontSize: '1.05rem', fontWeight: '800', color: isStatistics ? '#ffffff' : '#0066ff', margin: '0' }}>{item.title}</h4>
          <p style={{ fontSize: '0.78rem', color: isStatistics ? 'rgba(255, 255, 255, 0.95)' : 'var(--text-muted)', margin: '0', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
          style={{
            marginTop: '8px',
            width: '100%',
            justifyContent: 'center',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '0.78rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

/* ── Featured card wrapper with reveal ── */
const RevealCard = ({ item, delay, onCardClick, onPreviewClick, onFeedbackClick }) => {
  const ref = useReveal(delay);
  return (
    <div ref={ref} className="reveal-up">
      <ShowcaseItemCard 
        site={item} 
        onCardClick={onCardClick} 
        onPreviewClick={onPreviewClick}
        onFeedbackClick={onFeedbackClick}
      />
    </div>
  );
};

/* ── Section: Categories ── */
const CategoriesSection = ({ section, categories = [], onCategorySelect }) => {
  const headRef  = useReveal(0);
  
  // Filter only main categories
  const mainCategories = categories.filter(cat => !cat.parentCategory);

  // Helper to get image path (database path or beautiful default abstract tech images)
  const getCategoryImage = (cat, i) => {
    if (cat.image) {
      return getImageUrl(cat.image);
    }
    // Premium high-quality Unsplash fallbacks matching tech categories
    const fallbacks = [
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=600&auto=format&fit=crop', // blockchain
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop', // software dev
      'https://images.unsplash.com/photo-1547658719-da2b8116c1d0?q=80&w=600&auto=format&fit=crop', // web dev
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop', // science/data
    ];
    return fallbacks[i % fallbacks.length];
  };

  return (
    <section className="categories-section">
      <div ref={headRef} className="reveal-up" style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 className="section-title" style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>
          {section.title === 'Browse templates by category' ? 'Browse demos by category' : section.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '600px', margin: '0 auto' }}>{section.subtitle}</p>
      </div>
      <div className="categories-flip-grid">
        {mainCategories.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }} className="glass-card">
            No active categories added yet by administrator.
          </div>
        ) : (
          mainCategories.map((cat, i) => (
            <div 
              key={cat._id} 
              className="category-flip-card"
              onClick={() => onCategorySelect(cat.name)}
            >
              <div className="category-flip-card-inner">
                {/* Front Side: Image and Title */}
                <div 
                  className="category-flip-card-front" 
                  style={{ backgroundImage: `url(${getCategoryImage(cat, i)})` }}
                >
                  <div className="category-card-overlay" />
                  <h3 className="category-title">{cat.name}</h3>
                </div>
                
                {/* Back Side: Description and links */}
                <div className="category-flip-card-back">
                  <h3 className="category-back-title">{cat.name}</h3>
                  <p className="category-back-description">
                    {cat.description || `Explore our high-performance dynamic ${cat.name} layouts and templates built for modern web standards.`}
                  </p>
                  <div className="category-back-links">
                    {['Newest', 'Bestsellers'].map((tag, t) => (
                      <span 
                        key={t} 
                        className="category-back-link-item"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onCategorySelect(cat.name); 
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};








/* ── Section: Featured Grid (Handpicked Selection) ── */
const FeaturedGridSection = ({ section, onCardClick, onShowAllProducts, onPreviewClick, onFeedbackClick }) => {
  const headRef = useReveal(0);
  const items   = section.items || [];

  return (
    <section className="featured-grid-section">
      <div className="featured-grid-container">
        <div ref={headRef} className="featured-grid-header reveal-up">
          <div>
            <span className="section-tag">Handpicked Selection</span>
            <h2 className="section-title" style={{ marginBottom: '0' }}>{section.title}</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '500px', textAlign: 'right' }}>
            {section.subtitle}
          </p>
        </div>

        <div className="featured-items-grid">
          {items.map((item, i) => (
            <RevealCard 
              key={item._id} 
              item={item} 
              delay={i * 90} 
              onCardClick={onCardClick} 
              onPreviewClick={onPreviewClick}
              onFeedbackClick={onFeedbackClick}
            />
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <button onClick={onShowAllProducts} className="btn btn-primary">
              <span>View More</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }} className="glass-card">
            No showcases set as featured in the database section.
          </div>
        )}
      </div>
    </section>
  );
};



/* ── Section: Category Wise Grid Explorer ── */
const CategoryWiseGridSection = ({ categories = [], onCategorySelect, onCardClick, onPreviewClick, onFeedbackClick }) => {
  const headRef = useReveal(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({});

  const mainCategories = categories.filter(cat => !cat.parentCategory);

  useEffect(() => {
    if (mainCategories.length === 0 || activeCategory) return;

    const determineDefaultCategory = async () => {
      try {
        const counts = await Promise.all(
          mainCategories.map(async (cat) => {
            const res = await fetch(`${API_BASE}/api/demo-sites?category=${encodeURIComponent(cat.name)}&limit=1&showInExplorer=true&isActive=true`);
            const data = await res.json();
            return {
              category: cat,
              total: data.success ? data.pagination.total : 0
            };
          })
        );
        counts.sort((a, b) => b.total - a.total);
        const bestCat = counts[0]?.total > 0 ? counts[0].category : mainCategories[0];
        setActiveCategory(bestCat);
      } catch (err) {
        console.error('Error determining default category:', err);
        setActiveCategory(mainCategories[0]);
      }
    };

    determineDefaultCategory();
  }, [categories, mainCategories, activeCategory]);

  useEffect(() => {
    if (!activeCategory) return;

    const fetchCategoryProducts = async () => {
      if (cache[activeCategory.name]) {
        setProducts(cache[activeCategory.name]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/demo-sites?category=${encodeURIComponent(activeCategory.name)}&limit=4&showInExplorer=true&isActive=true`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
          setCache(prev => ({ ...prev, [activeCategory.name]: data.data }));
        }
      } catch (err) {
        console.error('Error fetching category products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [activeCategory, cache]);

  if (mainCategories.length === 0) return null;

  return (
    <section className="featured-grid-section" style={{ borderTop: '1px solid var(--border-color)', background: '#ffffff' }}>
      <div className="featured-grid-container">
        <div ref={headRef} className="featured-grid-header reveal-up" style={{ textAlign: 'center', display: 'block' }}>
          <span className="section-tag" style={{ display: 'block', margin: '0 auto 8px auto', width: 'max-content' }}>Category Explorer</span>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '8px' }}>Explore by Category</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            Filter our premium showcases category-wise. Click on any category below to load its top demo layouts.
          </p>
        </div>

        {/* Categories Tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', margin: '15px 0 30px 0' }}>
          {mainCategories.map(cat => (
            <button
              key={cat._id}
              className={`category-pill-btn ${activeCategory?._id === cat._id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 0', color: 'var(--text-muted)', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Loading items...</span>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }} className="glass-card">
            No showcases set in {activeCategory?.name} category.
          </div>
        ) : (
          <div className="category-wise-grid">
            {products.map((item) => (
              <ShowcaseItemCard
                key={item._id}
                site={item}
                onCardClick={onCardClick}
                onPreviewClick={onPreviewClick}
                onFeedbackClick={onFeedbackClick}
              />
            ))}
          </div>
        )}

        {/* View More Button */}
        {!loading && products.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '35px' }}>
            <button 
              onClick={() => onCategorySelect && onCategorySelect(activeCategory?.name)} 
              className="btn btn-primary"
            >
              <span>View More</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

/* ── Main export ── */
const HomepageSections = ({ 
  sections, 
  categories, 
  onCategorySelect, 
  onSearchClear, 
  onCardClick, 
  onShowAllProducts,
  onPreviewClick,
  onFeedbackClick
}) => (
  <div className="homepage-container">
    {sections.map((section) => {
      switch (section.type) {
        case 'categories':
          return <CategoriesSection key={section._id || 'cat'} section={section} categories={categories} onCategorySelect={onCategorySelect} />;
        case 'featured_grid':
          return (
            <FeaturedGridSection 
              key={section._id} 
              section={section} 
              onCardClick={onCardClick} 
              onShowAllProducts={onShowAllProducts}
              onPreviewClick={onPreviewClick}
              onFeedbackClick={onFeedbackClick}
            />
          );
        default:
          return null;
      }
    })}
    
    <CategoryWiseGridSection 
      categories={categories}
      onCategorySelect={onCategorySelect}
      onCardClick={onCardClick}
      onPreviewClick={onPreviewClick}
      onFeedbackClick={onFeedbackClick}
    />
  </div>
);

export default HomepageSections;
