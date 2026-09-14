# 🔍 دليل التحقق من متغيرات البيئة

## 📋 المتغيرات المطلوبة

### للاستخدام المحلي (Development)

| المتغير | مطلوب | الوصف | مثال |
|---------|-------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | رابط مشروع Supabase | `https://vatqqurkedwlyuqrfwrr.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ✅ | المفتاح العام من Supabase | `eyJhbGc...` (أكثر من 100 حرف) |
| `DATABASE_URL` | ✅ | رابط اتصال قاعدة البيانات | `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | ✅ | مفتاح سري لتوقيع JWT | أي مفتاح عشوائي (32 حرف على الأقل) |
| `NEXTAUTH_URL` | ✅ | رابط التطبيق المحلي | `http://localhost:3000` |
| `SKIP_ENV_VALIDATION` | ⚠️ | تخطي التحقق (اختياري) | `true` |

### للنشر على Vercel (Production)

| المتغير | مطلوب | البيئة | الوصف |
|---------|-------|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Production, Preview, Development | نفس القيمة المحلية |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | ✅ | Production, Preview, Development | نفس القيمة المحلية |
| `DATABASE_URL` | ✅ | Production, Preview, Development | نفس القيمة المحلية |
| `NEXTAUTH_SECRET` | ✅ | Production, Preview, Development | نفس القيمة المحلية |
| `NEXTAUTH_URL` | ✅ | **Production فقط** | `https://your-app.vercel.app` |
| `SKIP_ENV_VALIDATION` | ⚠️ | Production, Preview, Development | `true` |

---

## 🛠️ سكريبتات التحقق المتاحة

كل سكريبتات فحص/إصلاح `.env` مجمّعة الآن في `scripts/env/` ضمن أمرين فقط:

### 1. الفحص الشامل (موصى به)

```powershell
npm run check-env
```

**ما يفعله (يجمع كل ما كان مفرّقاً في سكريبتات سابقة):**
- ✅ يعرض محتوى ملف `.env` (مع إخفاء القيم الحساسة جزئياً)
- ✅ يتحقق من وجود جميع المتغيرات المطلوبة
- ✅ يكتشف القيم الافتراضية (placeholders) في أي متغيّر
- ✅ يحلل `DATABASE_URL` بالتفصيل (البروتوكول، المنفذ، كلمة المرور، Connection Pooling)
- ✅ يتحقق من صحة `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- ✅ يعرض قائمة التحقق لـ Vercel
- ✅ يعطي تحذيرات عن المشاكل المحتملة (أحرف خاصة في كلمة المرور، منفذ غير معتاد...)

### 2. الإصلاح التلقائي

```powershell
npm run fix-env
```

**ما يفعله:**
- ✅ ينشئ ملف `.env` من `env.example` إن لم يكن موجوداً
- ✅ يزيل BOM وأي أحرف مخفية من الملف
- ✅ يطبّع تنسيق سطر `DATABASE_URL` (يحيطه بعلامات اقتباس، يتحقق من صحته)

---

## 📝 خطوات التحقق اليدوي

### 1. التحقق من ملف .env

تأكدي من وجود ملف `.env` في المجلد الرئيسي:

```powershell
Test-Path .env
```

إذا كان `False`، أنشئي الملف:

```powershell
Copy-Item env.example .env
```

### 2. التحقق من المتغيرات الأساسية

افتحي ملف `.env` وتأكدي من وجود:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key-here
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 3. التحقق من القيم

- ❌ **لا تستخدمي** القيم الافتراضية مثل:
  - `your-project-ref`
  - `your-publishable-key-here`
  - `[YOUR-PASSWORD]`
  - `[PROJECT-REF]`

- ✅ **استخدمي** القيم الحقيقية من:
  - Supabase Dashboard → Settings → API
  - Supabase Dashboard → Settings → Database

---

## ⚠️ المشاكل الشائعة

### 1. ملف .env غير موجود

**الخطأ:**
```
❌ ملف .env غير موجود!
```

**الحل:**
```powershell
Copy-Item env.example .env
# ثم عدّلي القيم في ملف .env
```

### 2. متغير مفقود

**الخطأ:**
```
❌ NEXT_PUBLIC_SUPABASE_URL: غير موجود
```

**الحل:**
1. افتحي ملف `.env`
2. أضيفي المتغير المفقود
3. أضيفي القيمة الصحيحة

### 3. قيمة افتراضية (placeholder)

**الخطأ:**
```
❌ NEXT_PUBLIC_SUPABASE_URL: يحتوي على قيمة افتراضية
```

**الحل:**
1. افتحي ملف `.env`
2. استبدلي القيمة الافتراضية بالقيمة الحقيقية من Supabase

### 4. DATABASE_URL غير صحيح

**الخطأ:**
```
❌ DATABASE_URL يجب أن يبدأ بـ postgresql://
```

**الحل:**
- تأكدي من نسخ `DATABASE_URL` مباشرة من Supabase Dashboard
- تأكدي من وجود المنفذ (`:5432` أو `:6543`)
- إذا كانت كلمة المرور تحتوي على أحرف خاصة، استخدمي URL encoding

### 5. كلمة المرور تحتوي على أحرف خاصة

**التحذير:**
```
⚠️ كلمة المرور تحتوي على أحرف خاصة
```

**الحل:**
- استخدمي Connection Pooling من Supabase (أسهل)
- أو قومي بترميز الأحرف الخاصة:
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

---

## 🔗 الحصول على القيم من Supabase

### 1. NEXT_PUBLIC_SUPABASE_URL

1. اذهبي إلى [Supabase Dashboard](https://app.supabase.com)
2. اختاري مشروعك
3. اذهبي إلى **Settings** → **API**
4. انسخي **Project URL**

### 2. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

1. في نفس الصفحة (Settings → API)
2. انسخي **anon public** key أو **publishable key**

### 3. DATABASE_URL

1. اذهبي إلى **Settings** → **Database**
2. انقر على **Connection string**
3. اختر **URI**
4. انسخي الرابط الكامل

**أو استخدمي Connection Pooling:**
1. في نفس الصفحة
2. اختر **Connection pooling**
3. انسخي الرابط (يبدأ بـ `postgresql://postgres.[PROJECT-REF]`)

### 4. NEXTAUTH_SECRET

أنشئي مفتاح عشوائي:

```powershell
# في PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

أو استخدمي:
```bash
openssl rand -base64 32
```

### 5. NEXTAUTH_URL

- **للإنتاج:** `https://your-app.vercel.app`
- **محلياً:** `http://localhost:3000`

---

## ✅ قائمة التحقق السريعة

### قبل التشغيل المحلي:

- [ ] ملف `.env` موجود
- [ ] `NEXT_PUBLIC_SUPABASE_URL` موجود وصحيح
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` موجود وصحيح
- [ ] `DATABASE_URL` موجود وصحيح
- [ ] `NEXTAUTH_SECRET` موجود
- [ ] `NEXTAUTH_URL` مضبوط على `http://localhost:3000`
- [ ] لا توجد قيم افتراضية (placeholders)
- [ ] تم تشغيل `npm run check-env` بنجاح

### قبل النشر على Vercel:

- [ ] جميع المتغيرات مضافة في Vercel Dashboard
- [ ] `NEXTAUTH_URL` مضبوط على رابط الإنتاج
- [ ] `DATABASE_URL` صحيح ومُرمّز بشكل صحيح
- [ ] تم تحديد البيئة المناسبة لكل متغير
- [ ] تم إعادة النشر بعد إضافة المتغيرات

---

## 📚 روابط مفيدة

- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**آخر تحديث:** 2024
