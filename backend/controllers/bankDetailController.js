const BankAccount = require('../models/BankAccount');
const UpiDetail = require('../models/UpiDetail');
const WalletDetail = require('../models/WalletDetail');

/**
 * ============================================================================
 * BANK ACCOUNTS CONTROLLERS
 * ============================================================================
 */

// @desc    Get all bank accounts (optionally filtered by category)
// @route   GET /api/admin/bank-details/banks
// @access  Private (Super Admin)
exports.getBankAccounts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category && (category === 'GST' || category === 'NON_GST')) {
      filter.category = category;
    }

    const accounts = await BankAccount.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    console.error('getBankAccounts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bank accounts',
      error: error.message,
    });
  }
};

// @desc    Create a new bank account
// @route   POST /api/admin/bank-details/banks
// @access  Private (Super Admin)
exports.createBankAccount = async (req, res) => {
  try {
    const {
      category,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      branchName,
      accountType,
      isActive,
    } = req.body;

    if (!category || !bankName || !accountHolderName || !accountNumber || !ifscCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, bank name, account holder name, account number, and IFSC code',
      });
    }

    if (!['GST', 'NON_GST'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be either GST or NON_GST',
      });
    }

    const newAccount = await BankAccount.create({
      category,
      bankName: bankName.trim(),
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      branchName: branchName ? branchName.trim() : '',
      accountType: accountType ? accountType.trim() : 'Current',
      isActive: typeof isActive === 'boolean' ? isActive : isActive !== 'false',
    });

    return res.status(201).json({
      success: true,
      message: 'Bank account created successfully',
      data: newAccount,
    });
  } catch (error) {
    console.error('createBankAccount error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create bank account',
      error: error.message,
    });
  }
};

// @desc    Update a bank account
// @route   PUT /api/admin/bank-details/banks/:id
// @access  Private (Super Admin)
exports.updateBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
    }

    const {
      category,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      branchName,
      accountType,
      isActive,
    } = req.body;

    if (category) {
      if (!['GST', 'NON_GST'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Category must be either GST or NON_GST',
        });
      }
      account.category = category;
    }

    if (bankName !== undefined) account.bankName = bankName.trim();
    if (accountHolderName !== undefined) account.accountHolderName = accountHolderName.trim();
    if (accountNumber !== undefined) account.accountNumber = accountNumber.trim();
    if (ifscCode !== undefined) account.ifscCode = ifscCode.trim().toUpperCase();
    if (branchName !== undefined) account.branchName = branchName.trim();
    if (accountType !== undefined) account.accountType = accountType.trim();
    if (isActive !== undefined) {
      account.isActive = typeof isActive === 'boolean' ? isActive : isActive !== 'false';
    }

    await account.save();

    return res.status(200).json({
      success: true,
      message: 'Bank account updated successfully',
      data: account,
    });
  } catch (error) {
    console.error('updateBankAccount error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update bank account',
      error: error.message,
    });
  }
};

// @desc    Delete a bank account
// @route   DELETE /api/admin/bank-details/banks/:id
// @access  Private (Super Admin)
exports.deleteBankAccount = async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found',
      });
    }

    await account.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Bank account deleted successfully',
    });
  } catch (error) {
    console.error('deleteBankAccount error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete bank account',
      error: error.message,
    });
  }
};

/**
 * ============================================================================
 * UPI DETAILS CONTROLLERS
 * ============================================================================
 */

// @desc    Get all UPI details (optionally filtered by category)
// @route   GET /api/admin/bank-details/upi
// @access  Private (Super Admin)
exports.getUpiDetails = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category && (category === 'GST' || category === 'NON_GST')) {
      filter.category = category;
    }

    const upiList = await UpiDetail.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: upiList.length,
      data: upiList,
    });
  } catch (error) {
    console.error('getUpiDetails error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve UPI details',
      error: error.message,
    });
  }
};

// @desc    Create a new UPI detail
// @route   POST /api/admin/bank-details/upi
// @access  Private (Super Admin)
exports.createUpiDetail = async (req, res) => {
  try {
    const { category, upiId, displayName, isActive } = req.body;

    if (!category || !upiId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both category and UPI ID',
      });
    }

    if (!['GST', 'NON_GST'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be either GST or NON_GST',
      });
    }

    let qrCodeUrl = req.body.qrCodeUrl || '';
    if (req.file) {
      qrCodeUrl = req.file.cloudinaryUrl || `uploads/${req.file.filename}`;
    }

    const newUpi = await UpiDetail.create({
      category,
      upiId: upiId.trim(),
      displayName: displayName ? displayName.trim() : '',
      qrCodeUrl,
      isActive: typeof isActive === 'boolean' ? isActive : isActive !== 'false',
    });

    return res.status(201).json({
      success: true,
      message: 'UPI detail created successfully',
      data: newUpi,
    });
  } catch (error) {
    console.error('createUpiDetail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create UPI detail',
      error: error.message,
    });
  }
};

// @desc    Update a UPI detail
// @route   PUT /api/admin/bank-details/upi/:id
// @access  Private (Super Admin)
exports.updateUpiDetail = async (req, res) => {
  try {
    const upi = await UpiDetail.findById(req.params.id);

    if (!upi) {
      return res.status(404).json({
        success: false,
        message: 'UPI detail not found',
      });
    }

    const { category, upiId, displayName, isActive, qrCodeUrl } = req.body;

    if (category) {
      if (!['GST', 'NON_GST'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Category must be either GST or NON_GST',
        });
      }
      upi.category = category;
    }

    if (upiId !== undefined) upi.upiId = upiId.trim();
    if (displayName !== undefined) upi.displayName = displayName.trim();
    if (isActive !== undefined) {
      upi.isActive = typeof isActive === 'boolean' ? isActive : isActive !== 'false';
    }

    if (req.file) {
      upi.qrCodeUrl = req.file.cloudinaryUrl || `uploads/${req.file.filename}`;
    } else if (qrCodeUrl !== undefined) {
      upi.qrCodeUrl = qrCodeUrl;
    }

    await upi.save();

    return res.status(200).json({
      success: true,
      message: 'UPI detail updated successfully',
      data: upi,
    });
  } catch (error) {
    console.error('updateUpiDetail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update UPI detail',
      error: error.message,
    });
  }
};

// @desc    Delete a UPI detail
// @route   DELETE /api/admin/bank-details/upi/:id
// @access  Private (Super Admin)
exports.deleteUpiDetail = async (req, res) => {
  try {
    const upi = await UpiDetail.findById(req.params.id);

    if (!upi) {
      return res.status(404).json({
        success: false,
        message: 'UPI detail not found',
      });
    }

    await upi.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'UPI detail deleted successfully',
    });
  } catch (error) {
    console.error('deleteUpiDetail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete UPI detail',
      error: error.message,
    });
  }
};

/**
 * ============================================================================
 * WALLET DETAILS CONTROLLERS
 * ============================================================================
 */

// @desc    Get all wallet details (optionally filtered by category)
// @route   GET /api/admin/bank-details/wallets
// @access  Private (Super Admin)
exports.getWalletDetails = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category && (category === 'GST' || category === 'NON_GST')) {
      filter.category = category;
    }

    const wallets = await WalletDetail.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: wallets.length,
      data: wallets,
    });
  } catch (error) {
    console.error('getWalletDetails error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve wallet details',
      error: error.message,
    });
  }
};

// @desc    Create a new wallet detail
// @route   POST /api/admin/bank-details/wallets
// @access  Private (Super Admin)
exports.createWalletDetail = async (req, res) => {
  try {
    const { category, walletName, assetType, network, walletAddress, isActive } = req.body;

    if (!category || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both category and wallet address',
      });
    }

    if (!['GST', 'NON_GST'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be either GST or NON_GST',
      });
    }

    let qrCodeUrl = req.body.qrCodeUrl || '';
    if (req.file) {
      qrCodeUrl = req.file.cloudinaryUrl || `uploads/${req.file.filename}`;
    }

    const newWallet = await WalletDetail.create({
      category,
      walletName: walletName ? walletName.trim() : '',
      assetType: assetType ? assetType.trim() : '',
      network: network ? network.trim() : '',
      walletAddress: walletAddress.trim(),
      qrCodeUrl,
      isActive: typeof isActive === 'boolean' ? isActive : isActive !== 'false',
    });

    return res.status(201).json({
      success: true,
      message: 'Wallet detail created successfully',
      data: newWallet,
    });
  } catch (error) {
    console.error('createWalletDetail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create wallet detail',
      error: error.message,
    });
  }
};

// @desc    Update a wallet detail
// @route   PUT /api/admin/bank-details/wallets/:id
// @access  Private (Super Admin)
exports.updateWalletDetail = async (req, res) => {
  try {
    const wallet = await WalletDetail.findById(req.params.id);

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet detail not found',
      });
    }

    const { category, walletName, assetType, network, walletAddress, isActive, qrCodeUrl } = req.body;

    if (category) {
      if (!['GST', 'NON_GST'].includes(category)) {
        return res.status(400).json({
          success: false,
          message: 'Category must be either GST or NON_GST',
        });
      }
      wallet.category = category;
    }

    if (walletName !== undefined) wallet.walletName = walletName.trim();
    if (assetType !== undefined) wallet.assetType = assetType.trim();
    if (network !== undefined) wallet.network = network.trim();
    if (walletAddress !== undefined) wallet.walletAddress = walletAddress.trim();
    if (isActive !== undefined) {
      wallet.isActive = typeof isActive === 'boolean' ? isActive : isActive !== 'false';
    }

    if (req.file) {
      wallet.qrCodeUrl = req.file.cloudinaryUrl || `uploads/${req.file.filename}`;
    } else if (qrCodeUrl !== undefined) {
      wallet.qrCodeUrl = qrCodeUrl;
    }

    await wallet.save();

    return res.status(200).json({
      success: true,
      message: 'Wallet detail updated successfully',
      data: wallet,
    });
  } catch (error) {
    console.error('updateWalletDetail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update wallet detail',
      error: error.message,
    });
  }
};

// @desc    Delete a wallet detail
// @route   DELETE /api/admin/bank-details/wallets/:id
// @access  Private (Super Admin)
exports.deleteWalletDetail = async (req, res) => {
  try {
    const wallet = await WalletDetail.findById(req.params.id);

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet detail not found',
      });
    }

    await wallet.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Wallet detail deleted successfully',
    });
  } catch (error) {
    console.error('deleteWalletDetail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete wallet detail',
      error: error.message,
    });
  }
};

/**
 * ============================================================================
 * PUBLIC READ-ONLY CONTROLLERS (Client Facing)
 * ============================================================================
 */

// @desc    Get active bank details for public client display (filtered by category if provided)
// @route   GET /api/bank-details/public
// @access  Public
exports.getPublicBankDetails = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category && (category === 'GST' || category === 'NON_GST')) {
      filter.category = category;
    }

    const [banks, upi, wallets] = await Promise.all([
      BankAccount.find(filter)
        .select('category bankName accountHolderName accountNumber ifscCode branchName accountType')
        .sort({ createdAt: -1 }),
      UpiDetail.find(filter)
        .select('category upiId displayName qrCodeUrl')
        .sort({ createdAt: -1 }),
      WalletDetail.find(filter)
        .select('category walletName assetType network walletAddress qrCodeUrl')
        .sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        banks,
        upi,
        wallets,
      },
    });
  } catch (error) {
    console.error('getPublicBankDetails error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve public bank details',
      error: error.message,
    });
  }
};

