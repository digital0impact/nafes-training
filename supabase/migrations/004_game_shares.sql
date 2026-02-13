-- جدول مشاركة الألعاب التعليمية مع الطالبات (game_shares)
-- يلزم وجود جداول users و classes في نفس القاعدة

CREATE TABLE IF NOT EXISTS "game_shares" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shareToAll" BOOLEAN NOT NULL DEFAULT false,
    "studentIds" TEXT NOT NULL,
    "classId" TEXT,
    "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_shares_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "game_shares_gameId_idx" ON "game_shares"("gameId");
CREATE INDEX IF NOT EXISTS "game_shares_userId_idx" ON "game_shares"("userId");
CREATE INDEX IF NOT EXISTS "game_shares_classId_idx" ON "game_shares"("classId");
CREATE INDEX IF NOT EXISTS "game_shares_sharedAt_idx" ON "game_shares"("sharedAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'game_shares_userId_fkey'
  ) THEN
    ALTER TABLE "game_shares" ADD CONSTRAINT "game_shares_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'game_shares_classId_fkey'
  ) THEN
    ALTER TABLE "game_shares" ADD CONSTRAINT "game_shares_classId_fkey"
      FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
