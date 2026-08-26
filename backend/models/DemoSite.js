const mongoose = require('mongoose');

const DemoSiteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    serverCategory: {
      type: String,
      trim: true,
      default: '',
    },
    scriptLink: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
      default: null,
    },
    liveDemoLink: {
      type: String,
      trim: true,
      default: '',
    },
    adminLink: {
      type: String,
      trim: true,
      default: '',
    },
    frontendCredentials: {
      type: mongoose.Schema.Types.Mixed,
      default: { username: '', password: '' }
    },
    frontendRoleCredentials: [
      {
        role: { type: String, trim: true },
        username: { type: String, trim: true, default: '' },
        password: { type: String, trim: true, default: '' },
        apkFile: { type: String, default: null },
        liveDemoLink: { type: String, trim: true, default: '' }
      }
    ],
    adminCredentials: {
      type: mongoose.Schema.Types.Mixed,
      default: { username: '', password: '' }
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    showInExplorer: {
      type: Boolean,
      default: true,
    },
    developer: {
      type: String,
      trim: true,
      default: 'MetaBlock',
    },
    apkFile: {
      type: String,
      default: null,
    },
    isClientDemo: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Also provides updatedAt
  }
);

module.exports = mongoose.model('DemoSite', DemoSiteSchema);
