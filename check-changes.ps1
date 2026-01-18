# Script للتحقق من التغييرات المحفوظة

Write-Host "🔍 التحقق من حالة التغييرات..." -ForegroundColor Cyan
Write-Host ""

# التحقق من وجود Git
if (Test-Path ".git") {
    Write-Host "✅ Git مهيأ" -ForegroundColor Green
    
    # التحقق من حالة Git
    Write-Host ""
    Write-Host "📋 حالة Git:" -ForegroundColor Yellow
    git status --short
    
    Write-Host ""
    Write-Host "📝 آخر 5 commits:" -ForegroundColor Yellow
    git log --oneline -5
    
} else {
    Write-Host "⚠️  Git غير مهيأ" -ForegroundColor Yellow
    Write-Host "💡 الملفات موجودة على القرص لكن لم يتم حفظها في Git" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📁 التحقق من الملفات المهمة:" -ForegroundColor Cyan

$importantFiles = @(
    "src/components/student/student-auth-guard.tsx",
    "src/components/student/index.ts",
    "src/app/student/page.tsx",
    "package.json",
    "tsconfig.json"
)

foreach ($file in $importantFiles) {
    if (Test-Path $file) {
        $lastModified = (Get-Item $file).LastWriteTime
        Write-Host "✅ $file" -ForegroundColor Green
        Write-Host "   آخر تعديل: $lastModified" -ForegroundColor Gray
    } else {
        Write-Host "❌ $file غير موجود!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "💡 ملاحظة:" -ForegroundColor Yellow
Write-Host "   - حذف Cursor من سطح المكتب لا يحذف الملفات" -ForegroundColor Gray
Write-Host "   - الملفات موجودة في: C:\Users\hope-\Desktop\نافس\التطبيق\nafes-training" -ForegroundColor Gray
Write-Host "   - إذا تم حفظ الملفات (Ctrl+S) قبل الإغلاق، فالتغييرات موجودة" -ForegroundColor Gray
Write-Host "   - إذا لم يتم commit في Git، قد تكون بعض التغييرات غير محفوظة" -ForegroundColor Gray
