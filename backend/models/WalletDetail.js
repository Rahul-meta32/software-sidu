const mongoose = require('mongoose');

const WalletDetailSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['GST', 'NON_GST'],
      required: [true, 'Please specify category (GST or NON_GST)'],
      trim: true,
    },
    walletName: {
      type: String,
      trim: true,
      default: '',
    },
    assetType: {
      type: String,
      trim: true,
      default: '',
    },
    network: {
      type: String,
      trim: true,
      default: '',
    },
    walletAddress: {
      type: String,
      required: [true, 'Please provide the wallet address'],
      trim: true,
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

module.exports = mongoose.model('WalletDetail', WalletDetailSchema);
