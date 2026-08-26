const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let serviceAccount;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
} else {
  try {
    serviceAccount = require('./firebase-service-account.json');
  } catch (error) {
    console.error('Failed to load firebase-service-account.json:', error.message);
  }
}

let app;
let db;

if (serviceAccount) {
  try {
    app = initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully.');
    db = getFirestore(app);
  } catch (error) {
    console.error('Firebase Admin init error:', error.stack || error.message);
  }
} else {
  console.error('Firebase Admin SDK not initialized: No credentials provided.');
}

module.exports = { app, db };
