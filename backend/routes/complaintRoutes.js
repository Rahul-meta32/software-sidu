const express = require('express');
const router = express.Router();
const { createComplaint, checkResolvedFeedback } = require('../controllers/complaintController');

// Public route to submit a complaint / feedback
router.post('/demo-sites/:id/complain', createComplaint);
router.post('/demo-sites/:id/feedback', createComplaint);

// Public route to check status of feedback
router.post('/feedback/check-resolved', checkResolvedFeedback);

module.exports = router;
