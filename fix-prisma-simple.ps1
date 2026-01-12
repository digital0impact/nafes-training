# Script بسيط لإصلاح خطأ Prisma EPERM

Write-Host "🔧 إصلاح خطأ Prisma..." -ForegroundColor Cyan
Write-Host ""

# إيقاف عمليات Node.js
Write-Host "🛑 إيقاف عمليات Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "✅ تم إيقاف عمليات Node.js" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "✅ لا توجد عمليات Node.js قيد التشغيل" -ForegroundColor Green
}

# حذف مجلد .prisma
Write-Host "🗑️  حذف مجلد .prisma..." -ForegroundColor Yellow
$prismaPath = "node_modules\.prisma"
if (Test-Path $prismaPath) {
    Remove-Item -Recurse -Force $prismaPath -ErrorAction SilentlyContinue
    Write-Host "✅ تم حذف مجلد .prisma" -ForegroundColor Green
}

# حذف مجلد @prisma/client
Write-Host "🗑️  حذف مجلد @prisma/client..." -ForegroundColor Yellow
$clientPath = "node_modules\@prisma\client"
if (Test-Path $clientPath) {
    Remove-Item -Recurse -Force $clientPath -ErrorAction SilentlyContinue
    Write-Host "✅ تم حذف مجلد @prisma/client" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔄 إعادة توليد Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ تم بنجاح!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 الآن يمكنك تشغيل: npm run build" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "⚠️  لا يزال هناك مشكلة. حاولي:" -ForegroundColor Yellow
    Write-Host "   1. إغلاق VS Code" -ForegroundColor Gray
    Write-Host "   2. إغلاق جميع نوافذ Terminal" -ForegroundColor Gray
    Write-Host "   3. إعادة فتح Terminal جديد" -ForegroundColor Gray
    Write-Host "   4. تشغيل هذا السكريبت مرة أخرى" -ForegroundColor Gray
}
