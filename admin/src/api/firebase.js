import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA_9p5jctbBNdPaq6pSvJdXXKFc1r9k2PU",
  authDomain: "fir-metablock-5d8a7.firebaseapp.com",
  projectId: "fir-metablock-5d8a7",
  storageBucket: "fir-metablock-5d8a7.firebasestorage.app",
  messagingSenderId: "560167202804",
  appId: "1:560167202804:web:e78ef37ac5f3c78b6b93a1",
  measurementId: "G-RYF16XB05C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
