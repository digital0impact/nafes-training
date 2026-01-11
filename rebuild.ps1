# Script لتنظيف cache وإعادة البناء

Write-Host "🧹 جاري تنظيف cache..." -ForegroundColor Cyan

# حذف مجلدات cache
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ تم حذف .next" -ForegroundColor Green
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
