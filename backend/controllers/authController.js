const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Admin/Agent login (rejects clients/users)
 * @route   POST /api/admin/login
 * @access  Public
 */
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body; // 'email' field contains either email or username

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password',
      });
    }

    // Find by email (case-insensitive) or username (exact match)
    const user = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: email }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Reject user role on admin login
    if (user.role === 'user') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to access the admin panel.',
      });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Login Admin Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
};

/**
 * @desc    Client-side Login (accepts any role: user, agent, superadmin)
 * @route   POST /api/admin/client/login
 * @access  Public
 */
const loginClient = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password',
      });
    }

    // Find by email (case-insensitive) or username (exact match)
    const user = await User.findOne({
      $or: [
        { email: username.toLowerCase() },
        { username: username }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      }
    });
  } catch (error) {
    console.error('Login Client Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

/**
 * @desc    Create User (role = user)
 * @route   POST /api/admin/create-user
 * @access  Private (Superadmin only)
 */
const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    // Create user
    const newUser = new User({
      username,
      password,
      rawPassword: password,
      role: 'user',
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Create User Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to create user.',
    });
  }
};

/**
 * @desc    Create Agent (role = agent)
 * @route   POST /api/admin/create-agent
 * @access  Private (Superadmin only)
 */
const createAgent = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password',
      });
    }

    // Check if agent already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken',
      });
    }

    // Create agent
    const newAgent = new User({
      username,
      password,
      rawPassword: password,
      role: 'agent',
    });

    await newAgent.save();

    return res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: {
        id: newAgent._id,
        username: newAgent.username,
        role: newAgent.role,
        createdAt: newAgent.createdAt,
      },
    });
  } catch (error) {
    console.error('Create Agent Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to create agent.',
    });
  }
};

/**
 * @desc    Get Users and Agents
 * @route   GET /api/admin/users-and-agents
 * @access  Private (Superadmin only)
 */
const getUsersAndAgents = async (req, res) => {
  try {
    const accounts = await User.find({ role: { $in: ['agent', 'user'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error('Get Accounts Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to fetch accounts.',
    });
  }
};

/**
 * @desc    Get Admin Profile
 * @route   GET /api/admin/profile
 * @access  Private (Admin/Agent)
 */
const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to retrieve profile.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update Admin Profile
 * @route   PUT /api/admin/profile
 * @access  Private (Admin/Agent)
 */
const updateAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      // Clean up uploaded file if not found
      if (req.file) {
        const fs = require('fs');
        const path = require('path');
        const absolutePath = path.join(__dirname, '../uploads', req.file.filename);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      }
      return res.status(404).json({
        success: false,
        message: 'User profile not found',
      });
    }

    const { email, password } = req.body;

    // Update fields
    if (email) {
      user.email = email;
    }

    if (password && password.trim() !== '') {
      user.password = password; // Automatic hashing pre-save hook
    }

    // Replace profile image if a new file is uploaded
    if (req.file) {
      if (user.profileImage) {
        const fs = require('fs');
        const path = require('path');
        const oldAbsolutePath = path.join(__dirname, '../', user.profileImage);
        if (fs.existsSync(oldAbsolutePath)) {
          try {
            fs.unlinkSync(oldAbsolutePath);
          } catch (err) {
            console.error('Failed to delete old profile image:', err.message);
          }
        }
      }
      user.profileImage = req.file.cloudinaryUrl || `uploads/${req.file.filename}`;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    // Cleanup newly uploaded file on error
    if (req.file) {
      const fs = require('fs');
      const path = require('path');
      const absolutePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to update profile.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a User or Agent account
 * @route   DELETE /api/admin/users-and-agents/:id
 * @access  Private (Superadmin only)
 */
const deleteUserOrAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Do not allow deleting superadmin
    if (user.role === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete superadmin accounts',
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `${user.role === 'agent' ? 'Agent' : 'User'} deleted successfully`,
    });
  } catch (error) {
    console.error('Delete Account Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to delete account.',
    });
  }
};

/**
 * @desc    Update a User or Agent account
 * @route   PUT /api/admin/users-and-agents/:id
 * @access  Private (Superadmin only)
 */
const updateUserOrAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found',
      });
    }

    // Do not allow updating superadmin through this endpoint
    if (user.role === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update superadmin accounts through this endpoint',
      });
    }

    if (username) {
      // Check if username is taken by another user
      const existingUser = await User.findOne({ username, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken',
        });
      }
      user.username = username;
    }

    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
      }
      user.password = password;
      user.rawPassword = password;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Account updated successfully',
      data: {
        id: user._id,
        username: user.username,
        role: user.role,
        rawPassword: user.rawPassword,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update Account Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Failed to update account.',
    });
  }
};

module.exports = {
  loginAdmin,
  loginClient,
  createUser,
  createAgent,
  getUsersAndAgents,
  getAdminProfile,
  updateAdminProfile,
  deleteUserOrAgent,
  updateUserOrAgent
};
