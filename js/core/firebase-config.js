// Firebase Configuration for JewelryDashboard
// This file initializes Firebase and exports auth instance

const firebaseConfig = {
  apiKey: "AIzaSyBIYjWby4JaV6l2gx7JGTaVSf3SDJfmuvI",
  authDomain: "jewelry-dashboard-77511.firebaseapp.com",
  projectId: "jewelry-dashboard-77511",
  storageBucket: "jewelry-dashboard-77511.firebasestorage.app",
  messagingSenderId: "687793981529",
  appId: "1:687793981529:web:14298f47785f257da60948",
  measurementId: "G-9CM1F7263S"
};

// Allowed users - only these emails can access the system
const ALLOWED_USERS = [
  // TODO: Add your allowed email addresses here
  // 'user1@gmail.com',
  // 'user2@gmail.com'
];

// Firebase will be initialized via CDN scripts in HTML
// This config is used by the auth module
window.FIREBASE_CONFIG = firebaseConfig;
window.ALLOWED_USERS = ALLOWED_USERS;
