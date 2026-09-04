const express = require('express');
const router = express.Router();
const {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getUpiDetails,
  createUpiDetail,
  updateUpiDetail,
  deleteUpiDetail,
  getWalletDetails,
  createWalletDetail,
  updateWalletDetail,
  deleteWalletDetail,
} = require('../controllers/bankDetailController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { uploadQrCodeFile } = require('../middleware/uploadMiddleware');
const { cloudinaryUpload } = require('../middleware/cloudinaryUpload');

// Enforce Super Admin authentication on all routes in this router
router.use(protect);
router.use(restrictTo('superadmin'));

// Bank Accounts Routes
router.route('/banks')
  .get(getBankAccounts)
  .post(createBankAccount);

router.route('/banks/:id')
  .put(updateBankAccount)
  .delete(deleteBankAccount);

// UPI Details Routes
router.route('/upi')
  .get(getUpiDetails)
  .post(uploadQrCodeFile, cloudinaryUpload, createUpiDetail);

router.route('/upi/:id')
  .put(uploadQrCodeFile, cloudinaryUpload, updateUpiDetail)
  .delete(deleteUpiDetail);

// Wallet Details Routes
router.route('/wallets')
  .get(getWalletDetails)
  .post(uploadQrCodeFile, cloudinaryUpload, createWalletDetail);

router.route('/wallets/:id')
  .put(uploadQrCodeFile, cloudinaryUpload, updateWalletDetail)
  .delete(deleteWalletDetail);

module.exports = router;
