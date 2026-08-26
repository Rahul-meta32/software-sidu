const express = require('express');
const router = express.Router();
const { createDemoRequest, checkDemoRequestStatus, deleteDemoRequest } = require('../controllers/demoRequestController');
const { uploadDocFile } = require('../middleware/uploadMiddleware');
const { cloudinaryUpload } = require('../middleware/cloudinaryUpload');

// Submit a demo request
router.post('/demo-requests', uploadDocFile, cloudinaryUpload, createDemoRequest);

// Check status of demo requests
router.post('/demo-requests/check-status', checkDemoRequestStatus);

// Delete a demo request
router.delete('/demo-requests/:id', deleteDemoRequest);

module.exports = router;
