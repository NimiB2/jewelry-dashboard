// Script to create products_data.json from bulk_product_import.js
// Run this in the browser console to generate the JSON file

// First, we need to load the bulk_product_import.js to get the productsToImport array
// Then we'll create a proper JSON structure

const productsData = [
  {
    "productType": "טבעת",
    "modelName": "סופי",
    "material": "14K זהב",
    "materialWeightGr": 2.9
  },
  {
    "productType": "טבעת",
    "modelName": "ענבר",
    "material": "14K זהב",
    "materialWeightGr": 1.7
  },
  {
    "productType": "טבעת",
    "modelName": "טביעת אצבע",
    "material": "כסף יציקה",
    "materialWeightGr": 7.9
  },
  {
    "productType": "טבעת",
    "modelName": "גל דקה",
    "material": "14K זהב",
    "materialWeightGr": 2.1
  },
  {
    "productType": "טבעת",
    "modelName": "גל עבה",
    "material": "14K זהב",
    "materialWeightGr": 4
  },
  {
    "productType": "טבעת",
    "modelName": "טבעת צמה",
    "material": "14K זהב",
    "materialWeightGr": 2
  },
  {
    "productType": "טבעת",
    "modelName": "קרואסון",
    "material": "14K זהב",
    "materialWeightGr": 2
  },
  {
    "productType": "טבעת",
    "modelName": "עיגול ואבן קטן (מיה)",
    "material": "14K זהב",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "אבנים",
        "price": 100
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "מיקה (עם אבן)",
    "material": "14K זהב",
    "materialWeightGr": 3,
    "additions": [
      {
        "name": "אבנים",
        "price": 20
      },
      {
        "name": "אחר",
        "price": 20
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "גוני ויהלומים",
    "material": "14K זהב",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "אבנים",
        "price": 350
      }
    ]
  }
];

// Create the JSON structure
const jsonStructure = {
  "metadata": {
    "version": "1.0",
    "description": "Product data for JewelryDashboard bulk import",
    "totalProducts": productsData.length,
    "lastUpdated": new Date().toISOString().split('T')[0]
  },
  "products": productsData
};

// Convert to JSON string
const jsonString = JSON.stringify(jsonStructure, null, 2);

// Create download link
const blob = new Blob([jsonString], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'products_data.json';
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);

console.log('✅ products_data.json created and downloaded!');
console.log(`📊 Total products: ${productsData.length}`);
