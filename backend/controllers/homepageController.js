const HomepageSection = require('../models/HomepageSection');
const DemoSite = require('../models/DemoSite');

// @desc    Get dynamic homepage sections with populated items
// @route   GET /api/homepage
// @access  Public
exports.getHomepageData = async (req, res) => {
  try {
    // 1. Fetch homepage sections configuration (only visible ones)
    // Using $ne:false so existing docs without the isVisible field are treated as visible
    const sections = await HomepageSection.find({ isVisible: { $ne: false } })
      .populate('items')
      .sort({ order: 1 });

    // 2. Fetch the latest demo sites dynamically (only live ones)
    const latestSites = await DemoSite.find({ isActive: true })
      .select('-serverCategory -scriptLink -date')
      .sort({ createdAt: -1 })
      .limit(8)
      .populate({
        path: 'category',
        populate: {
          path: 'parentCategory'
        }
      });

    // 3. Populate items in sections dynamically based on section type to keep it updated with latest demos
    const processedSections = sections.map(section => {
      const secObj = section.toObject();
      
      if (secObj.type === 'horizontal_showcase') {
        // First 4 latest sites
        secObj.items = latestSites.slice(0, 4);
      } else if (secObj.type === 'statistics_highlights') {
        // Next 4 latest sites (or overlap/fallback if not enough sites to make exactly 4 cards)
        let items = latestSites.slice(4, 8);
        if (items.length < 4 && latestSites.length > 0) {
          const needed = 4 - items.length;
          const fill = latestSites.slice(0, Math.min(needed, latestSites.length));
          items = [...items, ...fill];
        }
        secObj.items = items.slice(0, 4);
      } else if (secObj.type === 'featured_grid') {
        // Use the saved items from database (up to 6) if they exist, otherwise fallback to latest 6 sites
        if (section.items && section.items.length > 0) {
          const validItems = section.items.filter(item => item !== null && item !== undefined && item.isActive === true);
          if (validItems.length > 0) {
            secObj.items = validItems.slice(0, 6).map(item => item.toObject ? item.toObject() : item);
          } else {
            secObj.items = latestSites.slice(0, 6);
          }
        } else {
          secObj.items = latestSites.slice(0, 6);
        }
      } else {
        secObj.items = [];
      }
      
      return secObj;
    });

    res.status(200).json({
      success: true,
      count: processedSections.length,
      data: processedSections
    });
  } catch (error) {
    console.error('getHomepageData error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve homepage configurations'
    });
  }
};

// @desc    Get ALL homepage sections (admin - includes hidden ones)
// @route   GET /api/homepage/admin/all-sections
// @access  Private (Admin)
exports.getAdminSections = async (req, res) => {
  try {
    const sections = await HomepageSection.find().populate('items').sort({ order: 1 });
    res.status(200).json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('getAdminSections error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve homepage sections'
    });
  }
};


// @desc    Create homepage section configuration
// @route   POST /api/admin/homepage/sections
// @access  Private (Admin)
exports.createHomepageSection = async (req, res) => {
  try {
    const section = await HomepageSection.create(req.body);
    res.status(201).json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Validation error'
    });
  }
};

// @desc    Update homepage section configuration
// @route   PUT /api/admin/homepage/sections/:id
// @access  Private (Admin)
exports.updateHomepageSection = async (req, res) => {
  try {
    const section = await HomepageSection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found'
      });
    }

    res.status(200).json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Validation error'
    });
  }
};

// @desc    Delete homepage section configuration
// @route   DELETE /api/admin/homepage/sections/:id
// @access  Private (Admin)
exports.deleteHomepageSection = async (req, res) => {
  try {
    const section = await HomepageSection.findByIdAndDelete(req.params.id);

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Homepage section not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Homepage section removed'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
