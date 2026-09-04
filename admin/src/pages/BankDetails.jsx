import React, { useState, useEffect } from 'react';
import bankDetailService from '../api/bankDetailService';
import { API_BASE_URL } from '../api/axiosInstance';
import {
  Landmark,
  QrCode,
  Wallet,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  Upload,
  Building2,
  DollarSign,
  Layers,
  ArrowRight
} from 'lucide-react';

const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${serverUrl}/${cleanPath}`;
};

const BankDetails = () => {
  // Category tabs: 'GST' | 'NON_GST'
  const [activeCategory, setActiveCategory] = useState('GST');

  // Sub-type tabs: 'banks' | 'upi' | 'wallets'
  const [activeTab, setActiveTab] = useState('banks');

  // Data states
  const [banks, setBanks] = useState([]);
  const [upiList, setUpiList] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Unmasked account numbers map { [id]: boolean }
  const [visibleAccountNumbers, setVisibleAccountNumbers] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // QR Preview Modal
  const [previewQrUrl, setPreviewQrUrl] = useState(null);

  // Form Fields State - Bank
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    accountType: 'Current',
    isActive: true,
  });

  // Form Fields State - UPI
  const [upiForm, setUpiForm] = useState({
    upiId: '',
    displayName: '',
    isActive: true,
  });
  const [upiQrFile, setUpiQrFile] = useState(null);
  const [upiQrPreview, setUpiQrPreview] = useState('');

  // Form Fields State - Wallet
  const [walletForm, setWalletForm] = useState({
    walletName: '',
    assetType: '',
    network: '',
    walletAddress: '',
    isActive: true,
  });
  const [walletQrFile, setWalletQrFile] = useState(null);
  const [walletQrPreview, setWalletQrPreview] = useState('');

  // Fetch all data for current active category
  const fetchData = async () => {
    setLoading(true);
    setFormError('');
    try {
      if (activeTab === 'banks') {
        const res = await bankDetailService.getBankAccounts(activeCategory);
        if (res.success) setBanks(res.data);
      } else if (activeTab === 'upi') {
        const res = await bankDetailService.getUpiDetails(activeCategory);
        if (res.success) setUpiList(res.data);
      } else if (activeTab === 'wallets') {
        const res = await bankDetailService.getWalletDetails(activeCategory);
        if (res.success) setWallets(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch bank details:', err);
      setFormError(err.response?.data?.message || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory, activeTab]);

  // Flash success message
  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };

  // Mask Account Number helper
  const maskAccountNumber = (accNo) => {
    if (!accNo) return '';
    const str = String(accNo).trim();
    if (str.length <= 4) return str;
    const last4 = str.slice(-4);
    const masked = '•'.repeat(Math.max(str.length - 4, 4));
    return `${masked} ${last4}`;
  };

  const toggleAccountVisibility = (id) => {
    setVisibleAccountNumbers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormError('');
    if (activeTab === 'banks') {
      setBankForm({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        accountType: 'Current',
        isActive: true,
      });
    } else if (activeTab === 'upi') {
      setUpiForm({
        upiId: '',
        displayName: '',
        isActive: true,
      });
      setUpiQrFile(null);
      setUpiQrPreview('');
    } else if (activeTab === 'wallets') {
      setWalletForm({
        walletName: '',
        assetType: '',
        network: '',
        walletAddress: '',
        isActive: true,
      });
      setWalletQrFile(null);
      setWalletQrPreview('');
    }
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormError('');
    if (activeTab === 'banks') {
      setBankForm({
        bankName: item.bankName || '',
        accountHolderName: item.accountHolderName || '',
        accountNumber: item.accountNumber || '',
        ifscCode: item.ifscCode || '',
        branchName: item.branchName || '',
        accountType: item.accountType || 'Current',
        isActive: item.isActive !== false,
      });
    } else if (activeTab === 'upi') {
      setUpiForm({
        upiId: item.upiId || '',
        displayName: item.displayName || '',
        isActive: item.isActive !== false,
      });
      setUpiQrFile(null);
      setUpiQrPreview(item.qrCodeUrl ? getMediaUrl(item.qrCodeUrl) : '');
    } else if (activeTab === 'wallets') {
      setWalletForm({
        walletName: item.walletName || '',
        assetType: item.assetType || '',
        network: item.network || '',
        walletAddress: item.walletAddress || '',
        isActive: item.isActive !== false,
      });
      setWalletQrFile(null);
      setWalletQrPreview(item.qrCodeUrl ? getMediaUrl(item.qrCodeUrl) : '');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormError('');
  };

  // Toggle Active Status
  const handleToggleActive = async (item) => {
    const updatedStatus = !item.isActive;
    try {
      if (activeTab === 'banks') {
        const res = await bankDetailService.updateBankAccount(item._id, { isActive: updatedStatus });
        if (res.success) {
          showSuccess(`Bank account status updated to ${updatedStatus ? 'Active' : 'Inactive'}.`);
          fetchData();
        }
      } else if (activeTab === 'upi') {
        const res = await bankDetailService.updateUpiDetail(item._id, { isActive: updatedStatus });
        if (res.success) {
          showSuccess(`UPI detail status updated to ${updatedStatus ? 'Active' : 'Inactive'}.`);
          fetchData();
        }
      } else if (activeTab === 'wallets') {
        const res = await bankDetailService.updateWalletDetail(item._id, { isActive: updatedStatus });
        if (res.success) {
          showSuccess(`Wallet status updated to ${updatedStatus ? 'Active' : 'Inactive'}.`);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  // Delete Item
  const handleDelete = async (id, name) => {
    const confirmMsg = `Are you sure you want to delete this ${activeTab === 'banks' ? 'bank account' : activeTab === 'upi' ? 'UPI detail' : 'wallet'} ${name ? `(${name})` : ''}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (activeTab === 'banks') {
        const res = await bankDetailService.deleteBankAccount(id);
        if (res.success) {
          showSuccess('Bank account deleted successfully.');
          fetchData();
        }
      } else if (activeTab === 'upi') {
        const res = await bankDetailService.deleteUpiDetail(id);
        if (res.success) {
          showSuccess('UPI detail deleted successfully.');
          fetchData();
        }
      } else if (activeTab === 'wallets') {
        const res = await bankDetailService.deleteWalletDetail(id);
        if (res.success) {
          showSuccess('Wallet deleted successfully.');
          fetchData();
        }
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (activeTab === 'banks') {
        if (!bankForm.bankName.trim() || !bankForm.accountHolderName.trim() || !bankForm.accountNumber.trim() || !bankForm.ifscCode.trim()) {
          setFormError('Please fill in all required fields (Bank Name, Account Holder Name, Account Number, IFSC Code).');
          setSubmitting(false);
          return;
        }

        const payload = {
          category: activeCategory,
          ...bankForm,
        };

        if (editingItem) {
          const res = await bankDetailService.updateBankAccount(editingItem._id, payload);
          if (res.success) {
            showSuccess('Bank account updated successfully.');
            handleCloseModal();
            fetchData();
          }
        } else {
          const res = await bankDetailService.createBankAccount(payload);
          if (res.success) {
            showSuccess('Bank account added successfully.');
            handleCloseModal();
            fetchData();
          }
        }
      } else if (activeTab === 'upi') {
        if (!upiForm.upiId.trim()) {
          setFormError('Please enter a valid UPI ID.');
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('category', activeCategory);
        formData.append('upiId', upiForm.upiId.trim());
        formData.append('displayName', upiForm.displayName.trim());
        formData.append('isActive', String(upiForm.isActive));
        if (upiQrFile) {
          formData.append('qrCode', upiQrFile);
        }

        if (editingItem) {
          const res = await bankDetailService.updateUpiDetail(editingItem._id, formData);
          if (res.success) {
            showSuccess('UPI detail updated successfully.');
            handleCloseModal();
            fetchData();
          }
        } else {
          const res = await bankDetailService.createUpiDetail(formData);
          if (res.success) {
            showSuccess('UPI detail added successfully.');
            handleCloseModal();
            fetchData();
          }
        }
      } else if (activeTab === 'wallets') {
        if (!walletForm.walletAddress.trim()) {
          setFormError('Please enter a wallet address.');
          setSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('category', activeCategory);
        formData.append('walletName', walletForm.walletName.trim());
        formData.append('assetType', walletForm.assetType.trim());
        formData.append('network', walletForm.network.trim());
        formData.append('walletAddress', walletForm.walletAddress.trim());
        formData.append('isActive', String(walletForm.isActive));
        if (walletQrFile) {
          formData.append('qrCode', walletQrFile);
        }

        if (editingItem) {
          const res = await bankDetailService.updateWalletDetail(editingItem._id, formData);
          if (res.success) {
            showSuccess('Wallet detail updated successfully.');
            handleCloseModal();
            fetchData();
          }
        } else {
          const res = await bankDetailService.createWalletDetail(formData);
          if (res.success) {
            showSuccess('Wallet detail added successfully.');
            handleCloseModal();
            fetchData();
          }
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      setFormError(err.response?.data?.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page-wrapper">
      {/* Page Header */}
      <div className="page-header-wrapper">
        <div className="page-title-section">
          <h2>Bank Details</h2>
          <p>Manage GST and NON-GST payment options (Bank Accounts, UPI IDs, and Wallets)</p>
        </div>
      </div>

      {/* Primary Category Selector: GST vs NON-GST */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Payment Category:
        </span>
        <div style={{
          display: 'inline-flex',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
        }}>
          <button
            type="button"
            onClick={() => setActiveCategory('GST')}
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              background: activeCategory === 'GST' ? 'var(--primary)' : 'transparent',
              color: activeCategory === 'GST' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeCategory === 'GST' ? '0 2px 10px rgba(0, 102, 255, 0.3)' : 'none',
            }}
          >
            GST Category
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('NON_GST')}
            style={{
              padding: '8px 24px',
              borderRadius: '8px',
              border: 'none',
              background: activeCategory === 'NON_GST' ? 'var(--primary)' : 'transparent',
              color: activeCategory === 'NON_GST' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeCategory === 'NON_GST' ? '0 2px 10px rgba(0, 102, 255, 0.3)' : 'none',
            }}
          >
            NON-GST Category
          </button>
        </div>
      </div>

      {/* Sub Category Navigation Tabs: Bank Accounts | UPI | Wallet */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '2px',
        marginBottom: '25px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('banks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'banks' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeTab === 'banks' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Landmark size={18} />
            <span>Bank Accounts</span>
            {activeTab === 'banks' && banks.length > 0 && (
              <span style={{
                background: 'rgba(0, 102, 255, 0.15)',
                color: 'var(--primary)',
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
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'upi' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeTab === 'upi' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <QrCode size={18} />
            <span>UPI Details</span>
            {activeTab === 'upi' && upiList.length > 0 && (
              <span style={{
                background: 'rgba(0, 102, 255, 0.15)',
                color: 'var(--primary)',
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
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'wallets' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              color: activeTab === 'wallets' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Wallet size={18} />
            <span>Wallet Details</span>
            {activeTab === 'wallets' && wallets.length > 0 && (
              <span style={{
                background: 'rgba(0, 102, 255, 0.15)',
                color: 'var(--primary)',
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

        {/* Action Button: + Add */}
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          <span>
            {activeTab === 'banks'
              ? 'Add Bank Account'
              : activeTab === 'upi'
              ? 'Add UPI Details'
              : 'Add Wallet Details'}
          </span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(34, 211, 160, 0.1)',
          border: '1px solid rgba(34, 211, 160, 0.3)',
          color: '#22d3a0',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          <Check size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="dashboard-loading-spinner" style={{ padding: '80px 20px' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p>Loading {activeCategory} {activeTab === 'banks' ? 'bank accounts' : activeTab === 'upi' ? 'UPI details' : 'wallets'}...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: BANK ACCOUNTS */}
          {activeTab === 'banks' && (
            <div className="datagrid-section-wrapper glass-card" style={{ padding: '24px' }}>
              {banks.length === 0 ? (
                <div className="empty-state glass-card" style={{ boxShadow: 'none', border: 'none', background: 'transparent', padding: '60px 20px' }}>
                  <Landmark size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <h2>No {activeCategory} Bank Accounts Found</h2>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 20px' }}>
                    Click the &quot;Add Bank Account&quot; button above to configure a bank account under {activeCategory}.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Plus size={16} />
                    <span>Add Bank Account</span>
                  </button>
                </div>
              ) : (
                <div className="datagrid-container">
                  <table className="datagrid-table">
                    <thead>
                      <tr>
                        <th>Bank &amp; Holder Name</th>
                        <th>Account Number</th>
                        <th>IFSC &amp; Branch</th>
                        <th>Account Type</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banks.map((b) => {
                        const isRevealed = !!visibleAccountNumbers[b._id];
                        return (
                          <tr key={b._id} className="datagrid-row">
                            <td>
                              <div className="row-title-container" style={{ paddingLeft: '8px' }}>
                                <div className="demo-thumbnail-wrapper" style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'rgba(0, 102, 255, 0.08)',
                                  color: 'var(--primary)',
                                  borderRadius: '8px',
                                  width: '38px',
                                  height: '38px'
                                }}>
                                  <Building2 size={18} />
                                </div>
                                <div style={{ marginLeft: '12px' }}>
                                  <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text-main)' }}>
                                    {b.bankName}
                                  </strong>
                                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    {b.accountHolderName}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.95rem',
                                  fontWeight: 600,
                                  letterSpacing: '1px',
                                  color: 'var(--text-main)',
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border-color)'
                                }}>
                                  {isRevealed ? b.accountNumber : maskAccountNumber(b.accountNumber)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleAccountVisibility(b._id)}
                                  className="action-icon-btn"
                                  title={isRevealed ? 'Hide account number' : 'Show account number'}
                                  style={{ padding: '4px', cursor: 'pointer' }}
                                >
                                  {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(b.accountNumber, b._id)}
                                  className="action-icon-btn"
                                  title="Copy account number"
                                  style={{ padding: '4px', cursor: 'pointer' }}
                                >
                                  {copiedId === b._id ? <Check size={14} style={{ color: '#22d3a0' }} /> : <Copy size={14} />}
                                </button>
                              </div>
                            </td>
                            <td>
                              <div>
                                <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>
                                  {b.ifscCode}
                                </span>
                                {b.branchName && (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {b.branchName}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span style={{
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                padding: '4px 10px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-muted)',
                                border: '1px solid var(--border-color)'
                              }}>
                                {b.accountType || 'Current'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => handleToggleActive(b)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  background: b.isActive ? 'rgba(34, 211, 160, 0.15)' : 'rgba(255, 77, 77, 0.15)',
                                  color: b.isActive ? '#22d3a0' : '#ff4d4d',
                                }}
                                title="Click to toggle status"
                              >
                                {b.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                <span>{b.isActive ? 'Active' : 'Inactive'}</span>
                              </button>
                            </td>
                            <td>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', paddingRight: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(b)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#10b981',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'opacity 0.2s, transform 0.2s',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                  title="Edit Bank Account"
                                >
                                  <Edit2 size={18} strokeWidth={2.2} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(b._id, b.bankName)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ff4d4d',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'opacity 0.2s, transform 0.2s',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                  title="Delete Bank Account"
                                >
                                  <Trash2 size={18} strokeWidth={2.2} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPI DETAILS */}
          {activeTab === 'upi' && (
            <div className="datagrid-section-wrapper glass-card" style={{ padding: '24px' }}>
              {upiList.length === 0 ? (
                <div className="empty-state glass-card" style={{ boxShadow: 'none', border: 'none', background: 'transparent', padding: '60px 20px' }}>
                  <QrCode size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <h2>No {activeCategory} UPI Details Registered</h2>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 20px' }}>
                    Click &quot;Add UPI Details&quot; to configure a UPI ID and optional QR Code under {activeCategory}.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Plus size={16} />
                    <span>Add UPI Details</span>
                  </button>
                </div>
              ) : (
                <div className="datagrid-container">
                  <table className="datagrid-table">
                    <thead>
                      <tr>
                        <th>UPI ID &amp; Name</th>
                        <th>QR Code</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upiList.map((u) => (
                        <tr key={u._id} className="datagrid-row">
                          <td>
                            <div className="row-title-container" style={{ paddingLeft: '8px' }}>
                              <div className="demo-thumbnail-wrapper" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0, 102, 255, 0.08)',
                                color: 'var(--primary)',
                                borderRadius: '8px',
                                width: '38px',
                                height: '38px'
                              }}>
                                <QrCode size={18} />
                              </div>
                              <div style={{ marginLeft: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                                    {u.upiId}
                                  </strong>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(u.upiId, u._id)}
                                    className="action-icon-btn"
                                    title="Copy UPI ID"
                                    style={{ padding: '2px', cursor: 'pointer' }}
                                  >
                                    {copiedId === u._id ? <Check size={12} style={{ color: '#22d3a0' }} /> : <Copy size={12} />}
                                  </button>
                                </div>
                                {u.displayName && (
                                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    {u.displayName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            {u.qrCodeUrl ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img
                                  src={getMediaUrl(u.qrCodeUrl)}
                                  alt="UPI QR Code"
                                  onClick={() => setPreviewQrUrl(getMediaUrl(u.qrCodeUrl))}
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    objectFit: 'contain',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    background: '#ffffff',
                                    padding: '2px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                  }}
                                  title="Click to preview QR code"
                                />
                                <button
                                  type="button"
                                  onClick={() => setPreviewQrUrl(getMediaUrl(u.qrCodeUrl))}
                                  className="datagrid-link-pill"
                                  style={{ fontSize: '0.78rem', padding: '4px 8px', cursor: 'pointer' }}
                                >
                                  View QR
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No QR</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(u)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                background: u.isActive ? 'rgba(34, 211, 160, 0.15)' : 'rgba(255, 77, 77, 0.15)',
                                color: u.isActive ? '#22d3a0' : '#ff4d4d',
                              }}
                              title="Click to toggle status"
                            >
                              {u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                              <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>
                          <td>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '-'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', paddingRight: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(u)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#10b981',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'opacity 0.2s, transform 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                title="Edit UPI Detail"
                              >
                                <Edit2 size={18} strokeWidth={2.2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(u._id, u.upiId)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ff4d4d',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'opacity 0.2s, transform 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                title="Delete UPI Detail"
                              >
                                <Trash2 size={18} strokeWidth={2.2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WALLET DETAILS */}
          {activeTab === 'wallets' && (
            <div className="datagrid-section-wrapper glass-card" style={{ padding: '24px' }}>
              {wallets.length === 0 ? (
                <div className="empty-state glass-card" style={{ boxShadow: 'none', border: 'none', background: 'transparent', padding: '60px 20px' }}>
                  <Wallet size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <h2>No {activeCategory} Wallets Registered</h2>
                  <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 20px' }}>
                    Click &quot;Add Wallet Details&quot; to configure a wallet address and optional QR Code under {activeCategory}.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Plus size={16} />
                    <span>Add Wallet Details</span>
                  </button>
                </div>
              ) : (
                <div className="datagrid-container">
                  <table className="datagrid-table">
                    <thead>
                      <tr>
                        <th>Wallet &amp; Asset Info</th>
                        <th>Wallet Address</th>
                        <th>Network</th>
                        <th>QR Code</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wallets.map((w) => (
                        <tr key={w._id} className="datagrid-row">
                          <td>
                            <div className="row-title-container" style={{ paddingLeft: '8px' }}>
                              <div className="demo-thumbnail-wrapper" style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(0, 102, 255, 0.08)',
                                color: 'var(--primary)',
                                borderRadius: '8px',
                                width: '38px',
                                height: '38px'
                              }}>
                                <Wallet size={18} />
                              </div>
                              <div style={{ marginLeft: '12px' }}>
                                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)', display: 'block' }}>
                                  {w.walletName || 'Crypto / Digital Wallet'}
                                </strong>
                                {w.assetType && (
                                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    Asset: {w.assetType}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                color: 'var(--text-main)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                maxWidth: '220px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }} title={w.walletAddress}>
                                {w.walletAddress}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(w.walletAddress, w._id)}
                                className="action-icon-btn"
                                title="Copy Wallet Address"
                                style={{ padding: '4px', cursor: 'pointer' }}
                              >
                                {copiedId === w._id ? <Check size={14} style={{ color: '#22d3a0' }} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </td>
                          <td>
                            {w.network ? (
                              <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(0, 102, 255, 0.1)',
                                color: 'var(--primary)',
                                border: '1px solid rgba(0, 102, 255, 0.2)'
                              }}>
                                {w.network}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Standard</span>
                            )}
                          </td>
                          <td>
                            {w.qrCodeUrl ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img
                                  src={getMediaUrl(w.qrCodeUrl)}
                                  alt="Wallet QR Code"
                                  onClick={() => setPreviewQrUrl(getMediaUrl(w.qrCodeUrl))}
                                  style={{
                                    width: '42px',
                                    height: '42px',
                                    objectFit: 'contain',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-color)',
                                    background: '#ffffff',
                                    padding: '2px',
                                    cursor: 'pointer',
                                  }}
                                  title="Click to preview QR code"
                                />
                                <button
                                  type="button"
                                  onClick={() => setPreviewQrUrl(getMediaUrl(w.qrCodeUrl))}
                                  className="datagrid-link-pill"
                                  style={{ fontSize: '0.78rem', padding: '4px 8px', cursor: 'pointer' }}
                                >
                                  View QR
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No QR</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(w)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                background: w.isActive ? 'rgba(34, 211, 160, 0.15)' : 'rgba(255, 77, 77, 0.15)',
                                color: w.isActive ? '#22d3a0' : '#ff4d4d',
                              }}
                              title="Click to toggle status"
                            >
                              {w.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                              <span>{w.isActive ? 'Active' : 'Inactive'}</span>
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', paddingRight: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(w)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#10b981',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'opacity 0.2s, transform 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                title="Edit Wallet Detail"
                              >
                                <Edit2 size={18} strokeWidth={2.2} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(w._id, w.walletName || w.walletAddress)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ff4d4d',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'opacity 0.2s, transform 0.2s',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                                title="Delete Wallet Detail"
                              >
                                <Trash2 size={18} strokeWidth={2.2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL: ADD / EDIT DIALOG */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div className="glass-card" style={{
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {editingItem ? 'Edit' : 'Add New'}{' '}
                  {activeTab === 'banks'
                    ? 'Bank Account'
                    : activeTab === 'upi'
                    ? 'UPI Details'
                    : 'Wallet Details'}
                </h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Category: {activeCategory}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                background: 'rgba(255, 77, 77, 0.1)',
                border: '1px solid rgba(255, 77, 77, 0.3)',
                color: '#ff4d4d',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '16px',
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* BANK FORM FIELDS */}
              {activeTab === 'banks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, State Bank of India"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SmartSoft Technologies Pvt Ltd"
                      value={bankForm.accountHolderName}
                      onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Account Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 50200012345678"
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          outline: 'none',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        IFSC Code *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0001234"
                        value={bankForm.ifscCode}
                        onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          outline: 'none',
                          fontFamily: 'monospace',
                          textTransform: 'uppercase',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Branch Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai Main Branch"
                        value={bankForm.branchName}
                        onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Account Type
                      </label>
                      <select
                        value={bankForm.accountType}
                        onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          outline: 'none',
                        }}
                      >
                        <option value="Current" style={{ background: '#1e293b' }}>Current Account</option>
                        <option value="Savings" style={{ background: '#1e293b' }}>Savings Account</option>
                        <option value="Salary" style={{ background: '#1e293b' }}>Salary Account</option>
                        <option value="Other" style={{ background: '#1e293b' }}>Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      id="bank-is-active"
                      checked={bankForm.isActive}
                      onChange={(e) => setBankForm({ ...bankForm, isActive: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="bank-is-active" style={{ fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      Mark as Active
                    </label>
                  </div>
                </div>
              )}

              {/* UPI FORM FIELDS */}
              {activeTab === 'upi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      UPI ID (VPA) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. smartsoft@okhdfcbank or business@upi"
                      value={upiForm.upiId}
                      onChange={(e) => setUpiForm({ ...upiForm, upiId: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Display Name / Beneficiary Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SmartSoft Official UPI"
                      value={upiForm.displayName}
                      onChange={(e) => setUpiForm({ ...upiForm, displayName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      QR Code Image (Optional)
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}>
                      {upiQrPreview ? (
                        <img
                          src={upiQrPreview}
                          alt="QR Preview"
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            background: '#ffffff',
                            padding: '2px',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '60px',
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px',
                          color: 'var(--text-muted)'
                        }}>
                          <Upload size={20} />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setUpiQrFile(file);
                              setUpiQrPreview(URL.createObjectURL(file));
                            }
                          }}
                          style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}
                        />
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Supported: JPG, PNG, WEBP, GIF (Max 10MB)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      id="upi-is-active"
                      checked={upiForm.isActive}
                      onChange={(e) => setUpiForm({ ...upiForm, isActive: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="upi-is-active" style={{ fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      Mark as Active
                    </label>
                  </div>
                </div>
              )}

              {/* WALLET FORM FIELDS */}
              {activeTab === 'wallets' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Wallet Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Binance, Trust Wallet"
                        value={walletForm.walletName}
                        onChange={(e) => setWalletForm({ ...walletForm, walletName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Asset / Wallet Type
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. USDT, BTC, ETH, INR"
                        value={walletForm.assetType}
                        onChange={(e) => setWalletForm({ ...walletForm, assetType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-main)',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Network (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TRC20, ERC20, BEP20, Polygon"
                      value={walletForm.network}
                      onChange={(e) => setWalletForm({ ...walletForm, network: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Wallet Address *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. TXYZ9876543210..."
                      value={walletForm.walletAddress}
                      onChange={(e) => setWalletForm({ ...walletForm, walletAddress: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        outline: 'none',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      QR Code Image (Optional)
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}>
                      {walletQrPreview ? (
                        <img
                          src={walletQrPreview}
                          alt="QR Preview"
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            background: '#ffffff',
                            padding: '2px',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '60px',
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px',
                          color: 'var(--text-muted)'
                        }}>
                          <Upload size={20} />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              setWalletQrFile(file);
                              setWalletQrPreview(URL.createObjectURL(file));
                            }
                          }}
                          style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}
                        />
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Supported: JPG, PNG, WEBP, GIF (Max 10MB)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      id="wallet-is-active"
                      checked={walletForm.isActive}
                      onChange={(e) => setWalletForm({ ...walletForm, isActive: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="wallet-is-active" style={{ fontSize: '0.9rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                      Mark as Active
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                  disabled={submitting}
                  style={{ padding: '10px 18px', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span>{editingItem ? 'Save Changes' : 'Create Record'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE PREVIEW */}
      {previewQrUrl && (
        <div
          onClick={() => setPreviewQrUrl(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
            cursor: 'pointer',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '16px',
              maxWidth: '380px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              position: 'relative',
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
            <h4 style={{ margin: '0 0 16px 0', color: '#0f172a', fontWeight: 700 }}>
              QR Code Preview
            </h4>
            <img
              src={previewQrUrl}
              alt="Full QR Preview"
              style={{
                width: '100%',
                maxWidth: '280px',
                height: 'auto',
                aspectRatio: '1/1',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
            <a
              href={previewQrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                marginTop: '16px',
                width: '100%',
                textAlign: 'center',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>Open in New Tab</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDetails;
