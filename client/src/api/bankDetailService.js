import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

/**
 * Public Client-side Bank Details Service
 */
export const bankDetailService = {
  /**
   * Fetch active bank details for public display
   * @param {string} [category] - Optional 'GST' or 'NON_GST'
   */
  getPublicDetails: async (category) => {
    const params = category ? { category } : {};
    const response = await axios.get(`${API_BASE}/bank-details/public`, { params });
    return response.data;
  },
};

export default bankDetailService;
