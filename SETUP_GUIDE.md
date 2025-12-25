# دليل إطلاق التطبيق - تدريب نافس

## المتطلبات الأساسية

### 1. تثبيت Node.js
- **Node.js 18.17+** (يوصى بـ Node.js 20 أو أحدث)
- **npm 9+** (يأتي مع Node.js)

**للتحقق من الإصدار:**
```bash
node --version
npm --version
```

**تحميل Node.js:**
- من الموقع الرسمي: https://nodejs.org/
- اختر النسخة LTS (Long Term Support)

---

## خطوات الإعداد والتشغيل

### الخطوة 1: تثبيت الحزم (Dependencies)

افتحي Terminal/PowerShell في مجلد المشروع وقومي بتشغيل:

```bash
cd nafes-training
npm install
```

هذا الأمر سيقوم بتثبيت جميع المكتبات المطلوبة:
- Next.js
- React
- Prisma
- NextAuth
- Tailwind CSS
- وغيرها...

---

### الخطوة 2: إعداد ملف المتغيرات البيئية (.env)

أنشئي ملف `.env` في المجلد الرئيسي للمشروع (`nafes-training/.env`) وأضيفي المتغيرات التالية:

```env
# رابط قاعدة البيانات (SQLite)
DATABASE_URL="file:./prisma/dev.db"

# مفتاح سري لـ NextAuth (يجب تغييره في الإنتاج)
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**ملاحظات مهمة:**
- في بيئة الإنتاج، استخدمي مفتاح سري قوي (يمكن توليده باستخدام: `openssl rand -base64 32`)
- `NEXTAUTH_URL` يجب أن يتطابق مع رابط التطبيق

---

### الخطوة 3: إعداد قاعدة البيانات

#### أ. إنشاء قاعدة البيانات وتطبيق Migrations

```bash
# توليد Prisma Client
npx prisma generate

# تطبيق migrations على قاعدة البيانات
npx prisma migrate dev
```

هذا الأمر سيقوم بـ:
- إنشاء ملف قاعدة البيانات `prisma/dev.db` (إذا لم يكن موجوداً)
- تطبيق جميع migrations (الجدول الجديد `testType` وغيرها)

#### ب. (اختياري) فتح Prisma Studio لعرض البيانات

```bash
npx prisma studio
```

سيتم فتح واجهة رسومية على `http://localhost:5555` لإدارة قاعدة البيانات.

---

### الخطوة 4: تشغيل التطبيق

#### للتطوير (Development Mode):

```bash
npm run dev
```

أو استخدمي الملف الجاهز:
```bash
start-dev.bat
```

سيتم تشغيل التطبيق على: **http://localhost:3000**

#### للإنتاج (Production Mode):

```bash
# بناء التطبيق
npm run build

# تشغيل النسخة المبنية
npm start
```

---

## إنشاء حساب معلم (للمرة الأولى)

بعد تشغيل التطبيق، يمكنك إنشاء حساب معلم من خلال:

1. افتحي المتصفح على `http://localhost:3000`
2. اذهبي إلى صفحة التسجيل: `http://localhost:3000/auth/signup`
3. أدخلي بيانات المعلم:
   - البريد الإلكتروني
   - الاسم
   - كلمة المرور

**أو** يمكنك إنشاء حساب يدوياً من Prisma Studio:
1. شغلي `npx prisma studio`
2. اذهبي إلى جدول `users`
3. أضيفي مستخدم جديد مع:
   - `email`: البريد الإلكتروني
   - `name`: الاسم
   - `password`: كلمة مرور مشفرة (استخدمي bcrypt)

---

## هيكل قاعدة البيانات

التطبيق يستخدم **SQLite** كقاعدة بيانات محلية، وتحتوي على:

- **users**: حسابات المعلمين
- **students**: بيانات الطالبات
- **test_models**: نماذج الاختبارات
- **activities**: الأنشطة التعليمية
- **sessions**: جلسات المصادقة

---

## استكشاف الأخطاء

### مشكلة: "Cannot find module '@prisma/client'"
**الحل:**
```bash
npx prisma generate
npm install
```

### مشكلة: "Database not found" أو "Migration failed"
**الحل:**
```bash
npx prisma migrate reset  # يحذف قاعدة البيانات ويعيد إنشائها
npx prisma migrate dev     # يطبق migrations من جديد
```

### مشكلة: "Port 3000 is already in use"
**الحل:**
- أوقفي التطبيق الذي يستخدم المنفذ 3000
- أو غيّري المنفذ في `package.json`:
  ```json
  "dev": "next dev -p 3001"
  ```

### مشكلة: "NEXTAUTH_SECRET is missing"
**الحل:**
- تأكدي من وجود ملف `.env` في المجلد الرئيسي
- تأكدي من وجود المتغير `NEXTAUTH_SECRET` في الملف

---

## نصائح للإنتاج (Production)

### 1. تغيير قاعدة البيانات
في الإنتاج، استخدمي قاعدة بيانات أقوى مثل PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nafes_training"
```

### 2. تغيير NEXTAUTH_SECRET
استخدمي مفتاح سري قوي:
```bash
openssl rand -base64 32
```

### 3. تفعيل HTTPS
في الإنتاج، تأكدي من استخدام HTTPS لـ `NEXTAUTH_URL`:
```env
NEXTAUTH_URL="https://yourdomain.com"
```

### 4. بناء التطبيق للإنتاج
```bash
npm run build
npm start
```

---

## الملفات المهمة

- `package.json`: قائمة الحزم والأوامر
- `.env`: المتغيرات البيئية (لا يتم رفعها للـ Git)
- `prisma/schema.prisma`: مخطط قاعدة البيانات
- `prisma/dev.db`: قاعدة البيانات (SQLite)
- `src/app/`: صفحات التطبيق
- `src/components/`: المكونات القابلة لإعادة الاستخدام

---

## الدعم والمساعدة

إذا واجهت أي مشاكل:
1. تحققي من أن جميع المتطلبات مثبتة
2. تأكدي من تشغيل جميع الأوامر في المجلد الصحيح
3. راجعي ملفات السجلات (logs) في Terminal

---

**تم التحديث:** يناير 2025







