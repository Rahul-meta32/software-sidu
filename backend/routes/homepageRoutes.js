const express = require('express');
const {
  getHomepageData,
  getAdminSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection
} = require('../controllers/homepageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// --- PUBLIC ROUTES ---
// GET /api/homepage -> Retrieves active homepage layout sections
router.get('/', getHomepageData);

// --- PROTECTED ADMIN ROUTES ---
// GET /api/homepage/admin/all-sections -> Get all sections including hidden (admin only)
router.get('/admin/all-sections', protect, getAdminSections);

// POST /api/admin/homepage/sections -> Create new homepage section config
router.post('/admin/sections', protect, createHomepageSection);

// PUT /api/admin/homepage/sections/:id -> Update homepage section config
router.put('/admin/sections/:id', protect, updateHomepageSection);

// DELETE /api/admin/homepage/sections/:id -> Delete homepage section config
router.delete('/admin/sections/:id', protect, deleteHomepageSection);

module.exports = router;

