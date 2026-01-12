# Script للتحقق من جاهزية المشروع للبناء

Write-Host "🔍 التحقق من جاهزية المشروع للبناء..." -ForegroundColor Cyan
Write-Host ""

# التحقق من الملفات المهمة
Write-Host "📁 التحقق من الملفات المهمة..." -ForegroundColor Yellow
$requiredFiles = @(
    "src/components/student/student-auth-guard.tsx",
    "src/components/student/index.ts",
    "src/app/student/page.tsx",
    "package.json",
    "tsconfig.json",
    "vercel.json",
    "prisma/schema.prisma"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file غير موجود!" -ForegroundColor Red
        $missingFiles += $file
    }
}

Write-Host ""

# التحقق من Git
Write-Host "📦 التحقق من Git..." -ForegroundColor Yellow
$gitFiles = @(
    "src/components/student/student-auth-guard.tsx",
    "src/components/student/index.ts"
)

$missingInGit = @()
foreach ($file in $gitFiles) {
    if (Test-Path $file) {
        $gitStatus = git ls-files $file 2>&1
        if ($LASTEXITCODE -eq 0 -and $gitStatus) {
            Write-Host "✅ $file موجود في Git" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $file غير موجود في Git!" -ForegroundColor Yellow
            $missingInGit += $file
        }
    }
}

Write-Host ""

# التحقق من الاستيراد
Write-Host "📝 التحقق من الاستيراد..." -ForegroundColor Yellow
$pageContent = Get-Content "src/app/student/page.tsx" -Raw
if ($pageContent -match '@/components/student["\']') {
    Write-Host "✅ الاستيراد صحيح (يستخدم @/components/student)" -ForegroundColor Green
} else {
    Write-Host "⚠️  تحققي من الاستيراد في src/app/student/page.tsx" -ForegroundColor Yellow
}

Write-Host ""

# التحقق من package.json
Write-Host "📋 التحقق من package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if ($packageJson.scripts.build -eq "prisma generate && next build") {
    Write-Host "✅ build script صحيح" -ForegroundColor Green
} else {
    Write-Host "⚠️  build script: $($packageJson.scripts.build)" -ForegroundColor Yellow
}

Write-Host ""

# ملخص
Write-Host "📊 الملخص:" -ForegroundColor Cyan
if ($missingFiles.Count -eq 0 -and $missingInGit.Count -eq 0) {
    Write-Host "✅ جميع الملفات موجودة وجاهزة!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 الخطوة التالية:" -ForegroundColor Yellow
    Write-Host "   1. تأكدي من أن البناء يعمل محلياً: npm run build" -ForegroundColor Gray
    Write-Host "   2. تأكدي من أن جميع التغييرات مرفوعة: git push" -ForegroundColor Gray
    Write-Host "   3. تحققي من متغيرات البيئة في Vercel" -ForegroundColor Gray
} else {
    if ($missingFiles.Count -gt 0) {
        Write-Host "❌ الملفات التالية غير موجودة:" -ForegroundColor Red
        foreach ($file in $missingFiles) {
            Write-Host "   - $file" -ForegroundColor Red
        }
    }
    if ($missingInGit.Count -gt 0) {
        Write-Host "⚠️  الملفات التالية غير موجودة في Git:" -ForegroundColor Yellow
        foreach ($file in $missingInGit) {
            Write-Host "   - $file" -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "💡 قومي بإضافة الملفات:" -ForegroundColor Cyan
        Write-Host "   git add $($missingInGit -join ' ')" -ForegroundColor Gray
        Write-Host "   git commit -m 'Add missing files'" -ForegroundColor Gray
        Write-Host "   git push" -ForegroundColor Gray
    }
}
