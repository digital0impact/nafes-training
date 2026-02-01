# إصلاح خطأ قاعدة البيانات على Vercel

## المشكلة

عند تسجيل الدخول على التطبيق المنشور على Vercel يظهر:

```
Invalid `prisma.user.findUnique()` invocation:
Can't reach database server at `db.vatqqurkedwlyuqrfwrr.supabase.co`:`5432`
Please make sure your database server is running at ...
```

**السبب:** على Vercel (بيئة serverless) الاتصال **المباشر** بقاعدة البيانات (المنفذ **5432**) غالباً لا يعمل. Supabase يوصي باستخدام **Connection Pooler** (المنفذ **6543**) للتطبيقات المنشورة على Vercel.

---

## الحل (استخدام Connection Pooler على Vercel)

### الخطوة 1: الحصول على رابط Connection Pooling من Supabase

1. ادخلي إلى [Supabase Dashboard](https://app.supabase.com)
2. اختاري مشروعك
3. اذهبي إلى **Settings** → **Database**
4. في قسم **Connection string** اختر **Connection pooling** (وليس URI العادي)
5. اختر **URI** وانسخي الرابط

الصيغة تكون شبيهة بـ:

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

مثال لمشروعك (استبدلي `[YOUR-PASSWORD]` بكلمة مرور قاعدة البيانات):

```
postgresql://postgres.vatqqurkedwlyuqrfwrr:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### الخطوة 2: إضافة `?pgbouncer=true` لـ Prisma (إلزامي)

في نهاية الرابط أضيفي `?pgbouncer=true` حتى يعمل Prisma بشكل صحيح مع الـ pooler. **بدون هذا المعامل** قد يظهر خطأ مثل: `prepared statement "s0" already exists`.

**القيمة النهائية لـ DATABASE_URL على Vercel:**

```
postgresql://postgres.vatqqurkedwlyuqrfwrr:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### الخطوة 3: تعديل المتغير في Vercel

1. ادخلي إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختاري المشروع
3. **Settings** → **Environment Variables**
4. عدّلي (أو أضيفي) المتغير **`DATABASE_URL`**:
   - **Name:** `DATABASE_URL`
   - **Value:** الرابط من الخطوة 2 (مع كلمة المرور الحقيقية وبدون `[YOUR-PASSWORD]`)
   - **Environment:** Production (و Preview إن أردت)
5. احفظي التغييرات

### الخطوة 4: إعادة النشر (Redeploy)

بعد تغيير المتغيرات يجب إعادة النشر:

- من صفحة **Deployments** اضغطي على **⋯** بجانب آخر نشر ثم **Redeploy**
- أو ادفعي أي تغيير جديد إلى Git ليشغّل نشراً تلقائياً

بعد انتهاء الـ redeploy جرّبي تسجيل الدخول مرة أخرى.

---

## ملخص الفرق

| البيئة        | المنفذ | المضيف                          | متى يُستخدم      |
|--------------|--------|----------------------------------|-------------------|
| اتصال مباشر  | 5432   | `db.xxx.supabase.co`            | محلياً (اختياري) |
| Connection Pooler | 6543 | `aws-0-us-east-1.pooler.supabase.com` | **على Vercel (مطلوب)** |

- **محلياً:** يمكن الاستمرار باستخدام `db....supabase.co:5432` في ملف `.env`
- **على Vercel:** استخدمي دائماً رابط الـ pooler (المنفذ 6543) مع `?pgbouncer=true`

---

## إذا كانت كلمة المرور تحتوي على أحرف خاصة

إذا كانت كلمة المرور فيها مثلاً `@` أو `#` أو `=` قومي بترميزها في الرابط:

- `@` → `%40`
- `#` → `%23`
- `=` → `%3D`
- `:` → `%3A`

أو استخدمي من Supabase نسخ **Connection pooling** جاهزاً ثم استبدلي جزء كلمة المرور فقط بعد الترميز.

---

**آخر تحديث:** 2026
