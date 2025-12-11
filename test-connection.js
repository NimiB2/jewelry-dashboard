// Quick MongoDB connection test
require('dotenv').config();
const { connectToDatabase, closeConnection } = require('./config/database');

async function testConnection() {
    console.log('🔍 Testing MongoDB connection...\n');
    
    try {
        // Check if MONGODB_URI exists
        if (!process.env.MONGODB_URI) {
            console.log('❌ MONGODB_URI not found in .env file');
            console.log('\n📝 To fix this:');
            console.log('1. Copy .env.example to .env');
            console.log('2. Add your MongoDB Atlas connection string');
            console.log('3. See README-MONGODB.md for detailed instructions\n');
            process.exit(1);
        }
        
        console.log('✅ MONGODB_URI found in environment');
        console.log(`📍 Connecting to: ${process.env.MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@')}\n`);
        
        // Try to connect
        const db = await connectToDatabase();
        
        console.log('✅ Successfully connected to MongoDB!');
        console.log(`📊 Database name: ${db.databaseName}`);
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log(`📁 Collections (${collections.length}):`);
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        
        // Test a simple operation
        console.log('\n🧪 Testing database operations...');
        const testCollection = db.collection('_test');
        await testCollection.insertOne({ test: true, timestamp: new Date() });
        const testDoc = await testCollection.findOne({ test: true });
        await testCollection.deleteOne({ test: true });
        
        if (testDoc) {
            console.log('✅ Read/Write operations working correctly');
        }
        
        console.log('\n🎉 All tests passed! MongoDB is ready to use.');
        console.log('\n📚 Next steps:');
        console.log('1. Start the server: npm start');
        console.log('2. Open: http://localhost:65528');
        console.log('3. Migrate data: http://localhost:65528/utils/migrate-to-mongodb.html\n');
        
    } catch (error) {
        console.log('\n❌ Connection failed!');
        console.log(`Error: ${error.message}\n`);
        
        if (error.message.includes('bad auth')) {
            console.log('🔐 Authentication Error:');
            console.log('- Check username and password in MONGODB_URI');
            console.log('- Verify user exists in MongoDB Atlas → Database Access\n');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.log('🌐 Network Error:');
            console.log('- Check your internet connection');
            console.log('- Verify the cluster URL is correct\n');
        } else if (error.message.includes('IP') || error.message.includes('not authorized')) {
            console.log('🔒 IP Whitelist Error:');
            console.log('- Add your IP to Network Access in MongoDB Atlas');
            console.log('- Or allow access from anywhere (0.0.0.0/0)\n');
        }
        
        console.log('📖 See README-MONGODB.md for detailed setup instructions\n');
        process.exit(1);
    } finally {
        await closeConnection();
    }
}

testConnection();
