# بناء التطبيق للإنتاج
# هذا الملف يحل مشكلة Execution Policy في PowerShell

# تغيير Execution Policy للجلسة الحالية فقط (غير دائم)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# الانتقال إلى مجلد المشروع
Set-Location $PSScriptRoot

# بناء التطبيق
npm run build
