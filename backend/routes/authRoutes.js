const express = require('express');
const {
  loginAdmin,
  loginClient,
  createUser,
  createAgent,
  getUsersAndAgents,
  getAdminProfile,
  updateAdminProfile,
  deleteUserOrAgent,
  updateUserOrAgent
} = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { uploadAdminProfileImage } = require('../middleware/uploadMiddleware');
const { cloudinaryUpload } = require('../middleware/cloudinaryUpload');

const router = express.Router();

// Route: POST /api/admin/login
router.post('/login', loginAdmin);

// Route: POST /api/admin/client/login
router.post('/client/login', loginClient);

// Route: POST /api/admin/create-user
router.post('/create-user', protect, restrictTo('superadmin'), createUser);

// Route: POST /api/admin/create-agent
router.post('/create-agent', protect, restrictTo('superadmin'), createAgent);

// Route: GET /api/admin/users-and-agents
router.get('/users-and-agents', protect, restrictTo('superadmin'), getUsersAndAgents);

// Route: DELETE /api/admin/users-and-agents/:id
router.delete('/users-and-agents/:id', protect, restrictTo('superadmin'), deleteUserOrAgent);

// Route: PUT /api/admin/users-and-agents/:id
router.put('/users-and-agents/:id', protect, restrictTo('superadmin'), updateUserOrAgent);

// Route: GET /api/admin/profile (Get profile details)
router.get('/profile', protect, getAdminProfile);

// Route: PUT /api/admin/profile (Update details/avatar)
router.put('/profile', protect, uploadAdminProfileImage, cloudinaryUpload, updateAdminProfile);

module.exports = router;

