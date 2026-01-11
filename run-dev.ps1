# Script لتشغيل التطبيق في وضع التطوير

Write-Host "🚀 تشغيل التطبيق..." -ForegroundColor Cyan
Write-Host ""

# التحقق من وجود ملف .env
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  ملف .env غير موجود!" -ForegroundColor Yellow
    Write-Host "💡 جاري نسخ env.example إلى .env..." -ForegroundColor Yellow
    
    if (Test-Path "env.example") {
        Copy-Item env.example .env
        Write-Host "✅ تم إنشاء ملف .env" -ForegroundColor Green
        Write-Host "⚠️  يرجى ملء القيم في ملف .env من Supabase Dashboard" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "اضغطي Enter للمتابعة بعد ملء ملف .env..."
        Read-Host
    } else {
        Write-Host "❌ ملف env.example غير موجود!" -ForegroundColor Red
        exit 1
    }
}

# التحقق من node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 تثبيت Dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# تشغيل التطبيق
Write-Host "🌐 تشغيل التطبيق على http://localhost:3000" -ForegroundColor Green
Write-Host "💡 اضغطي Ctrl+C لإيقاف التطبيق" -ForegroundColor Yellow
Write-Host ""

npm run dev
