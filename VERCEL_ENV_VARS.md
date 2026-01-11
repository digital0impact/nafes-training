# متغيرات البيئة المطلوبة في Vercel

## قائمة المتغيرات

انسخي هذه القيم من Supabase Dashboard وأضيفيها في Vercel → Project Settings → Environment Variables

### 1. NEXT_PUBLIC_SUPABASE_URL
- **المصدر:** Supabase Dashboard → Settings → API → Project URL
- **مثال:** `https://abcdefghijklmnop.supabase.co`
- **البيئات:** Production, Preview, Development

### 2. NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
- **المصدر:** Supabase Dashboard → Settings → API → Project API keys → `anon` key أو `publishable` key
- **مثال:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **البيئات:** Production, Preview, Development

### 3. DATABASE_URL
- **المصدر:** Supabase Dashboard → Settings → Database → Connection string → URI
- **مثال:** `postgresql://postgres:[PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres`
- **ملاحظة:** استبدلي `[PASSWORD]` بكلمة مرور قاعدة البيانات
- **البيئات:** Production, Preview, Development

### 4. NEXTAUTH_SECRET
- **المصدر:** أنشئي قيمة عشوائية آمنة
- **الطريقة:** استخدمي PowerShell:
  ```powershell
  [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
  ```
- **البيئات:** Production, Preview, Development

### 5. NEXTAUTH_URL
- **القيمة:** رابط التطبيق على Vercel
- **مثال:** `https://nafes-training.vercel.app`
- **ملاحظة:** سيتم إنشاء الرابط بعد النشر الأول
- **البيئات:** Production فقط

### 6. SKIP_ENV_VALIDATION
- **القيمة:** `true`
- **البيئات:** Production, Preview, Development

---

## كيفية إضافة المتغيرات في Vercel

1. اذهبي إلى [vercel.com](https://vercel.com)
2. افتحي مشروعك
3. اضغطي على **Settings**
4. اضغطي على **Environment Variables**
5. أضيفي كل متغير:
   - أدخلي **Name**
   - أدخلي **Value**
   - اختر **Environment** (Production, Preview, Development)
   - اضغطي **Save**
6. كرري العملية لكل متغير

---

## ملاحظات مهمة

⚠️ **لا ترفعي ملف `.env` إلى GitHub** - يجب أن تبقى القيم سرية

⚠️ **تأكدي من إضافة جميع المتغيرات** قبل النشر

⚠️ **بعد إضافة المتغيرات، يجب إعادة النشر** - اضغطي على **Redeploy** في آخر deployment

---

## التحقق من المتغيرات

بعد النشر، يمكنك التحقق من أن المتغيرات تم تحميلها بشكل صحيح:

1. اذهبي إلى Vercel → Project → Deployments
2. افتحي آخر deployment
3. اضغطي على **View Function Logs**
4. ابحثي عن أي أخطاء متعلقة بالمتغيرات
