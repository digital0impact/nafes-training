# Script لعمل Baseline للـ Migrations
# استخدمي هذا إذا كانت قاعدة البيانات تحتوي بالفعل على الجداول

Write-Host "`n🔧 جاري عمل baseline للـ migrations...`n" -ForegroundColor Cyan

# الانتقال إلى مجلد المشروع
Set-Location -Path $PSScriptRoot

# تحديد أن migrations تم تطبيقها
Write-Host "✅ تحديد migration الأولى: 20251208104024_init" -ForegroundColor Yellow
npx prisma migrate resolve --applied 20251208104024_init

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم بنجاح!`n" -ForegroundColor Green
} else {
    Write-Host "❌ فشل! تحققي من الخطأ أعلاه`n" -ForegroundColor Red
    exit 1
}

Write-Host "✅ تحديد migration الثانية: 20251209110515_add_subscription_plan" -ForegroundColor Yellow
npx prisma migrate resolve --applied 20251209110515_add_subscription_plan

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم بنجاح!`n" -ForegroundColor Green
} else {
    Write-Host "❌ فشل! تحققي من الخطأ أعلاه`n" -ForegroundColor Red
    exit 1
}

Write-Host "✅ تحديد migration الثالثة: 20250110000000_add_test_type" -ForegroundColor Yellow
npx prisma migrate resolve --applied 20250110000000_add_test_type

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم بنجاح!`n" -ForegroundColor Green
} else {
    Write-Host "❌ فشل! تحققي من الخطأ أعلاه`n" -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ تم الانتهاء بنجاح!`n" -ForegroundColor Green
Write-Host "الآن يمكنك تشغيل: npx prisma migrate deploy" -ForegroundColor Cyan
Write-Host "أو التحقق من الحالة: npx prisma migrate status`n" -ForegroundColor Cyan
