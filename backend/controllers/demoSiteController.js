const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const DemoSite = require('../models/DemoSite');
const User = require('../models/User');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const { uploadToCloudinary } = require('../middleware/cloudinaryUpload');


// Helper function to check if requester is an admin/agent
const checkAdmin = async (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await User.findById(decoded.id);
      return !!admin && (admin.role === 'superadmin' || admin.role === 'agent');
    } catch (error) {
      return false;
    }
  }
  return false;
};

// Helper function to delete a file from the disk safely
const deleteUploadedFile = (relativeFilePath) => {
  if (!relativeFilePath) return;
  const absolutePath = path.join(__dirname, '../', relativeFilePath);
  if (fs.existsSync(absolutePath)) {
    try {
      fs.unlinkSync(absolutePath);
    } catch (error) {
      console.error(`Failed to delete file at ${absolutePath}:`, error.message);
    }
  }
};

// Helper function to clean up newly uploaded files in case of request validation failure
const cleanupUploadedFiles = (files) => {
  if (!files) return;
  if (files.images) {
    files.images.forEach(file => deleteUploadedFile(`uploads/${file.filename}`));
  }
  if (files.video) {
    deleteUploadedFile(`uploads/${files.video[0].filename}`);
  }
  if (files.apkFile) {
    deleteUploadedFile(`uploads/${files.apkFile[0].filename}`);
  }
};

/**
 * @desc    Create new Demo Site
 * @route   POST /api/admin/demo-sites
 * @access  Private (Admin)
 */
const createDemoSite = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      liveDemoLink, 
      category, 
      isActive, 
      serverCategory, 
      scriptLink, 
      date,
      adminLink,
      frontendCredentials,
      frontendRoleCredentials,
      adminCredentials,
      developer,
      showInExplorer,
      isClientDemo
    } = req.body;

    // Check required textual fields
    if (!title || !description) {
      // If validation fails, delete the uploaded files to prevent disk cluttering
      cleanupUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title and description',
      });
    }

    // Process uploaded images paths
    const images = req.files && req.files.images
      ? req.files.images.map(file => file.cloudinaryUrl || `uploads/${file.filename}`)
      : [];

    // Process uploaded video path
    const video = req.files && req.files.video
      ? (req.files.video[0].cloudinaryUrl || `uploads/${req.files.video[0].filename}`)
      : null;

    // Process uploaded apk file path
    const apkFile = req.files && req.files.apkFile
      ? (req.files.apkFile[0].cloudinaryUrl || `uploads/${req.files.apkFile[0].filename}`)
      : null;

    let parsedRoleCredentials = [];
    if (frontendRoleCredentials) {
      try {
        parsedRoleCredentials = typeof frontendRoleCredentials === 'string'
          ? JSON.parse(frontendRoleCredentials)
          : frontendRoleCredentials;
      } catch (err) {
        console.error('Failed to parse frontendRoleCredentials:', err.message);
      }
    }

    // Process uploaded roleApk_* files
    if (req.files) {
      parsedRoleCredentials.forEach((cred, index) => {
        const fieldName = `roleApk_${index}`;
        if (req.files[fieldName] && req.files[fieldName].length > 0) {
          const file = req.files[fieldName][0];
          cred.apkFile = file.cloudinaryUrl || `uploads/${file.filename}`;
        }
      });
    }

    let parsedFrontendCreds = { username: '', password: '' };
    if (frontendCredentials) {
      try {
        parsedFrontendCreds = typeof frontendCredentials === 'string'
          ? JSON.parse(frontendCredentials)
          : frontendCredentials;
      } catch (err) {
        parsedFrontendCreds = { username: frontendCredentials, password: '' };
      }
    }

    let parsedAdminCreds = { username: '', password: '' };
    if (adminCredentials) {
      try {
        parsedAdminCreds = typeof adminCredentials === 'string'
          ? JSON.parse(adminCredentials)
          : adminCredentials;
      } catch (err) {
        parsedAdminCreds = { username: adminCredentials, password: '' };
      }
    }

    // Process uploaded adminApk file
    if (req.files && req.files.adminApk && req.files.adminApk.length > 0) {
      const file = req.files.adminApk[0];
      parsedAdminCreds.apkFile = file.cloudinaryUrl || `uploads/${file.filename}`;
    }

    // Combine date with current time to preserve calendar choice but record exact save time
    let finalDate = null;
    if (date) {
      finalDate = new Date(date);
      const now = new Date();
      finalDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    } else {
      finalDate = new Date();
    }

    // Create the demo site in DB
    const demoSite = await DemoSite.create({
      title,
      description,
      images,
      video,
      apkFile,
      liveDemoLink,
      category: category && mongoose.Types.ObjectId.isValid(category) ? category : null,
      isActive: isActive === 'true' || isActive === true ? true : false,
      showInExplorer: showInExplorer === 'false' || showInExplorer === false ? false : true,
      serverCategory: serverCategory || '',
      scriptLink: scriptLink || '',
      date: finalDate,
      adminLink: adminLink || '',
      frontendCredentials: parsedFrontendCreds,
      frontendRoleCredentials: parsedRoleCredentials,
      adminCredentials: parsedAdminCreds,
      developer: req.user ? req.user.username : 'SmartSoft',
      isClientDemo: isClientDemo === 'true' || isClientDemo === true ? true : false,
    });

    return res.status(201).json({
      success: true,
      message: 'Demo site created successfully',
      data: demoSite,
    });
  } catch (error) {
    console.error('Create Demo Site Error:', error.message);
    cleanupUploadedFiles(req.files);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to create demo site.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all Demo Sites (Public - for client-side)
 * @route   GET /api/demo-sites
 * @access  Public
 */
const getDemoSites = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Search and Category parameters
    const search = req.query.search || '';
    const category = req.query.category || '';
    const categoryGroup = req.query.categoryGroup || '';
    const showInExplorer = req.query.showInExplorer;
    const serverCategory = req.query.serverCategory;
    const isActive = req.query.isActive;
    const isClientDemo = req.query.isClientDemo;
    
    const isAdmin = await checkAdmin(req);
    const query = {};

    if (isClientDemo === 'true' || isClientDemo === true) {
      query.isClientDemo = true;
    } else {
      query.isClientDemo = { $ne: true };
    }

    if (serverCategory) {
      query.serverCategory = serverCategory;
    }

    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true' || isActive === true;
    }

    if (showInExplorer !== undefined) {
      if (showInExplorer === 'true' || showInExplorer === true) {
        query.showInExplorer = { $ne: false };
      } else {
        query.showInExplorer = false;
      }
    }
    // All sites are visible to clients — active/inactive only controls the button shown

    if (category && category !== 'All Items') {
      if (mongoose.Types.ObjectId.isValid(category) && category.length === 24) {
        const catDoc = await Category.findById(category);
        if (catDoc) {
          if (!catDoc.parentCategory) {
            const subcats = await Category.find({ parentCategory: catDoc._id });
            const subcatIds = subcats.map(s => s._id);
            query.category = { $in: [catDoc._id, ...subcatIds] };
          } else {
            query.category = catDoc._id;
          }
        } else {
          query.category = category;
        }
      } else {
        const catDoc = await Category.findOne({ name: new RegExp('^' + category.trim() + '$', 'i') });
        if (catDoc) {
          if (!catDoc.parentCategory) {
            const subcats = await Category.find({ parentCategory: catDoc._id });
            const subcatIds = subcats.map(s => s._id);
            query.category = { $in: [catDoc._id, ...subcatIds] };
          } else {
            query.category = catDoc._id;
          }
        } else {
          query.category = null; // category not found, return empty results or skip
        }
      }
    }

    if (categoryGroup === 'game') {
      const gameDevCat = await Category.findOne({ name: /game development/i });
      if (gameDevCat) {
        const subCats = await Category.find({ parentCategory: gameDevCat._id });
        const gameCatIds = [gameDevCat._id, ...subCats.map(c => c._id)];
        query.category = { $in: gameCatIds };
      } else {
        query.category = { $in: [] }; // No game development categories found
      }
    } else if (categoryGroup === 'software') {
      const gameDevCat = await Category.findOne({ name: /game development/i });
      if (gameDevCat) {
        const subCats = await Category.find({ parentCategory: gameDevCat._id });
        const gameCatIds = [gameDevCat._id, ...subCats.map(c => c._id)];
        query.category = { $nin: gameCatIds };
      }
    }

    if (search) {
      const matchingCats = await Category.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const matchingCatIds = matchingCats.map(c => c._id);

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];

      if (matchingCatIds.length > 0) {
        query.$or.push({ category: { $in: matchingCatIds } });
      }
    }

    // Run queries
    const total = await DemoSite.countDocuments(query);
    const selectFields = isAdmin ? '' : '-serverCategory -scriptLink -date';

    const demoSites = await DemoSite.find(query)
      .select(selectFields)
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: demoSites.length,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: demoSites,
    });
  } catch (error) {
    console.error('Get Demo Sites Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to fetch demo sites.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single Demo Site
 * @route   GET /api/demo-sites/:id
 * @access  Public
 */
const getDemoSiteById = async (req, res) => {
  try {
    const isAdmin = await checkAdmin(req);
    const selectFields = isAdmin ? '' : '-serverCategory -scriptLink -date';
    const demoSite = await DemoSite.findById(req.params.id)
      .select(selectFields)
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory'
        }
      });

    if (!demoSite) {
      return res.status(404).json({
        success: false,
        message: `Demo site not found with id ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: demoSite,
    });
  } catch (error) {
    console.error('Get Demo Site By Id Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid Demo Site ID format',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to fetch demo site details.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update a Demo Site
 * @route   PUT /api/admin/demo-sites/:id
 * @access  Private (Admin)
 */
const updateDemoSite = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      liveDemoLink, 
      category, 
      isActive, 
      serverCategory, 
      scriptLink, 
      date,
      adminLink,
      frontendCredentials,
      frontendRoleCredentials,
      adminCredentials,
      developer,
      showInExplorer,
      isClientDemo
    } = req.body;
    let demoSite = await DemoSite.findById(req.params.id);

    if (!demoSite) {
      cleanupUploadedFiles(req.files);
      return res.status(404).json({
        success: false,
        message: `Demo site not found with id ${req.params.id}`,
      });
    }

    // Keep track of files to delete after successful update
    const oldFilesToDelete = [];

    // Fields to update
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (liveDemoLink !== undefined) updateData.liveDemoLink = liveDemoLink;
    if (category !== undefined) {
      updateData.category = category && mongoose.Types.ObjectId.isValid(category) ? category : null;
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive === 'true' || isActive === true ? true : false;
    }
    if (showInExplorer !== undefined) {
      updateData.showInExplorer = showInExplorer === 'true' || showInExplorer === true ? true : false;
    }
    if (isClientDemo !== undefined) {
      updateData.isClientDemo = isClientDemo === 'true' || isClientDemo === true ? true : false;
    }
    if (serverCategory !== undefined) updateData.serverCategory = serverCategory;
    if (scriptLink !== undefined) updateData.scriptLink = scriptLink;
    if (date !== undefined) {
      if (date) {
        const finalDate = new Date(date);
        const now = new Date();
        finalDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        updateData.date = finalDate;
      } else {
        updateData.date = new Date();
      }
    }
    if (adminLink !== undefined) updateData.adminLink = adminLink;
    if (frontendCredentials !== undefined) {
      let parsedFrontendCreds = { username: '', password: '' };
      if (frontendCredentials) {
        try {
          parsedFrontendCreds = typeof frontendCredentials === 'string'
            ? JSON.parse(frontendCredentials)
            : frontendCredentials;
        } catch (err) {
          parsedFrontendCreds = { username: frontendCredentials, password: '' };
        }
      }
      updateData.frontendCredentials = parsedFrontendCreds;
    }
    if (adminCredentials !== undefined) {
      let parsedAdminCreds = { username: '', password: '' };
      if (adminCredentials) {
        try {
          parsedAdminCreds = typeof adminCredentials === 'string'
            ? JSON.parse(adminCredentials)
            : adminCredentials;
        } catch (err) {
          parsedAdminCreds = { username: adminCredentials, password: '' };
        }
      }

      // Check if new adminApk was uploaded
      if (req.files && req.files.adminApk && req.files.adminApk.length > 0) {
        const file = req.files.adminApk[0];
        // Delete old adminApk file if it exists
        if (demoSite.adminCredentials && demoSite.adminCredentials.apkFile) {
          oldFilesToDelete.push(demoSite.adminCredentials.apkFile);
        }
        parsedAdminCreds.apkFile = file.cloudinaryUrl || `uploads/${file.filename}`;
      } else {
        // Retain the old apkFile url if it wasn't replaced or explicitly removed
        if (demoSite.adminCredentials && demoSite.adminCredentials.apkFile) {
          parsedAdminCreds.apkFile = demoSite.adminCredentials.apkFile;
        }
      }
      
      // Check if adminApk was explicitly removed
      if (req.body.adminApkRemoved === 'true') {
        if (demoSite.adminCredentials && demoSite.adminCredentials.apkFile) {
          oldFilesToDelete.push(demoSite.adminCredentials.apkFile);
        }
        parsedAdminCreds.apkFile = null;
      }

      updateData.adminCredentials = parsedAdminCreds;
    }
    if (developer !== undefined) {
      updateData.developer = (developer && developer.trim()) ? developer.trim() : 'SmartSoft';
    }
    if (frontendRoleCredentials !== undefined) {
      let parsedRoleCredentials = [];
      if (frontendRoleCredentials) {
        try {
          parsedRoleCredentials = typeof frontendRoleCredentials === 'string'
            ? JSON.parse(frontendRoleCredentials)
            : frontendRoleCredentials;
        } catch (err) {
          console.error('Failed to parse frontendRoleCredentials:', err.message);
        }
      }

      // Process uploaded roleApk_* files
      parsedRoleCredentials.forEach((cred, index) => {
        const fieldName = `roleApk_${index}`;
        if (req.files && req.files[fieldName] && req.files[fieldName].length > 0) {
          const file = req.files[fieldName][0];
          if (cred.apkFile) {
            oldFilesToDelete.push(cred.apkFile);
          }
          cred.apkFile = file.cloudinaryUrl || `uploads/${file.filename}`;
        }
      });

      // Delete any files from deleted credentials
      if (demoSite.frontendRoleCredentials) {
        demoSite.frontendRoleCredentials.forEach(oldCred => {
          if (oldCred.apkFile) {
            // Check if this apkFile is still kept in any of the updated parsedRoleCredentials
            const isKept = parsedRoleCredentials.some(newCred => newCred.apkFile === oldCred.apkFile);
            if (!isKept) {
              oldFilesToDelete.push(oldCred.apkFile);
            }
          }
        });
      }

      updateData.frontendRoleCredentials = parsedRoleCredentials;
    }

    // Parse existingImages from request body if present to manage screenshot updates correctly
    let remainingImages = [];
    if (req.body.existingImages) {
      try {
        remainingImages = typeof req.body.existingImages === 'string'
          ? JSON.parse(req.body.existingImages)
          : req.body.existingImages;
      } catch (err) {
        console.error('Failed to parse existingImages:', err.message);
      }
    } else {
      // Fallback: if not provided (e.g., from legacy client), retain all original images
      remainingImages = demoSite.images || [];
    }

    // Find deleted images to remove from disk/Cloudinary
    const remainingImagesSet = new Set(remainingImages);
    const deletedImages = (demoSite.images || []).filter(img => !remainingImagesSet.has(img));
    oldFilesToDelete.push(...deletedImages);

    // Process new images
    const newImages = req.files && req.files.images && req.files.images.length > 0
      ? req.files.images.map(file => file.cloudinaryUrl || `uploads/${file.filename}`)
      : [];

    // Save combined list of remaining and new images
    updateData.images = [...remainingImages, ...newImages];

    // Check if a new video was uploaded
    if (req.files && req.files.video && req.files.video.length > 0) {
      // Mark old video for deletion
      if (demoSite.video) {
        oldFilesToDelete.push(demoSite.video);
      }
      // Update with new video path
      updateData.video = req.files.video[0].cloudinaryUrl || `uploads/${req.files.video[0].filename}`;
    }

    // Check if a new apk was uploaded
    if (req.files && req.files.apkFile && req.files.apkFile.length > 0) {
      // Mark old apk for deletion
      if (demoSite.apkFile) {
        oldFilesToDelete.push(demoSite.apkFile);
      }
      // Update with new apk path
      updateData.apkFile = req.files.apkFile[0].cloudinaryUrl || `uploads/${req.files.apkFile[0].filename}`;
    } else if (req.body.apkFileUrl !== undefined && req.body.apkFileUrl === '') {
      if (demoSite.apkFile) {
        oldFilesToDelete.push(demoSite.apkFile);
      }
      updateData.apkFile = null;
    }

    // Update demo site in the database
    demoSite = await DemoSite.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Delete the old files since DB update succeeded
    oldFilesToDelete.forEach(filePath => deleteUploadedFile(filePath));

    return res.status(200).json({
      success: true,
      message: 'Demo site updated successfully',
      data: demoSite,
    });
  } catch (error) {
    console.error('Update Demo Site Error:', error.message);
    cleanupUploadedFiles(req.files);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid Demo Site ID format',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to update demo site.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a Demo Site
 * @route   DELETE /api/admin/demo-sites/:id
 * @access  Private (Admin)
 */
const deleteDemoSite = async (req, res) => {
  try {
    const demoSite = await DemoSite.findById(req.params.id);

    if (!demoSite) {
      return res.status(404).json({
        success: false,
        message: `Demo site not found with id ${req.params.id}`,
      });
    }

    // Delete related files from disk
    demoSite.images.forEach(filePath => deleteUploadedFile(filePath));
    if (demoSite.video) {
      deleteUploadedFile(demoSite.video);
    }
    if (demoSite.apkFile) {
      deleteUploadedFile(demoSite.apkFile);
    }

    // Delete from database
    await demoSite.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Demo site and associated files deleted successfully',
    });
  } catch (error) {
    console.error('Delete Demo Site Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid Demo Site ID format',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to delete demo site.',
      error: error.message,
    });
  }
};

/**
 * @desc    Upload single APK File standalone with progress
 * @route   POST /api/admin/upload-apk
 * @access  Private (Admin)
 */
const uploadApkFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No APK file was uploaded.',
      });
    }

    const apkUrl = `uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'APK file uploaded successfully.',
      apkUrl: apkUrl,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error('Upload APK Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload APK file.',
      error: error.message,
    });
  }
};



module.exports = {
  createDemoSite,
  getDemoSites,
  getDemoSiteById,
  updateDemoSite,
  deleteDemoSite,
  uploadApkFile,
};

