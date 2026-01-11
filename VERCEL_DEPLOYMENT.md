# دليل نشر التطبيق على Vercel

## المتطلبات الأساسية

1. حساب على GitHub (لربط المستودع)
2. حساب على Vercel (يمكن إنشاؤه مجاناً)
3. حساب على Supabase (للحصول على متغيرات البيئة)

---

## الخطوة 1: رفع المشروع على GitHub

### 1.1 إنشاء مستودع جديد على GitHub

1. اذهبي إلى [github.com](https://github.com)
2. اضغطي على **"New repository"** أو **"+"** في الزاوية العلوية
3. أدخلي اسم المستودع (مثلاً: `nafes-training`)
4. اختر **Private** أو **Public** حسب رغبتك
5. **لا** تختاري "Initialize with README" (لأن المشروع موجود بالفعل)
6. اضغطي **"Create repository"**

### 1.2 رفع المشروع إلى GitHub

افتحي PowerShell في مجلد المشروع وقومي بتنفيذ:

```powershell
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"

# تهيئة Git (إذا لم يكن موجوداً)
git init

# إضافة جميع الملفات
git add .

# عمل commit أولي
git commit -m "Initial commit: Nafes Training App"

# إضافة المستودع البعيد (استبدلي YOUR_USERNAME و REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# رفع المشروع
git branch -M main
git push -u origin main
```

**ملاحظة:** استبدلي `YOUR_USERNAME` و `REPO_NAME` باسم المستخدم واسم المستودع الفعليين.

---

## الخطوة 2: ربط المشروع مع Vercel

### 2.1 تسجيل الدخول إلى Vercel

1. اذهبي إلى [vercel.com](https://vercel.com)
2. اضغطي على **"Sign Up"** أو **"Log In"**
3. اختر **"Continue with GitHub"** لربط حسابك مع GitHub

### 2.2 إضافة مشروع جديد

1. بعد تسجيل الدخول، اضغطي على **"Add New..."** أو **"New Project"**
2. ستظهر قائمة بجميع المستودعات من GitHub
3. ابحثي عن مستودع `nafes-training` واضغطي **"Import"**

### 2.3 إعداد المشروع

في صفحة الإعداد:

1. **Project Name:** اتركي الاسم الافتراضي أو غيّريه
2. **Framework Preset:** يجب أن يكون **Next.js** (سيتم اكتشافه تلقائياً)
3. **Root Directory:** اتركيه فارغاً (`.`)
4. **Build Command:** `npm run build` (افتراضي)
5. **Output Directory:** `.next` (افتراضي)
6. **Install Command:** `npm install` (افتراضي)

---

## الخطوة 3: إضافة متغيرات البيئة

### 3.1 الحصول على قيم المتغيرات من Supabase

اذهبي إلى [supabase.com](https://supabase.com) → مشروعك → **Settings** → **API**:

- `NEXT_PUBLIC_SUPABASE_URL`: موجود في **Project URL**
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`: موجود في **Project API keys** → **anon/public** key

اذهبي إلى **Settings** → **Database** → **Connection string** → **URI**:

- `DATABASE_URL`: انسخي **Connection string** (يبدأ بـ `postgresql://`)

### 3.2 إضافة المتغيرات في Vercel

في صفحة إعداد المشروع على Vercel:

1. ابحثي عن قسم **"Environment Variables"**
2. أضيفي كل متغير على حدة:

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [القيمة من Supabase]
   Environment: Production, Preview, Development (اختياري)
   ```

   ```
   Name: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
   Value: [القيمة من Supabase]
   Environment: Production, Preview, Development
   ```

   ```
   Name: DATABASE_URL
   Value: [Connection string من Supabase]
   Environment: Production, Preview, Development
   ```

   ```
   Name: NEXTAUTH_SECRET
   Value: [أنشئي قيمة عشوائية - يمكن استخدام: openssl rand -base64 32]
   Environment: Production, Preview, Development
   ```

   ```
   Name: NEXTAUTH_URL
   Value: https://your-project-name.vercel.app
   Environment: Production
   ```

   ```
   Name: SKIP_ENV_VALIDATION
   Value: true
   Environment: Production, Preview, Development
   ```

### 3.3 إنشاء NEXTAUTH_SECRET

لإنشاء قيمة آمنة لـ `NEXTAUTH_SECRET`، استخدمي:

```powershell
# في PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

أو استخدمي أي مولد عشوائي عبر الإنترنت.

---

## الخطوة 4: النشر

1. بعد إضافة جميع متغيرات البيئة، اضغطي **"Deploy"**
2. انتظري حتى يكتمل البناء (عادة 2-5 دقائق)
3. بعد اكتمال البناء، ستحصلين على رابط التطبيق (مثلاً: `https://nafes-training.vercel.app`)

---

## الخطوة 5: إعداد قاعدة البيانات

### 5.1 تشغيل Migrations

بعد النشر الأول، يجب تشغيل migrations على قاعدة البيانات:

1. اذهبي إلى **Supabase Dashboard** → **SQL Editor**
2. افتحي ملفات migration من `prisma/migrations/`
3. نفّذي كل migration بالترتيب

أو استخدمي Vercel CLI:

```powershell
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login

# الانتقال إلى مجلد المشروع
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"

# تشغيل migrations
vercel env pull .env.production
npx prisma migrate deploy
```

---

## الخطوة 6: التحقق من النشر

1. افتحي رابط التطبيق من Vercel
2. تأكدي من أن الصفحة الرئيسية تعمل
3. اختبري تسجيل الدخول
4. تحققي من الأخطاء في **Vercel Dashboard** → **Deployments** → **Functions Logs**

---

## حل المشاكل الشائعة

### خطأ: "Module not found"
- تأكدي من أن جميع الملفات موجودة في المستودع
- تحققي من أن `package.json` يحتوي على جميع dependencies

### خطأ: "Environment variable not found"
- تأكدي من إضافة جميع متغيرات البيئة في Vercel
- تحققي من أن الأسماء مطابقة تماماً (حساسة لحالة الأحرف)

### خطأ: "Database connection failed"
- تحققي من `DATABASE_URL` في Vercel
- تأكدي من أن قاعدة البيانات في Supabase تعمل
- تحققي من أن IP Vercel مسموح في Supabase (عادة مسموح افتراضياً)

### خطأ: "Build failed"
- افتحي **Deployments** → **View Build Logs**
- ابحثي عن الخطأ المحدد
- تأكدي من أن `npm run build` يعمل محلياً

---

## التحديثات المستقبلية

بعد ربط المشروع مع Vercel، كل مرة تدفعين فيها تغييرات إلى GitHub:

1. Vercel سيكتشف التغييرات تلقائياً
2. سيبدأ بناء جديد تلقائياً
3. سيتم نشر التحديثات تلقائياً

---

## روابط مفيدة

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

---

## ملاحظات مهمة

1. **لا ترفعي ملف `.env`** إلى GitHub (موجود في `.gitignore`)
2. **تأكدي من إضافة جميع متغيرات البيئة** في Vercel
3. **احتفظي بنسخة احتياطية** من قيم متغيرات البيئة
4. **راقبي استخدام Vercel** (الخطة المجانية محدودة)

---

## الدعم

إذا واجهت أي مشاكل:
1. تحققي من **Build Logs** في Vercel
2. تحققي من **Function Logs** في Vercel
3. راجعي الأخطاء في **Supabase Dashboard** → **Logs**
