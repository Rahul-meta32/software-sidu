const ScriptSite = require('../models/ScriptSite');

// @desc    Get all script sites
// @route   GET /api/script-sites
// @access  Private (Authenticated)
exports.getScriptSites = async (req, res) => {
  try {
    const sites = await ScriptSite.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sites.length,
      data: sites,
    });
  } catch (error) {
    console.error('getScriptSites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve script sites',
      error: error.message,
    });
  }
};

// @desc    Create a new script site
// @route   POST /api/admin/script-sites
// @access  Private (Admin/Developer)
exports.createScriptSite = async (req, res) => {
  try {
    const { name, link } = req.body;

    if (!name || !link) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both name and link fields',
      });
    }

    const newSite = await ScriptSite.create({
      name: name.trim(),
      link: link.trim(),
    });

    return res.status(201).json({
      success: true,
      data: newSite,
    });
  } catch (error) {
    console.error('createScriptSite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create script site',
      error: error.message,
    });
  }
};

// @desc    Delete a script site
// @route   DELETE /api/admin/script-sites/:id
// @access  Private (Admin/Developer)
exports.deleteScriptSite = async (req, res) => {
  try {
    const site = await ScriptSite.findById(req.params.id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Script site not found',
      });
    }

    await site.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Script site deleted successfully',
    });
  } catch (error) {
    console.error('deleteScriptSite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete script site',
      error: error.message,
    });
  }
};

// @desc    Update a script site
// @route   PUT /api/admin/script-sites/:id
// @access  Private (Admin/Developer)
exports.updateScriptSite = async (req, res) => {
  try {
    const { name, link } = req.body;
    const site = await ScriptSite.findById(req.params.id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Script site not found',
      });
    }

    if (name) site.name = name.trim();
    if (link) site.link = link.trim();

    await site.save();

    return res.status(200).json({
      success: true,
      data: site,
    });
  } catch (error) {
    console.error('updateScriptSite error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update script site',
      error: error.message,
    });
  }
};
