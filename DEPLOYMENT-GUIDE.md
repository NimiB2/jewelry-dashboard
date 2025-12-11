# 🚀 מדריך פריסה לשרת - Jewelry Dashboard

מדריך מלא לפריסת הפרויקט לשרת עם אבטחה מלאה.

---

## 📋 תוכן עניינים

1. [הגדרת אבטחה מקומית](#הגדרת-אבטחה-מקומית)
2. [פריסה ל-Render (חינמי)](#פריסה-ל-render)
3. [פריסה ל-Railway (חינמי)](#פריסה-ל-railway)
4. [פריסה ל-Vercel + MongoDB](#פריסה-ל-vercel)

---

## 🔒 הגדרת אבטחה מקומית

### שלב 1: צור סיסמה מאובטחת

הרץ את הסקריפט ליצירת hash:

```bash
node generate-password.js YOUR_SECURE_PASSWORD
```

דוגמה:
```bash
node generate-password.js MyStr0ng!Pass2024
```

תקבל פלט כמו:
```
🔐 Generated Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add these to your .env file:

# Admin Password
ADMIN_PASSWORD_HASH=a1b2c3d4e5f6...

# Session Token
AUTH_TOKEN=x1y2z3a4b5c6...
```

### שלב 2: עדכן קובץ .env

פתח/צור קובץ `.env` והוסף:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jewelry_dashboard

# Server
PORT=65528
NODE_ENV=development

# MongoDB & Auth
USE_MONGODB=true
USE_AUTH=true

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<ההאש שקיבלת>
AUTH_TOKEN=<הטוקן שקיבלת>
```

### שלב 3: בדוק מקומית

```bash
npm start
```

גש ל: `http://localhost:65528`

אמור להפנות אותך לדף התחברות.

**פרטי כניסה:**
- שם משתמש: `admin` (או מה שהגדרת)
- סיסמה: הסיסמה שהזנת ב-generate-password

---

## 🌐 פריסה ל-Render (מומלץ - חינמי)

### למה Render?
- ✅ חינמי לחלוטין (750 שעות/חודש)
- ✅ תמיכה ב-Node.js + MongoDB
- ✅ HTTPS אוטומטי
- ✅ קל להגדרה

### שלב 1: הכן את הפרויקט

1. **צור חשבון GitHub** (אם אין לך)
2. **העלה את הפרויקט ל-GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jewelry-dashboard.git
git push -u origin main
```

### שלב 2: הירשם ל-Render

1. גש ל: https://render.com
2. הירשם עם GitHub
3. אשר חיבור ל-repositories

### שלב 3: צור Web Service

1. לחץ **"New +"** → **"Web Service"**
2. חבר את ה-repository שלך
3. הגדרות:
   - **Name**: `jewelry-dashboard`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### שלב 4: הגדר Environment Variables

בעמוד ה-Service, לחץ **"Environment"** והוסף:

```
MONGODB_URI=mongodb+srv://...
PORT=10000
NODE_ENV=production
USE_MONGODB=true
USE_AUTH=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<ההאש שלך>
AUTH_TOKEN=<הטוקן שלך>
```

**חשוב:** 
- Render דורש `PORT=10000` (לא 65528)
- השרת יתאים אוטומטית

### שלב 5: Deploy

1. לחץ **"Create Web Service"**
2. המתן 2-3 דקות לבנייה
3. תקבל URL כמו: `https://jewelry-dashboard.onrender.com`

### שלב 6: בדוק

גש ל-URL שקיבלת - אמור להפנות לדף התחברות!

---

## 🚂 פריסה ל-Railway (אלטרנטיבה חינמית)

### למה Railway?
- ✅ $5 קרדיט חינמי/חודש
- ✅ מהיר מאוד
- ✅ ממשק פשוט

### שלבים:

1. **הירשם:** https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **בחר את ה-repository**
4. **הוסף Environment Variables** (כמו ב-Render)
5. **Deploy!**

Railway יזהה אוטומטית את `package.json` ויריץ `npm start`.

---

## ▲ פריסה ל-Vercel (רק Frontend)

**שים לב:** Vercel מתאים רק ל-frontend. תצטרך שרת נפרד ל-API.

### אופציה 1: Vercel Frontend + Render Backend

1. **Deploy Backend ל-Render** (כמו למעלה)
2. **Deploy Frontend ל-Vercel:**

```bash
npm install -g vercel
vercel
```

3. **עדכן את ה-API URLs** בקוד לכתובת Render

### אופציה 2: Vercel Serverless Functions

זה מורכב יותר ודורש שינויים בקוד. לא מומלץ למתחילים.

---

## 🔐 אבטחה בפרודקשן

### ✅ רשימת בדיקות אבטחה:

- [ ] `USE_AUTH=true` בפרודקשן
- [ ] סיסמה חזקה (8+ תווים, אותיות+מספרים+סימנים)
- [ ] `AUTH_TOKEN` ייחודי (64 תווים)
- [ ] `NODE_ENV=production`
- [ ] MongoDB IP Whitelist מוגדר (לא 0.0.0.0/0)
- [ ] HTTPS מופעל (אוטומטי ב-Render/Railway)
- [ ] `.env` לא ב-Git (בדוק `.gitignore`)

### 🔒 שינוי סיסמה:

1. צור hash חדש:
```bash
node generate-password.js NewPassword123
```

2. עדכן `ADMIN_PASSWORD_HASH` ב-Environment Variables
3. Redeploy (Render/Railway יעשו זאת אוטומטית)

---

## 🌍 גישה מכל מקום

לאחר הפריסה, תוכל לגשת למערכת מ:
- 💻 כל מחשב
- 📱 טלפון נייד
- 🖥️ טאבלט

פשוט גש ל-URL שקיבלת והתחבר עם הסיסמה שלך.

---

## 🔄 עדכון הפרויקט

### ב-GitHub:
```bash
git add .
git commit -m "Update description"
git push
```

Render/Railway יזהו את השינוי וי-redeploy אוטומטית!

---

## 🆘 פתרון בעיות

### בעיה: "Application failed to respond"
**פתרון:** 
- בדוק ש-`PORT` מוגדר נכון (10000 ב-Render)
- בדוק logs בממשק Render/Railway

### בעיה: "Unauthorized"
**פתרון:**
- בדוק ש-`AUTH_TOKEN` זהה בין client ו-server
- נסה ליצור token חדש

### בעיה: "MongoDB connection failed"
**פתרון:**
- בדוק ש-`MONGODB_URI` נכון
- הוסף את IP של Render/Railway ל-MongoDB Atlas Network Access
- או השתמש ב-0.0.0.0/0 (פחות מאובטח)

---

## 📊 ניטור

### Render Dashboard:
- **Logs**: צפה בלוגים בזמן אמת
- **Metrics**: שימוש ב-CPU/Memory
- **Events**: היסטוריית deployments

### MongoDB Atlas:
- **Metrics**: שאילתות, חיבורים
- **Performance**: זמני תגובה
- **Alerts**: התראות על בעיות

---

## 💰 עלויות

### תוכנית חינמית:

**Render Free:**
- 750 שעות/חודש (כ-31 יום)
- השרת "ישן" אחרי 15 דקות חוסר פעילות
- התעוררות: 30 שניות

**MongoDB Atlas Free:**
- 512MB אחסון
- מספיק ל-~10,000 מוצרים

**סה"כ: ₪0/חודש** 🎉

### אם צריך יותר:

**Render Starter ($7/חודש):**
- שרת תמיד פעיל
- יותר זיכרון

**MongoDB Atlas Shared ($9/חודש):**
- 2GB-5GB אחסון
- גיבויים אוטומטיים

---

## ✅ סיכום

1. ✅ הגדר אבטחה מקומית
2. ✅ בדוק שהכל עובד ב-localhost
3. ✅ העלה ל-GitHub
4. ✅ Deploy ל-Render
5. ✅ הגדר Environment Variables
6. ✅ בדוק שהאתר עובד
7. ✅ התחבר ותהנה!

---

**מזל טוב! האתר שלך באוויר! 🎉**

גש ל-URL שקיבלת והתחבר עם הסיסמה שלך.
