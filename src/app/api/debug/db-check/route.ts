import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * API Route لفحص اتصال قاعدة البيانات
 */
export async function GET() {
  try {
    // التحقق من وجود DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL
    const envVars = {
      DATABASE_URL: !!databaseUrl,
    }

    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: "DATABASE_URL غير موجود في ملف .env",
        envVars,
      })
    }

    // محاولة الاتصال بقاعدة البيانات
    await prisma.$connect()

    // جلب الإحصائيات
    const [userCount, classCount, studentCount, testCount, activityCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.class.count().catch(() => 0),
      prisma.student.count().catch(() => 0),
      prisma.testModel.count().catch(() => 0),
      prisma.activity.count().catch(() => 0),
    ])

    // جلب آخر المستخدمين
    const recentUsers = await prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionPlan: true,
      },
    }).catch(() => [])

    // جلب آخر الفصول
    const recentClasses = await prisma.class.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        code: true,
        name: true,
        grade: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    }).catch(() => [])

    return NextResponse.json({
      success: true,
      envVars: {
        DATABASE_URL: databaseUrl.substring(0, 30) + "..." + databaseUrl.substring(databaseUrl.length - 10),
      },
      stats: {
        userCount,
        classCount,
        studentCount,
        testCount,
        activityCount,
      },
      recentUsers,
      recentClasses,
    })
  } catch (error: any) {
    console.error("Database check error:", error)

    let errorMessage = error.message || "حدث خطأ أثناء الاتصال بقاعدة البيانات"

    // رسائل خطأ محددة
    if (error.message?.includes("P1001")) {
      errorMessage = "لا يمكن الوصول إلى خادم قاعدة البيانات. تأكدي من أن Supabase يعمل."
    } else if (error.message?.includes("P1000")) {
      errorMessage = "فشل المصادقة. تأكدي من أن كلمة مرور قاعدة البيانات صحيحة."
    } else if (error.message?.includes("P1017")) {
      errorMessage = "انقطع الاتصال بخادم قاعدة البيانات. جربي مرة أخرى."
    } else if (error.message?.includes('env("DATABASE_URL")')) {
      errorMessage = "DATABASE_URL غير موجود في ملف .env"
    } else if (error.message?.includes("Can't reach database server")) {
      errorMessage = "لا يمكن الوصول إلى خادم قاعدة البيانات. تحققي من الاتصال بالإنترنت."
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        envVars: {
          DATABASE_URL: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}
