-- جدول إتقان المهارات/المؤشرات للطالبة (student_mastery)
-- نفّذ هذا الملف على قاعدة البيانات إذا ظهر خطأ: The table `public.student_mastery` does not exist
--
-- طرق التنفيذ (بدون psql):
-- 1) من المشروع: npm run db:student-mastery   (يستخدم DATABASE_URL من .env)
-- 2) من Supabase: Dashboard → SQL Editor → الصق المحتوى وشغّل Run

CREATE TABLE IF NOT EXISTS "student_mastery" (
    "id" TEXT NOT NULL,
    "studentDbId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_mastery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "student_mastery_studentDbId_key_key" ON "student_mastery"("studentDbId", "key");
CREATE INDEX IF NOT EXISTS "student_mastery_studentDbId_idx" ON "student_mastery"("studentDbId");
CREATE INDEX IF NOT EXISTS "student_mastery_key_idx" ON "student_mastery"("key");

ALTER TABLE "student_mastery" ADD CONSTRAINT "student_mastery_studentDbId_fkey"
    FOREIGN KEY ("studentDbId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
