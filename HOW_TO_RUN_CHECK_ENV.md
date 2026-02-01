# 🚀 كيفية تشغيل سكريبت التحقق من متغيرات البيئة

## الطريقة 1: استخدام ملف Batch (الأسهل)

### في CMD:
```cmd
check-env.bat
```

### في PowerShell:
```powershell
.\check-env.bat
```

أو:
```powershell
cmd /c check-env.bat
```

---

## الطريقة 2: استخدام ملف PowerShell

```powershell
.\check-env.ps1
```

إذا ظهرت رسالة Execution Policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
.\check-env.ps1
```

---

## الطريقة 3: مباشرة من npm

```powershell
npm run check-all-env
```

---

## الطريقة 4: مباشرة باستخدام npx

```powershell
npx tsx scripts/check-all-env.ts
```

---

## الطريقة 5: من CMD مباشرة

افتحي **Command Prompt** (CMD) وليس PowerShell:

```cmd
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"
check-env.bat
```

أو:

```cmd
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"
npx tsx scripts/check-all-env.ts
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

إذا استمرت المشاكل، راجعي ملف `ENV_VARIABLES_CHECK.md` للتحقق اليدوي من المتغيرات.
