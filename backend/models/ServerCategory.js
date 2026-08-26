const mongoose = require('mongoose');

const ServerCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a server category name'],
      unique: true,
      trim: true,
    },
    serverType: {
      type: String,
      required: [true, 'Please provide a server type'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a server description'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide a server email'],
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      default: '',
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide a server expiry date'],
    },
    lastExpiryNotificationDate: {
      type: String,
      default: '',
    },
    allowedDevelopers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ServerCategory', ServerCategorySchema);
