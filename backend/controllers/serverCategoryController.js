const ServerCategory = require('../models/ServerCategory');
const ServerPasswordRequest = require('../models/ServerPasswordRequest');
const { checkExpiredServers } = require('../utils/expiryScheduler');

// @desc    Get all server categories
// @route   GET /api/server-categories
// @access  Private (Authenticated)
exports.getServerCategories = async (req, res) => {
  try {
    let categories;
    
    if (req.user.role === 'superadmin') {
      // Superadmins see everything including plain password
      categories = await ServerCategory.find()
        .populate('allowedDevelopers', 'username email')
        .sort({ name: 1 });
      
      return res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } else {
      // Agents (developers) only see servers where they are in allowedDevelopers list
      const rawCategories = await ServerCategory.find({
        allowedDevelopers: req.user._id
      }).sort({ name: 1 });

      // For each category, look up if there is an approved request
      categories = await Promise.all(
        rawCategories.map(async (cat) => {
          const catObj = cat.toObject();
          
          const approvedRequest = await ServerPasswordRequest.findOne({
            agent: req.user._id,
            serverCategory: cat._id,
            status: 'approved'
          });

          const pendingRequest = await ServerPasswordRequest.findOne({
            agent: req.user._id,
            serverCategory: cat._id,
            status: 'pending'
          });

          // Mask password if not approved
          if (!approvedRequest) {
            catObj.password = '';
          }
          
          // Add status fields so agent UI knows what to render
          catObj.passwordRequestStatus = approvedRequest 
            ? 'approved' 
            : (pendingRequest ? 'pending' : 'none');

          return catObj;
        })
      );

      return res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
      });
    }
  } catch (error) {
    console.error('getServerCategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve server categories',
      error: error.message,
    });
  }
};

// @desc    Create a new server category
// @route   POST /api/admin/server-categories
// @access  Private (Admin)
exports.createServerCategory = async (req, res) => {
  try {
    const { name, serverType, description, email, password, allowedDevelopers, expiryDate } = req.body;

    if (!name || !serverType || !description || !email || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, serverType, description, email, expiryDate',
      });
    }

    // Check if category already exists
    const categoryExists = await ServerCategory.findOne({ name: name.trim() });
    if (categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Server category already exists',
      });
    }

    const category = await ServerCategory.create({
      name: name.trim(),
      serverType: serverType.trim(),
      description: description.trim(),
      email: email.trim(),
      password: password ? password.trim() : '',
      expiryDate: new Date(expiryDate),
      allowedDevelopers: allowedDevelopers || [],
    });

    res.status(201).json({
      success: true,
      data: category,
    });

    // Run expiry alert check immediately
    checkExpiredServers().catch(err => console.error('Immediate checkExpiredServers error:', err));
  } catch (error) {
    console.error('createServerCategory error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Validation error',
    });
  }
};

// @desc    Update an existing server category
// @route   PUT /api/admin/server-categories/:id
// @access  Private (Admin)
exports.updateServerCategory = async (req, res) => {
  try {
    const { name, serverType, description, email, password, allowedDevelopers, expiryDate } = req.body;
    const category = await ServerCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Server category not found',
      });
    }

    if (name) category.name = name.trim();
    if (serverType) category.serverType = serverType.trim();
    if (description !== undefined) category.description = description.trim();
    if (email !== undefined) category.email = email.trim();
    if (password !== undefined) category.password = password.trim();
    if (allowedDevelopers !== undefined) category.allowedDevelopers = allowedDevelopers;
    
    if (expiryDate !== undefined) {
      const newExpiry = new Date(expiryDate);
      if (!category.expiryDate || category.expiryDate.getTime() !== newExpiry.getTime()) {
        category.expiryDate = newExpiry;
        category.lastExpiryNotificationDate = ''; // Reset flag to trigger alert immediately
      }
    }

    await category.save();

    res.status(200).json({
      success: true,
      data: category,
    });

    // Run expiry alert check immediately
    checkExpiredServers().catch(err => console.error('Immediate checkExpiredServers error:', err));
  } catch (error) {
    console.error('updateServerCategory error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Validation error',
    });
  }
};

// @desc    Delete a server category
// @route   DELETE /api/admin/server-categories/:id
// @access  Private (Admin)
exports.deleteServerCategory = async (req, res) => {
  try {
    const category = await ServerCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Server category not found',
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Server category deleted successfully',
    });
  } catch (error) {
    console.error('deleteServerCategory error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Request server password access
// @route   POST /api/server-categories/:id/request-password
// @access  Private (Agent)
exports.requestServerPassword = async (req, res) => {
  try {
    const serverId = req.params.id;
    const agentId = req.user._id;

    const server = await ServerCategory.findById(serverId);
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server category not found',
      });
    }

    if (!server.allowedDevelopers.includes(agentId)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access permissions for this server category',
      });
    }

    const existingRequest = await ServerPasswordRequest.findOne({
      agent: agentId,
      serverCategory: serverId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: `A password request is already ${existingRequest.status} for this server`,
      });
    }

    const request = await ServerPasswordRequest.create({
      agent: agentId,
      serverCategory: serverId,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Password access request submitted successfully',
      data: request
    });
  } catch (error) {
    console.error('requestServerPassword error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve server password request
// @route   PUT /api/admin/server-password-requests/:requestId/approve
// @access  Private (Superadmin)
exports.approveServerPasswordRequest = async (req, res) => {
  try {
    const request = await ServerPasswordRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Password request not found',
      });
    }

    request.status = 'approved';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Password request approved successfully',
      data: request
    });
  } catch (error) {
    console.error('approveServerPasswordRequest error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reject server password request
// @route   PUT /api/admin/server-password-requests/:requestId/reject
// @access  Private (Superadmin)
exports.rejectServerPasswordRequest = async (req, res) => {
  try {
    const request = await ServerPasswordRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Password request not found',
      });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Password request rejected successfully',
      data: request
    });
  } catch (error) {
    console.error('rejectServerPasswordRequest error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
