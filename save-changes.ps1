# Script لحفظ التغييرات في Git

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   حفظ التغييرات في Git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# عرض حالة Git
Write-Host "📋 حالة Git الحالية:" -ForegroundColor Yellow
git status --short
Write-Host ""

# عرض الملفات المعدلة
Write-Host "📝 الملفات المعدلة:" -ForegroundColor Yellow
git diff --name-only
Write-Host ""

# عرض الملفات الجديدة
Write-Host "➕ الملفات الجديدة:" -ForegroundColor Yellow
git ls-files --others --exclude-standard
Write-Host ""

# السؤال عن الإجراء
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ماذا تريدين فعله؟" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. إضافة جميع التغييرات والملفات الجديدة" -ForegroundColor White
Write-Host "2. إضافة الملفات المعدلة فقط" -ForegroundColor White
Write-Host "3. إضافة ملفات محددة" -ForegroundColor White
Write-Host "4. عرض التغييرات فقط (بدون حفظ)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "اختيارك (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "➕ إضافة جميع التغييرات..." -ForegroundColor Yellow
        git add .
        Write-Host "✅ تم إضافة جميع الملفات" -ForegroundColor Green
        Write-Host ""
        
        $commitMessage = Read-Host "أدخلي رسالة commit (أو اضغطي Enter للرسالة الافتراضية)"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "Update: حفظ التغييرات الأخيرة"
        }
        
        Write-Host ""
        Write-Host "💾 عمل commit..." -ForegroundColor Yellow
        git commit -m $commitMessage
        Write-Host "✅ تم حفظ التغييرات" -ForegroundColor Green
        Write-Host ""
        
        $push = Read-Host "هل تريدين رفع التغييرات إلى GitHub؟ (y/n)"
        if ($push -eq 'y' -or $push -eq 'Y') {
            Write-Host ""
            Write-Host "🚀 رفع التغييرات..." -ForegroundColor Yellow
            git push
            Write-Host "✅ تم رفع التغييرات" -ForegroundColor Green
        }
    }
    "2" {
        Write-Host ""
        Write-Host "➕ إضافة الملفات المعدلة فقط..." -ForegroundColor Yellow
        git add -u
        Write-Host "✅ تم إضافة الملفات المعدلة" -ForegroundColor Green
        Write-Host ""
        
        $commitMessage = Read-Host "أدخلي رسالة commit"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "Update: تحديث الملفات المعدلة"
        }
        
        Write-Host ""
        Write-Host "💾 عمل commit..." -ForegroundColor Yellow
        git commit -m $commitMessage
        Write-Host "✅ تم حفظ التغييرات" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "📋 الملفات المتاحة:" -ForegroundColor Yellow
        git status --short
        Write-Host ""
        $files = Read-Host "أدخلي أسماء الملفات (مفصولة بمسافة)"
        if ($files) {
            git add $files
            Write-Host "✅ تم إضافة الملفات المحددة" -ForegroundColor Green
            Write-Host ""
            $commitMessage = Read-Host "أدخلي رسالة commit"
            git commit -m $commitMessage
        }
    }
    "4" {
        Write-Host ""
        Write-Host "📝 عرض التغييرات:" -ForegroundColor Yellow
        git diff
    }
    default {
        Write-Host "❌ اختيار غير صحيح" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   الحالة النهائية:" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
git status --short
