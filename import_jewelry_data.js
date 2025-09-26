// סקריפט להוספת תכשיטים מאקסל למערכת
// להריץ בקונסול של הדפדפן כשהאתר פתוח

function importJewelryData() {
    console.log('🚀 מתחיל ייבוא תכשיטים...');
    
    // נתוני התכשיטים מהאקסל
    const jewelryData = [
        { type: 'טבעת', name: 'נימי עליה', material: 'זהב 14K', weight: 2.5, additions: { earrings: 0, chain: 0, stones: 0, coating: 180, other: 210 } },
        { type: 'טבעת', name: 'טבעת אופיר', material: 'זהב 14K', weight: 4, additions: { earrings: 0, chain: 0, stones: 0, coating: 160, other: 100 } },
        { type: 'שרשרת', name: 'ספיר זהוב עליה', material: 'זהב 14K', weight: 2, additions: { earrings: 0, chain: 0, stones: 650, coating: 80, other: 100 } },
        { type: 'טבעת', name: 'חרוזת יהלום 1 קארט', material: 'זהב 14K', weight: 3.5, additions: { earrings: 0, chain: 0, stones: 0, coating: 0, other: 100 } },
        { type: 'עגילים', name: 'יהל', material: 'כסף ציפוי', weight: 4, additions: { earrings: 20, chain: 0, stones: 0, coating: 40, other: 0 } },
        { type: 'עגילים', name: 'יהל', material: 'ציפוי ציפוי', weight: 4, additions: { earrings: 20, chain: 0, stones: 0, coating: 40, other: 50 } },
        { type: 'עגילים', name: 'עגיל סלט בזהב', material: 'זהב 14K', weight: 0.3, additions: { earrings: 60, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'טבעת אביגיל', material: 'זהב 14K', weight: 3, additions: { earrings: 0, chain: 0, stones: 0, coating: 100, other: 80 } },
        { type: 'טבעת', name: 'טבעת איזדין', material: 'זהב 14K', weight: 4, additions: { earrings: 0, chain: 0, stones: 2000, coating: 0, other: 150 } },
        { type: 'טבעת', name: 'לב קטנטון', material: 'זהב 14K', weight: 2.5, additions: { earrings: 0, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'שרשרת עליה', material: 'זהב 14K', weight: 2.1, additions: { earrings: 0, chain: 550, stones: 0, coating: 180, other: 200 } },
        { type: 'צמיד', name: 'צמיד זהב', material: 'זהב 14K', weight: 2, additions: { earrings: 0, chain: 400, stones: 0, coating: 180, other: 200 } },
        { type: 'עגילים', name: 'פרח שיבוץ נעמי', material: 'זהב 14K', weight: 0.9, additions: { earrings: 100, chain: 0, stones: 0, coating: 40, other: 50 } },
        { type: 'שרשרת', name: 'פרח שיבוץ נעמי', material: 'זהב 14K', weight: 0.8, additions: { earrings: 0, chain: 600, stones: 0, coating: 15, other: 30 } },
        { type: 'שרשרת', name: 'פרח שיבוץ', material: 'ציפוי ציפוי', weight: 4, additions: { earrings: 0, chain: 10, stones: 0, coating: 15, other: 30 } },
        { type: 'שרשרת', name: 'טבעת עדי אהבה', material: 'זהב 14K', weight: 2.8, additions: { earrings: 0, chain: 0, stones: 0, coating: 90, other: 300 } },
        { type: 'שרשרת', name: 'שרשרת חמסה חדשה', material: 'זהב 14K', weight: 1, additions: { earrings: 0, chain: 550, stones: 0, coating: 30, other: 30 } },
        { type: 'צמיד', name: 'חמסת חדשה', material: 'זהב 14K', weight: 1, additions: { earrings: 0, chain: 400, stones: 0, coating: 30, other: 30 } },
        { type: 'שרשרת', name: 'ציפוי ריקולס', material: 'זהב 14K', weight: 1.8, additions: { earrings: 0, chain: 500, stones: 0, coating: 0, other: 0 } },
        { type: 'עגילים', name: 'עגילי גרים', material: 'כסף ציפוי', weight: 6, additions: { earrings: 8, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'עגילים', name: 'עגילי גרים', material: 'ציפוי ציפוי', weight: 6, additions: { earrings: 8, chain: 0, stones: 0, coating: 70, other: 0 } },
        { type: 'עגילים', name: 'עגילי יהמי מים', material: 'כסף ציפוי', weight: 0.7, additions: { earrings: 5, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'עגילים', name: 'עגילי יהמי מים', material: 'ציפוי ציפוי', weight: 0.7, additions: { earrings: 5, chain: 0, stones: 0, coating: 15, other: 0 } },
        { type: 'עגילים', name: 'עגיל הרץ', material: 'זהב 14K', weight: 2.5, additions: { earrings: 100, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'עגילים', name: 'עגיל יהמי', material: 'זהב 14K', weight: 4, additions: { earrings: 100, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'עגילים', name: 'פרח תלוי דקי', material: 'כסף', weight: 15, additions: { earrings: 10, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'עגילים', name: 'פרח תלוי דקי', material: 'ציפוי כסף', weight: 15, additions: { earrings: 10, chain: 0, stones: 0, coating: 70, other: 0 } },
        { type: 'טבעת', name: 'גל מרקיזה', material: 'זהב 14K', weight: 2.1, additions: { earrings: 0, chain: 0, stones: 240, coating: 0, other: 80 } },
        { type: 'עגילים', name: 'אטרנו', material: 'כסף ציפוי', weight: 9, additions: { earrings: 8, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'עגילים', name: 'אטרנו', material: 'ציפוי ציפוי', weight: 9, additions: { earrings: 8, chain: 0, stones: 0, coating: 60, other: 0 } },
        { type: 'צמיד', name: 'עמית', material: 'כסף', weight: 13, additions: { earrings: 0, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'צמיד', name: 'עמית', material: 'ציפוי כסף', weight: 13, additions: { earrings: 0, chain: 0, stones: 0, coating: 70, other: 0 } },
        { type: 'צמיד', name: 'לילי', material: 'כסף', weight: 1.75, additions: { earrings: 0, chain: 0, stones: 20, coating: 0, other: 0 } },
        { type: 'צמיד', name: 'לילי', material: 'ציפוי כסף', weight: 2.25, additions: { earrings: 0, chain: 0, stones: 20, coating: 0, other: 30 } },
        { type: 'צמיד', name: 'הלה', material: 'כסף', weight: 11, additions: { earrings: 8, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'צמיד', name: 'הלה', material: 'ציפוי כסף', weight: 11, additions: { earrings: 8, chain: 0, stones: 0, coating: 0, other: 100 } },
        { type: 'צמיד', name: 'צמיד גרים', material: 'כסף ציפוי', weight: 8, additions: { earrings: 0, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'צמיד', name: 'צמיד גרים', material: 'ציפוי ציפוי', weight: 8, additions: { earrings: 0, chain: 0, stones: 0, coating: 70, other: 0 } },
        { type: 'צמיד', name: 'צמיד גל', material: 'כסף', weight: 5, additions: { earrings: 0, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'צמיד', name: 'צמיד גל', material: 'ציפוי כסף', weight: 5, additions: { earrings: 0, chain: 0, stones: 0, coating: 65, other: 0 } },
        { type: 'צמיד', name: 'עמית', material: 'זהב 14K', weight: 14, additions: { earrings: 0, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'צמיד', name: 'צמיד גל', material: 'זהב 14K', weight: 10, additions: { earrings: 0, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'צמיד', name: 'לב', material: 'זהב 14K', weight: 0.7, additions: { earrings: 0, chain: 0, stones: 400, coating: 0, other: 0 } },
        { type: 'צמיד', name: 'יהלום לילך', material: 'זהב 14K', weight: 2.2, additions: { earrings: 0, chain: 0, stones: 300, coating: 60, other: 0 } },
        { type: 'צמיד', name: 'יהלום לילך 2', material: 'זהב 14K', weight: 2.2, additions: { earrings: 0, chain: 0, stones: 300, coating: 120, other: 0 } },
        { type: 'שרשרת', name: 'טבעת אברהם', material: 'זהב 14K', weight: 1.8, additions: { earrings: 0, chain: 620, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'בלים', material: 'כסף ציפוי', weight: 1.8, additions: { earrings: 0, chain: 25, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'בלים', material: 'ציפוי ציפוי', weight: 1.8, additions: { earrings: 0, chain: 25, stones: 0, coating: 40, other: 0 } },
        { type: 'שרשרת', name: 'לוחות', material: 'זהב 14K', weight: 5, additions: { earrings: 0, chain: 650, stones: 0, coating: 80, other: 30 } },
        { type: 'שרשרת', name: 'חמסה', material: 'כסף ציפוי', weight: 0.2, additions: { earrings: 0, chain: 20, stones: 30, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'חמסה', material: 'ציפוי ציפוי', weight: 0.2, additions: { earrings: 0, chain: 20, stones: 30, coating: 0, other: 30 } },
        { type: 'שרשרת', name: 'חמסה', material: 'זהב 14K', weight: 1.1, additions: { earrings: 0, chain: 550, stones: 30, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'זהב אבן', material: 'זהב 14K', weight: 1.26, additions: { earrings: 0, chain: 600, stones: 40, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'לב מחול', material: 'זהב 14K', weight: 1.288, additions: { earrings: 0, chain: 620, stones: 40, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'יסמין', material: 'כסף ציפוי', weight: 3.5, additions: { earrings: 0, chain: 30, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'יסמין', material: 'ציפוי ציפוי', weight: 3.5, additions: { earrings: 0, chain: 30, stones: 0, coating: 50, other: 0 } },
        { type: 'שרשרת', name: 'זהב אבן', material: 'זהב 14K', weight: 1.29, additions: { earrings: 0, chain: 620, stones: 50, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'לב קטן', material: 'זהב 14K', weight: 0.7, additions: { earrings: 0, chain: 550, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'אמונות', material: 'זהב 14K', weight: 1, additions: { earrings: 0, chain: 550, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'לב', material: 'כסף ציפוי', weight: 2, additions: { earrings: 0, chain: 20, stones: 0, coating: 0, other: 0 } },
        { type: 'טבעת', name: 'אליה לב', material: 'זהב 14K', weight: 4, additions: { earrings: 0, chain: 0, stones: 0, coating: 50, other: 0 } },
        { type: 'שרשרת', name: 'לילך יהלום', material: 'זהב 14K', weight: 2.2, additions: { earrings: 0, chain: 650, stones: 100, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'לילך יהלום 2', material: 'זהב 14K', weight: 2.2, additions: { earrings: 0, chain: 650, stones: 200, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'ליקט', material: 'זהב 14K', weight: 0.8, additions: { earrings: 0, chain: 600, stones: 60, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'ליקט', material: 'זהב 14K', weight: 0.8, additions: { earrings: 0, chain: 600, stones: 120, coating: 0, other: 0 } },
        { type: 'טבעת', name: 'גל עם אבן חן', material: 'זהב 14K', weight: 2.1, additions: { earrings: 0, chain: 0, stones: 0, coating: 100, other: 0 } },
        { type: 'שרשרת', name: 'לב אבן', material: 'זהב 14K', weight: 0.9, additions: { earrings: 0, chain: 550, stones: 50, coating: 0, other: 0 } },
        { type: 'טבעת', name: 'חותם לגבר', material: 'זהב 14K', weight: 5, additions: { earrings: 0, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'טבעת אורחת', material: 'זהב 14K', weight: 3.5, additions: { earrings: 0, chain: 0, stones: 0, coating: 40, other: 80 } },
        { type: 'שרשרת', name: 'פליחה פרח אחד', material: 'ציפוי ציפוי', weight: 13, additions: { earrings: 0, chain: 25, stones: 0, coating: 0, other: 40 } },
        { type: 'שרשרת', name: 'פליחה פרח אחד', material: 'כסף ציפוי', weight: 13, additions: { earrings: 0, chain: 25, stones: 0, coating: 0, other: 0 } },
        { type: 'צמיד', name: 'פליחה', material: 'ציפוי ציפוי', weight: 13, additions: { earrings: 0, chain: 20, stones: 0, coating: 0, other: 40 } },
        { type: 'צמיד', name: 'פליחה', material: 'כסף ציפוי', weight: 13, additions: { earrings: 0, chain: 20, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'דליה', material: 'ציפוי ציפוי', weight: 13, additions: { earrings: 0, chain: 25, stones: 0, coating: 0, other: 40 } },
        { type: 'שרשרת', name: 'דליה', material: 'כסף ציפוי', weight: 13, additions: { earrings: 0, chain: 25, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'נ\' ושינוי בגרמים 4', material: 'זהב 14K', weight: 5, additions: { earrings: 0, chain: 0, stones: 45, coating: 0, other: 0 } },
        { type: 'עגילים', name: 'עגיל אבן קטנטון', material: 'זהב 14K', weight: 0.5, additions: { earrings: 150, chain: 0, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'בלים', material: 'זהב 14K', weight: 2, additions: { earrings: 0, chain: 620, stones: 0, coating: 0, other: 0 } },
        { type: 'שרשרת', name: 'עגיל יהל', material: 'זהב 14K', weight: 9, additions: { earrings: 0, chain: 300, stones: 50, coating: 0, other: 0 } }
    ];

    // פונקציה לחישוב מחיר תכשיט
    function calculateJewelryPrice(item) {
        try {
            // שלב א' - עלות חומרים
            const materialPricePerGram = getMaterialPricePerGram(item.material);
            const materialCost = materialPricePerGram * item.weight;
            
            // סכום התוספות
            const additionsSum = (item.additions.earrings || 0) + 
                                (item.additions.chain || 0) + 
                                (item.additions.stones || 0) + 
                                (item.additions.coating || 0) + 
                                (item.additions.other || 0);
            
            // שלב ב' - הוצאות כלליות (עם קבועי תמחור)
            const jewelryPricingConstants = getJewelryPricingConstantsTotal();
            const generalExpenses = materialCost + additionsSum + jewelryPricingConstants;
            
            // שלב ג' - עבודה והוצאות
            const laborTime = getLaborTimeForMaterial(item.material);
            const laborHourRate = getLaborHourRate();
            const laborCost = laborTime * laborHourRate;
            const workAndExpenses = generalExpenses + laborCost;
            
            // שלב ד' - הוצאות סופיות (עם כל העמלות)
            const allFeesMultiplier = getAllFeesMultiplier();
            const finalExpenses = workAndExpenses * allFeesMultiplier;
            
            // שלב ה' - מחיר סופי (עם מכפלת רווח)
            const profitMultiplier = getProfitMultiplier(item.material);
            const recommendedPrice = finalExpenses * profitMultiplier;
            
            return {
                cost: finalExpenses,
                price: recommendedPrice,
                sitePrice: recommendedPrice
            };
        } catch (error) {
            console.error(`שגיאה בחישוב מחיר עבור ${item.name}:`, error);
            return {
                cost: 0,
                price: 0,
                sitePrice: 0
            };
        }
    }

    // פונקציה להמרת תוספות למבנה המערכת
    function convertAdditionsToArray(additions) {
        const additionsArray = [];
        
        if (additions.earrings > 0) additionsArray.push({ name: 'עגילים', price: additions.earrings });
        if (additions.chain > 0) additionsArray.push({ name: 'שרשרת', price: additions.chain });
        if (additions.stones > 0) additionsArray.push({ name: 'אבנים', price: additions.stones });
        if (additions.coating > 0) additionsArray.push({ name: 'ציפוי', price: additions.coating });
        if (additions.other > 0) additionsArray.push({ name: 'אחר', price: additions.other });
        
        return additionsArray;
    }

    // קבלת המוצרים הקיימים
    const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
    let addedCount = 0;
    let errorCount = 0;

    // הוספת כל התכשיטים
    jewelryData.forEach((item, index) => {
        try {
            // חישוב מחיר
            const pricing = calculateJewelryPrice(item);
            
            // יצירת מוצר חדש
            const product = {
                id: Date.now() + index, // ID ייחודי
                type: item.type,
                name: item.name,
                material: item.material,
                weight: item.weight,
                cost: pricing.cost,
                price: pricing.price,
                sitePrice: pricing.sitePrice,
                additions: convertAdditionsToArray(item.additions),
                collections: ['כללי'] // קולקציה ברירת מחדל
            };
            
            existingProducts.push(product);
            addedCount++;
            
            console.log(`✅ נוסף: ${item.name} (${item.type}) - ₪${pricing.price.toFixed(2)}`);
            
        } catch (error) {
            console.error(`❌ שגיאה בהוספת ${item.name}:`, error);
            errorCount++;
        }
    });

    // שמירה ב-localStorage
    localStorage.setItem('products', JSON.stringify(existingProducts));
    
    console.log(`🎉 סיום ייבוא!`);
    console.log(`✅ נוספו בהצלחה: ${addedCount} תכשיטים`);
    console.log(`❌ שגיאות: ${errorCount} תכשיטים`);
    console.log(`📊 סה"כ מוצרים במערכת: ${existingProducts.length}`);
    
    // רענון הדף לטעינת הנתונים החדשים
    if (addedCount > 0) {
        console.log('🔄 מרענן את הדף...');
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}

// הרצת הייבוא
importJewelryData();
