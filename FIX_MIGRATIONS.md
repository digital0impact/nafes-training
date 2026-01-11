# 🔧 حل مشكلة Baseline للـ Migrations

## المشكلة
```
Error: P3005
The database schema is not empty.
```

## الحل السريع

### الطريقة 1: استخدام الـ Script (الأسهل)

افتحي PowerShell في مجلد المشروع وشغلي:

```powershell
cd nafes-training
.\fix-baseline.ps1
```

### الطريقة 2: يدوياً (خطوة بخطوة)

افتحي PowerShell في مجلد المشروع وشغلي الأوامر التالية **واحدًا تلو الآخر**:

```powershell
# 1. الانتقال إلى مجلد المشروع
cd nafes-training

# 2. تحديد migration الأولى
npx prisma migrate resolve --applied 20251208104024_init

# 3. تحديد migration الثانية
npx prisma migrate resolve --applied 20251209110515_add_subscription_plan

# 4. تحديد migration الثالثة
npx prisma migrate resolve --applied 20250110000000_add_test_type

# 5. التحقق من الحالة
npx prisma migrate status

# 6. محاولة النشر مرة أخرى
npx prisma migrate deploy
```

## ملاحظات مهمة

⚠️ **لا تحاولي تشغيل محتوى ملف `vercel.json` مباشرة في PowerShell!**

- ملف `vercel.json` هو ملف إعدادات لـ Vercel فقط
- لا يُنفذ كأمر PowerShell
- Vercel يقرأه تلقائياً عند النشر

## بعد حل المشكلة

بعد عمل baseline بنجاح:

1. ✅ تأكدي من أن `npx prisma migrate status` يظهر أن جميع migrations تم تطبيقها
2. ✅ يمكنك الآن استخدام `npx prisma migrate deploy` بدون مشاكل
3. ✅ عند النشر في Vercel، سيتم تطبيق migrations تلقائياً

## للاستخدام في Vercel

بعد حل المشكلة محلياً:

1. تأكدي من إضافة `DATABASE_URL` في Environment Variables في Vercel
2. عند النشر، سيتم تشغيل migrations تلقائياً عبر `postbuild` script
3. إذا كانت قاعدة البيانات في Vercel جديدة، ستعمل migrations بشكل طبيعي
