/**
 * FIREBASE INITIALIZATION
 * Configures Firebase Auth, Firestore, and Realtime Database.
 * Gracefully falls back to local-only mode if the config is not set up
 * or if there is no internet connection.
 */

// Your Firebase Configuration (replace with your own credentials from Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};

let app = null;
let auth = null;
let db = null;
let rtdb = null;
let isFirebaseActive = false;

// Check if Firebase SDK is loaded via script tags
if (typeof firebase !== 'undefined') {
  try {
    // Only initialize if the user has replaced placeholder values
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
      app = firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();
      rtdb = firebase.database();
      isFirebaseActive = true;

      // Enable Firestore offline persistence for premium PWA offline experience
      db.enablePersistence().catch(err => {
        if (err.code === 'failed-precondition') {
          console.warn('[Firebase] Multiple tabs open, persistence disabled.');
        } else if (err.code === 'unimplemented') {
          console.warn('[Firebase] Browser does not support persistence.');
        }
      });

      console.log('[Firebase] Initialized successfully.');
    } else {
      console.log('[Firebase] Running in local-only mode (placeholder credentials).');
    }
  } catch (e) {
    console.error('[Firebase] Initialization failed:', e);
  }
} else {
  console.log('[Firebase] SDK not loaded. Running in local-only mode.');
}

export { auth, db, rtdb, isFirebaseActive };
