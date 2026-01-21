# تشغيل أي أمر npm مع حل مشكلة Execution Policy
# الاستخدام: .\run-npm.ps1 <command>
# مثال: .\run-npm.ps1 install
# مثال: .\run-npm.ps1 "run build"

# تغيير Execution Policy للجلسة الحالية فقط (غير دائم)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

# الانتقال إلى مجلد المشروع
Set-Location $PSScriptRoot

# التحقق من وجود أمر
if ($args.Count -eq 0) {
    Write-Host "الاستخدام: .\run-npm.ps1 <command>" -ForegroundColor Yellow
    Write-Host "مثال: .\run-npm.ps1 install" -ForegroundColor Yellow
    Write-Host "مثال: .\run-npm.ps1 `"run build`"" -ForegroundColor Yellow
    exit 1
}

# تشغيل الأمر
$command = $args -join " "
npm $command
