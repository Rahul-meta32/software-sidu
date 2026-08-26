const express = require('express');
const router = express.Router();
const {
  getServerCategories,
  createServerCategory,
  updateServerCategory,
  deleteServerCategory,
  requestServerPassword,
  approveServerPasswordRequest,
  rejectServerPasswordRequest,
} = require('../controllers/serverCategoryController');
const { protect } = require('../middleware/authMiddleware');

// Get allowed server categories list (Authenticated users)
router.get('/server-categories', protect, getServerCategories);

// Password Request (Agents/Developers)
router.post('/server-categories/:id/request-password', protect, requestServerPassword);

// Server Category Management (Admin/Superadmin only)
router.post('/admin/server-categories', protect, createServerCategory);
router.put('/admin/server-categories/:id', protect, updateServerCategory);
router.delete('/admin/server-categories/:id', protect, deleteServerCategory);

// Password Request Approval (Superadmin only)
router.put('/admin/server-password-requests/:requestId/approve', protect, approveServerPasswordRequest);
router.put('/admin/server-password-requests/:requestId/reject', protect, rejectServerPasswordRequest);

module.exports = router;
