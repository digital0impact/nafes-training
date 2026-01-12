# Script لإصلاح خطأ Prisma EPERM

Write-Host "🔧 إصلاح خطأ Prisma..." -ForegroundColor Cyan
Write-Host ""

# إيقاف جميع عمليات Node.js
Write-Host "🛑 إيقاف عمليات Node.js..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# حذف مجلد .prisma
Write-Host "🗑️  حذف مجلد .prisma..." -ForegroundColor Yellow
$prismaPath = "node_modules\.prisma"
if (Test-Path $prismaPath) {
    try {
        Remove-Item -Recurse -Force $prismaPath -ErrorAction Stop
        Write-Host "✅ تم حذف مجلد .prisma" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  لا يمكن حذف المجلد. قد يكون قيد الاستخدام." -ForegroundColor Yellow
        Write-Host "💡 حاولي إغلاق VS Code و Terminal وإعادة المحاولة" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ المجلد غير موجود" -ForegroundColor Green
}

# حذف مجلد @prisma/client
Write-Host "🗑️  حذف مجلد @prisma/client..." -ForegroundColor Yellow
$clientPath = "node_modules\@prisma\client"
if (Test-Path $clientPath) {
    try {
        Remove-Item -Recurse -Force $clientPath -ErrorAction Stop
        Write-Host "✅ تم حذف مجلد @prisma/client" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  لا يمكن حذف المجلد. قد يكون قيد الاستخدام." -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ المجلد غير موجود" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔄 إعادة توليد Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "✅ تم الانتهاء!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 الخطوة التالية:" -ForegroundColor Yellow
Write-Host "   npm run build" -ForegroundColor Gray
