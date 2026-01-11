# Script لتحديد أن migrations تم تطبيقها (Baseline)
# استخدمي هذا إذا كانت قاعدة البيانات تحتوي بالفعل على الجداول

Write-Host "🔧 جاري عمل baseline للـ migrations..." -ForegroundColor Cyan

# تحديد أن migrations تم تطبيقها
Write-Host "`n✅ تحديد migration الأولى: 20251208104024_init" -ForegroundColor Yellow
npx prisma migrate resolve --applied 20251208104024_init

Write-Host "`n✅ تحديد migration الثانية: 20251209110515_add_subscription_plan" -ForegroundColor Yellow
npx prisma migrate resolve --applied 20251209110515_add_subscription_plan

Write-Host "`n✅ تحديد migration الثالثة: 20250110000000_add_test_type" -ForegroundColor Yellow
npx prisma migrate resolve --applied 20250110000000_add_test_type

Write-Host "`n✨ تم الانتهاء! الآن يمكنك تشغيل: npx prisma migrate deploy" -ForegroundColor Green
