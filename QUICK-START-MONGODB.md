# ⚡ התחלה מהירה - MongoDB

## 🎯 3 שלבים פשוטים

### 1️⃣ צור חשבון MongoDB Atlas (חינמי)
- גש ל: https://www.mongodb.com/cloud/atlas
- הירשם והתחבר
- צור Cluster חינמי (M0 Free)
- הוסף משתמש ב-Database Access
- הוסף IP ב-Network Access (0.0.0.0/0 לפיתוח)
- העתק את ה-Connection String

### 2️⃣ הגדר את קובץ .env
צור קובץ `.env` בתיקיית הפרויקט:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/jewelry_dashboard?retryWrites=true&w=majority
PORT=65528
NODE_ENV=development
USE_MONGODB=true
```

**החלף**:
- `USERNAME` - שם המשתמש שיצרת
- `PASSWORD` - הסיסמה שיצרת
- `cluster` - שם ה-Cluster שלך

### 3️⃣ בדוק חיבור והרץ
```bash
# בדוק את החיבור
npm run test-db

# אם הכל תקין, הרץ את השרת
npm start

# פתח דפדפן
http://localhost:65528
```

---

## 📤 העברת נתונים קיימים

אם יש לך נתונים ב-localStorage:

1. הרץ את השרת: `npm start`
2. פתח: http://localhost:65528/utils/migrate-to-mongodb.html
3. לחץ "התחל העברה"
4. המתן לסיום

---

## ✅ בדיקה מהירה

פתח: http://localhost:65528/api/health

אמור להחזיר:
```json
{
  "status": "healthy",
  "mongodb": "connected"
}
```

---

## 🆘 בעיות נפוצות

### ❌ "MONGODB_URI is not defined"
→ צור קובץ `.env` עם ה-Connection String

### ❌ "bad auth"
→ בדוק שם משתמש וסיסמה ב-Connection String

### ❌ "IP not whitelisted"
→ הוסף את ה-IP שלך ב-MongoDB Atlas → Network Access

---

## 📚 מסמכים מלאים

ראה `README-MONGODB.md` להוראות מפורטות.

---

**זהו! 🎉**
