const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
// For production, use service account credentials
// For development with just token verification, we can use projectId only

let firebaseApp = null;

function initializeFirebaseAdmin() {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        // Option 1: Check for service account file in config directory
        const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
        
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
            console.log('✅ Firebase Admin initialized with service account file');
            return firebaseApp;
        }
        
        // Option 2: Check if service account credentials are in environment variable
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
            console.log('✅ Firebase Admin initialized with service account env');
            return firebaseApp;
        }
        
        // Option 3: Use project ID only (limited - no token verification)
        const projectId = process.env.FIREBASE_PROJECT_ID || 'jewelry-dashboard-77511';
        firebaseApp = admin.initializeApp({
            projectId: projectId
        });
        console.log('⚠️ Firebase Admin initialized without credentials (limited mode)');

        return firebaseApp;
    } catch (error) {
        console.error('❌ Firebase Admin initialization error:', error);
        throw error;
    }
}

// Verify Firebase ID token
async function verifyIdToken(idToken) {
    try {
        initializeFirebaseAdmin();
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return {
            valid: true,
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name
        };
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        return {
            valid: false,
            error: error.message
        };
    }
}

// Get Firebase Auth instance
function getAuth() {
    initializeFirebaseAdmin();
    return admin.auth();
}

module.exports = {
    initializeFirebaseAdmin,
    verifyIdToken,
    getAuth
};
