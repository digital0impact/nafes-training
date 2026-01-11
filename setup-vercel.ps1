# Script لإعداد المشروع للنشر على Vercel
# استخدمي هذا بعد رفع المشروع على GitHub

Write-Host "🚀 إعداد المشروع للنشر على Vercel" -ForegroundColor Cyan
Write-Host ""

# التحقق من Git
Write-Host "📦 التحقق من Git..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Git غير مهيأ. جاري التهيئة..." -ForegroundColor Yellow
    git init
    Write-Host "✅ تم تهيئة Git" -ForegroundColor Green
} else {
    Write-Host "✅ Git مهيأ بالفعل" -ForegroundColor Green
}

# التحقق من ملف .env
Write-Host "`n🔐 التحقق من ملف .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  ملف .env غير موجود!" -ForegroundColor Red
    Write-Host "💡 انسخي env.example إلى .env واملئي القيم" -ForegroundColor Yellow
    Write-Host "   Copy-Item env.example .env" -ForegroundColor Gray
} else {
    Write-Host "✅ ملف .env موجود" -ForegroundColor Green
}

# التحقق من البناء
Write-Host "`n🔨 التحقق من البناء..." -ForegroundColor Yellow
Write-Host "💡 تأكدي من أن npm run build يعمل بدون أخطاء" -ForegroundColor Yellow
Write-Host "   npm run build" -ForegroundColor Gray

# معلومات مهمة
Write-Host "`n📋 الخطوات التالية:" -ForegroundColor Cyan
Write-Host "1. ارفعي المشروع على GitHub" -ForegroundColor White
Write-Host "2. اذهبي إلى vercel.com واربطي المستودع" -ForegroundColor White
Write-Host "3. أضيفي متغيرات البيئة من Supabase" -ForegroundColor White
Write-Host "4. اضغطي Deploy" -ForegroundColor White
Write-Host ""
Write-Host "📖 للمزيد من التفاصيل، راجعي ملف VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""

# عرض متغيرات البيئة المطلوبة
Write-Host "🔑 متغيرات البيئة المطلوبة في Vercel:" -ForegroundColor Cyan
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" -ForegroundColor White
Write-Host "   - DATABASE_URL" -ForegroundColor White
Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor White
Write-Host "   - NEXTAUTH_URL" -ForegroundColor White
Write-Host "   - SKIP_ENV_VALIDATION" -ForegroundColor White
Write-Host ""
