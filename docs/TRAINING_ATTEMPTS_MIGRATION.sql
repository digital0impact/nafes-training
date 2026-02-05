-- جدول محاولات التدريب (اختبارات المحاكاة)
-- نفّذ هذا الملف على قاعدة البيانات إذا ظهر خطأ: The table `public.training_attempts` does not exist
--
-- طرق التنفيذ (بدون psql):
-- 1) من المشروع: npm run db:training-attempts   (يستخدم DATABASE_URL من .env)
-- 2) من Supabase: Dashboard → SQL Editor → الصق المحتوى وشغّل Run

CREATE TABLE IF NOT EXISTS "training_attempts" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "classCode" TEXT NOT NULL,
    "classId" TEXT,
    "studentDbId" TEXT,
    "testModelId" TEXT,
    "testModelTitle" TEXT,
    "answers" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "training_attempts_classCode_idx" ON "training_attempts"("classCode");
CREATE INDEX IF NOT EXISTS "training_attempts_classId_idx" ON "training_attempts"("classId");
CREATE INDEX IF NOT EXISTS "training_attempts_studentDbId_idx" ON "training_attempts"("studentDbId");
CREATE INDEX IF NOT EXISTS "training_attempts_completedAt_idx" ON "training_attempts"("completedAt");

ALTER TABLE "training_attempts" ADD CONSTRAINT "training_attempts_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "training_attempts" ADD CONSTRAINT "training_attempts_studentDbId_fkey"
    FOREIGN KEY ("studentDbId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
