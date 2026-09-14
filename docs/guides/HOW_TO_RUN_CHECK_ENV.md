# 🚀 كيفية تشغيل سكريبت التحقق من متغيرات البيئة

## الطريقة 1: مباشرة من npm (الأسهل والموصى بها)

```powershell
npm run check-env
```

لإصلاح/إنشاء ملف `.env` تلقائياً قبل الفحص:

```powershell
npm run fix-env
```

---

## الطريقة 2: استخدام ملف PowerShell المساعد

```powershell
.\scripts\windows\check-env.ps1
```

هذا الملف يضبط Execution Policy للجلسة الحالية تلقائياً، فلا داعي لتشغيل أي أمر إضافي.

---

## الطريقة 3: مباشرة باستخدام npx

```powershell
npx tsx scripts/env/check-env.ts
```

---

## الطريقة 4: من CMD مباشرة

افتحي **Command Prompt** (CMD) وليس PowerShell، وانتقلي إلى مجلد المشروع:

```cmd
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"
npm run check-env
```

---

## إذا لم تعمل أي طريقة

### الحل البديل: التحقق اليدوي

1. افتحي ملف `.env` في محرر النصوص
2. تأكدي من وجود المتغيرات التالية:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `SKIP_ENV_VALIDATION` (اختياري)

3. تأكدي من أن القيم ليست قيم افتراضية مثل:
   - ❌ `your-project-ref`
   - ❌ `your-publishable-key-here`
   - ❌ `[YOUR-PASSWORD]`
   - ❌ `[PROJECT-REF]`

---

## نصائح

- إذا كان لديك مشاكل مع PowerShell، استخدمي **CMD** بدلاً منه
- تأكدي من أنك في المجلد الصحيح للمشروع
- تأكدي من تثبيت Node.js و npm

---

## المساعدة

إذا استمرت المشاكل، راجعي ملف [`ENV_VARIABLES_CHECK.md`](./ENV_VARIABLES_CHECK.md) للتحقق اليدوي من المتغيرات.
