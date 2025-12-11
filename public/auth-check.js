// Client-side authentication check
(function() {
    // Skip auth check for login page
    if (window.location.pathname === '/login.html' || window.location.pathname === '/login') {
        return;
    }
    
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        // No token, redirect to login
        window.location.href = '/login.html';
        return;
    }
    
    // Verify token with server
    fetch('/api/health', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            // Token invalid, clear and redirect
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            window.location.href = '/login.html';
        }
    })
    .catch(() => {
        // Network error, allow offline access with localStorage
        console.log('⚠️  Offline mode - using localStorage');
    });
    
    // Add logout functionality
    window.logout = function() {
        if (confirm('האם אתה בטוח שברצונך להתנתק?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            window.location.href = '/login.html';
        }
    };
    
    // Intercept all API calls to add auth token
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const [url, options = {}] = args;
        
        // Add auth token to API calls
        if (url.startsWith('/api/') && !url.includes('/auth/login')) {
            const token = localStorage.getItem('authToken');
            if (token) {
                options.headers = options.headers || {};
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return originalFetch(url, options).then(response => {
            // If 401, redirect to login
            if (response.status === 401 && !url.includes('/auth/login')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('username');
                window.location.href = '/login.html';
            }
            return response;
        });
    };
})();
