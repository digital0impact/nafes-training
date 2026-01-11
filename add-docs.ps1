# Script لإضافة ملفات التوثيق والسكريبتات المساعدة

Write-Host "📚 إضافة ملفات التوثيق والسكريبتات..." -ForegroundColor Cyan
Write-Host ""

# إضافة ملفات التوثيق المهمة
Write-Host "➕ إضافة ملفات التوثيق..." -ForegroundColor Yellow
git add START_HERE.md
git add VERCEL_DEPLOYMENT.md
git add VERCEL_ENV_VARS.md
git add TROUBLESHOOTING.md
git add FIX_DEPLOYMENT.md
git add RUN_APP.md

# إضافة السكريبتات المساعدة
Write-Host "➕ إضافة السكريبتات المساعدة..." -ForegroundColor Yellow
git add setup-vercel.ps1
git add run-dev.ps1
git add add-all-changes.ps1
git add check-files.ps1

# إضافة ملفات الإصلاح (اختياري - يمكن تجاهلها)
Write-Host "➕ إضافة ملفات الإصلاح..." -ForegroundColor Yellow
git add FIX_MIGRATIONS.md
git add FIX_PRISMA_BUILD.md
git add BASELINE_INSTRUCTIONS.md
git add baseline-migrations.ps1
git add clean-build.ps1
git add clean-build-simple.ps1
git add fix-baseline.ps1
git add fix-prisma-build.ps1
git add rebuild.ps1

Write-Host ""
Write-Host "✅ تم إضافة الملفات" -ForegroundColor Green
Write-Host ""
Write-Host "📋 حالة Git:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "💡 الخطوة التالية:" -ForegroundColor Yellow
Write-Host "   git commit -m 'Add documentation and helper scripts'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
