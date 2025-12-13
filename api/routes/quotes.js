// Quotes API Routes
const express = require('express');
const router = express.Router();
const { getDatabase } = require('../../config/database');

// Default quotes list
const DEFAULT_QUOTES = [
    "מיטל, את לא רק יוצרת תכשיטים, את יוצרת קסם! שהדשבורד יראה את זה! ✨",
    "היום זה היום שבו את שוברת שיאים חדשים. התכשיטים שלך מחכים שתפיצי אותם בעולם! 🚀",
    "זכרי: כל תכשיט שלך הוא יצירת אמנות. עכשיו בואי נראה כמה אנשים יתאהבו בהן היום! ❤️",
    "הדשבורד הזה הוא גן המשחקים שלך. שחקי אותה בגדול! 🌟",
    "את הכוכבת, והתכשיטים שלך הם האור. בואי, תאירי את הנתונים! 💡",
    "התכשיטים שלך כל כך יפים שאנשים מוכנים למכור כליה בשבילם. דשבורד, תתכונן לעומס! 😉💰",
    "נכנסת לדשבורד? שימי לב, הנתונים הולכים לזהור כמו יהלום משובח, בדיוק כמו התכשיטים שלך! 💎😂",
    "מיטל, את לא צריכה קפה, את צריכה לראות את הנתונים! הם ממריצים יותר מכל אספרסו. ☕️📊",
    "הדשבורד הזה לא יודע מה נפל עליו. בואי נראה לו איך 'מלכת התכשיטים' עובדת! 👑💪",
    "תכשיט יפה דורש תשומת לב, וגם הנתונים שלך! בואי ניתן להם את הכבוד המגיע להם. 💖🤓",
    "מיטל, את נכנסת לדשבורד — והמספרים כבר מסתדרים יפה בשבילך 😌📈",
    "עוד יום, עוד הוכחה שאת מותג ולא רק סטודיו 💎🔥",
    "היום את לא 'בודקת נתונים' — את מכוונת יהלומים 🧭💎",
    "הדשבורד פה כדי לשרת אותך. כמו שהאור משרת זהב ✨🥇",
    "כל קליק שלך = עוד צעד לקולקציה הבאה שכולם ירצו 🤍🛍️",
    "התכשיטים שלך מדברים. הנתונים רק מתעדים את זה 🎙️📊",
    "עבודה קטנה עכשיו, וואו גדול אחר כך 😏✨",
    "זה הזמן להרים את היום — כמו שאת מרימה לוקים 💅🌟",
    "את לא 'מנהלת עסק' — את בונה אימפריה עדינה 👑🤍",
    "היום הדשבורד לומד מה זה סטנדרט גבוה 💎📈",
    "מיטל נכנסה. הדשבורד: 'אוקיי, אני מתנהג יפה' 😳📊",
    "אם נתון לא מסתדר — תגידי לו 'תתאים את עצמך לאסתטיקה' 😌✨",
    "הדשבורד הזה לא מפחד מכלום… חוץ ממיטל עם מטרות חודשיות 😅🎯",
    "את: 'רק הצצה קטנה'. גם הדשבורד יודע שזה שקר חמוד 🤥💻",
    "הנתונים היום: 'בבקשה אל תעשי לי פילטרים' 😂📈",
    "עוד רגע את מסדרת פה הכל — כמו שרשרת שהסתבכה בכיס 😭🔗",
    "בואי נבדוק מכירות… ואם אין מספיק, נאשים את מרקורי ברטרו 🪐😆",
    "הדשבורד קלט אותך ונכנס למצב 'וואו' אוטומטי 🤯✨",
    "היום את עובדת מסודר. מחר: 'אני רק באתי לבדוק משהו קטן' 😅📊",
    "תזכורת: את הבוסית. גם כשהאקסל עושה פרצופים 😤📈",
    "מיטל, יש לך טעם של מי שנולדה לזה ✨👑",
    "את מצליחה לשלב לב, ידיים זהב וראש חד — זה נדיר 💛🧠",
    "כל יום שאת יוצרת בו — העולם נראה קצת יותר יפה 🌸💎",
    "את לא מחכה להשראה. את ההשראה 😌✨",
    "הסטודיו שלך הוא קסם, ואת המנוע שלו ⚡️💍",
    "כל פריט שלך מרגיש 'הכי אישי' — וזה הכוח שלך 🤍💎",
    "הדיוק שלך? רמה של תכשיט. לא של 'בערך' 😏✨"
];

// GET random quote
router.get('/random', async (req, res) => {
    try {
        const db = await getDatabase();
        const collection = db.collection('quotes');
        
        // Get all quotes from DB
        const quotes = await collection.find({}).toArray();
        
        if (quotes.length === 0) {
            // If no quotes in DB, seed them first
            await collection.insertMany(DEFAULT_QUOTES.map(text => ({ text, createdAt: new Date() })));
            // Return random from defaults
            const randomIndex = Math.floor(Math.random() * DEFAULT_QUOTES.length);
            return res.json({ quote: DEFAULT_QUOTES[randomIndex] });
        }
        
        // Return random quote
        const randomIndex = Math.floor(Math.random() * quotes.length);
        res.json({ quote: quotes[randomIndex].text });
    } catch (error) {
        console.error('Error getting random quote:', error);
        // Fallback to default quotes if DB fails
        const randomIndex = Math.floor(Math.random() * DEFAULT_QUOTES.length);
        res.json({ quote: DEFAULT_QUOTES[randomIndex] });
    }
});

// GET all quotes
router.get('/', async (req, res) => {
    try {
        const db = await getDatabase();
        const collection = db.collection('quotes');
        const quotes = await collection.find({}).toArray();
        res.json(quotes);
    } catch (error) {
        console.error('Error getting quotes:', error);
        res.status(500).json({ error: 'Failed to get quotes' });
    }
});

// POST seed quotes (initialize DB with default quotes)
router.post('/seed', async (req, res) => {
    try {
        const db = await getDatabase();
        const collection = db.collection('quotes');
        
        // Clear existing quotes
        await collection.deleteMany({});
        
        // Insert default quotes
        const result = await collection.insertMany(
            DEFAULT_QUOTES.map(text => ({ text, createdAt: new Date() }))
        );
        
        res.json({ 
            success: true, 
            message: `Seeded ${result.insertedCount} quotes`,
            count: result.insertedCount
        });
    } catch (error) {
        console.error('Error seeding quotes:', error);
        res.status(500).json({ error: 'Failed to seed quotes' });
    }
});

// POST add new quote
router.post('/', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Quote text is required' });
        }
        
        const db = await getDatabase();
        const collection = db.collection('quotes');
        
        const result = await collection.insertOne({ text, createdAt: new Date() });
        res.json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error('Error adding quote:', error);
        res.status(500).json({ error: 'Failed to add quote' });
    }
});

module.exports = router;
