# نشر التغييرات على Vercel

## الطريقة 1: الدفع إلى GitHub (النشر التلقائي)

إذا كان المشروع مربوطاً بمستودع GitHub و Vercel مربوطاً به، يكفي الدفع إلى الفرع `main` لبدء النشر:

```powershell
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"

# عرض التغييرات
git status

# إضافة كل الملفات
git add .

# إنشاء commit (عدّل الرسالة إن رغبت)
git commit -m "خطة نافس: تصميم شبكة أسابيع مع سحب وإفلات، طباعة قائمة الطلاب، وعرض الخطة بنفس التصميم"

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

---

## إصلاح خطأ `users.isDisabled` بعد النشر

إذا ظهرت رسالة: **The column `users.isDisabled` does not exist in the current database** عند تسجيل الدخول بعد النشر:

1. اتصل بقاعدة البيانات **الإنتاجية** (نفس الـ `DATABASE_URL` المستخدم في Vercel).
2. نفّذ هذا الأمر SQL مرة واحدة:

```sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isDisabled" BOOLEAN NOT NULL DEFAULT false;
```

أو نفّذ الملف `docs/ADD_ISDISABLED_COLUMN.sql` من أي عميل PostgreSQL (pgAdmin، DBeaver).

3. **من الطرفية بدون تثبيت psql — باستخدام Prisma:**  
   اجعل `DATABASE_URL` في `.env` يشير إلى قاعدة **الإنتاج**، ثم نفّذ:
   ```powershell
   npm run db:add-isdisabled
   ```
   أو لمرة واحدة مع رابط الإنتاج (استبدل الرابط الفعلي):
   ```powershell
   $env:DATABASE_URL = "YOUR_PRODUCTION_DATABASE_URL"; npm run db:add-isdisabled
   ```
