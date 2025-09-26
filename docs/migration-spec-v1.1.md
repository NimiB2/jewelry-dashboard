# דף אפיון מיגרציה ויישום – JewelryDashboard v1.1

עודכן: 2025-09-26

## תקציר החלטות
- **ארכיטקטורה**: Frontend מול Firestore (Realtime + Offline) + שרת Express דק (Render) לפעולות ניהוליות.
- **מספר הזמנה באופליין**: מספר זמני באופליין; הקצאה סופית בשרת בעת חיבור.
- **שמות בעברית**: אין צורך בשדה `nameLower`.
- **שדות "מי יצר"**: לא נשמרים `createdBy` ברמה כללית (אלא אם יידרש בהמשך).
- **חשבונית**: סטטוס חשבונית בוליאני `invoiceSent` (נשלח/לא נשלח).
- **פיתוח מקומי**: שרת מקומי תמיד על פורט `65528`.

```mermaid
flowchart LR
  A[Frontend (PWA)] -->|Auth (ID token)| B[Express API (Render)]
  A -->|Realtime/Offline| C[Cloud Firestore]
  A -->|Static assets| D[Firebase Hosting]
  B -->|Admin SDK| C
```

---

## 1) מטרות וגבולות
- **מטרות**
  - להעביר נתונים (מוצרים/הזמנות/הגדרות) ל‑Firestore לפי סכימה עדכנית.
  - לשמר חישובי תמחור ודפי UI קיימים.
  - להוסיף שרת דק לפעולות: הקצאת מספר הזמנה, ייבוא/גיבוי, דוחות בהמשך.
  - תמיכה מלאה ב‑Realtime + Offline + PWA.
- **גבולות**
  - אפליקציה פרטית ל‑~3 משתמשים.
  - מינימום עלויות (Firebase חינמי + Render חינמי).
  - ללא אחסון קבצים בשלב זה.

---

## 2) מודל נתונים Firestore (v1.1)

### products/ (מסמך = מוצר)
- **שדות**
  - `name` (string)
  - `collections` (array<string>)
  - `material` (string)
  - `weight` (number)
  - `additions` (array<{ name: string, price: number }>) – תוספות מרובות בשם+מחיר
  - `laborTime` (number) – זמן בסיס בדקות
  - `extraLaborMinutes` (number) – תוספת זמן בדקות
  - `active` (boolean)
  - `createdAt` (timestamp) – מומלץ לצורך מיון ובקרת שינויים
  - `updatedAt` (timestamp)
  - `legacyId` (number|string, אופציונלי למיגרציה)

### orders/ (מסמך = הזמנה)
- **שדות**
  - `orderNumber` (number) – רציף, מוקצה בשרת
  - `date` (timestamp)
  - `selectedProducts` (array<{ productId, name, unitPrice, qty }>) – צילום מצב
  - `amountCalculated` (number)
  - `discount` (object): `{ enabled: boolean, percent: number, reason: string }`
  - `finalPaid` (number)
  - `orderStatus` (string) – יתואם למצבי האתר בפועל (ראו “החלטות פתוחות”)
  - `invoiceSent` (boolean) – חשבונית נשלחה/לא נשלחה
  - `notes` (string)
  - `createdAt` (timestamp) – מומלץ
  - `updatedAt` (timestamp)

### settings/main (מסמך יחיד)
- **שדות**
  - `categories` (object – המבנה הקיים היום)
  - `version` (number|string)
  - `updatedAt` (timestamp)

### counters/orders (מסמך)
- **שדות**
  - `value` (number) – מונה רציף להזמנות

### transactions/ (אופציונלי לשלב מאוחר יותר)
- **שדות**
  - `type` ("expense" | "income"), `amount` (number), `date` (timestamp)
  - `category` (string), `tags` (array<string>), `notes` (string)
  - `createdAt` (timestamp)

---

## 3) אינדקסים (Indexes)
- **orders**
  - `orderBy(date desc)` — רשימה כרונולוגית
  - `where(orderStatus == X) + orderBy(date desc)` — Composite Index
  - `where(invoiceSent == true) + orderBy(date desc)` — Composite Index
- **products**
  - שלב ראשון: טעינה של ≤200 פריטים וסינון בצד הלקוח (לרוב ללא Composite).
  - אופציונלי: `where(collections array-contains X) + orderBy(createdAt desc)` — Composite Index.

---

## 4) API של השרת (Express)
- **אימות לכל ה‑admin endpoints**
  - Header: `Authorization: Bearer <Firebase ID token>`
  - אימות ב‑Firebase Admin SDK + רשימת אימיילים מורשים (whitelist).
  - CORS: לאפשר Firebase Hosting ולוקאלי: `http://localhost:65528` בלבד.
- **Endpoints**
  - `GET /health` → 200 `{ "status":"ok", "uptime": <number> }`
  - `POST /admin/allocateOrderNumber` → 200 `{ "orderNumber": <number> }`
    - טרנזקציה על `counters/orders.value`
  - `POST /admin/importProducts`
    - Body: `{ dryRun:boolean, updateExisting:boolean, products:[...] }`
    - 200: `{ inserted:number, updated:number, skipped:number, errors:[] }`
  - `GET /admin/exportBackup?collections=products,orders,settings`
    - 200: `{ exportedAt:string, collections:{ products:[], orders:[], settings:[] } }`

---

## 5) מיגרציה – צ’ק‑ליסט שלבים

### לפני התחלה
- [ ] לפתוח פרויקט Firebase + להפעיל Auth, Firestore, Hosting
- [ ] להגדיר כללי אבטחה: גישה רק למשתמשים שלכם (Auth חובה)
- [ ] ליצור `counters/orders` עם value התחלתי (למשל 1000)

### שלב A — שרת דק (לוקאלי על 65528)
- [ ] הקמת Express, אימות Firebase ID Token + whitelist, CORS
- [ ] לממש `GET /health`
- [ ] לממש `POST /admin/allocateOrderNumber` (טרנזקציה)
- **קריטריוני קבלה**
  - [ ] `/health` מחזיר ok
  - [ ] הקצאת `orderNumber` עובדת, ייחודית ורציפה

### שלב B — ייבוא מוצרים (מקור: `data/products_data.json`)
- **מיפוי**
  - [ ] `additions`: אם ערך בודד → `[{name:"תוספת",price:<value>}]`
  - [ ] `extraLaborMinutes`: אם לא קיים → 0
  - [ ] `active`: אם לא קיים → true
  - [ ] `legacyId`: לשימור שיוך
- **תהליך**
  - [ ] Dry run ב‑`/admin/importProducts` (ולידציה/סטטיסטיקה)
  - [ ] Commit בבאצ׳ים ≤500
  - [ ] אימות ספירות ודגימה ידנית
- **קריטריוני קבלה**
  - [ ] ספירה זהה בין מקור ל‑Firestore
  - [ ] מסך מוצרים נטען מ‑Firestore ומציג נכון

### שלב C — הזמנות היסטוריות (אם קיימות לייבוא)
- **מיפוי**
  - [ ] `invoiceSent`: ברירת מחדל false אם לא קיים מקור
  - [ ] `orderStatus`: בהתאם למצבים באתר
- **תהליך**
  - [ ] סקריפט ייבוא/endpoint אופציונלי `/admin/importOrders`
- **קריטריוני קבלה**
  - [ ] תצוגות/פילטרים לפי date/status תקינים

### שלב D — settings
- [ ] שמירת `categories` במסמך `settings/main`
- [ ] לוודא שחישובי העלות עובדים מול ההגדרות החדשות

### שלב E — שכבת Repositories בצד לקוח
- [ ] התאמת `js/domain/repositories/*.repository.js` ל‑Firestore עבור CRUD
- [ ] שימוש ב‑`/admin/allocateOrderNumber` להקצאת מספר הזמנה
- [ ] לשמור Realtime + Offline (onSnapshot + persistence)

### שלב F — PWA + Offline
- [ ] Service Worker + manifest
- [ ] הפעלת Offline Persistence ל‑Firestore
- [ ] בדיקה: טעינת האפליקציה ללא רשת + סנכרון כתיבות כשחוזרת רשת

### שלב G — אינדקסים + בדיקות + גיבוי
- [ ] יצירת Composite Indexes (כמפורט בסעיף 3)
- [ ] בדיקות פונקציונליות (מוצרים/הזמנות/הגדרות), ביצועים, ואבטחה
- [ ] Export גיבוי לאחר מיגרציה

---

## 6) אבטחה, סודות וסביבות
- **Firestore Rules**
  - [ ] `request.auth != null` חובה לקריאה/כתיבה
  - [ ] אופציונלי: הגבלת אימיילים מורשים
- **סודות (Render, פרודקשן)**
  - [ ] `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
  - [ ] `ALLOWED_EMAILS` (CSV)
  - [ ] `ALLOWED_ORIGINS` (Firebase Hosting + `http://localhost:65528`)
- **סביבות**
  - [ ] לוקאלית: שרת Express על 65528
  - [ ] פרודקשן: Frontend על Firebase Hosting, שרת על Render

---

## 7) Realtime/Offline + PWA
- CRUD שוטף דרך Firestore SDK בצד לקוח — מקבל Realtime + Offline.
- פעולות ניהוליות (הקצאת מספר הזמנה, ייבוא/גיבוי) דרך השרת.
- אופליין להזמנות: להציג “מספר זמני”, ולעדכן למספר רציף כשחוזרת רשת.

---

## 8) דגשים לביצועים ועלויות
- להישאר ב‑Free tier: להשתמש ב‑`limit()`, לסגור מאזינים כשלא צריך.
- טעינת ≤200 מוצרים בבת אחת + סינון בצד הלקוח — מקובל בהיקף שלך.

---

## 9) החלטות פתוחות
- **orderStatus**: לאשר רשימת מצבים סופית התואמת את האתר (למשל: `open | in_progress | ready | delivered | completed | cancelled`).
- **timestamps**: האם להשאיר `createdAt/updatedAt`? (מומלץ כן למיון ובדק־בית).
- **extraLaborReason**: האם נדרש לשמירה? (ברירת מחדל: לא).

---

## 10) ניהול גרסאות מסמך
- v1.1 (2025-09-26): יצירת מסמך ראשוני מאושר, כולל מודל נתונים מעודכן (additions מרובות, extraLaborMinutes, invoiceSent), API, אינדקסים וצ’ק‑ליסט מיגרציה.

---

## 11) כיצד להשתמש במסמך
- בכל שיחה בוחרים שלב מצ’ק‑ליסט (A..G), עובדים לפיו ומסמנים וי.
- נוסיף/נעדכן סעיפים לפי צורך, ונעלה גרסת מסמך (v1.x).
