# 🔧 إصلاح مشكلة DATABASE_URL

## المشكلة
```
Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

هذا يعني أن `DATABASE_URL` في ملف `.env` إما:
- ❌ غير موجود
- ❌ فارغ
- ❌ لا يبدأ بـ `postgresql://` أو `postgres://`

---

## ✅ الحل السريع

### الخطوة 1: افتحي ملف `.env`

افتحي ملف `.env` في المجلد الرئيسي للمشروع.

### الخطوة 2: تحققي من وجود DATABASE_URL

ابحثي عن سطر يحتوي على `DATABASE_URL`. يجب أن يكون موجوداً ويبدو هكذا:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### الخطوة 3: إذا كان غير موجود أو غير صحيح

#### أ) الحصول على DATABASE_URL من Supabase

1. اذهبي إلى [Supabase Dashboard](https://app.supabase.com)
2. اختاري مشروعك
3. اذهبي إلى **Settings** → **Database**
4. انقر على **Connection string**
5. اختر **URI**
6. انسخي الرابط الكامل

**أو استخدمي Connection Pooling (أسهل وأكثر أماناً):**

1. في نفس الصفحة (Settings → Database → Connection string)
2. اختر **Connection pooling**
3. انسخي الرابط (يبدأ بـ `postgresql://postgres.[PROJECT-REF]`)

#### ب) إضافة DATABASE_URL إلى ملف .env

أضيفي أو عدّلي السطر في ملف `.env`:

**للاتصال المباشر:**
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
```

**للـ Connection Pooling (موصى به محلياً، ومطلوب على Vercel):**
```env
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```
⚠️ **على Vercel:** يجب استخدام رابط الـ pooler (المنفذ 6543) مع `?pgbouncer=true` — الاتصال المباشر (5432) لا يعمل. راجعي `VERCEL_DATABASE_FIX.md`.

**⚠️ مهم:**
- استبدلي `YOUR_PASSWORD` بكلمة مرور قاعدة البيانات من Supabase
- استبدلي `YOUR_PROJECT_REF` برمز المشروع (مثل `vatqqurkedwlyuqrfwrr`)
- إذا كانت كلمة المرور تحتوي على أحرف خاصة، استخدمي URL encoding (انظري أدناه)

---

## 🔐 إذا كانت كلمة المرور تحتوي على أحرف خاصة

إذا كانت كلمة المرور تحتوي على: `@`, `#`, `$`, `%`, `&`, `+`, `=`, `?`, `/`, `:`

**الحل الأسهل:** استخدمي **Connection Pooling** من Supabase (لا يحتاج encoding)

**أو قومي بترميز الأحرف الخاصة:**
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- `:` → `%3A`

**مثال:**
إذا كانت كلمة المرور: `MyP@ssw0rd#123`
يجب أن تصبح: `MyP%40ssw0rd%23123`

---

## ✅ التحقق من الإصلاح

بعد إضافة/تعديل `DATABASE_URL`:

### الطريقة 1: استخدام سكريبت التحقق
```powershell
npm run check-env
```

### الطريقة 2: التحقق اليدوي
افتحي ملف `.env` وتأكدي من:
- ✅ `DATABASE_URL` موجود
- ✅ يبدأ بـ `postgresql://` أو `postgres://`
- ✅ يحتوي على كلمة المرور الصحيحة
- ✅ يحتوي على رقم المنفذ (`:5432` أو `:6543`)
- ✅ لا يحتوي على `[YOUR-PASSWORD]` أو `[PROJECT-REF]`

---

## 📋 مثال كامل لملف .env

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vatqqurkedwlyuqrfwrr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Connection (على Vercel استخدمي هذا الشكل مع ?pgbouncer=true)
DATABASE_URL="postgresql://postgres.vatqqurkedwlyuqrfwrr:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

---

## 🚀 بعد الإصلاح

1. احفظي ملف `.env`
2. أعدي تشغيل التطبيق:
   ```powershell
   npm run dev
   ```
3. جربي تسجيل الدخول مرة أخرى

---

## 🚀 إذا كان التطبيق منشوراً على Vercel

خطأ مثل "Can't reach database server at db.xxx.supabase.co:5432" على Vercel يعني أنك تستخدمين الاتصال المباشر. **على Vercel يجب استخدام Connection Pooler (المنفذ 6543) مع `?pgbouncer=true`.** راجعي ملف **`VERCEL_DATABASE_FIX.md`** للخطوات الكاملة.

---

## ❓ إذا استمرت المشكلة

1. تأكدي من نسخ `DATABASE_URL` مباشرة من Supabase Dashboard (لا تعدلي أي شيء)
2. تأكدي من عدم وجود مسافات إضافية قبل أو بعد القيمة
3. تأكدي من استخدام علامات الاقتباس `"` حول القيمة
4. محلياً: جربي استخدام Connection Pooling بدلاً من الاتصال المباشر
5. على Vercel: استخدمي **فقط** Connection Pooler (راجعي `VERCEL_DATABASE_FIX.md`)

---

**آخر تحديث:** 2026
