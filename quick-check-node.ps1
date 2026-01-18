Write-Host "=== فحص Node.js ===" -ForegroundColor Cyan
Write-Host ""

# البحث عن Node.js
$found = $false

# المسارات الشائعة
$paths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe"
)

Write-Host "البحث عن Node.js..." -ForegroundColor Yellow
foreach ($path in $paths) {
    if (Test-Path $path) {
        Write-Host "✓ موجود في: $path" -ForegroundColor Green
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "✗ Node.js غير مثبت" -ForegroundColor Red
    Write-Host ""
    Write-Host "الحل:" -ForegroundColor Yellow
    Write-Host "1. اذهبي إلى: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. حمّلي النسخة LTS" -ForegroundColor White
    Write-Host "3. ثبّتي Node.js (تأكدي من اختيار Add to PATH)" -ForegroundColor White
    Write-Host "4. أغلقي وأعيدي فتح PowerShell" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Node.js مثبت لكن قد لا يكون في PATH" -ForegroundColor Yellow
    Write-Host "حاولي إعادة فتح PowerShell أو إعادة تثبيت Node.js" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "للتحقق يدوياً:" -ForegroundColor Cyan
Write-Host "  node --version" -ForegroundColor Gray
Write-Host "  npm --version" -ForegroundColor Gray
