# دليل تثبيت Node.js - خطوة بخطوة

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   دليل تثبيت Node.js خطوة بخطوة" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من Node.js
Write-Host "الخطوة 1: التحقق من Node.js..." -ForegroundColor Yellow

$nodeExists = $false
$commonPaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe"
)

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        Write-Host "✓ Node.js موجود في: $path" -ForegroundColor Green
        $nodeExists = $true
    }
}

if (-not $nodeExists) {
    Write-Host "✗ Node.js غير مثبت" -ForegroundColor Red
    Write-Host ""
    Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "   خطوات التثبيت:" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. افتحي المتصفح واذهبي إلى:" -ForegroundColor White
    Write-Host "   https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. اضغطي على زر 'LTS' (النسخة المستقرة)" -ForegroundColor White
    Write-Host ""
    Write-Host "3. بعد التحميل، شغّلي الملف الذي تم تحميله" -ForegroundColor White
    Write-Host ""
    Write-Host "4. أثناء التثبيت:" -ForegroundColor White
    Write-Host "   - اضغطي 'Next' في جميع الخطوات" -ForegroundColor Gray
    Write-Host "   - ⚠️  مهم جداً: تأكدي من اختيار 'Add to PATH'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "5. بعد التثبيت:" -ForegroundColor White
    Write-Host "   - أغلقي جميع نوافذ PowerShell" -ForegroundColor Gray
    Write-Host "   - افتحي PowerShell جديد" -ForegroundColor Gray
    Write-Host "   - جربي: node --version" -ForegroundColor Gray
    Write-Host ""
    
    # محاولة فتح المتصفح
    $openBrowser = Read-Host "هل تريدين فتح صفحة التحميل الآن؟ (y/n)"
    if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
        Start-Process "https://nodejs.org/"
        Write-Host ""
        Write-Host "✓ تم فتح المتصفح" -ForegroundColor Green
    }
} else {
    Write-Host ""
    Write-Host "⚠️  Node.js مثبت لكن npm لا يعمل" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "الحلول الممكنة:" -ForegroundColor Cyan
    Write-Host "1. أغلقي وأعيدي فتح PowerShell" -ForegroundColor White
    Write-Host "2. إذا لم يعمل، أعدي تثبيت Node.js" -ForegroundColor White
    Write-Host "3. تأكدي من اختيار 'Add to PATH' أثناء إعادة التثبيت" -ForegroundColor White
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   بعد التثبيت - التحقق:" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "بعد إعادة فتح PowerShell، نفذي:" -ForegroundColor White
Write-Host "  node --version" -ForegroundColor Gray
Write-Host "  npm --version" -ForegroundColor Gray
Write-Host ""
Write-Host "إذا ظهرت الأرقام، فالتثبيت نجح! ✅" -ForegroundColor Green
Write-Host ""
