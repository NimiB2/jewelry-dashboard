// Script to extract products data from bulk_product_import.js and save to JSON file
// This is a one-time utility script

// Read the bulk_product_import.js file and extract the productsToImport array
async function extractProductsData() {
    try {
        // Load the bulk_product_import.js file
        const response = await fetch('./bulk_product_import.js');
        const scriptContent = await response.text();
        
        // Extract the productsToImport array using regex
        const arrayMatch = scriptContent.match(/const productsToImport = (\[[\s\S]*?\]);/);
        
        if (!arrayMatch) {
            throw new Error('Could not find productsToImport array in the file');
        }
        
        // Parse the array
        const productsData = eval(arrayMatch[1]);
        
        // Convert to JSON string with proper formatting
        const jsonData = JSON.stringify(productsData, null, 2);
        
        // Create a download link for the JSON file
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        console.log('✅ Products data extracted successfully!');
        console.log(`📊 Total products: ${productsData.length}`);
        console.log('💾 JSON file downloaded');
        
        return productsData;
        
    } catch (error) {
        console.error('❌ Error extracting products data:', error);
        return null;
    }
}

// Run the extraction
extractProductsData();
