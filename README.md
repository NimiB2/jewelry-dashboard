# 💎 Jewelry Dashboard - מערכת ניהול עסק תכשיטים

מערכת ניהול עסקית מתקדמת לניהול תכשיטים עם MongoDB, אבטחה ופריסה לענן.

<div dir="rtl">

## ✨ תכונות

### 💰 ניהול הכנסות והוצאות
- מעקב אחר הכנסות והוצאות
- חישוב רווח נקי ואחוזי רווח
- סינון לפי שנה וחודש
- תמיכה בהוצאות חוזרות
- חישוב משכורת מחושבת

### 💎 תמחור מוצרים
- מחשבון תמחור דינמי
- חישוב עלויות חומרים, עבודה ועמלות
- ניהול קולקציות
- רשימת מוצרים עם סינון
- אזהרות על רווח נמוך
- עדכון אוטומטי בשינוי הגדרות

### 📦 ניהול הזמנות
- יצירת הזמנות עם בחירת מוצרים
- מערכת הנחות מתקדמת
- מספור הזמנות אוטומטי
- מעקב אחר סטטוס הזמנות
- חיפוש וסינון

### ⚙️ הגדרות מערכת
- ניהול קטגוריות דינמי
- עמלות, חומרים, זמני עבודה
- קבועי תמחור
- הוצאות קבועות
- סנכרון אוטומטי

### 🔒 אבטחה
- **התחברות מאובטחת** - גישה רק למשתמש מורשה
- **הצפנת סיסמאות** - SHA-256 hashing
- **Token-based sessions** - אבטחת API
- **אופציונלי** - ניתן לכבות לפיתוח

### 💾 MongoDB Integration
- **גיבוי בענן** - כל הנתונים ב-MongoDB Atlas
- **סנכרון בין מכשירים** - גישה מכל מקום
- **Offline support** - עובד גם בלי אינטרנט
- **חינמי** - 512MB ללא עלות

</div>

---

## 🚀 התחלה מהירה

### דרישות מקדימות
- Node.js 14+ מותקן
- חשבון MongoDB Atlas (חינמי)
- Git (אופציונלי)

### התקנה

```bash
# 1. Clone או הורד את הפרויקט
git clone https://github.com/YOUR_USERNAME/jewelry-dashboard.git
cd jewelry-dashboard

# 2. התקן תלויות
npm install

# 3. הגדר MongoDB (ראה QUICK-START-MONGODB.md)
# צור קובץ .env עם:
# MONGODB_URI=mongodb+srv://...
# PORT=65528
# USE_MONGODB=true

# 4. הגדר אבטחה (ראה SECURITY-SETUP.md)
node generate-password.js YOUR_PASSWORD
# העתק את הפלט ל-.env

# 5. הרץ את השרת
npm start

# 6. פתח דפדפן
# http://localhost:65528
```

---

## 📚 מדריכים

### מדריכים מפורטים:
- **[QUICK-START-MONGODB.md](QUICK-START-MONGODB.md)** - התחלה מהירה עם MongoDB
- **[README-MONGODB.md](README-MONGODB.md)** - מדריך MongoDB מלא
- **[SECURITY-SETUP.md](SECURITY-SETUP.md)** - הגדרת אבטחה
- **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - פריסה לשרת

### מדריכים מהירים:

#### 🔌 חיבור MongoDB (3 שלבים)
1. צור חשבון ב-[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. העתק Connection String ל-`.env`
3. `npm start`

#### 🔒 הגדרת אבטחה (3 שלבים)
1. `node generate-password.js YOUR_PASSWORD`
2. העתק hash ו-token ל-`.env`
3. `npm start` → התחבר עם הסיסמה

#### 🚀 פריסה לשרת (5 שלבים)
1. העלה ל-GitHub
2. הירשם ל-[Render](https://render.com)
3. צור Web Service
4. הוסף Environment Variables
5. Deploy!

---

## 🏗️ ארכיטקטורה

```
jewelry-dashboard/
├── api/
│   └── routes/          # API endpoints (products, orders, expenses)
├── config/
│   └── database.js      # MongoDB connection
├── middleware/
│   └── auth.js          # Authentication middleware
├── public/
│   ├── login.html       # Login page
│   └── auth-check.js    # Client-side auth
├── js/
│   ├── core/            # Core services (storage)
│   ├── domain/          # Repositories (data access)
│   ├── features/        # Feature modules
│   └── glue/            # App state
├── css/
│   └── styles.css       # Styling
├── utils/
│   └── migrate-to-mongodb.html  # Migration tool
├── index.html           # Main app
├── server.js            # Express server
└── package.json         # Dependencies
```

---

## 🔧 טכנולוגיות

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **dotenv** - Environment variables

### Frontend
- **Vanilla JavaScript** - No frameworks
- **HTML5 & CSS3** - Modern UI
- **localStorage** - Offline support

### אבטחה
- **SHA-256** - Password hashing
- **Token-based auth** - Session management
- **HTTPS** - Encrypted communication (production)

---

## 📊 API Endpoints

### Authentication
```
POST /api/auth/login     - Login
```

### Products
```
GET    /api/products           - Get all products
POST   /api/products           - Create product
PUT    /api/products/:id       - Update product
DELETE /api/products/:id       - Delete product
POST   /api/products/bulk      - Bulk import
```

### Orders
```
GET    /api/orders                      - Get all orders
POST   /api/orders                      - Create order
PUT    /api/orders/:id                  - Update order
DELETE /api/orders/:id                  - Delete order
POST   /api/orders/meta/allocate-number - Allocate order number
POST   /api/orders/bulk                 - Bulk import
```

### Expenses
```
GET    /api/expenses           - Get all expenses
POST   /api/expenses           - Create expense
PUT    /api/expenses/:id       - Update expense
DELETE /api/expenses/:id       - Delete expense
DELETE /api/expenses/group/:id - Delete expense group
POST   /api/expenses/bulk      - Bulk import
```

### Health
```
GET /api/health - Check server & DB status
```

---

## 🔒 אבטחה

### משתמש יחיד
המערכת מיועדת למשתמש יחיד (בעל העסק).

### פרטי כניסה
מוגדרים בקובץ `.env`:
```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<hash>
AUTH_TOKEN=<token>
```

### יצירת סיסמה
```bash
node generate-password.js YOUR_PASSWORD
```

### ביטול אבטחה (פיתוח בלבד)
```env
USE_AUTH=false
```

**⚠️ אל תעשה זאת בפרודקשן!**

---

## 🌐 פריסה

### אפשרויות חינמיות:

#### 1. Render (מומלץ)
- ✅ 750 שעות/חודש חינם
- ✅ HTTPS אוטומטי
- ✅ קל להגדרה
- 📖 [מדריך מלא](DEPLOYMENT-GUIDE.md#פריסה-ל-render)

#### 2. Railway
- ✅ $5 קרדיט/חודש
- ✅ מהיר מאוד
- ✅ ממשק פשוט
- 📖 [מדריך מלא](DEPLOYMENT-GUIDE.md#פריסה-ל-railway)

#### 3. Vercel (Frontend בלבד)
- ✅ חינמי לחלוטין
- ⚠️ דורש שרת נפרד ל-API
- 📖 [מדריך מלא](DEPLOYMENT-GUIDE.md#פריסה-ל-vercel)

---

## 💰 עלויות

### תוכנית חינמית מלאה:
- **Render Free**: 750 שעות/חודש
- **MongoDB Atlas Free**: 512MB
- **סה"כ**: ₪0/חודש 🎉

### אם צריך יותר:
- **Render Starter**: $7/חודש (שרת תמיד פעיל)
- **MongoDB Shared**: $9/חודש (2GB-5GB)

---

## 🛠️ פיתוח

### הרצה מקומית
```bash
npm start          # Production mode
npm run dev        # Development mode (auto-reload)
npm run test-db    # Test MongoDB connection
```

### סקריפטים נוספים
```bash
node generate-password.js PASSWORD  # Generate password hash
node test-connection.js             # Test MongoDB
```

### Environment Variables
```env
# MongoDB
MONGODB_URI=mongodb+srv://...
USE_MONGODB=true

# Server
PORT=65528
NODE_ENV=development

# Authentication
USE_AUTH=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<hash>
AUTH_TOKEN=<token>
```

---

## 📱 גישה ממכשירים

אחרי פריסה לשרת, ניתן לגשת מ:
- 💻 כל מחשב
- 📱 טלפון נייד
- 🖥️ טאבלט

פשוט גש ל-URL של השרת והתחבר.

---

## 🔄 עדכונים

### עדכון הקוד
```bash
git pull
npm install
npm start
```

### עדכון בשרת
אם השתמשת ב-Render/Railway:
```bash
git add .
git commit -m "Update"
git push
```
השרת יתעדכן אוטומטית!

---

## 🆘 תמיכה

### בעיות נפוצות

**"MONGODB_URI is not defined"**
→ צור קובץ `.env` עם Connection String

**"Unauthorized"**
→ בדוק שם משתמש וסיסמה, או הרץ `generate-password.js` מחדש

**"Application failed to respond"**
→ בדוק logs ב-Render/Railway Dashboard

### מדריכים
- [MongoDB Setup](README-MONGODB.md)
- [Security Setup](SECURITY-SETUP.md)
- [Deployment Guide](DEPLOYMENT-GUIDE.md)

---

## 📄 רישיון

MIT License - חופשי לשימוש אישי ומסחרי.

---

## 🙏 תודות

נבנה עם:
- Express.js
- MongoDB
- Node.js
- ❤️

---

**מוכן להתחיל? בחר מדריך:**
- 🚀 [התחלה מהירה](QUICK-START-MONGODB.md)
- 🔒 [הגדרת אבטחה](SECURITY-SETUP.md)
- 🌐 [פריסה לשרת](DEPLOYMENT-GUIDE.md)

**הצלחה! 🎉**
