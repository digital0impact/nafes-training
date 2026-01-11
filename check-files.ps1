# Script للتحقق من أن جميع الملفات موجودة في Git

Write-Host "🔍 التحقق من الملفات المطلوبة..." -ForegroundColor Cyan
Write-Host ""

$requiredFiles = @(
    "src/components/student/student-auth-guard.tsx",
    "src/components/student/index.ts",
    "src/app/student/page.tsx"
)

$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file موجود" -ForegroundColor Green
        
        # التحقق من Git
        $gitStatus = git ls-files $file 2>&1
        if ($LASTEXITCODE -eq 0 -and $gitStatus) {
            Write-Host "   ✓ موجود في Git" -ForegroundColor Gray
        } else {
            Write-Host "   ⚠️  غير موجود في Git!" -ForegroundColor Yellow
            $missingFiles += $file
        }
    } else {
        Write-Host "❌ $file غير موجود!" -ForegroundColor Red
        $missingFiles += $file
    }
}

Write-Host ""

if ($missingFiles.Count -gt 0) {
    Write-Host "⚠️  الملفات التالية غير موجودة في Git:" -ForegroundColor Yellow
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "💡 قومي بإضافة الملفات إلى Git:" -ForegroundColor Cyan
    Write-Host "   git add $($missingFiles -join ' ')" -ForegroundColor Gray
    Write-Host "   git commit -m 'Add missing files'" -ForegroundColor Gray
    Write-Host "   git push" -ForegroundColor Gray
} else {
    Write-Host "✅ جميع الملفات موجودة في Git" -ForegroundColor Green
}
