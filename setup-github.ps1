# سكريبت ربط المشروع بـ GitHub
# قم بتشغيل هذا السكريبت من داخل مجلد nafes-training

Write-Host "=== ربط المشروع بـ GitHub ===" -ForegroundColor Green

# تحديث رابط المستودع البعيد
Write-Host "`n1. تحديث رابط المستودع البعيد..." -ForegroundColor Yellow
git remote set-url origin https://github.com/digital0impact/nafes-training.git

# التحقق من الإعداد
Write-Host "`n2. التحقق من إعدادات المستودع البعيد..." -ForegroundColor Yellow
git remote -v

# إضافة جميع الملفات
Write-Host "`n3. إضافة جميع الملفات..." -ForegroundColor Yellow
git add .

# إنشاء commit أولي
Write-Host "`n4. إنشاء commit أولي..." -ForegroundColor Yellow
git commit -m "Initial commit: تطبيق تدريب نافس"

# تعيين الفرع الرئيسي
Write-Host "`n5. تعيين الفرع الرئيسي..." -ForegroundColor Yellow
git branch -M main

# رفع الملفات إلى GitHub
Write-Host "`n6. رفع الملفات إلى GitHub..." -ForegroundColor Yellow
Write-Host "ملاحظة: قد تحتاج إلى إدخال بيانات اعتماد GitHub" -ForegroundColor Cyan
git push -u origin main

Write-Host "`n=== تم بنجاح! ===" -ForegroundColor Green
Write-Host "يمكنك الآن زيارة المستودع على: https://github.com/digital0impact/nafes-training" -ForegroundColor Cyan
