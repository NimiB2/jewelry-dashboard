// Simple authentication middleware
const crypto = require('crypto');

// Hash password with SHA-256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Check if user is authenticated
function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.substring(7);
    const expectedToken = process.env.AUTH_TOKEN;
    
    if (!expectedToken) {
        console.error('⚠️  AUTH_TOKEN not set in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    
    if (token !== expectedToken) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
    
    next();
}

// Login endpoint handler
async function login(req, res) {
    const { username, password } = req.body;
    
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    
    if (!expectedUsername || !expectedPasswordHash) {
        console.error('⚠️  Admin credentials not set in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Check credentials
    const passwordHash = hashPassword(password);
    
    if (username === expectedUsername && passwordHash === expectedPasswordHash) {
        // Generate session token (in production, use JWT or similar)
        const token = process.env.AUTH_TOKEN;
        
        return res.json({
            success: true,
            token: token,
            username: username
        });
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
}

// Generate password hash (utility function)
function generatePasswordHash(password) {
    return hashPassword(password);
}

module.exports = {
    isAuthenticated,
    login,
    generatePasswordHash,
    hashPassword
};
