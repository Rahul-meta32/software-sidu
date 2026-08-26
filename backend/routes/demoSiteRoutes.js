const express = require('express');
const {
  createDemoSite,
  getDemoSites,
  getDemoSiteById,
  updateDemoSite,
  deleteDemoSite,
  uploadApkFile,
} = require('../controllers/demoSiteController');
const { protect } = require('../middleware/authMiddleware');
const { uploadDemoSiteFiles, uploadSingleApkFile } = require('../middleware/uploadMiddleware');
const { cloudinaryUpload } = require('../middleware/cloudinaryUpload');

const router = express.Router();

// --- PUBLIC ROUTES ---
// GET /api/demo-sites -> Get all demo sites (Client side)
router.get('/demo-sites', getDemoSites);

// GET /api/demo-sites/:id -> Get single demo site
router.get('/demo-sites/:id', getDemoSiteById);

// --- PROTECTED ADMIN ROUTES ---
// POST /api/admin/upload-apk -> Standalone upload APK with progress
router.post('/admin/upload-apk', protect, uploadSingleApkFile, uploadApkFile);

// POST /api/admin/demo-sites -> Create new demo site
router.post('/admin/demo-sites', protect, uploadDemoSiteFiles, cloudinaryUpload, createDemoSite);

// PUT /api/admin/demo-sites/:id -> Update demo site
router.put('/admin/demo-sites/:id', protect, uploadDemoSiteFiles, cloudinaryUpload, updateDemoSite);

// DELETE /api/admin/demo-sites/:id -> Delete demo site
router.delete('/admin/demo-sites/:id', protect, deleteDemoSite);

module.exports = router;

