const mongoose = require('mongoose');

const ScriptSiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a script site name'],
      trim: true,
    },
    link: {
      type: String,
      required: [true, 'Please provide a script site link'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ScriptSite', ScriptSiteSchema);
