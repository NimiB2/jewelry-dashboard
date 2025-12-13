# 🏗️ מדריך ארכיטקטורת שרת - JewelryDashboard

## 📋 סיכום ההחלטות

**תאריך:** דצמבר 2025  
**סטטוס:** מתוכנן להטמעה

---

## 🎯 דרישות המערכת

| דרישה | פתרון |
|--------|--------|
| אבטחה | Firebase Authentication + HTTPS |
| התחברות | Google OAuth (אימייל גוגל) |
| משתמשים | 2 משתמשים (allowlist) |
| עלות | חינם |

---

## 🏛️ ארכיטקטורה שנבחרה

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Express API   │────▶│  MongoDB Atlas  │
│ Firebase Host   │     │    (Render)     │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│         Firebase Authentication         │
│           (Google OAuth)                │
└─────────────────────────────────────────┘
```

---

## 🧩 רכיבי המערכת

### 1. Firebase Authentication (חינם)
- **תפקיד:** אימות משתמשים
- **שיטה:** Google OAuth
- **הגבלה:** allowlist של מיילים מורשים
- **עלות:** חינם (עד 50,000 משתמשים/חודש)

### 2. MongoDB Atlas (חינם)
- **תפקיד:** מסד נתונים
- **Tier:** M0 Free (512MB)
- **עלות:** חינם לצמיתות

### 3. Render (חינם)
- **תפקיד:** אירוח שרת Express API
- **Tier:** Free (750 שעות/חודש)
- **עלות:** חינם
- **הערה:** השרת "נרדם" אחרי 15 דקות ללא פעילות

### 4. Firebase Hosting (חינם)
- **תפקיד:** אירוח Frontend
- **Tier:** Spark (10GB bandwidth/חודש)
- **עלות:** חינם
- **יתרון:** HTTPS אוטומטי, CDN גלובלי

---

## 👥 משתמשים מורשים

```javascript
// allowlist - רק המיילים האלה יכולים להתחבר
const ALLOWED_USERS = [
  'user1@gmail.com',  // TODO: להחליף למייל אמיתי
  'user2@gmail.com'   // TODO: להחליף למייל אמיתי
];
```

---

## 📝 שלבי הטמעה

### שלב 1: הקמת Firebase (10 דקות)
- [ ] יצירת פרויקט Firebase ב-console.firebase.google.com
- [ ] הפעלת Authentication
- [ ] הוספת Google כ-Sign-in provider
- [ ] קבלת Firebase config

### שלב 2: עדכון הקוד (30 דקות)
- [ ] התקנת Firebase SDK
- [ ] יצירת קומפוננטת Login עם Google
- [ ] עדכון middleware לאימות Firebase tokens
- [ ] הוספת allowlist validation
- [ ] עדכון Frontend לשימוש ב-Firebase Auth

### שלב 3: Deploy לשרת (15 דקות)
- [ ] יצירת חשבון Render
- [ ] חיבור ל-GitHub repo
- [ ] הגדרת Environment Variables
- [ ] Deploy

### שלב 4: Deploy Frontend (10 דקות)
- [ ] התקנת Firebase CLI
- [ ] firebase init hosting
- [ ] firebase deploy

### שלב 5: בדיקות (10 דקות)
- [ ] בדיקת התחברות עם Google
- [ ] בדיקת allowlist (מייל לא מורשה נדחה)
- [ ] בדיקת כל הפונקציונליות

---

## 🔧 Environment Variables נדרשים

### Render (שרת)
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

# App
NODE_ENV=production
PORT=65528
```

### Frontend
```javascript
// Firebase Config (לא סודי - מוטמע בקוד)
const firebaseConfig = {
  apiKey: "...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## 🔒 אבטחה

### מה מובנה:
- ✅ HTTPS (אוטומטי ב-Render ו-Firebase Hosting)
- ✅ Firebase Auth tokens (JWT מאובטח)
- ✅ MongoDB Atlas עם IP whitelist
- ✅ Allowlist של משתמשים מורשים

### מה צריך להגדיר:
- [ ] הגדרת allowlist של מיילים
- [ ] הגדרת IP whitelist ב-MongoDB Atlas
- [ ] הסרת גישת אנונימית

---

## 💰 סיכום עלויות

| שירות | עלות חודשית |
|--------|-------------|
| Firebase Auth | $0 |
| MongoDB Atlas | $0 |
| Render | $0 |
| Firebase Hosting | $0 |
| **סה"כ** | **$0** |

---

## 🔗 קישורים שימושיים

- [Firebase Console](https://console.firebase.google.com/)
- [MongoDB Atlas](https://cloud.mongodb.com/)
- [Render Dashboard](https://dashboard.render.com/)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)

---

## 📌 הערות חשובות

1. **Render Free Tier** - השרת "נרדם" אחרי 15 דקות ללא פעילות. ההתעוררות לוקחת ~30 שניות.

2. **Offline Support** - המערכת תומכת בעבודה אופליין עם localStorage כגיבוי.

3. **הרחבה עתידית** - אם יהיו יותר משתמשים או נפח גדול יותר, קל לשדרג לתוכניות בתשלום.

4. **Port** - תמיד להשתמש בפורט 65528 לפיתוח מקומי.

---

## 🚀 פקודות שימושיות

### פיתוח מקומי
```bash
npm start                    # הרצת השרת
npm run test-db              # בדיקת חיבור MongoDB
```

### Firebase CLI
```bash
npm install -g firebase-tools   # התקנת Firebase CLI
firebase login                  # התחברות
firebase init hosting           # אתחול hosting
firebase deploy                 # העלאה לשרת
```

### Render
```bash
# ה-deploy אוטומטי דרך GitHub
# כל push ל-main מפעיל deploy חדש
```
