# سكريبت مساعد لنشر التطبيق على Vercel
# هذا السكريبت يساعدك في التحقق من الجاهزية قبل النشر

Write-Host "`n🚀 دليل النشر على Vercel - التحقق من الجاهزية`n" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# 1. التحقق من Git
Write-Host "1️⃣  التحقق من Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "   ✅ Git مهيأ" -ForegroundColor Green
    
    # التحقق من المستودع البعيد
    try {
        $remote = git remote -v 2>&1
        if ($remote -and -not ($remote -match "fatal")) {
            Write-Host "   ✅ المستودع البعيد مضاف" -ForegroundColor Green
            $remoteUrl = ($remote -split "`n" | Select-Object -First 1)
            Write-Host "   📍 $remoteUrl" -ForegroundColor Cyan
        } else {
            Write-Host "   ⚠️  المستودع البعيد غير مضاف" -ForegroundColor Yellow
            Write-Host "   💡 قم بتنفيذ: .\setup-github.ps1" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "   ⚠️  لا يمكن التحقق من المستودع البعيد" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Git غير مهيأ" -ForegroundColor Red
    Write-Host "   💡 قم بتنفيذ: git init" -ForegroundColor Cyan
}

Write-Host ""

# 2. التحقق من ملف .env
Write-Host "2️⃣  التحقق من ملف .env..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ ملف .env موجود (للتطوير المحلي)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  ملف .env غير موجود (مطلوب للتطوير المحلي فقط)" -ForegroundColor Yellow
    Write-Host "   💡 انسخي env.example إلى .env" -ForegroundColor Cyan
}

Write-Host ""

# 3. التحقق من ملفات Vercel
Write-Host "3️⃣  التحقق من ملفات Vercel..." -ForegroundColor Yellow
if (Test-Path "vercel.json") {
    Write-Host "   ✅ vercel.json موجود" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  vercel.json غير موجود" -ForegroundColor Yellow
}

if (Test-Path "VERCEL_DEPLOYMENT.md") {
    Write-Host "   ✅ دليل النشر موجود" -ForegroundColor Green
}

Write-Host ""

# 4. التحقق من Migrations
Write-Host "4️⃣  التحقق من Migrations..." -ForegroundColor Yellow
if (Test-Path "prisma/migrations") {
    $migrations = Get-ChildItem "prisma/migrations" -Directory | Measure-Object
    Write-Host "   ✅ Prisma Migrations موجودة ($($migrations.Count) migration)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Prisma Migrations غير موجودة" -ForegroundColor Yellow
}

if (Test-Path "supabase/migrations") {
    $supabaseMigrations = Get-ChildItem "supabase/migrations" -File | Measure-Object
    Write-Host "   ✅ Supabase Migrations موجودة ($($supabaseMigrations.Count) ملف)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Supabase Migrations غير موجودة" -ForegroundColor Yellow
}

Write-Host ""

# 5. عرض الخطوات التالية
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "📋 الخطوات التالية للنشر:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ✅ تأكدي من أن المشروع مرفوع على GitHub" -ForegroundColor White
Write-Host "   💡 إذا لم يكن: .\setup-github.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ✅ اذهبي إلى vercel.com وسجلي الدخول" -ForegroundColor White
Write-Host "   🔗 https://vercel.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. ✅ اضغطي 'Add New Project' واربطي المستودع" -ForegroundColor White
Write-Host ""
Write-Host "4. ✅ أضيفي متغيرات البيئة من Supabase:" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY" -ForegroundColor Gray
Write-Host "   - DATABASE_URL" -ForegroundColor Gray
Write-Host "   - NEXTAUTH_SECRET" -ForegroundColor Gray
Write-Host "   - NEXTAUTH_URL (بعد النشر)" -ForegroundColor Gray
Write-Host "   - SKIP_ENV_VALIDATION" -ForegroundColor Gray
Write-Host ""
Write-Host "5. ✅ اضغطي 'Deploy'" -ForegroundColor White
Write-Host ""
Write-Host "6. ✅ بعد النشر، طبقي Migrations على قاعدة البيانات" -ForegroundColor White
Write-Host ""
Write-Host "📖 للمزيد من التفاصيل:" -ForegroundColor Cyan
Write-Host "   - دليل_النشر_الخطوة_بخطوة.md" -ForegroundColor White
Write-Host "   - VERCEL_DEPLOYMENT.md" -ForegroundColor White
Write-Host "   - VERCEL_ENV_VARS.md" -ForegroundColor White
Write-Host ""

# 6. سؤال عن البناء
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
$buildCheck = Read-Host "هل تريدين التحقق من البناء الآن؟ (y/n)"
if ($buildCheck -eq "y" -or $buildCheck -eq "Y") {
    Write-Host ""
    Write-Host "🔨 جاري التحقق من البناء..." -ForegroundColor Yellow
    Write-Host ""
    
    # تنظيف البناء السابق
    if (Test-Path ".next") {
        Write-Host "🧹 تنظيف البناء السابق..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    }
    
    # البناء
    Write-Host "🔨 جاري البناء..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ البناء نجح! جاهز للنشر 🚀" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ البناء فشل. يجب إصلاح الأخطاء أولاً" -ForegroundColor Red
        Write-Host "💡 راجعي ملف FIX_BUILD_ERROR.md" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
