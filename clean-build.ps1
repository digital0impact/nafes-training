# Script لتنظيف cache وإعادة البناء

Write-Host "🧹 جاري تنظيف cache..." -ForegroundColor Cyan

# الانتقال إلى مجلد المشروع
Set-Location -Path $PSScriptRoot

# حذف مجلدات cache
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ تم حذف .next" -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✅ تم حذف node_modules/.cache" -ForegroundColor Green
}

# إعادة توليد Prisma Client
Write-Host "`n🔧 جاري توليد Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ تم توليد Prisma Client بنجاح" -ForegroundColor Green
} else {
    Write-Host "❌ فشل توليد Prisma Client" -ForegroundColor Red
    exit 1
}

# البناء
Write-Host "`n🏗️  جاري البناء..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ تم البناء بنجاح!" -ForegroundColor Green
} else {
    Write-Host "`n❌ فشل البناء. تحققي من الأخطاء أعلاه." -ForegroundColor Red
    exit 1
}
