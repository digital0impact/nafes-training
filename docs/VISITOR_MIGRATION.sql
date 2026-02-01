-- تطبيق دعم دور الزائر (Visitor/Reviewer) على قاعدة البيانات
-- الطريقة المفضلة: npx prisma migrate dev --name add_visitor_reviewer
-- أو نفّذ هذا الملف يدوياً إذا كنت لا تستخدم Prisma Migrate

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isDisabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "visitor_profiles" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "visitor_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "visitor_profiles_teacherId_visitorId_key" ON "visitor_profiles"("teacherId", "visitorId");
CREATE INDEX IF NOT EXISTS "visitor_profiles_visitorId_idx" ON "visitor_profiles"("visitorId");
CREATE INDEX IF NOT EXISTS "visitor_profiles_teacherId_idx" ON "visitor_profiles"("teacherId");
ALTER TABLE "visitor_profiles" ADD CONSTRAINT "visitor_profiles_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "visitor_profiles" ADD CONSTRAINT "visitor_profiles_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "visitor_comments" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visitor_comments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "visitor_comments_visitorId_idx" ON "visitor_comments"("visitorId");
CREATE INDEX IF NOT EXISTS "visitor_comments_targetType_targetId_idx" ON "visitor_comments"("targetType", "targetId");
ALTER TABLE "visitor_comments" ADD CONSTRAINT "visitor_comments_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
