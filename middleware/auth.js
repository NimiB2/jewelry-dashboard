// Authentication middleware with Firebase support
const crypto = require('crypto');
const { verifyIdToken } = require('../config/firebase-admin');
const { getDatabase } = require('../config/database');

// Hash password with SHA-256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Check if user is authenticated (supports both Firebase and legacy tokens)
async function isAuthenticated(req, res, next) {
    const authHeader = req.headers.authorization;
    // If true, any Firebase-authenticated user is allowed (skip MongoDB authorizedUsers check).
    // Use this only temporarily (e.g. interviews/demo). To restore original behavior set it to false/empty.
    const bypassAuthorizedUsers = process.env.BYPASS_AUTHORIZED_USERS === 'true';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    // Try Firebase token verification first
    if (token.length > 100) {
        try {
            const result = await verifyIdToken(token);
            
            if (result.valid) {
                // Temporary mode: allow any Firebase user (skip MongoDB authorization list)
                if (bypassAuthorizedUsers) {
                    req.user = {
                        uid: result.uid,
                        email: result.email,
                        name: result.name
                    };
                    return next();
                }

                // Normal mode: Check if user is in authorizedUsers collection
                const db = await getDatabase();
                const authorizedUser = await db.collection('authorizedUsers').findOne({ uid: result.uid });

                if (authorizedUser) {
                    req.user = {
                        uid: result.uid,
                        email: result.email,
                        name: result.name,
                        role: authorizedUser.role
                    };
                    return next();
                }

                console.log(`❌ User ${result.email} not in authorizedUsers`);
                return res.status(403).json({ error: 'Forbidden - User not authorized' });
            }
        } catch (error) {
            console.error('Firebase token verification error:', error.message);
        }
    }
    
    // Fallback to legacy token (for backward compatibility)
    const expectedToken = process.env.AUTH_TOKEN;
    if (expectedToken && token === expectedToken) {
        return next();
    }
    
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
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
