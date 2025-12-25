# دليل نشر ومشاركة التطبيق

## خيارات النشر المتاحة

### 1. Vercel (موصى به - الأسهل) ⭐

**Vercel** هو منصة مخصصة لنشر تطبيقات Next.js، وتوفر:
- ✅ نشر مجاني
- ✅ HTTPS تلقائي
- ✅ تحديثات تلقائية من Git
- ✅ دعم SQLite و PostgreSQL
- ✅ نطاق مجاني (your-app.vercel.app)

#### خطوات النشر على Vercel:

1. **إنشاء حساب على Vercel:**
   - اذهبي إلى: https://vercel.com
   - سجلي دخول بحساب GitHub/GitLab/Bitbucket

2. **رفع المشروع على GitHub:**
   ```bash
   # في مجلد المشروع
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/nafes-training.git
   git push -u origin main
   ```

3. **النشر على Vercel:**
   - اذهبي إلى: https://vercel.com/new
   - اربطي مستودع GitHub
   - Vercel سيكتشف Next.js تلقائياً
   - أضيفي المتغيرات البيئية:
     ```
     DATABASE_URL="file:./prisma/dev.db"
     NEXTAUTH_SECRET="your-production-secret-key"
     NEXTAUTH_URL="https://your-app.vercel.app"
     ```

4. **إعداد قاعدة البيانات:**
   - Vercel لا يدعم SQLite في الإنتاج (ملفات مؤقتة)
   - **استخدمي قاعدة بيانات خارجية:**
     - **Supabase** (مجاني): https://supabase.com
     - **PlanetScale** (مجاني): https://planetscale.com
     - **Railway** (مجاني): https://railway.app

#### إعداد PostgreSQL على Supabase:

**للحصول على دليل تفصيلي كامل، راجعي: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**

**ملخص سريع:**
1. أنشئي مشروع جديد على Supabase
2. انسخي رابط الاتصال من Settings > Database > Connection string (URI)
3. حدّثي `prisma/schema.prisma`: `provider = "postgresql"`
4. أضيفي في Vercel Environment Variables:
   ```
   DATABASE_URL="postgresql://postgres:PASSWORD@db.REF.supabase.co:5432/postgres"
   ```
5. شغلي migrations:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

---

### 2. Netlify

**Netlify** منصة أخرى جيدة للنشر:

#### خطوات النشر:

1. أنشئي حساب على: https://netlify.com
2. اربطي مستودع GitHub
3. إعدادات البناء:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. أضيفي المتغيرات البيئية في Netlify Dashboard

**ملاحظة:** Netlify يتطلب إعدادات إضافية لـ Next.js API Routes.

---

### 3. الخادم الخاص (VPS/Cloud Server)

#### المتطلبات:
- خادم Linux (Ubuntu 20.04+)
- Node.js 18+ مثبت
- PM2 لإدارة العملية
- Nginx كخادم ويب عكسي

#### خطوات النشر:

1. **رفع الملفات:**
   ```bash
   # على الخادم
   git clone https://github.com/yourusername/nafes-training.git
   cd nafes-training
   npm install
   ```

2. **إعداد قاعدة البيانات:**
   ```bash
   # استخدمي PostgreSQL أو MySQL
   npx prisma generate
   npx prisma migrate deploy
   ```

3. **إنشاء ملف .env:**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/nafes"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="https://yourdomain.com"
   NODE_ENV="production"
   ```

4. **بناء التطبيق:**
   ```bash
   npm run build
   ```

5. **تثبيت PM2:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "nafes-training" -- start
   pm2 save
   pm2 startup
   ```

6. **إعداد Nginx:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **إعداد SSL (HTTPS):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## إعدادات الإنتاج المهمة

### 1. ملف .env للإنتاج

```env
# قاعدة البيانات (PostgreSQL موصى به)
DATABASE_URL="postgresql://user:password@host:5432/database"

# مفتاح سري قوي (استخدمي: openssl rand -base64 32)
NEXTAUTH_SECRET="your-very-strong-secret-key-here"

# رابط التطبيق النهائي
NEXTAUTH_URL="https://yourdomain.com"

# بيئة الإنتاج
NODE_ENV="production"
```

### 2. تحديث Prisma Schema للإنتاج

إذا كنت تستخدم PostgreSQL، تأكدي من تحديث `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // بدلاً من "sqlite"
  url      = env("DATABASE_URL")
}
```

ثم شغلي:
```bash
npx prisma migrate deploy
```

### 3. تحديث next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // إعدادات إضافية للإنتاج
  output: 'standalone', // لتحسين الأداء
};

export default nextConfig;
```

---

## مشاركة التطبيق مع الآخرين

### 1. مشاركة الرابط المباشر

بعد النشر، يمكنك مشاركة الرابط:
- **Vercel:** `https://your-app.vercel.app`
- **Netlify:** `https://your-app.netlify.app`
- **خادم خاص:** `https://yourdomain.com`

### 2. إنشاء حسابات للمستخدمين

#### للمعلمين:
- اذهبي إلى: `https://your-app.com/auth/signup`
- أنشئي حساب معلم جديد
- يمكن للمعلمين إنشاء حساباتهم الخاصة

#### للطالبات:
- المعلم يضيف الطالبات من لوحة التحكم
- الطالبات تسجل دخول من: `https://your-app.com/auth/student-signin`

### 3. مشاركة عبر QR Code

يمكنك إنشاء QR Code يحتوي على رابط التطبيق:
- استخدمي: https://www.qr-code-generator.com
- اطبعي QR Code وعلّقيه في الفصل

---

## نصائح الأمان للإنتاج

### 1. مفتاح NEXTAUTH_SECRET قوي
```bash
# توليد مفتاح سري قوي
openssl rand -base64 32
```

### 2. حماية قاعدة البيانات
- استخدمي كلمات مرور قوية
- فعّلي SSL/TLS للاتصال بقاعدة البيانات
- لا تشاركي رابط قاعدة البيانات علناً

### 3. تحديثات أمنية
```bash
# تحديث الحزم بانتظام
npm audit
npm audit fix
```

### 4. نسخ احتياطي
- نسخ احتياطي يومي لقاعدة البيانات
- حفظ نسخة من ملف `.env` في مكان آمن

---

## استكشاف مشاكل النشر

### مشكلة: "Database connection failed"
**الحل:**
- تحققي من `DATABASE_URL` في Environment Variables
- تأكدي من أن قاعدة البيانات متاحة من الإنترنت
- تحققي من جدار الحماية (Firewall)

### مشكلة: "NEXTAUTH_SECRET is missing"
**الحل:**
- أضيفي `NEXTAUTH_SECRET` في Environment Variables
- تأكدي من استخدام مفتاح سري قوي

### مشكلة: "Build failed"
**الحل:**
- تحققي من السجلات (Logs) في منصة النشر
- تأكدي من تثبيت جميع الحزم
- تحققي من أخطاء TypeScript: `npm run build` محلياً

### مشكلة: "API routes not working"
**الحل:**
- تأكدي من إعدادات Next.js في منصة النشر
- تحققي من أن API Routes مدعومة (Vercel يدعمها تلقائياً)

---

## خيارات قاعدة البيانات للإنتاج

### 1. Supabase (موصى به - مجاني)
- ✅ 500MB قاعدة بيانات مجانية
- ✅ PostgreSQL
- ✅ واجهة إدارة سهلة
- 🔗 https://supabase.com

### 2. PlanetScale
- ✅ MySQL متوافق
- ✅ نسخ مجاني
- 🔗 https://planetscale.com

### 3. Railway
- ✅ PostgreSQL/MySQL
- ✅ $5 رصيد مجاني شهرياً
- 🔗 https://railway.app

### 4. Neon
- ✅ PostgreSQL Serverless
- ✅ نسخ مجاني
- 🔗 https://neon.tech

---

## خطوات سريعة للنشر على Vercel

```bash
# 1. رفع المشروع على GitHub
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/yourusername/nafes-training.git
git push -u origin main

# 2. اذهبي إلى Vercel.com
# 3. اربطي مستودع GitHub
# 4. أضيفي Environment Variables:
#    - DATABASE_URL (من Supabase أو PlanetScale)
#    - NEXTAUTH_SECRET (مفتاح سري قوي)
#    - NEXTAUTH_URL (رابط Vercel)

# 5. اضغطي Deploy
```

---

## الدعم

إذا واجهت أي مشاكل في النشر:
1. راجعي سجلات النشر (Deployment Logs)
2. تحققي من Environment Variables
3. تأكدي من إعدادات قاعدة البيانات

**تم التحديث:** يناير 2025

