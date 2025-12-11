# 🔒 הגדרת אבטחה - מדריך מהיר

## ⚡ 3 שלבים פשוטים

### 1️⃣ צור סיסמה

```bash
node generate-password.js YOUR_PASSWORD
```

דוגמה:
```bash
node generate-password.js MySecure123!
```

### 2️⃣ העתק לקובץ .env

צור/ערוך קובץ `.env`:

```env
# MongoDB (מהשלב הקודם)
MONGODB_URI=mongodb+srv://...

# Server
PORT=65528
NODE_ENV=development
USE_MONGODB=true

# Authentication
USE_AUTH=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<העתק מהפלט>
AUTH_TOKEN=<העתק מהפלט>
```

### 3️⃣ הרץ והתחבר

```bash
npm start
```

גש ל: `http://localhost:65528`

**פרטי כניסה:**
- שם משתמש: `admin`
- סיסמה: הסיסמה שהזנת

---

## 🔓 ביטול אבטחה (לפיתוח)

אם אתה רוצה לעבוד בלי התחברות:

בקובץ `.env`:
```env
USE_AUTH=false
```

**⚠️ אל תעשה זאת בפרודקשן!**

---

## 🚪 התנתקות

בדף הראשי, פתח Console (F12) והרץ:
```javascript
logout()
```

או מחק את ה-localStorage:
```javascript
localStorage.clear()
```

---

## 🔑 שינוי סיסמה

1. צור hash חדש:
```bash
node generate-password.js NewPassword456
```

2. עדכן את `ADMIN_PASSWORD_HASH` בקובץ `.env`

3. הפעל מחדש את השרת

---

## 👥 הוספת משתמשים נוספים

**כרגע המערכת תומכת במשתמש אחד בלבד.**

אם תרצה להוסיף משתמשים נוספים בעתיד, נצטרך:
1. להוסיף טבלת משתמשים ב-MongoDB
2. לשנות את מערכת האימות
3. להוסיף ניהול הרשאות

זה אפשרי אבל דורש פיתוח נוסף.

---

## 🌐 אבטחה בשרת

כשאתה מעלה לשרת (Render/Railway):

1. **שנה את הסיסמה** - אל תשתמש באותה סיסמה כמו בפיתוח
2. **צור token חדש** - אל תשתמש באותו token
3. **הגדר HTTPS** - אוטומטי ב-Render/Railway
4. **הגבל IP ב-MongoDB** - לא 0.0.0.0/0

---

## 📱 גישה ממכשירים נוספים

אחרי שתתחבר פעם אחת, הטוקן נשמר ב-localStorage.

**זה אומר:**
- ✅ לא צריך להתחבר כל פעם
- ✅ עובד גם offline (עם localStorage)
- ⚠️ אם מישהו יגיע למחשב שלך, יהיה לו גישה

**כדי לאבטח:**
- 🔒 נעל את המחשב כשאתה לא בו
- 🚪 התנתק אם אתה במחשב ציבורי
- 🔐 השתמש בסיסמה חזקה

---

## 🆘 שכחתי את הסיסמה!

אין בעיה:

1. צור סיסמה חדשה:
```bash
node generate-password.js NewPassword789
```

2. עדכן את `.env` עם ה-hash החדש

3. הפעל מחדש את השרת

4. התחבר עם הסיסמה החדשה

---

**זהו! המערכת שלך מאובטחת! 🔒**
