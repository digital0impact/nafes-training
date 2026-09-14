# 🚀 دليل إعداد وتشغيل المشروع محلياً

## 📋 المتطلبات الأساسية

- **Node.js** 18.17+ (يوصى بـ Node 20 أو أحدث)
- **npm** 9+ (يأتي مع Node.js)
- **حساب Supabase** (مجاني)
- **Git** (اختياري)

## 🔧 خطوات الإعداد

### 1️⃣ استنساخ/تحميل المشروع

```bash
# إذا كان المشروع على Git
git clone <repository-url>
cd nafes-training

# أو إذا كان المشروع موجوداً محلياً
cd nafes-training
```

### 2️⃣ تثبيت الحزم

```bash
npm install
```

**ملاحظة:** إذا واجهت مشاكل في التثبيت:
```bash
npm install --legacy-peer-deps
```

### 3️⃣ إعداد متغيرات البيئة

#### أ) نسخ ملف `.env.example` إلى `.env`

```bash
# في Windows PowerShell
Copy-Item env.example .env

# في Windows CMD
copy env.example .env

# في Linux/Mac
cp env.example .env
```

#### ب) الحصول على قيم Supabase

1. اذهبي إلى [Supabase Dashboard](https://app.supabase.com)
2. أنشئي مشروع جديد أو استخدمي مشروع موجود
3. اذهبي إلى **Settings > API**
4. انسخي القيم التالية:

**من Project Settings:**
- `NEXT_PUBLIC_SUPABASE_URL` - Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - `anon` `public` key

**من Database Settings:**
- `DATABASE_URL` - Connection string > URI

#### ج) تحديث ملف `.env`

افتحي ملف `.env` وحدّثي القيم:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key-here

# Database
DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.your-project-ref.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ مهم:**
- استبدلي `YOUR-PASSWORD` بكلمة مرور قاعدة البيانات من Supabase
- إذا كانت كلمة المرور تحتوي على أحرف خاصة، استخدمي URL encoding:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - إلخ...

**إنشاء NEXTAUTH_SECRET:**
```bash
# في Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid()))

# في Linux/Mac
openssl rand -base64 32
```

### 4️⃣ التحقق من الإعداد

```bash
# التحقق من متغيرات البيئة
npm run check-env

# التحقق من اتصال قاعدة البيانات
npm run check-db

# التحقق من DATABASE_URL
npm run check-env
```

### 5️⃣ إعداد قاعدة البيانات

```bash
# توليد Prisma Client
npx prisma generate

# تطبيق التغييرات على قاعدة البيانات
npx prisma db push

# أو استخدام migrations (موصى به)
npx prisma migrate dev --name init
```

### 6️⃣ التحقق من قاعدة البيانات

```bash
npm run check-db
```

يجب أن ترى رسالة نجاح مع عدد الجداول.

## 🚀 التشغيل

### وضع التطوير

```bash
npm run dev
```

التطبيق سيعمل على: **http://localhost:3000**

### بناء المشروع

```bash
npm run build
```

### تشغيل الإنتاج

```bash
npm start
```

## ✅ التحقق من أن كل شيء يعمل

### 1. فتح المتصفح

افتحي: http://localhost:3000

### 2. اختبار تسجيل الدخول

- اذهبي إلى `/auth/signup` لإنشاء حساب معلم
- اذهبي إلى `/auth/signin` لتسجيل الدخول

### 3. اختبار إنشاء فصل

- بعد تسجيل الدخول، اذهبي إلى `/teacher/classes`
- أنشئي فصل جديد
- انسخي كود الفصل

### 4. اختبار تسجيل دخول طالب

- اذهبي إلى `/auth/student-signin`
- أدخلي اسم مستعار وكود الفصل
- يجب أن تعملي على صفحة الطالب

## 🐛 حل المشاكل الشائعة

### خطأ: Missing Supabase environment variables

**الحل:**
- تأكدي من وجود ملف `.env` في المجلد الرئيسي
- تأكدي من أن جميع المتغيرات موجودة
- أعدي تشغيل الخادم بعد تحديث `.env`

### خطأ: Database connection failed

**الحل:**
```bash
# تحقق من DATABASE_URL
npm run check-env

# تحقق من الاتصال
npm run check-db
```

**أسباب محتملة:**
- كلمة المرور خاطئة
- أحرف خاصة في كلمة المرور لم يتم escape
- المشروع غير موجود في Supabase

### خطأ: Prisma Client not generated

**الحل:**
```bash
npx prisma generate
```

### خطأ: Port 3000 already in use

**الحل:**
```bash
# استخدمي منفذ آخر
npm run dev -- -p 3001
```

أو أغلق التطبيق الذي يستخدم المنفذ 3000.

### خطأ: TypeScript errors

**الحل:**
```bash
# تحقق من الأخطاء
npm run lint

# إصلاح تلقائي (إن أمكن)
npm run lint -- --fix
```

## 📝 ملاحظات مهمة

1. **ملف `.env`**: لا ترفعيه إلى Git (موجود في `.gitignore`)
2. **قاعدة البيانات**: تأكدي من أن RLS (Row Level Security) معطل للتطوير
3. **المفاتيح**: لا تشاركي مفاتيح Supabase مع أحد
4. **التحديثات**: استخدمي `npm update` لتحديث الحزم

## 🔗 روابط مفيدة

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📞 الدعم

إذا واجهت مشاكل:
1. تحققي من ملفات التوثيق في المشروع
2. راجعي رسائل الخطأ في Terminal
3. تحققي من Supabase Dashboard

---

**تم التحديث:** 2025  
**الحالة:** ✅ جاهز للاستخدام
