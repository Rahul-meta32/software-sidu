const mongoose = require('mongoose');

const UpiDetailSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['GST', 'NON_GST'],
      required: [true, 'Please specify category (GST or NON_GST)'],
      trim: true,
    },
    upiId: {
      type: String,
      required: [true, 'Please provide the UPI ID'],
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    qrCodeUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UpiDetail', UpiDetailSchema);
