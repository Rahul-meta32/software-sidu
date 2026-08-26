import React from 'react';
import { BookOpen, HelpCircle, FileText, CheckCircle, Info, Settings } from 'lucide-react';

const Guide = () => {
  return (
    <div className="dashboard-page-wrapper">
      {/* Page Header section */}
      <div className="page-header-wrapper">
        <div className="page-title-section">
          <h2>Administrator Guide</h2>
          <p>Help, reference documentation, and system guidelines</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        {/* Left Card: Documentation Overview */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
            <span>Overview & Purpose</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
            Welcome to the MetaBlock admin guide! This page serves as a central registry for instructions on how to operate the Showcase Portal. You can customise this page later with specific documentation, guides, or manuals.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <div style={{ padding: '8px', background: 'rgba(0,102,255,0.05)', borderRadius: '6px', color: 'var(--primary)' }}>
                <CheckCircle size={16} />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>Site Management</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Register, edit, status toggle, and delete client demo sites.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <div style={{ padding: '8px', background: 'rgba(0,102,255,0.05)', borderRadius: '6px', color: 'var(--primary)' }}>
                <CheckCircle size={16} />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>Server & Category Settings</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Define server environments and tags to group web templates.</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <div style={{ padding: '8px', background: 'rgba(0,102,255,0.05)', borderRadius: '6px', color: 'var(--primary)' }}>
                <CheckCircle size={16} />
              </div>
              <div>
                <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>Security Controls</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Only authenticated administrators are authorised to access custom data fields.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Quick FAQ / Reference */}
        <div className="glass-card" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={20} style={{ color: 'var(--primary)' }} />
            <span>Frequently Asked Questions</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} style={{ color: 'var(--primary)' }} />
                <span>How to link script links securely?</span>
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', paddingLeft: '20px' }}>
                When adding a script link, use absolute HTTPS URLs. These are stored securely in the database and only shown inside the authenticated admin panels.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} style={{ color: 'var(--primary)' }} />
                <span>Can public visitors see server categories?</span>
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', paddingLeft: '20px' }}>
                No. The server categories and date fields are fully filtered at the API controller layer for public visitors.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} style={{ color: 'var(--primary)' }} />
                <span>Need help with custom layouts?</span>
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', paddingLeft: '20px' }}>
                You can configure homepage presentation sections directly from the portal layout config file or through database seeding scripts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Info Alert */}
      <div className="glass-card" style={{ marginTop: '30px', padding: '20px 30px', display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '4px solid var(--primary)' }}>
        <Settings size={24} style={{ color: 'var(--primary)' }} />
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>Configure this Page Later</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            To edit this documentation page, modify the React source code located at <code>admin-frontend/src/pages/Guide.jsx</code>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Guide;
