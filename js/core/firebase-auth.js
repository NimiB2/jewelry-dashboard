// Firebase Authentication Module for JewelryDashboard
// Handles Google Sign-in and user authorization

(function() {
    'use strict';

    // Wait for Firebase to be loaded
    function waitForFirebase() {
        return new Promise((resolve) => {
            if (typeof firebase !== 'undefined') {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (typeof firebase !== 'undefined') {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    // Initialize Firebase Auth
    async function initializeAuth() {
        await waitForFirebase();
        
        // Initialize Firebase app if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(window.FIREBASE_CONFIG);
        }

        return firebase.auth();
    }

    // Check if user email is in allowed list
    function isUserAllowed(email) {
        const allowedUsers = window.ALLOWED_USERS || [];
        
        // If no allowed users defined, allow all (for development)
        if (allowedUsers.length === 0) {
            console.warn('⚠️ No allowed users defined - allowing all authenticated users');
            return true;
        }
        
        return allowedUsers.includes(email.toLowerCase());
    }

    // Sign in with Google
    async function signInWithGoogle() {
        try {
            const auth = await initializeAuth();
            const provider = new firebase.auth.GoogleAuthProvider();
            
            // Force account selection
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            const result = await auth.signInWithPopup(provider);
            const user = result.user;

            // Check if user is allowed
            if (!isUserAllowed(user.email)) {
                await auth.signOut();
                throw new Error('משתמש לא מורשה. פנה למנהל המערכת.');
            }

            // Get ID token for API calls
            const idToken = await user.getIdToken();
            
            // Store token for API calls
            localStorage.setItem('firebase_token', idToken);
            localStorage.setItem('user_email', user.email);
            localStorage.setItem('user_name', user.displayName || user.email);

            console.log('✅ התחברות הצליחה:', user.email);
            return { user, token: idToken };

        } catch (error) {
            console.error('❌ שגיאת התחברות:', error);
            throw error;
        }
    }

    // Sign out
    async function signOut() {
        try {
            const auth = await initializeAuth();
            await auth.signOut();
            
            // Clear stored data
            localStorage.removeItem('firebase_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');

            console.log('✅ התנתקות הצליחה');
            
            // Redirect to login
            window.location.href = '/login.html';

        } catch (error) {
            console.error('❌ שגיאת התנתקות:', error);
            throw error;
        }
    }

    // Get current user
    async function getCurrentUser() {
        const auth = await initializeAuth();
        return new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                unsubscribe();
                resolve(user);
            });
        });
    }

    // Get fresh ID token (auto-refreshes if expired)
    async function getIdToken() {
        const user = await getCurrentUser();
        if (user) {
            const token = await user.getIdToken(true);
            localStorage.setItem('firebase_token', token);
            return token;
        }
        return null;
    }

    // Check authentication status
    async function checkAuth() {
        const user = await getCurrentUser();
        
        if (!user) {
            return { authenticated: false };
        }

        if (!isUserAllowed(user.email)) {
            await signOut();
            return { authenticated: false, error: 'משתמש לא מורשה' };
        }

        return {
            authenticated: true,
            user: {
                email: user.email,
                name: user.displayName,
                photo: user.photoURL
            }
        };
    }

    // Listen to auth state changes
    async function onAuthStateChanged(callback) {
        const auth = await initializeAuth();
        return auth.onAuthStateChanged(callback);
    }

    // Export functions globally
    window.FirebaseAuth = {
        signInWithGoogle,
        signOut,
        getCurrentUser,
        getIdToken,
        checkAuth,
        onAuthStateChanged,
        isUserAllowed
    };

})();
