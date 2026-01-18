# دليل تثبيت Git - خطوة بخطوة

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   دليل تثبيت Git خطوة بخطوة" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من Git
Write-Host "الخطوة 1: التحقق من Git..." -ForegroundColor Yellow

$gitExists = $false
$commonPaths = @(
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe"
)

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        Write-Host "✓ Git موجود في: $path" -ForegroundColor Green
        $gitExists = $true
    }
}

if (-not $gitExists) {
    Write-Host "✗ Git غير مثبت" -ForegroundColor Red
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "   خطوات التثبيت:" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. افتحي المتصفح واذهبي إلى:" -ForegroundColor White
    Write-Host "   https://git-scm.com/download/win" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. سيتم تحميل Git تلقائياً (أو اضغطي على Download)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. بعد التحميل، شغّلي الملف الذي تم تحميله" -ForegroundColor White
    Write-Host ""
    Write-Host "4. أثناء التثبيت:" -ForegroundColor White
    Write-Host "   - اضغطي 'Next' في جميع الخطوات" -ForegroundColor Gray
    Write-Host "   - ⚠️  مهم: تأكدي من اختيار 'Git from the command line and also from 3rd-party software'" -ForegroundColor Yellow
    Write-Host "   - أو اختاري 'Use Git and optional Unix tools from the Command Prompt'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. بعد التثبيت:" -ForegroundColor White
    Write-Host "   - أغلقي جميع نوافذ PowerShell" -ForegroundColor Gray
    Write-Host "   - افتحي PowerShell جديد" -ForegroundColor Gray
    Write-Host "   - جربي: git --version" -ForegroundColor Gray
    Write-Host ""
    
    # محاولة فتح المتصفح
    $openBrowser = Read-Host "هل تريدين فتح صفحة التحميل الآن؟ (y/n)"
    if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
        Start-Process "https://git-scm.com/download/win"
        Write-Host ""
        Write-Host "✓ تم فتح المتصفح" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "⚠️  Git مثبت لكن لا يعمل في PowerShell" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "الحلول الممكنة:" -ForegroundColor Cyan
    Write-Host "1. أغلقي وأعيدي فتح PowerShell" -ForegroundColor White
    Write-Host "2. إذا لم يعمل، أعدي تثبيت Git" -ForegroundColor White
    Write-Host "3. تأكدي من اختيار 'Git from the command line' أثناء إعادة التثبيت" -ForegroundColor White
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   بعد التثبيت - التحقق:" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "بعد إعادة فتح PowerShell، نفذي:" -ForegroundColor White
Write-Host "  git --version" -ForegroundColor Gray
Write-Host ""
Write-Host "إذا ظهر رقم الإصدار، فالتثبيت نجح! ✅" -ForegroundColor Green
Write-Host ""
