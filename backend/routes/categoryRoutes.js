const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  deleteCategory,
  getCategoryTree,
  updateCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { uploadCategoryImageFile } = require('../middleware/uploadMiddleware');
const { cloudinaryUpload } = require('../middleware/cloudinaryUpload');

// Public routes
router.get('/categories', getCategories);
router.get('/categories/tree', getCategoryTree);

// Admin routes (Protected)
router.post('/admin/categories', protect, uploadCategoryImageFile, cloudinaryUpload, createCategory);
router.put('/admin/categories/:id', protect, uploadCategoryImageFile, cloudinaryUpload, updateCategory);
router.delete('/admin/categories/:id', protect, deleteCategory);

module.exports = router;

