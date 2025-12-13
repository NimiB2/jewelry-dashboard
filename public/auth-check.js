// Client-side authentication check with Firebase
(function() {
    // Skip auth check for login page
    if (window.location.pathname === '/login.html' || window.location.pathname === '/login') {
        return;
    }
    
    // Check for Firebase token
    const token = localStorage.getItem('firebase_token');
    const userEmail = localStorage.getItem('user_email');
    
    if (!token || !userEmail) {
        // No token, redirect to login
        window.location.href = '/login.html';
        return;
    }
    
    // Display user info in console
    console.log('✅ מחובר כ:', userEmail);
    
    // Add logout functionality
    window.logout = async function() {
        if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
            // Clear stored data first
            localStorage.removeItem('firebase_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_name');
            
            // Load Firebase SDK dynamically if not loaded
            if (typeof firebase === 'undefined') {
                // Redirect with logout flag
                window.location.href = '/login.html?logout=true';
                return;
            }
            
            // Sign out from Firebase
            try {
                await firebase.auth().signOut();
                console.log('✅ התנתקות מ-Firebase הצליחה');
            } catch (e) {
                console.log('Firebase signout error:', e);
            }
            
            // Redirect to login with logout flag
            window.location.href = '/login.html?logout=true';
        }
    };
    
    // Get current user info
    window.getCurrentUser = function() {
        return {
            email: localStorage.getItem('user_email'),
            name: localStorage.getItem('user_name'),
            token: localStorage.getItem('firebase_token')
        };
    };
    
    // Intercept all API calls to add Firebase auth token
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const [url, options = {}] = args;
        
        // Add auth token to API calls
        if (url.startsWith('/api/') && !url.includes('/auth/login')) {
            const token = localStorage.getItem('firebase_token');
            if (token) {
                options.headers = options.headers || {};
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return originalFetch(url, options).then(response => {
            // If 401, redirect to login
            if (response.status === 401 && !url.includes('/auth/login')) {
                localStorage.removeItem('firebase_token');
                localStorage.removeItem('user_email');
                localStorage.removeItem('user_name');
                window.location.href = '/login.html';
            }
            return response;
        });
    };
    
    // Add user info display helper
    window.showUserInfo = function() {
        const user = window.getCurrentUser();
        alert(`מחובר כ: ${user.name || user.email}`);
    };
})();
