# نشر التغييرات على Vercel

## الطريقة 1: الدفع إلى GitHub (النشر التلقائي)

إذا كان المشروع مربوطاً بمستودع GitHub و Vercel مربوطاً به، يكفي الدفع إلى الفرع `main` لبدء النشر:

```powershell
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"

# عرض التغييرات
git status

# إضافة كل الملفات
git add .

# إنشاء commit
git commit -m "إضافة دور الزائر (Visitor/Reviewer) وإصلاح تسجيل الدخول"

# الدفع إلى GitHub
git push origin main
```

بعد نجاح `git push`، Vercel سيبني المشروع وينشره تلقائياً من لوحة Vercel.

---

## الطريقة 2: النشر عبر Vercel CLI

إذا أردت النشر مباشرة من الطرفية بدون الدفع إلى Git:

```powershell
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"

# تثبيت Vercel CLI إن لم يكن مثبتاً
npm i -g vercel

# نشر إنتاج (Production)
npx vercel --prod
```

سيُطلب منك تسجيل الدخول إلى Vercel أو ربط المشروع إن كان أول مرة.

---

## متغيرات البيئة على Vercel

تأكد من إعداد المتغيرات التالية في **Vercel → المشروع → Settings → Environment Variables**:

- `DATABASE_URL` – رابط قاعدة البيانات (PostgreSQL)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

بعد النشر، نفّذ ترحيل قاعدة البيانات مرة واحدة (من جهازك أو من Vercel):

```bash
npx prisma migrate deploy
```

أو نفّذ محتوى ملف `docs/VISITOR_MIGRATION.sql` يدوياً على قاعدة البيانات إذا لم تستخدم Prisma Migrate.
