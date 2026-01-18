# Script للتحقق من Node.js وتثبيته

Write-Host "🔍 التحقق من تثبيت Node.js..." -ForegroundColor Cyan
Write-Host ""

# التحقق من Node.js
$nodePath = $null
$npmPath = $null

# البحث في المسارات الشائعة
$commonPaths = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
)

foreach ($path in $commonPaths) {
    if (Test-Path $path) {
        $nodePath = $path
        Write-Host "✅ تم العثور على Node.js في: $path" -ForegroundColor Green
        break
    }
}

# محاولة استخدام Get-Command
try {
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCmd) {
        $nodePath = $nodeCmd.Source
        Write-Host "✅ Node.js موجود في PATH: $nodePath" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Node.js غير موجود في PATH" -ForegroundColor Yellow
}

# التحقق من npm
try {
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue
    if ($npmCmd) {
        $npmPath = $npmCmd.Source
        Write-Host "✅ npm موجود في PATH: $npmPath" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  npm غير موجود في PATH" -ForegroundColor Yellow
}

Write-Host ""

# إذا لم يتم العثور على Node.js
if (-not $nodePath) {
    Write-Host "❌ Node.js غير مثبت" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 خطوات التثبيت:" -ForegroundColor Cyan
    Write-Host "   1. اذهبي إلى: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "   2. حمّلي النسخة LTS (النسخة المستقرة)" -ForegroundColor Yellow
    Write-Host "   3. شغّلي المثبت واتبعي التعليمات" -ForegroundColor Yellow
    Write-Host "   4. ⚠️  مهم: تأكدي من اختيار 'Add to PATH' أثناء التثبيت" -ForegroundColor Yellow
    Write-Host "   5. أغلقي وأعيدي فتح PowerShell بعد التثبيت" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 أو استخدمي winget (إذا كان متوفراً):" -ForegroundColor Cyan
    Write-Host "   winget install OpenJS.NodeJS.LTS" -ForegroundColor Gray
    Write-Host ""
    
    # محاولة فتح المتصفح
    $response = Read-Host "هل تريدين فتح صفحة التحميل الآن؟ (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Start-Process "https://nodejs.org/"
    }
} else {
    Write-Host "✅ Node.js مثبت" -ForegroundColor Green
    
    # محاولة التحقق من الإصدار
    try {
        $nodeVersion = & $nodePath --version 2>&1
        Write-Host "   الإصدار: $nodeVersion" -ForegroundColor Gray
    } catch {
        Write-Host "   ⚠️  لا يمكن التحقق من الإصدار" -ForegroundColor Yellow
    }
    
    if ($npmPath) {
        try {
            $npmVersion = & $npmPath --version 2>&1
            Write-Host "   npm الإصدار: $npmVersion" -ForegroundColor Gray
        } catch {
            Write-Host "   ⚠️  لا يمكن التحقق من إصدار npm" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  npm غير موجود - قد تحتاجين لإعادة تثبيت Node.js" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📋 ملاحظات مهمة:" -ForegroundColor Cyan
Write-Host "   - بعد تثبيت Node.js، يجب إعادة فتح PowerShell" -ForegroundColor Gray
Write-Host "   - تأكدي من اختيار 'Add to PATH' أثناء التثبيت" -ForegroundColor Gray
Write-Host "   - بعد التثبيت، جربي: node --version و npm --version" -ForegroundColor Gray
