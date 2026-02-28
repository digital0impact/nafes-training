-- جدول دعوات الزوار (رابط الدعوة الذي ينشئه المعلم)
-- نفّذ هذا الملف على قاعدة البيانات إذا ظهر خطأ: The table `public.visitor_invites` does not exist
--
-- طرق التنفيذ:
-- 1) من المشروع: npx prisma migrate dev --name add_visitor_invites
-- 2) من Supabase: Dashboard → SQL Editor → الصق المحتوى وشغّل Run

CREATE TABLE IF NOT EXISTS "visitor_invites" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "visitor_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "visitor_invites_token_key" ON "visitor_invites"("token");
CREATE INDEX IF NOT EXISTS "visitor_invites_teacherId_idx" ON "visitor_invites"("teacherId");
CREATE INDEX IF NOT EXISTS "visitor_invites_token_idx" ON "visitor_invites"("token");

ALTER TABLE "visitor_invites" ADD CONSTRAINT "visitor_invites_teacherId_fkey"
    FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
