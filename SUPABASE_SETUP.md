# دليل ربط التطبيق بقاعدة بيانات Supabase

## ما هو Supabase؟

Supabase هو بديل مفتوح المصدر لـ Firebase، يوفر:
- ✅ قاعدة بيانات PostgreSQL مجانية (500MB)
- ✅ واجهة إدارة سهلة
- ✅ SSL/TLS تلقائي
- ✅ نسخ احتياطي تلقائي
- ✅ مناسب للإنتاج

---

## الخطوة 1: إنشاء مشروع على Supabase

### 1.1 التسجيل في Supabase

1. اذهبي إلى: https://supabase.com
2. اضغطي على **"Start your project"** أو **"Sign up"**
3. سجلي دخول بحساب GitHub (موصى به) أو بريد إلكتروني

### 1.2 إنشاء مشروع جديد

1. بعد تسجيل الدخول، اضغطي على **"New Project"**
2. املئي البيانات:
   - **Name**: `nafes-training` (أو أي اسم تفضلينه)
   - **Database Password**: اختر كلمة مرور قوية واحفظيها
   - **Region**: اختر أقرب منطقة (مثلاً: `Southeast Asia (Singapore)`)
3. اضغطي **"Create new project"**
4. انتظري حتى يكتمل إنشاء المشروع (2-3 دقائق)

---

## الخطوة 2: الحصول على رابط الاتصال

### 2.1 الوصول إلى إعدادات قاعدة البيانات

1. في لوحة تحكم Supabase، اذهبي إلى **Settings** (الإعدادات)
2. من القائمة الجانبية، اختر **Database**
3. انتقلي إلى قسم **Connection string**

### 2.2 نسخ رابط الاتصال

ستجدين عدة خيارات، اختر **"URI"**:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**مثال:**
```
postgresql://postgres:MyPassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

**ملاحظة مهمة:** استبدلي `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها عند إنشاء المشروع.

---

## الخطوة 3: تحديث Prisma Schema

### 3.1 تحديث ملف schema.prisma

افتحي ملف `prisma/schema.prisma` وغيري:

```prisma
datasource db {
  provider = "postgresql"  // بدلاً من "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3.2 تحديث ملف .env

أنشئي أو حدّثي ملف `.env` في المجلد الرئيسي:

```env
# رابط Supabase
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# أو بدون pgbouncer (للتطوير)
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**استبدلي:**
- `YOUR_PASSWORD`: كلمة مرور قاعدة البيانات
- `PROJECT_REF`: معرف المشروع من Supabase (موجود في رابط الاتصال)

---

## الخطوة 4: تطبيق Migrations على Supabase

### 4.1 توليد Prisma Client

```bash
npx prisma generate
```

### 4.2 تطبيق Migrations

```bash
npx prisma migrate deploy
```

هذا الأمر سينشئ جميع الجداول في قاعدة بيانات Supabase.

**ملاحظة:** إذا واجهت خطأ، جربي:

```bash
# حذف migrations القديمة (اختياري)
# ثم إنشاء migration جديد
npx prisma migrate dev --name init
```

---

## الخطوة 5: التحقق من الاتصال

### 5.1 فتح Prisma Studio

```bash
npx prisma studio
```

يجب أن يفتح Prisma Studio ويعرض قاعدة بيانات Supabase.

### 5.2 التحقق من Supabase Dashboard

1. اذهبي إلى Supabase Dashboard
2. من القائمة الجانبية، اختر **Table Editor**
3. يجب أن ترى جميع الجداول:
   - `users`
   - `students`
   - `test_models`
   - `activities`
   - `sessions`
   - `accounts`
   - `verification_tokens`

---

## الخطوة 6: إعدادات إضافية في Supabase

### 6.1 تفعيل Row Level Security (اختياري)

للأمان، يمكنك تفعيل Row Level Security:

1. في Supabase Dashboard، اذهبي إلى **Authentication** > **Policies**
2. أضيفي سياسات أمان حسب الحاجة

**ملاحظة:** للتطوير، يمكنك تركها معطلة مؤقتاً.

### 6.2 إعدادات الاتصال

في Supabase Dashboard > Settings > Database:

- **Connection Pooling**: موصى به للإنتاج
- **SSL Mode**: `require` (افتراضي)

---

## استكشاف الأخطاء

### مشكلة: "Connection refused" أو "Timeout"

**الحل:**
1. تحققي من رابط الاتصال (DATABASE_URL)
2. تأكدي من أن كلمة المرور صحيحة
3. تحققي من جدار الحماية (Firewall) - Supabase يسمح بالاتصال من أي مكان افتراضياً

### مشكلة: "password authentication failed"

**الحل:**
1. تحققي من كلمة المرور في DATABASE_URL
2. تأكدي من استخدام كلمة المرور الصحيحة من Supabase

### مشكلة: "relation does not exist"

**الحل:**
```bash
# تأكدي من تطبيق migrations
npx prisma migrate deploy

# أو أعدي إنشاء migrations
npx prisma migrate reset
npx prisma migrate dev
```

### مشكلة: "too many connections"

**الحل:**
استخدمي Connection Pooling في رابط الاتصال:
```
DATABASE_URL="postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

---

## استخدام Supabase في الإنتاج

### 1. تحديث NEXTAUTH_URL

في ملف `.env` للإنتاج:

```env
NEXTAUTH_URL="https://your-app.vercel.app"
```

### 2. إضافة Environment Variables في Vercel

عند النشر على Vercel:

1. اذهبي إلى Project Settings > Environment Variables
2. أضيفي:
   - `DATABASE_URL`: رابط Supabase
   - `NEXTAUTH_SECRET`: مفتاح سري قوي
   - `NEXTAUTH_URL`: رابط التطبيق

### 3. نسخ احتياطي

Supabase يوفر نسخ احتياطي تلقائي، لكن يمكنك:
1. اذهبي إلى Settings > Database > Backups
2. قومي بإنشاء نسخة احتياطية يدوياً عند الحاجة

---

## نصائح مهمة

### 1. أمان كلمة المرور

- لا تشاركي رابط الاتصال (DATABASE_URL) علناً
- استخدمي Environment Variables دائماً
- لا ترفعي ملف `.env` على GitHub

### 2. الأداء

- استخدمي Connection Pooling للإنتاج
- راقبي استخدام قاعدة البيانات من Supabase Dashboard
- فكري في الترقية عند تجاوز الحد المجاني (500MB)

### 3. التطوير المحلي

يمكنك استخدام Supabase للتطوير والإنتاج، أو:
- **التطوير**: SQLite محلي
- **الإنتاج**: Supabase

غيّري `DATABASE_URL` حسب البيئة.

---

## خطوات سريعة (ملخص)

```bash
# 1. أنشئي مشروع على Supabase.com
# 2. انسخي رابط الاتصال من Settings > Database

# 3. حدّثي prisma/schema.prisma
#    provider = "postgresql"

# 4. حدّثي .env
#    DATABASE_URL="postgresql://..."

# 5. شغلي الأوامر
npx prisma generate
npx prisma migrate deploy

# 6. تحققي
npx prisma studio
```

---

## روابط مفيدة

- 📚 [وثائق Supabase](https://supabase.com/docs)
- 🔗 [Supabase Dashboard](https://app.supabase.com)
- 📖 [Prisma + PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

---

**تم التحديث:** يناير 2025







