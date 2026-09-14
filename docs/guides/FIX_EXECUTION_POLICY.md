# حل مشكلة Execution Policy في PowerShell

## المشكلة
عند محاولة تشغيل `npm run dev` في PowerShell، قد تظهر رسالة خطأ:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

## الحلول

### الحل 1: استخدام ملفات PowerShell المساعدة (الأسهل) ✅

الملفات في `scripts/windows/` تضبط Execution Policy للجلسة الحالية تلقائياً قبل تشغيل الأمر:

**للتطوير:**
```powershell
.\scripts\windows\run-dev.ps1
```

**للبناء:**
```powershell
.\scripts\windows\run-build.ps1
```

**للتشغيل بعد البناء:**
```powershell
.\scripts\windows\run-start.ps1
```

**لأي أمر npm:**
```powershell
.\scripts\windows\run-npm.ps1 install
.\scripts\windows\run-npm.ps1 "run build"
.\scripts\windows\run-npm.ps1 "run check-db"
```

### الحل 2: تغيير Execution Policy للجلسة الحالية فقط

افتحي PowerShell كمسؤول (Run as Administrator) وشغلي:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
npm run dev
```

### الحل 3: تغيير Execution Policy بشكل دائم (غير موصى به)

⚠️ **تحذير:** هذا يغير إعدادات النظام. استخدمي هذا فقط إذا كنت متأكدة.

افتحي PowerShell كمسؤول وشغلي:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### الحل 4: استخدام CMD بدلاً من PowerShell

افتحي Command Prompt (CMD) وشغلي:

```cmd
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"
npm run dev
```

## الملفات المتاحة

راجعي [`scripts/windows/README.md`](../../scripts/windows/README.md) لقائمة كاملة بالملفات المتاحة
(`run-dev.ps1`، `run-build.ps1`، `run-start.ps1`، `run-npm.ps1`، `check-env.ps1`، `deploy-vercel.ps1`).

## التوصية

**استخدمي الحل 1 (ملفات `scripts\windows\*.ps1`)** - تحل مشكلة Execution Policy تلقائياً
ولا تتطلب أي تغييرات دائمة في النظام.
