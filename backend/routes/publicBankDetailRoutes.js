const express = require('express');
const router = express.Router();
const { getPublicBankDetails } = require('../controllers/bankDetailController');

// Public read-only route for active bank details
router.get('/public', getPublicBankDetails);
router.get('/', getPublicBankDetails);

module.exports = router;
