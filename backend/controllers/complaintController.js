const DemoSite = require('../models/DemoSite');
const { db } = require('../config/firebase');
const webpush = require('web-push');

// Set VAPID keys
webpush.setVapidDetails(
  'mailto:admin@smartsoft.com',
  'BKaunp2aYpmPuMm8ODHCx9Pijhj196IXJGnP6PdkLKylX9zUcHFV2QBLuP0SDKuOBaxGQo-s6OY8TyESVUieVWA',
  'Qf8u1SHFs7yt4eU6eHXuLejCkLchpIsR5SBGNTXttd0'
);

// @desc    Submit a complaint for a demo site
// @route   POST /api/demo-sites/:id/complain
// @access  Public
exports.createComplaint = async (req, res) => {
  try {
    const siteId = req.params.id;
    const { message } = req.body;

    // Find the site in MongoDB to verify it exists and get details
    const site = await DemoSite.findById(siteId);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Demo site not found',
      });
    }

    // Write a new complaint document to Firestore
    const complaintRef = db.collection('complaints').doc();
    const complaintData = {
      id: complaintRef.id,
      siteId: site._id.toString(),
      siteTitle: site.title,
      liveDemoLink: site.liveDemoLink,
      message: message || 'No details provided',
      createdAt: new Date().toISOString(),
      status: 'pending', // pending | resolved
    };

    await complaintRef.set(complaintData);

    // Send background push notifications to all registered admin browsers
    try {
      const subsSnapshot = await db.collection('push_subscriptions').get();
      const payload = JSON.stringify({
        title: 'New Website Feedback! ⚠️',
        body: `Feedback for "${site.title}": ${message || 'No description'}`,
        url: '/notifications'
      });

      const sendPromises = [];
      subsSnapshot.forEach((doc) => {
        const subData = doc.data().subscription;
        sendPromises.push(
          webpush.sendNotification(subData, payload).catch((err) => {
            console.error('Error sending push notification to subscription:', err.statusCode);
            // If subscription is expired/invalid (410 or 404), delete it from Firestore
            if (err.statusCode === 410 || err.statusCode === 404) {
              console.log('Removing stale/expired subscription:', doc.id);
              return doc.ref.delete();
            }
          })
        );
      });

      // Wait for all push notification attempts to finish
      await Promise.allSettled(sendPromises);
    } catch (pushError) {
      console.error('Push notification broadcast error:', pushError);
    }

    return res.status(201).json({
      success: true,
      message: 'Feedback registered successfully',
      data: complaintData,
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register feedback',
      error: error.message,
    });
  }
};

// @desc    Check status of submitted feedback
// @route   POST /api/feedback/check-resolved
// @access  Public
exports.checkResolvedFeedback = async (req, res) => {
  try {
    const { complaintIds } = req.body;
    if (!complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const resolvedSites = [];
    const fetchPromises = complaintIds.map(async (id) => {
      try {
        const docRef = db.collection('complaints').doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          const data = docSnap.data();
          if (data.status === 'resolved') {
            resolvedSites.push({
              id: data.id || docSnap.id,
              siteId: data.siteId,
              siteTitle: data.siteTitle,
              resolvedAt: data.resolvedAt || data.createdAt,
            });
          }
        }
      } catch (err) {
        console.error(`Error fetching document ${id}:`, err.message);
      }
    });

    await Promise.all(fetchPromises);

    return res.status(200).json({
      success: true,
      data: resolvedSites,
    });
  } catch (error) {
    console.error('Check resolved feedback error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check resolved feedback',
      error: error.message,
    });
  }
};
