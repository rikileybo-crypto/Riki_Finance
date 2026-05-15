# Riki Finance 💰 — ניהול כלכלי בית

אפליקציה לניהול פיננסי אישי המתחברת לחשבונות בנק ישראליים (בנק לאומי ו-MAX).

## הגדרה ראשונה

### 1. שכפל את הריפוסיטורי
```bash
git clone https://github.com/rikileybo-crypto/Riki_Finance.git
cd Riki_Finance
```

### 2. הגדר Supabase
1. צור פרויקט חדש ב-[supabase.com](https://supabase.com)
2. הרץ את הסקריפט `supabase/migration.sql` ב-SQL Editor
3. העתק את ה-URL וה-keys מ-Project Settings → API

### 3. הגדר Backend
```bash
cd backend
cp .env.example .env
# ערוך את .env עם הפרטים שלך
npm install
npm run dev
```

#### משתני סביבה לbackend (`.env`):
| מפתח | תיאור |
|------|--------|
| `PORT` | פורט השרת (ברירת מחדל: 3001) |
| `FRONTEND_URL` | כתובת הפרונטאנד |
| `SUPABASE_URL` | כתובת ה-Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key מ-Supabase |
| `SUPABASE_JWT_SECRET` | JWT Secret מ-Supabase |
| `ENCRYPTION_KEY` | מפתח הצפנה 32 תווים |

### 4. פרוס Backend ל-Railway
1. צור חשבון ב-[railway.app](https://railway.app)
2. צור פרויקט חדש ממאגר GitHub
3. הגדר את משתני הסביבה
4. Railway יזהה אוטומטית את ה-Dockerfile

### 5. הגדר Frontend
```bash
cd frontend
cp .env.example .env.local
# ערוך את .env.local עם הפרטים שלך
npm install
npm run dev
```

#### משתני סביבה לfrontend (`.env.local`):
| מפתח | תיאור |
|------|--------|
| `VITE_SUPABASE_URL` | כתובת ה-Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Anon Key מ-Supabase |
| `VITE_BACKEND_URL` | כתובת הbackend |

### 6. פרוס Frontend ל-Vercel
1. התחבר ל-[vercel.com](https://vercel.com)
2. ייבא את פרויקט GitHub
3. הגדר את ה-Root Directory ל-`frontend`
4. הוסף את משתני הסביבה
5. לחץ Deploy

## ארכיטקטורה

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐
│   React Frontend │◄──►│  Node.js Backend  │◄──►│   Supabase   │
│   (Vercel)       │    │   (Railway)       │    │  (Database)  │
└─────────────────┘    └──────────────────┘    └──────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  israeli-bank-   │
                    │    scrapers      │
                    │  (Playwright)    │
                    └──────────────────┘
```

## אבטחה
- פרטי הכניסה לבנק מוצפנים ב-AES-256 לפני שמירה ב-DB
- כל המשתמשים מוגנים עם JWT מ-Supabase
- Row Level Security (RLS) מבטיח שכל משתמש רואה רק את הנתונים שלו
