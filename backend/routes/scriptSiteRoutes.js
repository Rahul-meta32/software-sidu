const express = require('express');
const router = express.Router();
const {
  getScriptSites,
  createScriptSite,
  deleteScriptSite,
  updateScriptSite,
} = require('../controllers/scriptSiteController');
const { protect } = require('../middleware/authMiddleware');

// Get all script sites
router.get('/script-sites', protect, getScriptSites);

// Create script site
router.post('/admin/script-sites', protect, createScriptSite);

// Update script site
router.put('/admin/script-sites/:id', protect, updateScriptSite);

// Delete script site
router.delete('/admin/script-sites/:id', protect, deleteScriptSite);

module.exports = router;
