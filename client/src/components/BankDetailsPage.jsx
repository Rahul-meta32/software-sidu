import React, { useState, useEffect } from 'react';
import bankDetailService from '../api/bankDetailService';
import {
  Landmark,
  QrCode,
  Wallet,
  Copy,
  Check,
  Building2,
  Loader2,
  ArrowLeft,
  X,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const SERVER_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5050/api').replace(/\/api\/?$/, '');

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${SERVER_BASE}/${cleanPath}`;
};

const BankDetailsPage = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState('GST');
  const [activeTab, setActiveTab] = useState('banks');

  const [banks, setBanks] = useState([]);
  const [upiList, setUpiList] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [copiedKey, setCopiedKey] = useState(null);
  const [previewQrUrl, setPreviewQrUrl] = useState(null);

  const fetchBankDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bankDetailService.getPublicDetails(activeCategory);
      if (res.success && res.data) {
        setBanks(res.data.banks || []);
        setUpiList(res.data.upi || []);
        setWallets(res.data.wallets || []);
      } else {
        setError('Unable to load bank details.');
      }
    } catch (err) {
      console.error('Failed to load bank details on client:', err);
      setError('Could not connect to the payment details service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, [activeCategory]);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bank-details-page-container" style={{ padding: '40px 20px 80px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <button
          type="button"
          onClick={onBack || (() => { window.location.hash = '#/'; })}
          className="btn btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-main)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 211, 160, 0.1)', border: '1px solid rgba(34, 211, 160, 0.25)', padding: '6px 14px', borderRadius: '20px', color: '#22d3a0', fontSize: '0.8rem', fontWeight: 700 }}>
          <ShieldCheck size={16} />
          <span>Official Verified Payment Channels</span>
        </div>
      </div>

      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span className="section-tag glow-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>
          SmartSoft Financials
        </span>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Bank &amp; Payment Details
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.6' }}>
          Verify authentic company payment coordinates for direct invoices, consulting fees, and product development agreements.
        </p>
      </div>

      {/* Category Switcher: GST vs NON-GST */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px',
      }}>
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-darker)',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          gap: '6px',
        }}>
          <button
            type="button"
            onClick={() => setActiveCategory('GST')}
            style={{
              padding: '10px 28px',
              borderRadius: '10px',
              border: 'none',
              background: activeCategory === 'GST' ? 'var(--primary)' : 'transparent',
              color: activeCategory === 'GST' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: activeCategory === 'GST' ? '0 4px 14px rgba(0, 85, 255, 0.35)' : 'none',
            }}
          >
            GST Account
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('NON_GST')}
            style={{
              padding: '10px 28px',
              borderRadius: '10px',
              border: 'none',
              background: activeCategory === 'NON_GST' ? 'var(--primary)' : 'transparent',
              color: activeCategory === 'NON_GST' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              boxShadow: activeCategory === 'NON_GST' ? '0 4px 14px rgba(0, 85, 255, 0.35)' : 'none',
            }}
          >
            NON-GST Account
          </button>
        </div>
      </div>

      {/* Sub-Category Navigation: Bank Accounts | UPI Details | Wallet Details */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '2px',
        marginBottom: '36px',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('banks')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'banks' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'banks' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Landmark size={18} />
          <span>Bank Accounts</span>
          {banks.length > 0 && (
            <span style={{
              background: activeTab === 'banks' ? 'rgba(0, 85, 255, 0.12)' : 'var(--bg-darker)',
              color: activeTab === 'banks' ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              borderRadius: '10px',
              padding: '2px 8px',
              fontWeight: 700
            }}>
              {banks.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upi')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'upi' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'upi' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <QrCode size={18} />
          <span>UPI Details</span>
          {upiList.length > 0 && (
            <span style={{
              background: activeTab === 'upi' ? 'rgba(0, 85, 255, 0.12)' : 'var(--bg-darker)',
              color: activeTab === 'upi' ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              borderRadius: '10px',
              padding: '2px 8px',
              fontWeight: 700
            }}>
              {upiList.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wallets')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'wallets' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'wallets' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Wallet size={18} />
          <span>Wallet Details</span>
          {wallets.length > 0 && (
            <span style={{
              background: activeTab === 'wallets' ? 'rgba(0, 85, 255, 0.12)' : 'var(--bg-darker)',
              color: activeTab === 'wallets' ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              borderRadius: '10px',
              padding: '2px 8px',
              fontWeight: 700
            }}>
              {wallets.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Dynamic View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <Loader2 size={44} className="spinner" style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Loading verified payment details...</p>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '50px 30px', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
          <AlertCircle size={44} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
          <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Unable to Load Details</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>{error}</p>
          <button type="button" onClick={fetchBankDetails} className="btn btn-primary">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* TAB 1: BANK ACCOUNTS */}
          {activeTab === 'banks' && (
            <div>
              {banks.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
                  <Landmark size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>No Active Bank Accounts</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No bank accounts are currently published under the {activeCategory} category.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: '24px',
                }}>
                  {banks.map((b) => (
                    <div
                      key={b._id}
                      className="glass-card"
                      style={{
                        padding: '26px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '20px',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                      }}
                    >
                      <div>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              background: 'rgba(0, 85, 255, 0.1)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <Building2 size={22} />
                            </div>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                {b.bankName}
                              </h3>
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                {b.branchName ? `${b.branchName} Branch` : 'Main Branch'}
                              </span>
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: 'rgba(0, 85, 255, 0.08)',
                            color: 'var(--primary)',
                            border: '1px solid rgba(0, 85, 255, 0.2)',
                            textTransform: 'uppercase'
                          }}>
                            {b.accountType || 'Current'}
                          </span>
                        </div>

                        {/* Account Details Rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                              Account Holder Name
                            </span>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {b.accountHolderName}
                            </span>
                          </div>

                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                              Account Number
                            </span>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'var(--bg-darker)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                            }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '1px' }}>
                                {b.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(b.accountNumber, `acc-${b._id}`)}
                                className="btn btn-secondary"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                  background: copiedKey === `acc-${b._id}` ? 'rgba(34, 211, 160, 0.15)' : 'var(--bg-card)',
                                  color: copiedKey === `acc-${b._id}` ? '#22d3a0' : 'var(--text-main)',
                                  border: copiedKey === `acc-${b._id}` ? '1px solid rgba(34, 211, 160, 0.3)' : '1px solid var(--border-color)',
                                }}
                              >
                                {copiedKey === `acc-${b._id}` ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedKey === `acc-${b._id}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                              IFSC Code
                            </span>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'var(--bg-darker)',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                            }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.5px' }}>
                                {b.ifscCode}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(b.ifscCode, `ifsc-${b._id}`)}
                                className="btn btn-secondary"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                  background: copiedKey === `ifsc-${b._id}` ? 'rgba(34, 211, 160, 0.15)' : 'var(--bg-card)',
                                  color: copiedKey === `ifsc-${b._id}` ? '#22d3a0' : 'var(--text-main)',
                                  border: copiedKey === `ifsc-${b._id}` ? '1px solid rgba(34, 211, 160, 0.3)' : '1px solid var(--border-color)',
                                }}
                              >
                                {copiedKey === `ifsc-${b._id}` ? <Check size={12} /> : <Copy size={12} />}
                                <span>{copiedKey === `ifsc-${b._id}` ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)'
                      }}>
                        <span>Category: <strong>{b.category}</strong></span>
                        <span style={{ color: '#22d3a0', fontWeight: 700 }}>• Active Bank Channel</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPI DETAILS */}
          {activeTab === 'upi' && (
            <div>
              {upiList.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
                  <QrCode size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>No Active UPI IDs</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No UPI details are currently published under the {activeCategory} category.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '24px',
                }}>
                  {upiList.map((u) => (
                    <div
                      key={u._id}
                      className="glass-card"
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '16px',
                      }}
                    >
                      {/* QR Code Preview */}
                      {u.qrCodeUrl ? (
                        <div
                          onClick={() => setPreviewQrUrl(getMediaUrl(u.qrCodeUrl))}
                          style={{
                            background: '#ffffff',
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                          }}
                          title="Click to view full size QR code"
                        >
                          <img
                            src={getMediaUrl(u.qrCodeUrl)}
                            alt="UPI QR Code"
                            style={{
                              width: '160px',
                              height: '160px',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                          />
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                            Click to expand QR
                          </span>
                        </div>
                      ) : (
                        <div style={{
                          width: '160px',
                          height: '160px',
                          borderRadius: '12px',
                          background: 'var(--bg-darker)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <QrCode size={36} />
                          <span style={{ fontSize: '0.75rem' }}>No QR image</span>
                        </div>
                      )}

                      {/* Display Info */}
                      <div style={{ width: '100%' }}>
                        {u.displayName && (
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {u.displayName}
                          </h4>
                        )}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                          Unified Payments Interface (UPI)
                        </span>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-darker)',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                        }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.upiId}>
                            {u.upiId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(u.upiId, `upi-${u._id}`)}
                            className="btn btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              flexShrink: 0,
                              marginLeft: '8px',
                              background: copiedKey === `upi-${u._id}` ? 'rgba(34, 211, 160, 0.15)' : 'var(--bg-card)',
                              color: copiedKey === `upi-${u._id}` ? '#22d3a0' : 'var(--text-main)',
                              border: copiedKey === `upi-${u._id}` ? '1px solid rgba(34, 211, 160, 0.3)' : '1px solid var(--border-color)',
                            }}
                          >
                            {copiedKey === `upi-${u._id}` ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedKey === `upi-${u._id}` ? 'Copied' : 'Copy VPA'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WALLET DETAILS */}
          {activeTab === 'wallets' && (
            <div>
              {wallets.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
                  <Wallet size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>No Active Wallets</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No wallet addresses are currently published under the {activeCategory} category.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '24px',
                }}>
                  {wallets.map((w) => (
                    <div
                      key={w._id}
                      className="glass-card"
                      style={{
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '16px',
                      }}
                    >
                      {/* QR Preview */}
                      {w.qrCodeUrl ? (
                        <div
                          onClick={() => setPreviewQrUrl(getMediaUrl(w.qrCodeUrl))}
                          style={{
                            background: '#ffffff',
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'var(--shadow-sm)',
                            cursor: 'pointer',
                          }}
                          title="Click to view full size QR code"
                        >
                          <img
                            src={getMediaUrl(w.qrCodeUrl)}
                            alt="Wallet QR Code"
                            style={{
                              width: '160px',
                              height: '160px',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                          />
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px', display: 'block', fontWeight: 600 }}>
                            Click to expand QR
                          </span>
                        </div>
                      ) : (
                        <div style={{
                          width: '160px',
                          height: '160px',
                          borderRadius: '12px',
                          background: 'var(--bg-darker)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <Wallet size={36} />
                          <span style={{ fontSize: '0.75rem' }}>No QR image</span>
                        </div>
                      )}

                      {/* Wallet Info */}
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {w.walletName || 'Digital Wallet'}
                          </h4>
                          {w.network && (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(0, 85, 255, 0.1)',
                              color: 'var(--primary)',
                              border: '1px solid rgba(0, 85, 255, 0.25)',
                            }}>
                              {w.network}
                            </span>
                          )}
                        </div>

                        {w.assetType && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
                            Asset Type: <strong>{w.assetType}</strong>
                          </span>
                        )}

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-darker)',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                        }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px'
                          }} title={w.walletAddress}>
                            {w.walletAddress}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(w.walletAddress, `wallet-${w._id}`)}
                            className="btn btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              flexShrink: 0,
                              marginLeft: '8px',
                              background: copiedKey === `wallet-${w._id}` ? 'rgba(34, 211, 160, 0.15)' : 'var(--bg-card)',
                              color: copiedKey === `wallet-${w._id}` ? '#22d3a0' : 'var(--text-main)',
                              border: copiedKey === `wallet-${w._id}` ? '1px solid rgba(34, 211, 160, 0.3)' : '1px solid var(--border-color)',
                            }}
                          >
                            {copiedKey === `wallet-${w._id}` ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copiedKey === `wallet-${w._id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* QR Code Full Size Modal */}
      {previewQrUrl && (
        <div
          onClick={() => setPreviewQrUrl(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            cursor: 'pointer',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              padding: '28px',
              borderRadius: '20px',
              maxWidth: '360px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              cursor: 'default',
            }}
          >
            <button
              type="button"
              onClick={() => setPreviewQrUrl(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#334155',
              }}
            >
              <X size={18} />
            </button>
            <h4 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: 800, fontSize: '1.1rem' }}>
              Scan QR to Pay
            </h4>
            <img
              src={previewQrUrl}
              alt="Scan QR"
              style={{
                width: '100%',
                maxWidth: '260px',
                height: 'auto',
                aspectRatio: '1/1',
                objectFit: 'contain',
                borderRadius: '10px',
              }}
            />
            <p style={{ margin: '14px 0 0 0', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
              Use any UPI or payment app on your smartphone to scan and transfer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetailsPage;
