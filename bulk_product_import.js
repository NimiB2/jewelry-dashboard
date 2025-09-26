// Bulk Product Import Script for JewelryDashboard
// This script processes product data and adds them to the products list with proper pricing

// Global variables for products data
let productsToImport = [];
let materialMapping = {};

// Load products data from JSON file
async function loadProductsData() {
  try {
    console.log('📥 Loading products data from JSON file...');
    
    const response = await fetch('./data/jewelry_products.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    productsToImport = data.products || [];
    materialMapping = data.materialMapping || {
      "14K זהב": "זהב 14K",
      "כסף": "כסף",
      "כסף יציקה": "יציקה כסף",
      "ציפוי- כסף": "ציפוי זהב",
      "ציפוי- יציקה": "ציפוי זהב"
    };
    
    console.log(`✅ Loaded ${productsToImport.length} products from JSON`);
    console.log(`🔧 Loaded ${Object.keys(materialMapping).length} material mappings`);
    
    return data;
    
  } catch (error) {
    console.error('❌ Error loading products data:', error);
    console.log('⚠️ Using fallback material mapping...');
    
    // Fallback material mapping
    materialMapping = {
      "14K זהב": "זהב 14K",
      "כסף": "כסף",
      "כסף יציקה": "יציקה כסף",
      "ציפוי- כסף": "ציפוי זהב",
      "ציפוי- יציקה": "ציפוי זהב"
    };
    
    console.log('⚠️ No products loaded - please ensure JSON file exists');
    return null;
  }
}
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
  },
  {
    "productType": "טבעת",
    "modelName": "דניאל",
    "material": "14K זהב",
    "materialWeightGr": 4
  },
  {
    "productType": "טבעת",
    "modelName": "נישואין 5 ממ",
    "material": "14K זהב",
    "materialWeightGr": 4
  },
  {
    "productType": "טבעת",
    "modelName": "סול (שחר ויובל)",
    "material": "14K זהב",
    "materialWeightGr": 4,
    "additions": [
      {
        "name": "אבנים",
        "price": 200
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "גל 3 יהלום פלייר",
    "material": "14K זהב",
    "materialWeightGr": 2.1,
    "additions": [
      {
        "name": "אבנים",
        "price": 50
      },
      {
        "name": "אחר",
        "price": 90
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "טל",
    "material": "כסף",
    "materialWeightGr": 3.82,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "טל",
    "material": "ציפוי- כסף",
    "materialWeightGr": 3.82,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "ציפוי",
        "price": 60
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "לונה",
    "material": "כסף",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "לונה",
    "material": "ציפוי- כסף",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "ציפוי",
        "price": 30
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "לונה",
    "material": "14K זהב",
    "materialWeightGr": 3.06,
    "additions": [
      {
        "name": "עגילים",
        "price": 100
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "בליס",
    "material": "כסף יציקה",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "בליס",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "ציפוי",
        "price": 40
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "פרח ופנינה (איריס)",
    "material": "כסף יציקה",
    "materialWeightGr": 1,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "אבנים",
        "price": 20
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "פרח ופנינה (איריס)",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 1,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "אבנים",
        "price": 20
      },
      {
        "name": "ציפוי",
        "price": 35
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "קיפול גדול (סרינה)",
    "material": "כסף יציקה",
    "materialWeightGr": 7,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "קיפול גדול (סרינה)",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 7,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "ציפוי",
        "price": 70
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "רק אמורפי (דפני)",
    "material": "כסף יציקה",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "רק אמורפי (דפני)",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "ציפוי",
        "price": 40
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "פרח יסמין",
    "material": "כסף יציקה",
    "materialWeightGr": 2.23,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "פרח יסמין",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 2.23,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "ציפוי",
        "price": 30
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "עגילי גרייס",
    "material": "כסף יציקה",
    "materialWeightGr": 6,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "עגילי גרייס",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 6,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "ציפוי",
        "price": 70
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "עגילי יסמין מיני",
    "material": "כסף יציקה",
    "materialWeightGr": 0.7,
    "additions": [
      {
        "name": "עגילים",
        "price": 5
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "עגילי יסמין מיני",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 0.7,
    "additions": [
      {
        "name": "עגילים",
        "price": 5
      },
      {
        "name": "ציפוי",
        "price": 15
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "עגילי רוני",
    "material": "14K זהב",
    "materialWeightGr": 2.5,
    "additions": [
      {
        "name": "עגילים",
        "price": 100
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "עגילי יסמין",
    "material": "14K זהב",
    "materialWeightGr": 4,
    "additions": [
      {
        "name": "עגילים",
        "price": 100
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "פרח תלוי דייזי",
    "material": "כסף",
    "materialWeightGr": 15,
    "additions": [
      {
        "name": "עגילים",
        "price": 10
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "פרח תלוי דייזי",
    "material": "ציפוי- כסף",
    "materialWeightGr": 15,
    "additions": [
      {
        "name": "עגילים",
        "price": 10
      },
      {
        "name": "ציפוי",
        "price": 70
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "גל מרקיזה",
    "material": "14K זהב",
    "materialWeightGr": 2.1,
    "additions": [
      {
        "name": "אבנים",
        "price": 240
      },
      {
        "name": "אחר",
        "price": 80
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "אסתר",
    "material": "כסף יציקה",
    "materialWeightGr": 9,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "אסתר",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 9,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "ציפוי",
        "price": 60
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "עמית",
    "material": "כסף",
    "materialWeightGr": 13
  },
  {
    "productType": "צמיד",
    "modelName": "עמית",
    "material": "ציפוי- כסף",
    "materialWeightGr": 13,
    "additions": [
      {
        "name": "ציפוי",
        "price": 70
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "לילי",
    "material": "כסף",
    "materialWeightGr": 1.75,
    "additions": [
      {
        "name": "שרשרת",
        "price": 20
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "לילי",
    "material": "ציפוי- כסף",
    "materialWeightGr": 2.25,
    "additions": [
      {
        "name": "שרשרת",
        "price": 20
      },
      {
        "name": "ציפוי",
        "price": 30
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "הילה",
    "material": "כסף",
    "materialWeightGr": 11,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "הילה",
    "material": "ציפוי- כסף",
    "materialWeightGr": 11,
    "additions": [
      {
        "name": "עגילים",
        "price": 8
      },
      {
        "name": "ציפוי",
        "price": 100
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "צמיד גרייס",
    "material": "כסף יציקה",
    "materialWeightGr": 8
  },
  {
    "productType": "צמיד",
    "modelName": "צמיד גרייס",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 8,
    "additions": [
      {
        "name": "ציפוי",
        "price": 70
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "צמיד גל",
    "material": "כסף",
    "materialWeightGr": 5
  },
  {
    "productType": "צמיד",
    "modelName": "צמיד גל",
    "material": "ציפוי- כסף",
    "materialWeightGr": 5,
    "additions": [
      {
        "name": "ציפוי",
        "price": 65
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "עמית",
    "material": "14K זהב",
    "materialWeightGr": 14
  },
  {
    "productType": "צמיד",
    "modelName": "צמיד גל",
    "material": "14K זהב",
    "materialWeightGr": 10
  },
  {
    "productType": "צמיד",
    "modelName": "לב",
    "material": "14K זהב",
    "materialWeightGr": 0.7,
    "additions": [
      {
        "name": "שרשרת",
        "price": 400
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "יהלום לילך",
    "material": "14K זהב",
    "materialWeightGr": 2.2,
    "additions": [
      {
        "name": "שרשרת",
        "price": 300
      },
      {
        "name": "אבנים",
        "price": 60
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "2 יהלום לילך",
    "material": "14K זהב",
    "materialWeightGr": 2.2,
    "additions": [
      {
        "name": "שרשרת",
        "price": 300
      },
      {
        "name": "אבנים",
        "price": 120
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "טביעת אצבע",
    "material": "14K זהב",
    "materialWeightGr": 1.8,
    "additions": [
      {
        "name": "שרשרת",
        "price": 620
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "בליס",
    "material": "כסף יציקה",
    "materialWeightGr": 1.8,
    "additions": [
      {
        "name": "שרשרת",
        "price": 25
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "בליס",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 1.8,
    "additions": [
      {
        "name": "שרשרת",
        "price": 25
      },
      {
        "name": "ציפוי",
        "price": 40
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "לוונדר",
    "material": "14K זהב",
    "materialWeightGr": 5,
    "additions": [
      {
        "name": "שרשרת",
        "price": 650
      },
      {
        "name": "אבנים",
        "price": 80
      },
      {
        "name": "אחר",
        "price": 30
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "חמסה",
    "material": "כסף יציקה",
    "materialWeightGr": 0.2,
    "additions": [
      {
        "name": "שרשרת",
        "price": 20
      },
      {
        "name": "אבנים",
        "price": 30
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "חמסה",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 0.2,
    "additions": [
      {
        "name": "שרשרת",
        "price": 20
      },
      {
        "name": "אבנים",
        "price": 30
      },
      {
        "name": "ציפוי",
        "price": 30
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "חמסה",
    "material": "14K זהב",
    "materialWeightGr": 1.1,
    "additions": [
      {
        "name": "שרשרת",
        "price": 550
      },
      {
        "name": "אבנים",
        "price": 30
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "זהב ואבן",
    "material": "14K זהב",
    "materialWeightGr": 1.26,
    "additions": [
      {
        "name": "שרשרת",
        "price": 600
      },
      {
        "name": "אבנים",
        "price": 40
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "לב גדול",
    "material": "14K זהב",
    "materialWeightGr": 1.288,
    "additions": [
      {
        "name": "שרשרת",
        "price": 620
      },
      {
        "name": "אבנים",
        "price": 40
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "יסמין",
    "material": "כסף יציקה",
    "materialWeightGr": 3.5,
    "additions": [
      {
        "name": "שרשרת",
        "price": 30
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "יסמין",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 3.5,
    "additions": [
      {
        "name": "שרשרת",
        "price": 30
      },
      {
        "name": "ציפוי",
        "price": 50
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "זהב ואבן",
    "material": "14K זהב",
    "materialWeightGr": 1.29,
    "additions": [
      {
        "name": "שרשרת",
        "price": 620
      },
      {
        "name": "אבנים",
        "price": 50
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "לב קטן",
    "material": "14K זהב",
    "materialWeightGr": 0.7,
    "additions": [
      {
        "name": "שרשרת",
        "price": 550
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "אותיות",
    "material": "14K זהב",
    "materialWeightGr": 1,
    "additions": [
      {
        "name": "שרשרת",
        "price": 550
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "לב",
    "material": "כסף יציקה",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "שרשרת",
        "price": 20
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "אילה לב",
    "material": "14K זהב",
    "materialWeightGr": 4,
    "additions": [
      {
        "name": "אבנים",
        "price": 50
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "לילך יהלום",
    "material": "14K זהב",
    "materialWeightGr": 2.2,
    "additions": [
      {
        "name": "שרשרת",
        "price": 650
      },
      {
        "name": "אבנים",
        "price": 100
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "לילך 2 יהלום",
    "material": "14K זהב",
    "materialWeightGr": 2.2,
    "additions": [
      {
        "name": "שרשרת",
        "price": 650
      },
      {
        "name": "אבנים",
        "price": 200
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "לינקס",
    "material": "14K זהב",
    "materialWeightGr": 0.8,
    "additions": [
      {
        "name": "שרשרת",
        "price": 600
      },
      {
        "name": "אבנים",
        "price": 60
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "לינקס",
    "material": "14K זהב",
    "materialWeightGr": 0.8,
    "additions": [
      {
        "name": "שרשרת",
        "price": 600
      },
      {
        "name": "אבנים",
        "price": 120
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "גל עם אבן חן",
    "material": "14K זהב",
    "materialWeightGr": 2.1,
    "additions": [
      {
        "name": "אבנים",
        "price": 100
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "לב ואבן",
    "material": "14K זהב",
    "materialWeightGr": 0.9,
    "additions": [
      {
        "name": "שרשרת",
        "price": 550
      },
      {
        "name": "אבנים",
        "price": 50
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "חותם לגבר",
    "material": "14K זהב",
    "materialWeightGr": 5
  },
  {
    "productType": "טבעת",
    "modelName": "טבעת ארורה",
    "material": "14K זהב",
    "materialWeightGr": 3.5,
    "additions": [
      {
        "name": "אבנים",
        "price": 100
      },
      {
        "name": "אחר",
        "price": 80
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "פלורה (פרח אחד)",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 1.3,
    "additions": [
      {
        "name": "שרשרת",
        "price": 25
      },
      {
        "name": "ציפוי",
        "price": 40
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "פלורה (פרח אחד)",
    "material": "כסף יציקה",
    "materialWeightGr": 1.3,
    "additions": [
      {
        "name": "שרשרת",
        "price": 25
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "פלורה",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 1.3,
    "additions": [
      {
        "name": "שרשרת",
        "price": 20
      },
      {
        "name": "ציפוי",
        "price": 40
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "פלורה",
    "material": "כסף יציקה",
    "materialWeightGr": 1.3,
    "additions": [
      {
        "name": "שרשרת",
        "price": 20
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "דליה",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 1.3,
    "additions": [
      {
        "name": "שרשרת",
        "price": 25
      },
      {
        "name": "ציפוי",
        "price": 40
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "דליה",
    "material": "כסף יציקה",
    "materialWeightGr": 1.3,
    "additions": [
      {
        "name": "שרשרת",
        "price": 25
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "טבעת נישואין באבלס 4 מ״מ",
    "material": "14K זהב",
    "materialWeightGr": 5
  },
  {
    "productType": "עגילים",
    "modelName": "עגילי אבן קטנות",
    "material": "14K זהב",
    "materialWeightGr": 0.5,
    "additions": [
      {
        "name": "עגילים",
        "price": 150
      },
      {
        "name": "אבנים",
        "price": 45
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "בליס",
    "material": "14K זהב",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "שרשרת",
        "price": 620
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "עגילי יהל",
    "material": "14K זהב",
    "materialWeightGr": 9,
    "additions": [
      {
        "name": "עגילים",
        "price": 300
      },
      {
        "name": "אבנים",
        "price": 50
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "מיטל (ליילה)",
    "material": "14K זהב",
    "materialWeightGr": 2.5,
    "additions": [
      {
        "name": "אבנים",
        "price": 180
      },
      {
        "name": "אחר",
        "price": 210
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "טבעת אופיר",
    "material": "14K זהב",
    "materialWeightGr": 4,
    "additions": [
      {
        "name": "אבנים",
        "price": 160
      },
      {
        "name": "אחר",
        "price": 100
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "ספיר וורוד (עלמה)",
    "material": "14K זהב",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "שרשרת",
        "price": 650
      },
      {
        "name": "אבנים",
        "price": 80
      },
      {
        "name": "אחר",
        "price": 100
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "ארורה יהלום 1 קארט",
    "material": "14K זהב",
    "materialWeightGr": 3.5,
    "additions": [
      {
        "name": "אחר",
        "price": 100
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "י יהל",
    "material": "כסף יציקה",
    "materialWeightGr": 4,
    "additions": [
      {
        "name": "עגילים",
        "price": 20
      },
      {
        "name": "אבנים",
        "price": 40
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "יהל",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 4,
    "additions": [
      {
        "name": "עגילים",
        "price": 20
      },
      {
        "name": "אבנים",
        "price": 40
      },
      {
        "name": "ציפוי",
        "price": 50
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "עגיל ספיר ורוד בודד",
    "material": "14K זהב",
    "materialWeightGr": 0.3,
    "additions": [
      {
        "name": "עגילים",
        "price": 60
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "טבעת אביטל",
    "material": "14K זהב",
    "materialWeightGr": 3,
    "additions": [
      {
        "name": "אבנים",
        "price": 100
      },
      {
        "name": "אחר",
        "price": 80
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "טבעץ אירוסין",
    "material": "14K זהב",
    "materialWeightGr": 4,
    "additions": [
      {
        "name": "אבנים",
        "price": 2000
      },
      {
        "name": "אחר",
        "price": 150
      }
    ]
  },
  {
    "productType": "טבעת",
    "modelName": "לב קטנטנה",
    "material": "14K זהב",
    "materialWeightGr": 2.5
  },
  {
    "productType": "שרשרת",
    "modelName": "שרשרת ליילה",
    "material": "14K זהב",
    "materialWeightGr": 2.1,
    "additions": [
      {
        "name": "שרשרת",
        "price": 550
      },
      {
        "name": "אבנים",
        "price": 180
      },
      {
        "name": "אחר",
        "price": 200
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "צמיד לילה",
    "material": "14K זהב",
    "materialWeightGr": 2,
    "additions": [
      {
        "name": "שרשרת",
        "price": 400
      },
      {
        "name": "אבנים",
        "price": 180
      },
      {
        "name": "אחר",
        "price": 200
      }
    ]
  },
  {
    "productType": "עגילים",
    "modelName": "פרח שיבוץ (נטע)",
    "material": "14K זהב",
    "materialWeightGr": 0.9,
    "additions": [
      {
        "name": "עגילים",
        "price": 100
      },
      {
        "name": "אבנים",
        "price": 40
      },
      {
        "name": "אחר",
        "price": 50
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "פרח שיבוץ (נטע)",
    "material": "14K זהב",
    "materialWeightGr": 0.8,
    "additions": [
      {
        "name": "שרשרת",
        "price": 600
      },
      {
        "name": "אבנים",
        "price": 15
      },
      {
        "name": "אחר",
        "price": 30
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "פרח שיבוץ",
    "material": "ציפוי- יציקה",
    "materialWeightGr": 4,
    "additions": [
      {
        "name": "עגילים",
        "price": 10
      },
      {
        "name": "אבנים",
        "price": 15
      },
      {
        "name": "אחר",
        "price": 30
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "טבעת עדי (אהבה)",
    "material": "14K זהב",
    "materialWeightGr": 2.8,
    "additions": [
      {
        "name": "אבנים",
        "price": 90
      },
      {
        "name": "אחר",
        "price": 300
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "שרשרת חמסה חדשה",
    "material": "14K זהב",
    "materialWeightGr": 1,
    "additions": [
      {
        "name": "שרשרת",
        "price": 550
      },
      {
        "name": "אבנים",
        "price": 30
      },
      {
        "name": "אחר",
        "price": 30
      }
    ]
  },
  {
    "productType": "צמיד",
    "modelName": "חמסה חדשה",
    "material": "14K זהב",
    "materialWeightGr": 1,
    "additions": [
      {
        "name": "שרשרת",
        "price": 400
      },
      {
        "name": "אבנים",
        "price": 30
      },
      {
        "name": "אחר",
        "price": 30
      }
    ]
  },
  {
    "productType": "שרשרת",
    "modelName": "ציפור ניקולס",
    "material": "14K זהב",
    "materialWeightGr": 1.8,
    "additions": [
      {
        "name": "שרשרת",
        "price": 500
      }
    ]
  }
];

// Material mapping for the pricing system
const materialMapping = {
  "14K זהב": "זהב 14K",
  "כסף": "כסף",
  "כסף יציקה": "יציקה כסף",
  "ציפוי- כסף": "ציפוי זהב",
  "ציפוי- יציקה": "ציפוי זהב"
};

// Function to calculate pricing for a single product
function calculateProductPricing(productData) {
  console.log(`\n=== חישוב תמחור עבור: ${productData.modelName} ===`);
  
  const material = materialMapping[productData.material] || productData.material;
  const weight = productData.materialWeightGr;
  
  console.log(`חומר: ${material}, משקל: ${weight}g`);
  
  // Step A: Material costs = material type × weight
  const pricePerGram = getMaterialPricePerGram(material);
  const materialCost = pricePerGram * weight;
  console.log(`שלב א' - עלות חומרים: ${pricePerGram}₪/גרם × ${weight}גרם = ${materialCost.toFixed(2)}₪`);
  
  // Calculate additions sum (if any)
  let additionsSum = 0;
  if (productData.additions && Array.isArray(productData.additions)) {
    additionsSum = productData.additions.reduce((sum, addition) => sum + (addition.price || 0), 0);
    console.log(`תוספות: ${additionsSum.toFixed(2)}₪`);
  }
  
  // Step B: General expenses = material costs + additions + jewelry pricing constants
  const jewelryPricingConstants = getJewelryPricingConstantsTotal();
  const generalExpenses = materialCost + additionsSum + jewelryPricingConstants;
  console.log(`שלב ב' - הוצאות כללי: ${materialCost.toFixed(2)} + ${additionsSum.toFixed(2)} + ${jewelryPricingConstants.toFixed(2)} = ${generalExpenses.toFixed(2)}₪`);
  
  // Step C: Work and expenses = general expenses + (work time × hourly rate)
  const laborTime = getLaborTimeForMaterial(material);
  const laborHourRate = getLaborHourRate();
  const laborCost = laborTime * laborHourRate;
  const workAndExpenses = generalExpenses + laborCost;
  console.log(`שלב ג' - הוצאות ועבודה: ${generalExpenses.toFixed(2)} + (${laborTime} × ${laborHourRate}) = ${workAndExpenses.toFixed(2)}₪`);
  
  // Step D: Final expenses = work and expenses × all fees multiplier
  const allFeesMultiplier = getAllFeesMultiplier();
  const finalExpenses = workAndExpenses * allFeesMultiplier;
  console.log(`שלב ד' - הוצאות סופי: ${workAndExpenses.toFixed(2)} × ${allFeesMultiplier.toFixed(3)} = ${finalExpenses.toFixed(2)}₪`);
  
  // Step E: Final calculated price = final expenses × profit multiplier
  const profitMultiplier = getProfitMultiplier(material);
  const recommendedPrice = finalExpenses * profitMultiplier;
  console.log(`שלב ה' - מחיר מחושב סופי: ${finalExpenses.toFixed(2)} × ${profitMultiplier.toFixed(2)} = ${recommendedPrice.toFixed(2)}₪`);
  
  return {
    materialCost,
    additionsSum,
    generalExpenses,
    workAndExpenses,
    finalExpenses,
    recommendedPrice,
    calculations: {
      pricePerGram,
      jewelryPricingConstants,
      laborTime,
      laborHourRate,
      laborCost,
      allFeesMultiplier,
      profitMultiplier
    }
  };
}

// Function to convert product data to system format
function convertToSystemFormat(productData, pricingResults) {
  const material = materialMapping[productData.material] || productData.material;
  
  // Convert additions to system format
  const additions = [];
  if (productData.additions && Array.isArray(productData.additions)) {
    productData.additions.forEach(addition => {
      additions.push({
        name: addition.name || 'תוספת',
        price: addition.price || 0
      });
    });
  }
  
  return {
    id: Date.now() + Math.floor(Math.random() * 1000), // Unique integer ID
    type: productData.productType,
    name: productData.modelName,
    material: material,
    weight: productData.materialWeightGr,
    cost: pricingResults.finalExpenses, // Final expenses (before profit)
    price: pricingResults.recommendedPrice, // Recommended price
    sitePrice: pricingResults.recommendedPrice, // Site price = recommended price
    additions: additions,
    collections: ['כללי'] // All products in 'General' collection
  };
}

// Main function to process and import products
function importProducts() {
  console.log('=== התחלת תהליך ייבוא מוצרים ===');
  console.log(`מעבד ${productsToImport.length} מוצרים...`);
  
  const processedProducts = [];
  const repo = window.App.Repositories.ProductRepository;
  
  // Get current products
  let currentProducts = repo.getAll();
  
  productsToImport.forEach((productData, index) => {
    console.log(`\n--- מוצר ${index + 1}/${productsToImport.length} ---`);
    
    try {
      // Calculate pricing
      const pricingResults = calculateProductPricing(productData);
      
      // Convert to system format
      const systemProduct = convertToSystemFormat(productData, pricingResults);
      
      // Add to processed products
      processedProducts.push(systemProduct);
      
      console.log(`✅ מוצר "${systemProduct.name}" עובד בהצלחה`);
      console.log(`   מחיר מומלץ: ${systemProduct.price.toFixed(2)}₪`);
      console.log(`   עלות: ${systemProduct.cost.toFixed(2)}₪`);
      
    } catch (error) {
      console.error(`❌ שגיאה בעיבוד מוצר "${productData.modelName}":`, error);
    }
  });
  
  // Add processed products to the system
  if (processedProducts.length > 0) {
    currentProducts.push(...processedProducts);
    repo.saveAll(currentProducts);
    
    console.log(`\n=== סיכום ייבוא ===`);
    console.log(`✅ ${processedProducts.length} מוצרים נוספו בהצלחה לרשימה`);
    console.log(`📊 סה"כ מוצרים במערכת: ${currentProducts.length}`);
    
    // Refresh the products display if we're on the pricing page
    if (window.App && App.Managers && App.Managers.productManager) {
      App.Managers.productManager.loadProducts();
      console.log('🔄 רשימת המוצרים עודכנה');
    }
    
    // Show summary of imported products
    console.log('\n--- פירוט המוצרים שנוספו ---');
    processedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.type}) - ${product.price.toFixed(2)}₪`);
    });
    
  } else {
    console.log('❌ לא נוספו מוצרים - בדוק שגיאות למעלה');
  }
  
  return processedProducts;
}

// Function to test the pricing system before import
function testPricingSystem() {
  console.log('=== בדיקת מערכת התמחור ===');
  
  try {
    // Test all required functions
    const testMaterial = 'זהב 14K';
    const testWeight = 2.0;
    
    console.log('בדיקת פונקציות התמחור:');
    console.log(`- getMaterialPricePerGram("${testMaterial}"): ${getMaterialPricePerGram(testMaterial)}₪/גרם`);
    console.log(`- getLaborTimeForMaterial("${testMaterial}"): ${getLaborTimeForMaterial(testMaterial)} שעות`);
    console.log(`- getProfitMultiplier("${testMaterial}"): ${getProfitMultiplier(testMaterial)}`);
    console.log(`- getJewelryPricingConstantsTotal(): ${getJewelryPricingConstantsTotal()}₪`);
    console.log(`- getLaborHourRate(): ${getLaborHourRate()}₪/שעה`);
    console.log(`- getAllFeesMultiplier(): ${getAllFeesMultiplier()}`);
    
    console.log('✅ כל הפונקציות זמינות ועובדות');
    return true;
    
  } catch (error) {
    console.error('❌ שגיאה במערכת התמחור:', error);
    return false;
  }
}

// Export functions for console use
window.importProducts = importProducts;
window.testPricingSystem = testPricingSystem;
window.calculateProductPricing = calculateProductPricing;

console.log('📦 סקריפט ייבוא מוצרים נטען בהצלחה');
console.log('🔧 הפעל testPricingSystem() לבדיקת המערכת');
console.log('🚀 הפעל importProducts() לייבוא המוצרים');
