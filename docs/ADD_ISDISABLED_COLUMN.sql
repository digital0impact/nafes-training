-- إضافة عمود isDisabled لجدول users (إصلاح خطأ بعد النشر على Vercel)
-- نفّذ هذا الملف مرة واحدة على قاعدة البيانات الإنتاجية (PostgreSQL)

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isDisabled" BOOLEAN NOT NULL DEFAULT false;
