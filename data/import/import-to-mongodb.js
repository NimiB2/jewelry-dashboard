// Direct MongoDB Import Script for JewelryDashboard
// This script imports products directly to MongoDB via the API

// Configuration
const API_BASE = 'http://localhost:65528/api';

// Material mapping for pricing calculations
const materialMapping = {
    "14K זהב": "זהב 14K",
    "כסף": "כסף",
    "כסף יציקה": "יציקה כסף",
    "ציפוי- כסף": "ציפוי זהב",
    "ציפוי- יציקה": "ציפוי זהב"
};

// Import products directly to MongoDB
async function importToMongoDB() {
    console.log('🚀 Starting direct MongoDB import...');
    
    try {
        // Step 1: Load products from JSON
        console.log('📥 Loading products from JSON file...');
        const response = await fetch('./data/jewelry_products.json');
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${response.status}`);
        }
        
        const data = await response.json();
        const products = data.products || [];
        console.log(`✅ Loaded ${products.length} products from JSON`);
        
        if (products.length === 0) {
            console.log('❌ No products to import');
            return;
        }
        
        // Step 2: Check MongoDB connection
        console.log('🔌 Checking MongoDB connection...');
        const healthCheck = await fetch(`${API_BASE}/health`);
        const healthData = await healthCheck.json();
        
        if (healthData.mongodb !== 'connected') {
            throw new Error('MongoDB is not connected! Make sure the server is running.');
        }
        console.log('✅ MongoDB is connected');
        
        // Step 3: Process and format products
        console.log('⚙️ Processing products with pricing calculations...');
        const processedProducts = [];
        
        for (let i = 0; i < products.length; i++) {
            const productData = products[i];
            
            try {
                const processed = processProduct(productData, i + 1);
                processedProducts.push(processed);
            } catch (error) {
                console.warn(`⚠️ Skipped product "${productData.modelName}": ${error.message}`);
            }
        }
        
        console.log(`✅ Processed ${processedProducts.length} products`);
        
        // Step 4: Send to MongoDB via bulk API
        console.log('📤 Sending products to MongoDB...');
        const importResponse = await fetch(`${API_BASE}/products/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(processedProducts)
        });
        
        if (!importResponse.ok) {
            const errorText = await importResponse.text();
            throw new Error(`API error: ${importResponse.status} - ${errorText}`);
        }
        
        const result = await importResponse.json();
        
        // Step 5: Summary
        console.log('\n════════════════════════════════════════');
        console.log('🎉 IMPORT COMPLETED SUCCESSFULLY!');
        console.log('════════════════════════════════════════');
        console.log(`📦 Products imported: ${processedProducts.length}`);
        console.log(`💾 Stored directly in MongoDB`);
        console.log('════════════════════════════════════════\n');
        
        // Show product summary
        console.log('📋 Products imported:');
        processedProducts.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} (${p.type}) - ${p.material} - ₪${p.sitePrice || p.price}`);
        });
        
        return processedProducts;
        
    } catch (error) {
        console.error('❌ Import failed:', error.message);
        throw error;
    }
}

// Process a single product with pricing
function processProduct(productData, index) {
    const material = materialMapping[productData.material] || productData.material;
    const weight = productData.materialWeightGr || 0;
    
    // Calculate pricing using the app's pricing functions
    let cost = 0;
    let recommendedPrice = 0;
    
    if (typeof getMaterialPricePerGram === 'function') {
        // Use app pricing functions if available
        const pricePerGram = getMaterialPricePerGram(material);
        const materialCost = pricePerGram * weight;
        const jewelryConstants = typeof getJewelryPricingConstantsTotal === 'function' 
            ? getJewelryPricingConstantsTotal() : 50;
        const laborTime = typeof getLaborTimeForMaterial === 'function' 
            ? getLaborTimeForMaterial(material) : 1;
        const laborRate = typeof getLaborHourRate === 'function' 
            ? getLaborHourRate() : 80;
        const feesMultiplier = typeof getAllFeesMultiplier === 'function' 
            ? getAllFeesMultiplier() : 1.45;
        const profitMultiplier = typeof getProfitMultiplier === 'function' 
            ? getProfitMultiplier(material) : 1.5;
        
        const generalExpenses = materialCost + jewelryConstants;
        const workAndExpenses = generalExpenses + (laborTime * laborRate);
        cost = workAndExpenses * feesMultiplier;
        recommendedPrice = cost * profitMultiplier;
    } else {
        // Fallback: use site price as base
        cost = productData.sitePrice ? productData.sitePrice * 0.6 : 100;
        recommendedPrice = productData.sitePrice || cost * 1.5;
    }
    
    // Build product object for MongoDB
    return {
        id: Date.now() + index + Math.floor(Math.random() * 1000),
        type: productData.productType || 'תכשיט',
        name: productData.modelName || `מוצר ${index}`,
        material: material,
        weight: weight,
        cost: Math.round(cost * 100) / 100,
        price: Math.round(recommendedPrice * 100) / 100,
        sitePrice: productData.sitePrice || Math.round(recommendedPrice * 100) / 100,
        additions: productData.additions || [],
        collections: ['כללי'],
        laborTime: typeof getLaborTimeForMaterial === 'function' 
            ? getLaborTimeForMaterial(material) : 1,
        createdAt: new Date().toISOString(),
        importedFrom: 'bulk_import'
    };
}

// Check current products in MongoDB
async function checkMongoProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        console.log(`📊 Current products in MongoDB: ${products.length}`);
        return products;
    } catch (error) {
        console.error('❌ Failed to check products:', error.message);
        return [];
    }
}

// Clear all products from MongoDB (use with caution!)
async function clearMongoProducts() {
    if (!confirm('⚠️ Are you sure you want to delete ALL products from MongoDB?')) {
        console.log('❌ Cancelled');
        return;
    }
    
    try {
        const products = await checkMongoProducts();
        let deleted = 0;
        
        for (const product of products) {
            const response = await fetch(`${API_BASE}/products/${product.id}`, {
                method: 'DELETE'
            });
            if (response.ok) deleted++;
        }
        
        console.log(`🗑️ Deleted ${deleted} products from MongoDB`);
    } catch (error) {
        console.error('❌ Failed to clear products:', error.message);
    }
}

// Export functions for console use
window.importToMongoDB = importToMongoDB;
window.checkMongoProducts = checkMongoProducts;
window.clearMongoProducts = clearMongoProducts;

console.log('════════════════════════════════════════');
console.log('📦 MongoDB Import Script Loaded');
console.log('════════════════════════════════════════');
console.log('Available commands:');
console.log('  • importToMongoDB()    - Import all products to MongoDB');
console.log('  • checkMongoProducts() - Check current products count');
console.log('  • clearMongoProducts() - Delete all products (careful!)');
console.log('════════════════════════════════════════');
