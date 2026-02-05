# إصلاح خطأ npm Invalid Version

نفّذي الأوامر التالية **بالترتيب** من مجلد المشروع `nafes-training`:

## في PowerShell

```powershell
# 1. حذف الملفات المعطوبة
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# 2. إعادة التثبيت (سيُنشئ package-lock.json جديد)
npm install
```

## أو في CMD

```cmd
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
npm install
```

بعدها جرّبي البناء:

```bash
npm run build
```

---
إذا استمر الخطأ، تأكدي من إصدار npm: `npm -v` (يفضّل 10.x أو أحدث).
