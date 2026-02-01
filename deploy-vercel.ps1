# نشر التغييرات على Vercel عبر الدفع إلى GitHub
# شغّل من مجلد المشروع: .\deploy-vercel.ps1

Set-Location $PSScriptRoot

Write-Host "=== حالة Git ===" -ForegroundColor Cyan
git status --short
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== إضافة الملفات ===" -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "`n=== إنشاء commit ===" -ForegroundColor Cyan
git commit -m "إضافة دور الزائر (Visitor/Reviewer) وإصلاح تسجيل الدخول"
if ($LASTEXITCODE -ne 0) {
    Write-Host "لا توجد تغييرات جديدة أو فشل الـ commit." -ForegroundColor Yellow
    $cont = Read-Host "هل تريد الدفع على أي حال؟ (y/n)"
    if ($cont -ne "y") { exit 0 }
}

Write-Host "`n=== الدفع إلى origin main ===" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "فشل الدفع. تحقق من الاتصال بـ GitHub واسم المستخدم/كلمة المرور." -ForegroundColor Red
    exit 1
}

Write-Host "`nتم الدفع بنجاح. إذا كان Vercel مربوطاً بالمستودع، سيبدأ النشر تلقائياً." -ForegroundColor Green
