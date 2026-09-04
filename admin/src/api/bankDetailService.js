import axiosInstance from './axiosInstance';

/**
 * Bank Details Management Services (Super Admin)
 */
export const bankDetailService = {
  // =========================================================================
  // Bank Accounts
  // =========================================================================
  getBankAccounts: async (category) => {
    const params = category ? { category } : {};
    const response = await axiosInstance.get('/admin/bank-details/banks', { params });
    return response.data;
  },

  createBankAccount: async (data) => {
    const response = await axiosInstance.post('/admin/bank-details/banks', data);
    return response.data;
  },

  updateBankAccount: async (id, data) => {
    const response = await axiosInstance.put(`/admin/bank-details/banks/${id}`, data);
    return response.data;
  },

  deleteBankAccount: async (id) => {
    const response = await axiosInstance.delete(`/admin/bank-details/banks/${id}`);
    return response.data;
  },

  // =========================================================================
  // UPI Details
  // =========================================================================
  getUpiDetails: async (category) => {
    const params = category ? { category } : {};
    const response = await axiosInstance.get('/admin/bank-details/upi', { params });
    return response.data;
  },

  createUpiDetail: async (data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await axiosInstance.post('/admin/bank-details/upi', data, config);
    return response.data;
  },

  updateUpiDetail: async (id, data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await axiosInstance.put(`/admin/bank-details/upi/${id}`, data, config);
    return response.data;
  },

  deleteUpiDetail: async (id) => {
    const response = await axiosInstance.delete(`/admin/bank-details/upi/${id}`);
    return response.data;
  },

  // =========================================================================
  // Wallet Details
  // =========================================================================
  getWalletDetails: async (category) => {
    const params = category ? { category } : {};
    const response = await axiosInstance.get('/admin/bank-details/wallets', { params });
    return response.data;
  },

  createWalletDetail: async (data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await axiosInstance.post('/admin/bank-details/wallets', data, config);
    return response.data;
  },

  updateWalletDetail: async (id, data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await axiosInstance.put(`/admin/bank-details/wallets/${id}`, data, config);
    return response.data;
  },

  deleteWalletDetail: async (id) => {
    const response = await axiosInstance.delete(`/admin/bank-details/wallets/${id}`);
    return response.data;
  },
};

export default bankDetailService;
