// Jewelry Dashboard Server with MongoDB Integration
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectToDatabase } = require('./config/database');

// Import API routes
const productsRouter = require('./api/routes/products');
const ordersRouter = require('./api/routes/orders');
const expensesRouter = require('./api/routes/expenses');
const incomeRouter = require('./api/routes/income');
const settingsRouter = require('./api/routes/settings');
const { isAuthenticated, login } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 65528;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// Public routes (no auth required)
app.post('/api/auth/login', login);

// Protected API Routes (require authentication)
const useAuth = process.env.USE_AUTH !== 'false';
if (useAuth) {
    console.log('🔒 Authentication enabled');
    app.use('/api/products', isAuthenticated, productsRouter);
    app.use('/api/orders', isAuthenticated, ordersRouter);
    app.use('/api/expenses', isAuthenticated, expensesRouter);
    app.use('/api/income', isAuthenticated, incomeRouter);
    app.use('/api/settings', isAuthenticated, settingsRouter);
} else {
    console.log('⚠️  Authentication disabled');
    app.use('/api/products', productsRouter);
    app.use('/api/orders', ordersRouter);
    app.use('/api/expenses', expensesRouter);
    app.use('/api/income', incomeRouter);
    app.use('/api/settings', settingsRouter);
}

// Health check endpoint (protected if auth enabled)
app.get('/api/health', useAuth ? isAuthenticated : (req, res, next) => next(), async (req, res) => {
    try {
        const { getDatabase } = require('./config/database');
        const db = await getDatabase();
        await db.command({ ping: 1 });
        res.json({ 
            status: 'healthy', 
            mongodb: 'connected',
            authenticated: !!req.headers.authorization,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({ 
            status: 'unhealthy', 
            mongodb: 'disconnected',
            error: error.message 
        });
    }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from root (for backward compatibility)
app.use(express.static(path.join(__dirname)));

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Not found');
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server and connect to MongoDB
async function startServer() {
    try {
        // Connect to MongoDB
        if (process.env.USE_MONGODB !== 'false') {
            await connectToDatabase();
            console.log('✅ MongoDB connected successfully');
        } else {
            console.log('⚠️  MongoDB disabled - using localStorage only');
        }
        
        // Start Express server
        app.listen(port, () => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`🚀 Jewelry Dashboard Server`);
            console.log(`📍 URL: http://localhost:${port}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 MongoDB: ${process.env.USE_MONGODB !== 'false' ? 'Enabled' : 'Disabled'}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
