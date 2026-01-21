# حل مشكلة Execution Policy في PowerShell

## المشكلة
عند محاولة تشغيل `npm run dev` في PowerShell، قد تظهر رسالة خطأ:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

## الحلول

### الحل 1: استخدام ملف .bat (الأسهل والأسرع) ✅

استخدمي ملفات `.bat` بدلاً من تشغيل `npm` مباشرة:

**للتطوير:**
```cmd
run-dev.bat
```

**للبناء:**
```cmd
run-build.bat
```

**للتشغيل بعد البناء:**
```cmd
run-start.bat
```

أو انقرتي مرتين على الملف في File Explorer.

### الحل 2: تغيير Execution Policy للجلسة الحالية فقط

افتحي PowerShell كمسؤول (Run as Administrator) وشغلي:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
npm run dev
```

### الحل 3: استخدام ملفات PowerShell (.ps1)

شغلي ملفات PowerShell المتاحة:

**للتطوير:**
```powershell
.\run-dev.ps1
```

**للبناء:**
```powershell
.\run-build.ps1
```

**للتشغيل بعد البناء:**
```powershell
.\run-start.ps1
```

**لأي أمر npm:**
```powershell
.\run-npm.ps1 install
.\run-npm.ps1 "run build"
.\run-npm.ps1 "run check-db"
```

### الحل 4: تغيير Execution Policy بشكل دائم (غير موصى به)

⚠️ **تحذير:** هذا يغير إعدادات النظام. استخدمي هذا فقط إذا كنت متأكدة.

افتحي PowerShell كمسؤول وشغلي:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### الحل 5: استخدام CMD بدلاً من PowerShell

افتحي Command Prompt (CMD) وشغلي:

```cmd
cd "C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training"
npm run dev
```

## الملفات المتاحة

### ملفات .bat (تعمل في CMD و PowerShell)
- `run-dev.bat` - تشغيل التطبيق في وضع التطوير
- `run-build.bat` - بناء التطبيق للإنتاج
- `run-start.bat` - تشغيل التطبيق بعد البناء

### ملفات .ps1 (تعمل في PowerShell فقط)
- `run-dev.ps1` - تشغيل التطبيق في وضع التطوير
- `run-build.ps1` - بناء التطبيق للإنتاج
- `run-start.ps1` - تشغيل التطبيق بعد البناء
- `run-npm.ps1` - تشغيل أي أمر npm (مرن)

## التوصية

**استخدمي الحل 1 (ملفات .bat)** - هي الأسهل والأسرع ولا تتطلب أي تغييرات في النظام.

**إذا كنت تفضلين PowerShell:** استخدمي ملفات `.ps1` - ستحل مشكلة Execution Policy تلقائياً.
