// MongoDB Connection Configuration
const { MongoClient } = require('mongodb');
require('dotenv').config();

let client = null;
let db = null;

async function connectToDatabase() {
    if (db) {
        return db;
    }

    try {
        const uri = process.env.MONGODB_URI;
        
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log('🔌 Connecting to MongoDB...');
        
        client = new MongoClient(uri, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        await client.connect();
        
        // Test the connection
        await client.db('admin').command({ ping: 1 });
        
        db = client.db('jewelry_dashboard');
        
        console.log('✅ Successfully connected to MongoDB');
        console.log(`📊 Database: ${db.databaseName}`);
        
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
}

async function getDatabase() {
    if (!db) {
        return await connectToDatabase();
    }
    return db;
}

async function closeConnection() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('🔌 MongoDB connection closed');
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeConnection();
    process.exit(0);
});

module.exports = {
    connectToDatabase,
    getDatabase,
    closeConnection
};
