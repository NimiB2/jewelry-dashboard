// Direct MongoDB Product Seeding Script
// Run with: node scripts/seed-products.js

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'jewelry_dashboard';

// Material mapping
const materialMapping = {
    "14K זהב": "זהב 14K",
    "כסף": "כסף",
    "כסף יציקה": "יציקה כסף",
    "ציפוי- כסף": "ציפוי זהב",
    "ציפוי- יציקה": "ציפוי זהב"
};

// Basic pricing estimates (will be recalculated dynamically on site)
const materialPrices = {
    "זהב 14K": 250,
    "כסף": 8,
    "יציקה כסף": 12,
    "ציפוי זהב": 15
};

const laborTimes = {
    "זהב 14K": 1.5,
    "כסף": 1,
    "יציקה כסף": 0.8,
    "ציפוי זהב": 0.5
};

function calculateCost(material, weight) {
    const pricePerGram = materialPrices[material] || 50;
    const materialCost = pricePerGram * weight;
    const laborTime = laborTimes[material] || 1;
    const laborRate = 80;
    const jewelryConstants = 50; // packaging, shipping, etc.
    const feesMultiplier = 1.45; // VAT + fees
    
    const generalExpenses = materialCost + jewelryConstants;
    const workAndExpenses = generalExpenses + (laborTime * laborRate);
    const cost = workAndExpenses * feesMultiplier;
    
    return Math.round(cost * 100) / 100;
}

function processProduct(productData, index) {
    const material = materialMapping[productData.material] || productData.material;
    const weight = productData.materialWeightGr || 0;
    const cost = calculateCost(material, weight);
    
    return {
        id: Date.now() + index,
        type: productData.productType || 'תכשיט',
        name: productData.modelName || `מוצר ${index}`,
        material: material,
        weight: weight,
        cost: cost,
        price: productData.sitePrice || Math.round(cost * 1.5),
        sitePrice: productData.sitePrice || Math.round(cost * 1.5),
        additions: productData.additions || [],
        collections: ['כללי'],
        laborTime: laborTimes[material] || 1,
        createdAt: new Date().toISOString(),
        importedFrom: 'initial_seed'
    };
}

async function seedProducts() {
    console.log('════════════════════════════════════════');
    console.log('🌱 Starting Product Seed to MongoDB');
    console.log('════════════════════════════════════════\n');
    
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI not found in .env file!');
        process.exit(1);
    }
    
    const client = new MongoClient(MONGODB_URI);
    
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await client.connect();
        console.log('✅ Connected to MongoDB\n');
        
        const db = client.db(DB_NAME);
        const collection = db.collection('products');
        
        // Load JSON data
        console.log('📥 Loading products from JSON...');
        const jsonPath = path.join(__dirname, '..', 'data', 'jewelry_products.json');
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const products = jsonData.products || [];
        console.log(`✅ Found ${products.length} products in JSON\n`);
        
        if (products.length === 0) {
            console.log('❌ No products found in JSON file');
            return;
        }
        
        // Check existing products
        const existingCount = await collection.countDocuments();
        console.log(`📊 Current products in MongoDB: ${existingCount}`);
        
        if (existingCount > 0) {
            console.log('\n⚠️  Database already has products.');
            console.log('   Do you want to:');
            console.log('   1. Add new products (keeping existing)');
            console.log('   2. Replace all products');
            console.log('\n   Running in ADD mode (keeping existing products)...\n');
        }
        
        // Process products
        console.log('⚙️  Processing products...\n');
        const processedProducts = [];
        
        for (let i = 0; i < products.length; i++) {
            const processed = processProduct(products[i], i + 1);
            processedProducts.push(processed);
        }
        
        // Insert to MongoDB
        console.log('📤 Inserting products to MongoDB...');
        const result = await collection.insertMany(processedProducts);
        
        // Summary
        console.log('\n════════════════════════════════════════');
        console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
        console.log('════════════════════════════════════════');
        console.log(`📦 Products inserted: ${result.insertedCount}`);
        console.log(`💾 Database: ${DB_NAME}`);
        console.log(`📁 Collection: products`);
        console.log('════════════════════════════════════════\n');
        
        // Show sample products
        console.log('📋 Sample products inserted:');
        processedProducts.slice(0, 10).forEach((p, i) => {
            const priceStr = p.sitePrice ? `₪${p.sitePrice}` : 'N/A';
            console.log(`   ${i + 1}. ${p.name} (${p.type}) - ${p.material} - ${priceStr}`);
        });
        
        if (processedProducts.length > 10) {
            console.log(`   ... and ${processedProducts.length - 10} more products`);
        }
        
        // Final count
        const finalCount = await collection.countDocuments();
        console.log(`\n📊 Total products in MongoDB now: ${finalCount}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the seed
seedProducts();
