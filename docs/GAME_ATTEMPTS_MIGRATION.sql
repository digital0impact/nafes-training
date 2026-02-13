-- جدول محاولات الألعاب التعليمية (game_attempts)
-- نفّذ هذا الملف على قاعدة البيانات إذا ظهر خطأ 500 عند إنهاء لعبة
-- (مثل: relation "game_attempts" does not exist)
--
-- طرق التنفيذ:
-- 1) من Supabase: Dashboard → SQL Editor → الصق المحتوى وشغّل Run
-- 2) من المشروع: psql $DATABASE_URL -f docs/GAME_ATTEMPTS_MIGRATION.sql

CREATE TABLE IF NOT EXISTS "game_attempts" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "classCode" TEXT NOT NULL,
    "classId" TEXT,
    "studentDbId" TEXT,
    "gameId" TEXT NOT NULL,
    "gameTitle" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "answers" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "game_attempts_classCode_idx" ON "game_attempts"("classCode");
CREATE INDEX IF NOT EXISTS "game_attempts_classId_idx" ON "game_attempts"("classId");
CREATE INDEX IF NOT EXISTS "game_attempts_studentDbId_idx" ON "game_attempts"("studentDbId");
CREATE INDEX IF NOT EXISTS "game_attempts_gameId_idx" ON "game_attempts"("gameId");
CREATE INDEX IF NOT EXISTS "game_attempts_completedAt_idx" ON "game_attempts"("completedAt");
CREATE INDEX IF NOT EXISTS "game_attempts_nickname_idx" ON "game_attempts"("nickname");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'game_attempts_classId_fkey'
  ) THEN
    ALTER TABLE "game_attempts" ADD CONSTRAINT "game_attempts_classId_fkey"
      FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'game_attempts_studentDbId_fkey'
  ) THEN
    ALTER TABLE "game_attempts" ADD CONSTRAINT "game_attempts_studentDbId_fkey"
      FOREIGN KEY ("studentDbId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
