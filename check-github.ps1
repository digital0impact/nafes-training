# سكريبت التحقق من حالة ربط المشروع بـ GitHub
# قم بتشغيل هذا السكريبت من داخل مجلد nafes-training

Write-Host "=== التحقق من حالة ربط المشروع بـ GitHub ===" -ForegroundColor Green
Write-Host ""

# التحقق من وجود Git
Write-Host "1. التحقق من وجود Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "   ✅ Git مثبت: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Git غير مثبت. يرجى تثبيت Git أولاً." -ForegroundColor Red
    exit 1
}

Write-Host ""

# التحقق من تهيئة Git
Write-Host "2. التحقق من تهيئة Git..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "   ✅ Git مهيأ" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Git غير مهيأ. قم بتنفيذ: git init" -ForegroundColor Yellow
}

Write-Host ""

# التحقق من المستودع البعيد
Write-Host "3. التحقق من المستودع البعيد..." -ForegroundColor Yellow
try {
    $remote = git remote -v 2>&1
    if ($remote) {
        Write-Host "   ✅ المستودع البعيد مضاف:" -ForegroundColor Green
        Write-Host "   $remote" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  المستودع البعيد غير مضاف" -ForegroundColor Yellow
        Write-Host "   قم بإضافته باستخدام:" -ForegroundColor Yellow
        Write-Host "   git remote add origin https://github.com/digital0impact/nafes-training.git" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  لا يمكن التحقق من المستودع البعيد" -ForegroundColor Yellow
}

Write-Host ""

# التحقق من الفروع
Write-Host "4. التحقق من الفروع..." -ForegroundColor Yellow
try {
    $branches = git branch 2>&1
    if ($branches) {
        Write-Host "   ✅ الفروع المتاحة:" -ForegroundColor Green
        Write-Host "   $branches" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  لا توجد فروع. قم بإنشاء commit أولاً" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  لا يمكن التحقق من الفروع" -ForegroundColor Yellow
}

Write-Host ""

# التحقق من حالة الملفات
Write-Host "5. التحقق من حالة الملفات..." -ForegroundColor Yellow
try {
    $status = git status --short 2>&1
    if ($status) {
        Write-Host "   ⚠️  هناك ملفات غير متابعة أو معدلة:" -ForegroundColor Yellow
        Write-Host "   $status" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   قم بإضافتها باستخدام: git add ." -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ جميع الملفات متابعة" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  لا يمكن التحقق من حالة الملفات" -ForegroundColor Yellow
}

Write-Host ""

# التحقق من وجود Commits
Write-Host "6. التحقق من وجود Commits..." -ForegroundColor Yellow
try {
    $commits = git log --oneline -1 2>&1
    if ($commits -and -not ($commits -match "fatal")) {
        Write-Host "   ✅ آخر Commit:" -ForegroundColor Green
        Write-Host "   $commits" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  لا توجد Commits. قم بإنشاء commit أولاً:" -ForegroundColor Yellow
        Write-Host "   git add ." -ForegroundColor Cyan
        Write-Host "   git commit -m 'Initial commit: تطبيق تدريب نافس'" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  لا يمكن التحقق من Commits" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== انتهى التحقق ===" -ForegroundColor Green
Write-Host ""
Write-Host "للمزيد من المعلومات، راجع:" -ForegroundColor Cyan
Write-Host "- GITHUB_REVIEW.md: تقرير شامل عن حالة الربط" -ForegroundColor Cyan
Write-Host "- GITHUB_COMMANDS.md: أوامر سريعة للرفع" -ForegroundColor Cyan
Write-Host "- setup-github.ps1: سكريبت تلقائي للربط" -ForegroundColor Cyan
