// Script to extract all products data from bulk_product_import.js and create a clean JSON file
// This script will read the existing file and create a properly structured JSON

async function extractAndCreateJSON() {
    try {
        console.log('🚀 Starting data extraction...');
        
        // Read the bulk_product_import.js file
        const response = await fetch('./bulk_product_import.js');
        const fileContent = await response.text();
        
        // Extract the productsToImport array using regex
        const startIndex = fileContent.indexOf('const productsToImport = [');
        const endIndex = fileContent.indexOf('];', startIndex) + 2;
        
        if (startIndex === -1 || endIndex === -1) {
            throw new Error('Could not find productsToImport array');
        }
        
        // Extract the array declaration
        const arrayDeclaration = fileContent.substring(startIndex, endIndex);
        
        // Remove the variable declaration to get just the array
        const arrayContent = arrayDeclaration.replace('const productsToImport = ', '').replace(';', '');
        
        // Parse the array
        const productsData = JSON.parse(arrayContent);
        
        console.log(`📊 Extracted ${productsData.length} products`);
        
        // Create the complete JSON structure
        const jsonStructure = {
            metadata: {
                version: "1.0",
                description: "Complete product data for JewelryDashboard bulk import",
                totalProducts: productsData.length,
                lastUpdated: new Date().toISOString().split('T')[0],
                categories: [...new Set(productsData.map(p => p.productType))],
                materials: [...new Set(productsData.map(p => p.material))]
            },
            materialMapping: {
                "14K זהב": "זהב 14K",
                "כסף": "כסף", 
                "כסף יציקה": "יציקה כסף",
                "ציפוי- כסף": "ציפוי זהב",
                "ציפוי- יציקה": "ציפוי זהב"
            },
            products: productsData
        };
        
        // Convert to formatted JSON
        const jsonString = JSON.stringify(jsonStructure, null, 2);
        
        // Create and download the file
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jewelry_products_complete.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        console.log('✅ Complete JSON file created and downloaded!');
        console.log(`📁 File: jewelry_products_complete.json`);
        console.log(`📊 Products: ${productsData.length}`);
        console.log(`🏷️ Categories: ${jsonStructure.metadata.categories.join(', ')}`);
        console.log(`🔧 Materials: ${jsonStructure.metadata.materials.length} types`);
        
        return jsonStructure;
        
    } catch (error) {
        console.error('❌ Error extracting data:', error);
        return null;
    }
}

// Run the extraction
extractAndCreateJSON();
