# Script لإضافة جميع التغييرات المهمة إلى Git

Write-Host "📦 إضافة التغييرات إلى Git..." -ForegroundColor Cyan
Write-Host ""

# إضافة الملفات المعدلة المهمة
Write-Host "➕ إضافة الملفات المعدلة..." -ForegroundColor Yellow
git add src/app/student/page.tsx
git add src/app/student/activities/page.tsx
git add src/app/student/activities/[id]/page.tsx
git add src/app/student/simulation/select/page.tsx
git add src/app/teacher/tests/create/page.tsx
git add src/app/teacher/tests/create-diagnostic/page.tsx
git add src/app/teacher/outcomes/page.tsx
git add src/components/ui/card.tsx
git add src/components/student/student-auth-guard.tsx
git add src/components/student/index.ts
git add tsconfig.json
git add package.json
git add package-lock.json
git add .gitignore

# إضافة الملف المحذوف (حذف الملف المكرر)
Write-Host "🗑️  إضافة حذف الملف المكرر..." -ForegroundColor Yellow
git add src/components/auth/student-auth-guard.tsx

# إضافة ملفات التصحيح الأخرى
git add src/app/debug-login/page.tsx
git add src/app/debug-signup/page.tsx
git add scripts/debug-env.ts

Write-Host ""
Write-Host "✅ تم إضافة الملفات المهمة" -ForegroundColor Green
Write-Host ""
Write-Host "📋 حالة Git:" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "💡 الخطوة التالية:" -ForegroundColor Yellow
Write-Host "   git commit -m 'Fix: Add student auth guard and fix build errors'" -ForegroundColor Gray
Write-Host "   git push" -ForegroundColor Gray
