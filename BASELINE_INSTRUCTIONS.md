# 🔧 حل مشكلة Baseline للـ Migrations

## المشكلة
عند تشغيل `npx prisma migrate deploy`، تحصلين على خطأ:
```
Error: P3005
The database schema is not empty.
```

هذا يعني أن قاعدة البيانات تحتوي بالفعل على جداول، لكن Prisma لا يعرف أن migrations تم تطبيقها.

## الحل: عمل Baseline

### الخطوة 1: تحديد أن migrations تم تطبيقها

شغلي الأوامر التالية **واحدًا تلو الآخر**:

```powershell
# الانتقال إلى مجلد المشروع
cd nafes-training

# تحديد migration الأولى
npx prisma migrate resolve --applied 20251208104024_init

# تحديد migration الثانية
npx prisma migrate resolve --applied 20251209110515_add_subscription_plan

# تحديد migration الثالثة
npx prisma migrate resolve --applied 20250110000000_add_test_type
```

### الخطوة 2: التحقق من الحالة

```powershell
npx prisma migrate status
```

يجب أن ترين أن جميع migrations تم تطبيقها.

### الخطوة 3: النشر (إذا لزم الأمر)

```powershell
npx prisma migrate deploy
```

الآن يجب أن يعمل بدون أخطاء!

---

## ملاحظات مهمة

1. **تأكدي من أن قاعدة البيانات تحتوي على جميع الجداول المطلوبة** قبل عمل baseline
2. إذا كانت قاعدة البيانات فارغة، استخدمي `npx prisma migrate deploy` مباشرة
3. إذا كانت قاعدة البيانات تحتوي على جداول مختلفة عن migrations، قد تحتاجين إلى تعديل migrations أو قاعدة البيانات

---

## للاستخدام في Vercel

بعد عمل baseline محلياً، تأكدي من:

1. إضافة `DATABASE_URL` في Environment Variables في Vercel
2. إضافة script في `package.json`:

```json
{
  "scripts": {
    "postbuild": "prisma generate && prisma migrate deploy"
  }
}
```

3. أو إضافة build command في `vercel.json`:

```json
{
  "buildCommand": "npm run build && npx prisma generate && npx prisma migrate deploy"
}
```
