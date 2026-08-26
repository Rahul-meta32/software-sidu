import axiosInstance, { API_BASE_URL } from './axiosInstance';

export { API_BASE_URL };

/**
 * Authentication Services
 */
export const authService = {
  /**
   * Log in admin user
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<object>} response data with token and admin info
   */
  login: async (email, password) => {
    const response = await axiosInstance.post('/admin/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminEmail', response.data.admin.username || response.data.admin.email);
      localStorage.setItem('adminRole', response.data.admin.role || 'agent');
      if (response.data.admin.profileImage) {
        const serverUrl = API_BASE_URL.replace(/\/api\/?$/, '');
        const fullUrl = response.data.admin.profileImage.startsWith('http') 
          ? response.data.admin.profileImage 
          : `${serverUrl}/${response.data.admin.profileImage}`;
        localStorage.setItem('adminAvatar', fullUrl);
      } else {
        localStorage.removeItem('adminAvatar');
      }
    }
    return response.data;
  },

  /**
   * Log out admin user by clearing local token
   */
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminRole');
  },

  /**
   * Check if user is currently authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },

  /**
   * Fetch admin profile details
   * @returns {Promise<object>}
   */
  getProfile: async () => {
    const response = await axiosInstance.get('/admin/profile');
    return response.data;
  },

  /**
   * Update admin profile details (email, password, and avatar)
   * @param {FormData} formData 
   */
  updateProfile: async (formData) => {
    const response = await axiosInstance.put('/admin/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Create new user
   */
  createUser: async (username, password) => {
    const response = await axiosInstance.post('/admin/create-user', { username, password });
    return response.data;
  },

  /**
   * Create new agent
   */
  createAgent: async (username, password) => {
    const response = await axiosInstance.post('/admin/create-agent', { username, password });
    return response.data;
  },

  /**
   * Get all users and agents list
   */
  getUsersAndAgents: async () => {
    const response = await axiosInstance.get('/admin/users-and-agents');
    return response.data;
  },

  /**
   * Delete a user or agent account
   */
  deleteUserOrAgent: async (id) => {
    const response = await axiosInstance.delete(`/admin/users-and-agents/${id}`);
    return response.data;
  },

  /**
   * Update a user or agent account
   */
  updateUserOrAgent: async (id, username, password) => {
    const response = await axiosInstance.put(`/admin/users-and-agents/${id}`, { username, password });
    return response.data;
  }
};

/**
 * Demo Sites Services
 */
export const demoSiteService = {
  /**
   * Get all demo sites (Client & Admin side)
   * @param {object} params - Query params (page, limit, search)
   * @returns {Promise<object>} Paginated results
   */
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/demo-sites', { params });
    return response.data;
  },

  /**
   * Get single demo site details
   * @param {string} id - Demo Site database ID
   * @returns {Promise<object>} Demo site object
   */
  getById: async (id) => {
    const response = await axiosInstance.get(`/demo-sites/${id}`);
    return response.data;
  },

  /**
   * Create a new Demo Site (Admin only)
   * @param {FormData} formData - Multipart Form Data
   */
  create: async (formData) => {
    const response = await axiosInstance.post('/admin/demo-sites', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update an existing Demo Site (Admin only)
   * @param {string} id - Demo Site ID
   * @param {FormData} formData - Multipart Form Data
   */
  update: async (id, formData) => {
    const response = await axiosInstance.put(`/admin/demo-sites/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a Demo Site and its files (Admin only)
   * @param {string} id - Demo Site ID
   */
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/demo-sites/${id}`);
    return response.data;
  },

  /**
   * Upload single APK file with progress tracking
   * @param {File} file - APK File
   * @param {function} onProgress - Progress callback (percentage)
   */
  uploadApk: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('apkFile', file);
    const response = await axiosInstance.post('/admin/upload-apk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onProgress) onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },
};


/**
 * Category Services
 */
export const categoryService = {
  getAll: async () => {
    const response = await axiosInstance.get('/categories');
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/admin/categories', data);
    return response.data;
  },
  update: async (id, formData) => {
    const response = await axiosInstance.put(`/admin/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/categories/${id}`);
    return response.data;
  }
};

/**
 * Server Category Services
 */
export const serverCategoryService = {
  getAll: async () => {
    const response = await axiosInstance.get('/server-categories');
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/admin/server-categories', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/admin/server-categories/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/server-categories/${id}`);
    return response.data;
  },
  requestPassword: async (id) => {
    const response = await axiosInstance.post(`/server-categories/${id}/request-password`);
    return response.data;
  },
  approvePasswordRequest: async (requestId) => {
    const response = await axiosInstance.put(`/admin/server-password-requests/${requestId}/approve`);
    return response.data;
  },
  rejectPasswordRequest: async (requestId) => {
    const response = await axiosInstance.put(`/admin/server-password-requests/${requestId}/reject`);
    return response.data;
  }
};

/**
 * Homepage Section Management Services
 */
export const homepageSectionService = {
  /**
   * Get all sections including hidden (admin only)
   */
  getAll: async () => {
    const response = await axiosInstance.get('/homepage/admin/all-sections');
    return response.data;
  },

  /**
   * Toggle visibility of a section
   * @param {string} id - Section ID
   * @param {boolean} isVisible - New visibility state
   */
  toggleVisibility: async (id, isVisible) => {
    const response = await axiosInstance.put(`/homepage/admin/sections/${id}`, { isVisible });
    return response.data;
  },

  /**
   * Update a section configuration
   * @param {string} id - Section ID
   * @param {object} data - Data to update (e.g. { items: [...] })
   */
  update: async (id, data) => {
    const response = await axiosInstance.put(`/homepage/admin/sections/${id}`, data);
    return response.data;
  },

  /**
   * Delete a section
   * @param {string} id - Section ID
   */
  delete: async (id) => {
    const response = await axiosInstance.delete(`/homepage/admin/sections/${id}`);
    return response.data;
  }
};

/**
 * Script Sites Services
 */
export const scriptSiteService = {
  getAll: async () => {
    const response = await axiosInstance.get('/script-sites');
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/admin/script-sites', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await axiosInstance.put(`/admin/script-sites/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/admin/script-sites/${id}`);
    return response.data;
  }
};

