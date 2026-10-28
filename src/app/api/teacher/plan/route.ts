import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

/**
 * خطة نافس المخصصة للمعلمة الحالية (توزيع النواتج على الأسابيع وترتيبها).
 * عدم وجود خطة محفوظة يعني أن المعلمة تستخدم الخطة الافتراضية.
 *
 * يُنشأ جدول teacher_plans تلقائيًا عند أول استخدام، فلا يلزم تشغيل SQL يدويًا.
 * أمن الصفوف (RLS) مفعّل بلا سياسات، فلا يُقرأ الجدول من واجهة Supabase العامة،
 * ويصل إليه الخادم فقط عبر اتصال قاعدة البيانات.
 */

const MAX_PLAN_BYTES = 100_000

let tableReady: Promise<void> | null = null

function ensureTable() {
  if (!tableReady) {
    tableReady = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "teacher_plans" (
          "userId" TEXT PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "data" JSONB NOT NULL,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`)
      await prisma.$executeRawUnsafe(`ALTER TABLE "teacher_plans" ENABLE ROW LEVEL SECURITY`)
    })().catch((error) => {
      tableReady = null
      throw error
    })
  }
  return tableReady
}

async function getTeacher() {
  const user = await getCurrentUser()
  if (!user) return { error: NextResponse.json({ error: "غير مصرح" }, { status: 401 }) }
  if (user.role !== "teacher" && user.role !== "admin") {
    return { error: NextResponse.json({ error: "هذا الإجراء متاح للمعلمات فقط" }, { status: 403 }) }
  }
  return { user }
}

export async function GET() {
  try {
    const { user, error } = await getTeacher()
    if (error) return error

    await ensureTable()
    const rows = await prisma.$queryRaw<{ data: unknown }[]>`
      SELECT "data" FROM "teacher_plans" WHERE "userId" = ${user.id}`

    return NextResponse.json({ plan: rows[0]?.data ?? null })
  } catch (error) {
    console.error("خطأ في جلب خطة المعلمة:", error)
    return NextResponse.json({ error: "تعذر جلب الخطة" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error } = await getTeacher()
    if (error) return error

    const body = await request.json().catch(() => null)
    const plan = body?.plan
    if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
      return NextResponse.json({ error: "بيانات الخطة غير صحيحة" }, { status: 400 })
    }
    const json = JSON.stringify(plan)
    if (json.length > MAX_PLAN_BYTES) {
      return NextResponse.json({ error: "حجم الخطة أكبر من المسموح" }, { status: 413 })
    }

    await ensureTable()
    await prisma.$executeRaw`
      INSERT INTO "teacher_plans" ("userId", "data", "updatedAt")
      VALUES (${user.id}, ${json}::jsonb, CURRENT_TIMESTAMP)
      ON CONFLICT ("userId") DO UPDATE SET "data" = EXCLUDED."data", "updatedAt" = CURRENT_TIMESTAMP`

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("خطأ في حفظ خطة المعلمة:", error)
    return NextResponse.json({ error: "تعذر حفظ الخطة" }, { status: 500 })
  }
}

/** العودة إلى الخطة الافتراضية */
export async function DELETE() {
  try {
    const { user, error } = await getTeacher()
    if (error) return error

    await ensureTable()
    await prisma.$executeRaw`DELETE FROM "teacher_plans" WHERE "userId" = ${user.id}`

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("خطأ في إعادة تعيين خطة المعلمة:", error)
    return NextResponse.json({ error: "تعذر إعادة تعيين الخطة" }, { status: 500 })
  }
}
