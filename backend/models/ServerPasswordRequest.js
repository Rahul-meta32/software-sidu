const mongoose = require('mongoose');

const ServerPasswordRequestSchema = new mongoose.Schema(
  {
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serverCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServerCategory',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ServerPasswordRequest', ServerPasswordRequestSchema);
