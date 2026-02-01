import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * فحص موحّد لاتصال التطبيق بـ Supabase (Auth/API) وقاعدة البيانات (Prisma/Postgres)
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
  const databaseUrl = process.env.DATABASE_URL

  const result: {
    success: boolean
    supabase: {
      ok: boolean
      message: string
      envOk: boolean
      reachable: boolean
      health?: { name?: string; version?: string }
    }
    database: {
      ok: boolean
      message: string
      envOk: boolean
      reachable: boolean
      stats?: {
        userCount: number
        classCount: number
        studentCount: number
        testCount: number
        activityCount: number
      }
    }
  } = {
    success: false,
    supabase: {
      ok: false,
      message: "",
      envOk: !!(supabaseUrl && supabaseAnonKey),
      reachable: false,
    },
    database: {
      ok: false,
      message: "",
      envOk: !!databaseUrl,
      reachable: false,
    },
  }

  // —— فحص Supabase (متغيرات البيئة + الوصول للـ API) ——
  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = []
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL")
    if (!supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
    result.supabase.message = `متغيرات البيئة ناقصة: ${missing.join(", ")}`
  } else {
    const base = supabaseUrl.replace(/\/$/, "")
    const healthUrl = `${base}/auth/v1/health`
    try {
      const res = await fetch(healthUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
      result.supabase.reachable = res.ok
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        result.supabase.health = {
          name: data.name,
          version: data.version,
        }
        result.supabase.message = "اتصال Supabase (Auth/API) يعمل بشكل صحيح"
        result.supabase.ok = true
      } else {
        result.supabase.message = `Supabase استجاب برمز ${res.status}. تحققي من الرابط والمفتاح.`
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ شبكة"
      result.supabase.message = `لا يمكن الوصول إلى Supabase: ${msg}`
    }
  }

  // —— فحص قاعدة البيانات (Prisma / Postgres) ——
  if (!databaseUrl) {
    result.database.message = "DATABASE_URL غير موجود في متغيرات البيئة"
  } else if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    result.database.message =
      "DATABASE_URL يجب أن يبدأ بـ postgresql:// أو postgres://"
  } else {
    try {
      await prisma.$connect()
      result.database.reachable = true

      const [userCount, classCount, studentCount, testCount, activityCount] =
        await Promise.all([
          prisma.user.count().catch(() => 0),
          prisma.class.count().catch(() => 0),
          prisma.student.count().catch(() => 0),
          prisma.testModel.count().catch(() => 0),
          prisma.activity.count().catch(() => 0),
        ])

      result.database.stats = {
        userCount,
        classCount,
        studentCount,
        testCount,
        activityCount,
      }
      result.database.message = "اتصال قاعدة البيانات (Prisma) يعمل بشكل صحيح"
      result.database.ok = true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطأ غير معروف"
      result.database.message = msg
      if (msg.includes("P1001") || msg.includes("Can't reach database server")) {
        result.database.message =
          "لا يمكن الوصول إلى خادم قاعدة البيانات. تحققي من DATABASE_URL واتصالك بالإنترنت وإعدادات SSL (مثل ?sslmode=require)."
      } else if (msg.includes("P1000")) {
        result.database.message = "فشل المصادقة. تحققي من كلمة مرور قاعدة البيانات."
      }
    } finally {
      await prisma.$disconnect().catch(() => {})
    }
  }

  result.success = result.supabase.ok && result.database.ok

  return NextResponse.json(result)
}
