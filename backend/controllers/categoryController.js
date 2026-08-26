const Category = require('../models/Category');
const DemoSite = require('../models/DemoSite');
const mongoose = require('mongoose');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategory');
    
    const orderMap = {
      "web & software development": 1,
      "mobile application development": 2,
      "blockchain development": 3,
      "trading software development": 4,
      "ai & automation services": 5
    };

    categories.sort((a, b) => {
      const orderA = orderMap[a.name.toLowerCase().trim()] || 99;
      const orderB = orderMap[b.name.toLowerCase().trim()] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.name.localeCompare(b.name);
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error('getCategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message,
    });
  }
};

// @desc    Get hierarchical category tree with nested demo sites (for services mega menu)
// @route   GET /api/categories/tree
// @access  Public
exports.getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const demoSites = await DemoSite.find({ isActive: true })
      .select('_id title category images liveDemoLink adminLink frontendCredentials adminCredentials description isActive video createdAt')
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory'
        }
      })
      .lean();

    // Group demo sites by category ID
    const sitesByCategory = {};
    demoSites.forEach(site => {
      if (site.category) {
        const catId = site.category._id ? site.category._id.toString() : site.category.toString();
        if (!sitesByCategory[catId]) {
          sitesByCategory[catId] = [];
        }
        sitesByCategory[catId].push(site);
      }
    });

    // Separate into Main and Subcategories
    const mainCategories = categories.filter(cat => !cat.parentCategory);
    const subCategories = categories.filter(cat => cat.parentCategory);

    // Build subcategories under their parent, and attach their demo sites
    const subCategoriesMap = {};
    subCategories.forEach(sub => {
      const subObj = {
        ...sub,
        products: sitesByCategory[sub._id.toString()] || []
      };
      
      const parentId = sub.parentCategory.toString();
      if (!subCategoriesMap[parentId]) {
        subCategoriesMap[parentId] = [];
      }
      subCategoriesMap[parentId].push(subObj);
    });

    // Build the final tree
    const tree = mainCategories.map(main => {
      return {
        ...main,
        subcategories: subCategoriesMap[main._id.toString()] || []
      };
    });

    const orderMap = {
      "web & software development": 1,
      "mobile application development": 2,
      "blockchain development": 3,
      "trading software development": 4,
      "ai & automation services": 5
    };

    tree.sort((a, b) => {
      const orderA = orderMap[a.name.toLowerCase().trim()] || 99;
      const orderB = orderMap[b.name.toLowerCase().trim()] || 99;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.name.localeCompare(b.name);
    });

    res.status(200).json({
      success: true,
      data: tree
    });
  } catch (error) {
    console.error('getCategoryTree error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category tree',
      error: error.message,
    });
  }
};

// @desc    Create a new category
// @route   POST /api/admin/categories
// @access  Private (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a category name',
      });
    }

    // Check if category already exists
    const categoryExists = await Category.findOne({ name: name.trim() });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    let parentId = null;
    if (parentCategory) {
      if (mongoose.Types.ObjectId.isValid(parentCategory)) {
        const parent = await Category.findById(parentCategory);
        if (!parent) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found',
          });
        }
        parentId = parent._id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid Parent Category ID format',
        });
      }
    }

    let image = '';
    if (req.file) {
      image = req.file.cloudinaryUrl || `uploads/${req.file.filename}`;
    }

    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      parentCategory: parentId,
      image,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('createCategory error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Validation error',
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Also delete or clear parent category references in child categories
    await Category.updateMany({ parentCategory: category._id }, { $set: { parentCategory: null } });

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('deleteCategory error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update a category (description and image)
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (name !== undefined) {
      category.name = name.trim();
    }
    if (description !== undefined) {
      category.description = description.trim();
    }

    // Check if new image was uploaded via Cloudinary
    if (req.file) {
      category.image = req.file.cloudinaryUrl || `uploads/${req.file.filename}`;
    } else if (req.body.imageUrl !== undefined) {
      category.image = req.body.imageUrl;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    console.error('updateCategory error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Validation error',
    });
  }
};

