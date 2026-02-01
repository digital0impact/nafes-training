# 📊 حالة نشر التطبيق على Vercel

## ✅ الملفات المطلوبة للنشر

### 1. ملفات التكوين الموجودة ✅

- ✅ `vercel.json` - موجود ومُكوّن بشكل صحيح
- ✅ `package.json` - موجود ويحتوي على سكريبتات البناء
- ✅ `next.config.mjs` - موجود ومُكوّن
- ✅ `.gitignore` - يحتوي على `.vercel` (صحيح)

### 2. إعدادات `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "SKIP_ENV_VALIDATION": "true"
  }
}
```

**المنطقة:** `iad1` (US East - Virginia)

---

## 🔧 متغيرات البيئة المطلوبة في Vercel

يجب إضافة المتغيرات التالية في **Vercel Dashboard** → **Project Settings** → **Environment Variables**:

### متغيرات إلزامية:

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - القيمة: رابط مشروع Supabase
   - مثال: `https://vatqqurkedwlyuqrfwrr.supabase.co`
   - البيئة: Production, Preview, Development

2. **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`**
   - القيمة: المفتاح العام من Supabase
   - البيئة: Production, Preview, Development

3. **`DATABASE_URL`**
   - القيمة: **يجب استخدام Connection Pooler على Vercel** (الاتصال المباشر بالمنفذ 5432 لا يعمل من serverless).
   - مثال صحيح لـ Vercel: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
   - احصلي عليه من Supabase: **Settings** → **Database** → **Connection string** → **Connection pooling** → URI، ثم أضيفي `?pgbouncer=true` في النهاية.
   - ⚠️ **مهم:** إذا كانت كلمة المرور تحتوي على أحرف خاصة، يجب escape (راجعي `VERCEL_DATABASE_FIX.md`).
   - البيئة: Production, Preview, Development

4. **`NEXTAUTH_SECRET`**
   - القيمة: مفتاح سري عشوائي (يمكن إنشاؤه بـ `openssl rand -base64 32`)
   - البيئة: Production, Preview, Development

5. **`NEXTAUTH_URL`**
   - القيمة: رابط التطبيق المنشور
   - مثال للإنتاج: `https://your-app.vercel.app`
   - البيئة: **Production فقط**

6. **`SKIP_ENV_VALIDATION`**
   - القيمة: `true`
   - البيئة: Production, Preview, Development

---

## 📋 خطوات النشر على Vercel

### الطريقة الأولى: النشر عبر GitHub (موصى به)

1. **ربط المستودع:**
   - اذهبي إلى [Vercel Dashboard](https://vercel.com/dashboard)
   - اضغطي على **"Add New Project"**
   - اربطي المستودع من GitHub

2. **إعداد المشروع:**
   - Vercel سيكتشف تلقائياً أنه مشروع Next.js
   - تأكدي من أن **Framework Preset** هو **Next.js**
   - تأكدي من أن **Root Directory** هو `.` (المجلد الرئيسي)

3. **إضافة متغيرات البيئة:**
   - في صفحة الإعداد، أضيفي جميع المتغيرات المذكورة أعلاه
   - تأكدي من تحديد البيئة المناسبة لكل متغير

4. **النشر:**
   - اضغطي على **"Deploy"**
   - Vercel سيقوم تلقائياً بنشر كل commit جديد على `main`

### الطريقة الثانية: النشر عبر Vercel CLI

```powershell
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel

# النشر للإنتاج
vercel --prod
```

---

## 🔍 التحقق من حالة النشر

### 1. من Vercel Dashboard:

- **Deployments:** عرض جميع عمليات النشر
- **Build Logs:** عرض سجلات البناء والأخطاء
- **Function Logs:** عرض سجلات وقت التشغيل
- **Analytics:** إحصائيات الأداء

### 2. التحقق محلياً:

```powershell
# التحقق من أن البناء يعمل محلياً
npm run build

# التحقق من الاتصال بقاعدة البيانات
npm run check-db

# التحقق من متغيرات البيئة
npm run check-env
```

---

## ⚠️ المشاكل الشائعة وحلولها

### 1. خطأ: "Environment variable not found"

**الحل:**
- تأكدي من إضافة جميع المتغيرات في Vercel
- بعد إضافة المتغيرات، يجب إعادة النشر (Redeploy)

### 2. خطأ: "Build failed"

**الحل:**
- تحققي من Build Logs في Vercel
- تأكدي من أن البناء يعمل محلياً: `npm run build`
- تأكدي من أن جميع الملفات موجودة في Git

### 3. خطأ: "Database connection failed" أو "Can't reach database server at db.xxx.supabase.co:5432"

**السبب الشائع:** استخدام الاتصال المباشر (المنفذ 5432) على Vercel — لا يعمل من بيئة serverless.

**الحل:** استخدمي **Connection Pooler** (المنفذ 6543) لـ `DATABASE_URL` على Vercel. راجعي **`VERCEL_DATABASE_FIX.md`** للخطوات بالتفصيل.

- تحققي من أن `DATABASE_URL` على Vercel يستخدم `pooler.supabase.com:6543` وليس `db....supabase.co:5432`
- تأكدي من إضافة `?pgbouncer=true` في نهاية الرابط
- بعد تغيير المتغيرات، أعدي النشر (Redeploy)

### 4. خطأ: "Prisma Client not generated"

**الحل:**
- تأكدي من أن `package.json` يحتوي على:
  ```json
  {
    "scripts": {
      "build": "prisma generate && next build"
    }
  }
  ```
  ✅ هذا موجود بالفعل

---

## 📝 ملاحظات مهمة

1. **`.vercel` مجلد:** موجود في `.gitignore` (صحيح) - لا يجب رفعه إلى Git

2. **المنطقة:** التطبيق مُكوّن للنشر في `iad1` (US East)

3. **البناء:** يتضمن `prisma generate` قبل `next build` ✅

4. **GitHub Actions:** يوجد workflow للتحقق من البناء عند كل push

5. **المتغيرات البيئية:** يجب إضافتها يدوياً في Vercel Dashboard

---

## 🔗 روابط مفيدة

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Build Logs](https://vercel.com/docs/concepts/builds/build-logs)

---

## 📌 قائمة التحقق قبل النشر

- [ ] جميع الملفات موجودة في Git
- [ ] البناء يعمل محلياً (`npm run build`)
- [ ] جميع متغيرات البيئة مضافة في Vercel
- [ ] `DATABASE_URL` على Vercel يستخدم **Connection Pooler** (port 6543 + `?pgbouncer=true`) — راجعي `VERCEL_DATABASE_FIX.md`
- [ ] `NEXTAUTH_URL` مضبوط على رابط الإنتاج
- [ ] قاعدة البيانات متاحة في Supabase
- [ ] تم ربط المستودع مع Vercel
- [ ] تم تفعيل النشر التلقائي من GitHub

---

**آخر تحديث:** $(Get-Date -Format "yyyy-MM-dd")
