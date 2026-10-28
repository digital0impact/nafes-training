-- جدول خطة نافس المخصصة لكل معلمة (توزيع نواتج التعلم على الأسابيع)
-- يُنشأ تلقائيًا من المسار /api/teacher/plan عند أول استخدام، وهذا الملف للمرجع أو للتنفيذ اليدوي.
-- عدم وجود سجل للمعلمة يعني أنها تستخدم الخطة الافتراضية.

CREATE TABLE IF NOT EXISTS "teacher_plans" (
    "userId" TEXT PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- لا سياسات: الجدول غير متاح من واجهة Supabase العامة، ويصل إليه الخادم فقط
ALTER TABLE "teacher_plans" ENABLE ROW LEVEL SECURITY;
