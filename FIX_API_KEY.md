# 🔑 إصلاح خطأ "Invalid API key"

## المشكلة:
تظهر رسالة `Invalid API key` عند محاولة تسجيل الدخول.

## السبب:
المفاتيح في ملف `.env` غير صحيحة أو غير موجودة.

## الحل:

### الخطوة 1: التحقق من المفاتيح الحالية

شغلي الأمر التالي للتحقق من المفاتيح:
```bash
npm run check-keys
```

### الخطوة 2: الحصول على المفاتيح الصحيحة من Supabase

1. **اذهبي إلى Supabase Dashboard:**
   - افتحي: https://app.supabase.com
   - سجلي الدخول إلى حسابك

2. **اختيار المشروع:**
   - اختاري المشروع الخاص بك من القائمة

3. **الحصول على Project URL:**
   - اذهبي إلى: **Settings** > **API**
   - في قسم **Project URL**، انسخي الرابط
   - مثال: `https://abcdefghijklmnop.supabase.co`

4. **الحصول على API Key:**
   - في نفس الصفحة (Settings > API)
   - في قسم **Project API keys**
   - انسخي المفتاح المسمى **`anon` `public`** (وليس `service_role`)
   - المفتاح يبدأ عادة بـ `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### الخطوة 3: تحديث ملف `.env`

افتحي ملف `.env` في مجلد المشروع وحدّثي القيم:

```env
# Project URL (من Supabase Dashboard > Settings > API > Project URL)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Publishable Key (من Supabase Dashboard > Settings > API > anon/public key)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ مهم:**
- استبدلي `your-project-ref` برمز المشروع الفعلي
- استبدلي `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` بالمفتاح الفعلي
- لا تستخدمي `service_role` key - استخدمي `anon/public` فقط

### الخطوة 4: التحقق من التحديث

شغلي مرة أخرى:
```bash
npm run check-keys
```

يجب أن تظهر رسالة:
```
✅ جميع المفاتيح موجودة وصحيحة!
```

### الخطوة 5: إعادة تشغيل التطبيق

1. أوقفي التطبيق الحالي (Ctrl+C)
2. شغليه مرة أخرى:
   ```bash
   npm run dev
   ```

## ملاحظات مهمة:

1. **لا تشاركي المفاتيح:**
   - ملف `.env` موجود في `.gitignore` ولا يجب رفعه إلى Git
   - لا تشاركي المفاتيح مع أحد

2. **الفرق بين المفاتيح:**
   - **anon/public key**: للاستخدام في Client Side (متصفح المستخدم)
   - **service_role key**: للعمليات الإدارية فقط (لا تستخدميه في Client Side)

3. **إذا استمرت المشكلة:**
   - تأكدي من أن المفاتيح نسختها بشكل كامل (بدون مسافات إضافية)
   - تأكدي من أن ملف `.env` في المجلد الرئيسي للمشروع
   - أعدي تشغيل Terminal بعد تحديث `.env`

## مثال لملف `.env` صحيح:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.abcdefghijklmnopqrstuvwxyz1234567890
DATABASE_URL="postgresql://postgres:password@db.abcdefghijklmnop.supabase.co:5432/postgres"
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```
