import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

/**
 * FIREBASE DATABASE CONFIGURATION
 * We pull credentials securely from the local .env file
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/**
 * FIRESTORE INITIALIZATION
 * We must use `initializeFirestore` instead of `getFirestore` to inject the Long Polling rule,
 * or else the UI will freeze when we try to read/write from the database. This is a known issue
 * and the Long Polling workaround is the recommended solution from Firebase support
 */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});