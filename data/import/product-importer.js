// Product Import Logic for JewelryDashboard
// This script processes product data and adds them to the products list with proper pricing
// Data is loaded from external JSON file, no embedded data

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
async function importProducts() {
  console.log('=== התחלת תהליך ייבוא מוצרים ===');
  
  // Load data first
  await loadProductsData();
  
  if (productsToImport.length === 0) {
    console.log('❌ No products to import');
    return [];
  }
  
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
window.loadProductsData = loadProductsData;

console.log('📦 סקריפט ייבוא מוצרים נטען בהצלחה');
console.log('🔧 הפעל testPricingSystem() לבדיקת המערכת');
console.log('📥 הפעל loadProductsData() לטעינת נתוני המוצרים');
console.log('🚀 הפעל importProducts() לייבוא המוצרים');
