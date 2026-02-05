-- جدول مشاركة نماذج الاختبارات مع الطالبات (إرسال الاختبار)
-- نفّذ هذا الملف مرة واحدة على قاعدة البيانات ثم شغّل: npx prisma generate

CREATE TABLE IF NOT EXISTS "test_shares" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareToAll" BOOLEAN NOT NULL DEFAULT false,
    "studentIds" TEXT NOT NULL,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_shares_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "test_shares_userId_modelId_key" ON "test_shares"("userId", "modelId");
CREATE INDEX IF NOT EXISTS "test_shares_userId_idx" ON "test_shares"("userId");
CREATE INDEX IF NOT EXISTS "test_shares_modelId_idx" ON "test_shares"("modelId");

ALTER TABLE "test_shares" ADD CONSTRAINT "test_shares_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
