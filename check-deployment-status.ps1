# سكريبت التحقق من حالة النشر والاستضافة
# قم بتشغيل هذا السكريبت من داخل مجلد nafes-training

Write-Host "`n=== تقرير حالة النشر والاستضافة ===" -ForegroundColor Cyan
Write-Host "تاريخ التحقق: $(Get-Date -Format 'yyyy-MM-dd HH:mm')`n" -ForegroundColor Gray

$allGood = $true

# 1. التحقق من Git
Write-Host "1. حالة Git:" -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "   ✅ Git مهيأ" -ForegroundColor Green
    
    # التحقق من المستودع البعيد
    try {
        $remote = git remote -v 2>&1
        if ($remote -and -not ($remote -match "fatal")) {
            Write-Host "   ✅ المستودع البعيد مضاف" -ForegroundColor Green
            Write-Host "   $($remote -split "`n" | Select-Object -First 1)" -ForegroundColor Cyan
            
            # محاولة التحقق من الاتصال
            $branch = git branch --show-current 2>&1
            if ($branch -and -not ($branch -match "fatal")) {
                Write-Host "   ✅ الفرع الحالي: $branch" -ForegroundColor Green
            }
        } else {
            Write-Host "   ⚠️  المستودع البعيد غير مضاف" -ForegroundColor Yellow
            Write-Host "   💡 قم بتنفيذ: .\setup-github.ps1" -ForegroundColor Cyan
            $allGood = $false
        }
    } catch {
        Write-Host "   ⚠️  لا يمكن التحقق من المستودع البعيد" -ForegroundColor Yellow
        $allGood = $false
    }
} else {
    Write-Host "   ❌ Git غير مهيأ" -ForegroundColor Red
    Write-Host "   💡 قم بتنفيذ: git init" -ForegroundColor Cyan
    $allGood = $false
}

Write-Host ""

# 2. التحقق من ملفات Vercel
Write-Host "2. ملفات إعداد Vercel:" -ForegroundColor Yellow
if (Test-Path "vercel.json") {
    Write-Host "   ✅ vercel.json موجود" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  vercel.json غير موجود" -ForegroundColor Yellow
    $allGood = $false
}

if (Test-Path "VERCEL_DEPLOYMENT.md") {
    Write-Host "   ✅ دليل النشر موجود" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  دليل النشر غير موجود" -ForegroundColor Yellow
}

Write-Host ""

# 3. التحقق من ملفات قاعدة البيانات
Write-Host "3. ملفات قاعدة البيانات:" -ForegroundColor Yellow
if (Test-Path "prisma/migrations") {
    $migrations = Get-ChildItem "prisma/migrations" -Directory | Measure-Object
    Write-Host "   ✅ Migrations موجودة ($($migrations.Count) migration)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  مجلد Migrations غير موجود" -ForegroundColor Yellow
    $allGood = $false
}

if (Test-Path "supabase/migrations") {
    $supabaseMigrations = Get-ChildItem "supabase/migrations" -File | Measure-Object
    Write-Host "   ✅ Supabase Migrations موجودة ($($supabaseMigrations.Count) ملف)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Supabase Migrations غير موجودة" -ForegroundColor Yellow
}

Write-Host ""

# 4. التحقق من ملف .env
Write-Host "4. ملفات البيئة:" -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ ملف .env موجود (محلي)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  ملف .env غير موجود (مطلوب للتطوير المحلي)" -ForegroundColor Yellow
}

if (Test-Path "env.example") {
    Write-Host "   ✅ ملف env.example موجود" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  ملف env.example غير موجود" -ForegroundColor Yellow
}

Write-Host ""

# 5. التحقق من البناء
Write-Host "5. التحقق من البناء:" -ForegroundColor Yellow
Write-Host "   💡 للتحقق من البناء، قم بتنفيذ: npm run build" -ForegroundColor Cyan

Write-Host ""

# 6. ملخص الحالة
Write-Host "=== ملخص الحالة ===" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "✅ جميع المتطلبات الأساسية جاهزة!" -ForegroundColor Green
    Write-Host ""
    Write-Host "الخطوات التالية:" -ForegroundColor Yellow
    Write-Host "1. رفع المشروع على GitHub (إذا لم يكن مرفوعاً)" -ForegroundColor White
    Write-Host "2. ربط المشروع مع Vercel" -ForegroundColor White
    Write-Host "3. إضافة متغيرات البيئة في Vercel" -ForegroundColor White
    Write-Host "4. النشر على Vercel" -ForegroundColor White
    Write-Host "5. تطبيق Migrations على قاعدة البيانات" -ForegroundColor White
} else {
    Write-Host "⚠️  هناك بعض المتطلبات المفقودة" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "راجع التقرير أعلاه وأكمل الخطوات المطلوبة" -ForegroundColor White
}

Write-Host ""
Write-Host "📖 للمزيد من التفاصيل:" -ForegroundColor Cyan
Write-Host "   - حالة_النشر.md: تقرير شامل عن حالة النشر" -ForegroundColor White
Write-Host "   - VERCEL_DEPLOYMENT.md: دليل النشر على Vercel" -ForegroundColor White
Write-Host "   - VERCEL_ENV_VARS.md: قائمة متغيرات البيئة" -ForegroundColor White
Write-Host "   - supabase/DEPLOYMENT.md: دليل نشر قاعدة البيانات" -ForegroundColor White
Write-Host ""
