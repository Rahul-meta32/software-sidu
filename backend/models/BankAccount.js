const mongoose = require('mongoose');

const BankAccountSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['GST', 'NON_GST'],
      required: [true, 'Please specify category (GST or NON_GST)'],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, 'Please provide the bank name'],
      trim: true,
    },
    accountHolderName: {
      type: String,
      required: [true, 'Please provide the account holder name'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Please provide the account number'],
      trim: true,
    },
    ifscCode: {
      type: String,
      required: [true, 'Please provide the IFSC code'],
      trim: true,
      uppercase: true,
    },
    branchName: {
      type: String,
      trim: true,
      default: '',
    },
    accountType: {
      type: String,
      trim: true,
      default: 'Current',
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

module.exports = mongoose.model('BankAccount', BankAccountSchema);
