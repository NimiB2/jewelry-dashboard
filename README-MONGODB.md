# 🔌 חיבור MongoDB ל-Jewelry Dashboard

מדריך מלא לחיבור הפרויקט למסד נתונים MongoDB Atlas (חינמי).

## 📋 תוכן עניינים

1. [יצירת חשבון MongoDB Atlas](#יצירת-חשבון-mongodb-atlas)
2. [התקנת תלויות](#התקנת-תלויות)
3. [הגדרת קובץ .env](#הגדרת-קובץ-env)
4. [הרצת השרת](#הרצת-השרת)
5. [העברת נתונים](#העברת-נתונים)
6. [בדיקת החיבור](#בדיקת-החיבור)

---

## 🌐 יצירת חשבון MongoDB Atlas

### שלב 1: הרשמה
1. גש ל-[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. לחץ על **"Try Free"** או **"Start Free"**
3. הירשם עם Google/GitHub או אימייל

### שלב 2: יצירת Cluster
1. בחר באפשרות **FREE (M0)** - 512MB חינמי
2. בחר **Provider**: AWS / Google Cloud / Azure (לפי העדפה)
3. בחר **Region**: קרוב לישראל (למשל: Frankfurt, Paris)
4. שם ל-Cluster: `jewelry-dashboard` (או כל שם אחר)
5. לחץ **"Create Cluster"** - יקח כ-3-5 דקות

### שלב 3: הגדרת אבטחה

#### 3.1 Database Access (משתמש)
1. בתפריט צד שמאל: **Security → Database Access**
2. לחץ **"Add New Database User"**
3. בחר **Authentication Method**: Password
4. שם משתמש: `jewelry_admin` (או כל שם)
5. סיסמה: צור סיסמה חזקה (שמור אותה!)
6. **Database User Privileges**: `Atlas admin` או `Read and write to any database`
7. לחץ **"Add User"**

#### 3.2 Network Access (IP)
1. בתפריט צד שמאל: **Security → Network Access**
2. לחץ **"Add IP Address"**
3. בחר **"Allow Access from Anywhere"** (0.0.0.0/0)
   - לפיתוח זה בסדר, לפרודקשן הגדר IP ספציפי
4. לחץ **"Confirm"**

### שלב 4: קבלת Connection String
1. חזור ל-**Database** בתפריט
2. ליד ה-Cluster שלך לחץ **"Connect"**
3. בחר **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 5.5 or later
6. העתק את ה-**Connection String**:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
7. **חשוב**: החלף את `<username>` ו-`<password>` בפרטים האמיתיים!

---

## 📦 התקנת תלויות

פתח טרמינל בתיקיית הפרויקט והרץ:

```bash
npm install
```

זה יתקין:
- `express` - שרת API
- `mongodb` - דרייבר MongoDB
- `dotenv` - ניהול משתני סביבה
- `cors` - תמיכה ב-CORS
- `nodemon` - פיתוח (אופציונלי)

---

## ⚙️ הגדרת קובץ .env

1. העתק את הקובץ `.env.example` ל-`.env`:
   ```bash
   copy .env.example .env
   ```

2. ערוך את הקובץ `.env` והדבק את ה-Connection String שלך:
   ```env
   MONGODB_URI=mongodb+srv://jewelry_admin:YOUR_PASSWORD@cluster.mongodb.net/jewelry_dashboard?retryWrites=true&w=majority
   PORT=65528
   NODE_ENV=development
   USE_MONGODB=true
   ```

3. **החלף**:
   - `jewelry_admin` - שם המשתמש שיצרת
   - `YOUR_PASSWORD` - הסיסמה שיצרת
   - `cluster` - שם ה-Cluster שלך

### דוגמה מלאה:
```env
MONGODB_URI=mongodb+srv://jewelry_admin:MyStr0ngP@ssw0rd@jewelry-cluster.abc123.mongodb.net/jewelry_dashboard?retryWrites=true&w=majority
PORT=65528
NODE_ENV=development
USE_MONGODB=true
```

---

## 🚀 הרצת השרת

### הרצה רגילה:
```bash
npm start
```

### הרצה עם auto-reload (פיתוח):
```bash
npm run dev
```

אתה אמור לראות:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Jewelry Dashboard Server
📍 URL: http://localhost:65528
🌍 Environment: development
💾 MongoDB: Enabled
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔌 Connecting to MongoDB...
✅ Successfully connected to MongoDB
📊 Database: jewelry_dashboard
```

---

## 📤 העברת נתונים

אם יש לך נתונים קיימים ב-localStorage, העבר אותם ל-MongoDB:

### אפשרות 1: דרך ממשק גרפי
1. פתח דפדפן וגש ל: `http://localhost:65528/utils/migrate-to-mongodb.html`
2. בדוק שהחיבור ל-MongoDB תקין (✅ מחובר)
3. לחץ על **"🚀 התחל העברה"**
4. המתן עד שהתהליך יסתיים
5. בדוק את הלוג לוודא שהכל עבר בהצלחה

### אפשרות 2: דרך Console
פתח את ה-Console בדפדפן (F12) והרץ:

```javascript
// העברת מוצרים
const products = JSON.parse(localStorage.getItem('products') || '[]');
await fetch('/api/products/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(products)
});

// העברת הזמנות
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
await fetch('/api/orders/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orders)
});

// העברת הוצאות
const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
await fetch('/api/expenses/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenses)
});
```

---

## ✅ בדיקת החיבור

### בדיקה 1: Health Check
גש ל: `http://localhost:65528/api/health`

תקבל:
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### בדיקה 2: Console Logs
פתח את ה-Console בדפדפן (F12) וחפש:
```
✅ ProductRepository: MongoDB connected
✅ OrderRepository: MongoDB connected
✅ ExpenseRepository: MongoDB connected
```

### בדיקה 3: MongoDB Atlas
1. גש ל-MongoDB Atlas Dashboard
2. לחץ על **"Browse Collections"**
3. אמור לראות:
   - `jewelry_dashboard` database
   - `products`, `orders`, `expenses` collections
   - הנתונים שהעברת

---

## 🔄 מצב Offline (Fallback)

המערכת תומכת במצב offline אוטומטי:

- **אם MongoDB זמין**: כל הפעולות נשמרות ב-MongoDB + localStorage (backup)
- **אם MongoDB לא זמין**: המערכת עוברת אוטומטית ל-localStorage בלבד
- **חזרה לאונליין**: הנתונים מ-localStorage יסונכרנו אוטומטית

תראה הודעות ב-Console:
```
⚠️  MongoDB unavailable, using localStorage: Failed to fetch
```

---

## 🛠️ פתרון בעיות

### בעיה: "MONGODB_URI is not defined"
**פתרון**: ודא שיש קובץ `.env` עם `MONGODB_URI` תקין

### בעיה: "MongoServerError: bad auth"
**פתרון**: 
- בדוק שם משתמש וסיסמה ב-Connection String
- ודא שהמשתמש נוצר ב-Database Access

### בעיה: "MongoServerSelectionError"
**פתרון**:
- בדוק ש-IP שלך מורשה ב-Network Access
- או הוסף 0.0.0.0/0 (Allow from anywhere)

### בעיה: "⚠️ MongoDB disabled - using localStorage only"
**פתרון**: 
- בדוק ש-`USE_MONGODB=true` בקובץ `.env`
- הפעל מחדש את השרת

---

## 📊 API Endpoints

### Products
- `GET /api/products` - קבלת כל המוצרים
- `GET /api/products/:id` - קבלת מוצר ספציפי
- `POST /api/products` - יצירת מוצר חדש
- `PUT /api/products/:id` - עדכון מוצר
- `DELETE /api/products/:id` - מחיקת מוצר
- `POST /api/products/bulk` - העברה/שמירה המונית

### Orders
- `GET /api/orders` - קבלת כל ההזמנות
- `GET /api/orders/:id` - קבלת הזמנה ספציפית
- `POST /api/orders` - יצירת הזמנה חדשה
- `PUT /api/orders/:id` - עדכון הזמנה
- `DELETE /api/orders/:id` - מחיקת הזמנה
- `POST /api/orders/bulk` - העברה/שמירה המונית
- `GET /api/orders/meta/next-number` - קבלת מספר הזמנה הבא
- `POST /api/orders/meta/allocate-number` - הקצאת מספר הזמנה (atomic)

### Expenses
- `GET /api/expenses` - קבלת כל ההוצאות
- `GET /api/expenses/:id` - קבלת הוצאה ספציפית
- `POST /api/expenses` - יצירת הוצאה חדשה
- `PUT /api/expenses/:id` - עדכון הוצאה
- `DELETE /api/expenses/:id` - מחיקת הוצאה
- `DELETE /api/expenses/group/:groupId` - מחיקת קבוצת הוצאות
- `POST /api/expenses/bulk` - העברה/שמירה המונית

---

## 🎯 יתרונות החיבור

✅ **גיבוי אוטומטי** - הנתונים מאוחסנים בענן  
✅ **סנכרון בין מכשירים** - גישה מכל מחשב  
✅ **ביצועים טובים יותר** - מסד נתונים מקצועי  
✅ **Offline support** - עובד גם בלי אינטרנט  
✅ **חינמי לחלוטין** - 512MB ללא עלות  
✅ **אבטחה** - הצפנה ואימות משתמשים  

---

## 📞 תמיכה

אם נתקלת בבעיות:
1. בדוק את הלוגים בטרמינל
2. בדוק את ה-Console בדפדפן (F12)
3. ודא שכל השלבים בוצעו נכון
4. בדוק את ה-Connection String

---

**הצלחה! 🎉**
