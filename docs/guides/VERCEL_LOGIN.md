# تسجيل الدخول إلى Vercel CLI

## الخطوة 1: تسجيل الدخول

شغّل في الطرفية:

```powershell
npx vercel login
```

سيُفتح المتصفح أو يُعرض رابط لتسجيل الدخول في Vercel. أدخل بريدك وكلمة المرور أو سجّل الدخول عبر GitHub/Google.

## الخطوة 2: النشر بعد تسجيل الدخول

بعد ظهور رسالة نجاح تسجيل الدخول:

```powershell
npx vercel --prod
```

---

## بديل: النشر عبر GitHub (بدون Vercel CLI)

1. ادفع التغييرات إلى GitHub:
   ```powershell
   git add .
   git commit -m "تحديثات المشروع"
   git push origin main
   ```
2. إذا كان المشروع مربوطاً بمستودع GitHub في [vercel.com](https://vercel.com)، سيتم النشر تلقائياً بعد كل دفع إلى `main`.

لا تحتاج لتسجيل الدخول من الطرفية في هذه الحالة.
