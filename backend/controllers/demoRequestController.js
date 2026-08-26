const { db } = require('../config/firebase');
const webpush = require('web-push');

// Set VAPID keys (same keys from complaintController)
webpush.setVapidDetails(
  'mailto:admin@metablock.com',
  'BKaunp2aYpmPuMm8ODHCx9Pijhj196IXJGnP6PdkLKylX9zUcHFV2QBLuP0SDKuOBaxGQo-s6OY8TyESVUieVWA',
  'Qf8u1SHFs7yt4eU6eHXuLejCkLchpIsR5SBGNTXttd0'
);

// @desc    Submit a demo request
// @route   POST /api/demo-requests
// @access  Public (or authenticated clients)
exports.createDemoRequest = async (req, res) => {
  try {
    const { categoryName, demoName, details, requestedBy } = req.body;

    if (!categoryName || !demoName) {
      return res.status(400).json({
        success: false,
        message: 'Category name and demo name are required',
      });
    }

    let docUrl = '';
    if (req.file) {
      docUrl = req.file.cloudinaryUrl || `uploads/${req.file.filename}`;
    }

    // Write a new demo request document to Firestore
    const requestRef = db.collection('demo_requests').doc();
    const requestData = {
      id: requestRef.id,
      categoryName,
      demoName,
      details: details || '',
      requestedBy: requestedBy || 'Client User',
      docUrl: docUrl || '',
      createdAt: new Date().toISOString(),
      status: 'pending', // pending | done
      resolvedAt: null
    };

    await requestRef.set(requestData);

    // Send background push notifications to all registered admin browsers
    try {
      const subsSnapshot = await db.collection('push_subscriptions').get();
      const payload = JSON.stringify({
        title: 'New Demo Request! 🚀',
        body: `Requested: "${demoName}" under ${categoryName}`,
        url: '/demo-requests'
      });

      const sendPromises = [];
      subsSnapshot.forEach((doc) => {
        const subData = doc.data().subscription;
        sendPromises.push(
          webpush.sendNotification(subData, payload).catch((err) => {
            console.error('Error sending push notification to subscription:', err.statusCode);
            if (err.statusCode === 410 || err.statusCode === 404) {
              return doc.ref.delete();
            }
          })
        );
      });

      await Promise.allSettled(sendPromises);
    } catch (pushError) {
      console.error('Push notification broadcast error:', pushError);
    }

    return res.status(201).json({
      success: true,
      message: 'Demo request submitted successfully',
      data: requestData,
    });
  } catch (error) {
    console.error('Create demo request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit demo request',
      error: error.message,
    });
  }
};

// @desc    Check status of submitted demo requests
// @route   POST /api/demo-requests/check-status
// @access  Public
exports.checkDemoRequestStatus = async (req, res) => {
  try {
    const { requestIds } = req.body;
    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const completedRequests = [];
    const fetchPromises = requestIds.map(async (id) => {
      try {
        const docRef = db.collection('demo_requests').doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const data = docSnap.data();
          if (data.status === 'done' || data.status === 'resolved') {
            completedRequests.push({
              id: data.id || docSnap.id,
              categoryName: data.categoryName,
              demoName: data.demoName,
              resolvedAt: data.resolvedAt || data.createdAt,
            });
          }
        }
      } catch (err) {
        console.error(`Error fetching demo request doc ${id}:`, err.message);
      }
    });

    await Promise.all(fetchPromises);

    return res.status(200).json({
      success: true,
      data: completedRequests,
    });
  } catch (error) {
    console.error('Check demo request status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check demo request status',
      error: error.message,
    });
  }
};

// @desc    Delete a demo request
// @route   DELETE /api/demo-requests/:id
// @access  Private (or Admin)
exports.deleteDemoRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required',
      });
    }

    const docRef = db.collection('demo_requests').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        message: 'Demo request not found',
      });
    }

    await docRef.delete();

    return res.status(200).json({
      success: true,
      message: 'Demo request deleted successfully',
    });
  } catch (error) {
    console.error('Delete demo request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete demo request',
      error: error.message,
    });
  }
};

