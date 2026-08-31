const ServerCategory = require('../models/ServerCategory');
const User = require('../models/User');
const { db } = require('../config/firebase');
const webpush = require('web-push');

// Set VAPID keys
webpush.setVapidDetails(
  'mailto:admin@smartsoft.com',
  'BKaunp2aYpmPuMm8ODHCx9Pijhj196IXJGnP6PdkLKylX9zUcHFV2QBLuP0SDKuOBaxGQo-s6OY8TyESVUieVWA',
  'Qf8u1SHFs7yt4eU6eHXuLejCkLchpIsR5SBGNTXttd0'
);

const checkExpiredServers = async () => {
  try {
    console.log('Running server expiry check...');
    // Find all servers with an expiryDate
    const servers = await ServerCategory.find({ expiryDate: { $exists: true, $ne: null } })
      .populate('allowedDevelopers', 'username email');

    const currentDate = new Date();
    const year = currentDate.getUTCFullYear();
    const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getUTCDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const currentDateUTC = new Date(Date.UTC(year, currentDate.getUTCMonth(), currentDate.getUTCDate(), 0, 0, 0, 0));

    // Fetch all superadmins to get their emails
    const superadmins = await User.find({ role: 'superadmin' });
    const superadminEmails = superadmins.map(u => u.email).filter(Boolean);

    for (const server of servers) {
      if (server.lastExpiryNotificationDate === todayStr) {
        // Already sent today, skip
        continue;
      }

      const expiryDateVal = new Date(server.expiryDate);
      const expiryYear = expiryDateVal.getUTCFullYear();
      const expiryMonth = expiryDateVal.getUTCMonth();
      const expiryDay = expiryDateVal.getUTCDate();
      const expiryDateUTC = new Date(Date.UTC(expiryYear, expiryMonth, expiryDay, 0, 0, 0, 0));

      const diffMs = expiryDateUTC.getTime() - currentDateUTC.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      // Check if server is expiring in 7 days or less
      if (diffDays >= 0 && diffDays <= 7) {
        const message = diffDays === 0
          ? `Server "${server.name}" (Type: ${server.serverType}) is expiring today!`
          : `Server "${server.name}" (Type: ${server.serverType}) is expiring in ${diffDays} days.`;

        console.log(`[Expiry Notification] ${message}`);

        // Prepare target allowedEmails
        const developerEmails = (server.allowedDevelopers || []).map(d => d.email).filter(Boolean);
        const allowedEmails = [...new Set([...superadminEmails, ...developerEmails])];

        // 1. Write notification document to Firestore
        if (db) {
          try {
            const notificationRef = db.collection('complaints').doc();
            const notificationData = {
              id: notificationRef.id,
              siteId: server._id.toString(),
              siteTitle: `Server Expiry Alert: ${server.name}`,
              message: message,
              status: 'pending',
              createdAt: new Date().toISOString(),
              type: 'server_expiry',
              allowedEmails: allowedEmails,
            };
            await notificationRef.set(notificationData);
            console.log(`Notification written to Firestore for server: ${server.name}`);
          } catch (fsError) {
            console.error('Failed to write notification to Firestore:', fsError.message);
          }
        } else {
          console.warn('Firestore db not initialized. Skipping Firestore notification write.');
        }

        // 2. Send WebPush notification
        try {
          if (db) {
            const subsSnapshot = await db.collection('push_subscriptions').get();
            const payload = JSON.stringify({
              title: 'Server Expiry Alert! ⚠️',
              body: message,
              url: '/notifications'
            });

            const sendPromises = [];
            subsSnapshot.forEach((doc) => {
              const subData = doc.data().subscription;
              sendPromises.push(
                webpush.sendNotification(subData, payload).catch((err) => {
                  console.error('Error sending push notification to subscription:', err.statusCode);
                  if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log('Removing stale/expired subscription:', doc.id);
                    return doc.ref.delete();
                  }
                })
              );
            });

            await Promise.allSettled(sendPromises);
          }
        } catch (pushError) {
          console.error('Push notification broadcast error during expiry check:', pushError);
        }

        // 3. Update lastExpiryNotificationDate on server category model in MongoDB
        server.lastExpiryNotificationDate = todayStr;
        await server.save();
      }
    }
  } catch (error) {
    console.error('Error checking expired servers:', error);
  }
};

const startExpiryScheduler = () => {
  // Run immediately on server start with a slight delay
  setTimeout(checkExpiredServers, 5000);

  // Run every 1 hour (3600000 ms)
  setInterval(checkExpiredServers, 3600000);
};

module.exports = { startExpiryScheduler, checkExpiredServers };
