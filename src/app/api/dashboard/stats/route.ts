import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

/**
 * GET - جلب إحصائيات Dashboard للمعلم
 * يعرض: عدد الفصول، عدد الطالبات، عدد المحاولات الأسبوعية
 */
export async function GET() {
  try {
    const user = await requireTeacher()

    // حساب تاريخ بداية الأسبوع (السبت)
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = الأحد، 6 = السبت
    const daysToSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek) % 7
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysToSaturday)
    weekStart.setHours(0, 0, 0, 0)

    // جلب عدد الفصول
    const classesCount = await prisma.class.count({
      where: {
        userId: user.id,
      },
    })

    // جلب عدد الطالبات (من جميع الفصول)
    const studentsCount = await prisma.student.count({
      where: {
        class: {
          userId: user.id,
        },
      },
    })

    // جلب عدد المحاولات الأسبوعية
    const weeklyAttempts = await prisma.trainingAttempt.count({
      where: {
        class: {
          userId: user.id,
        },
        completedAt: {
          gte: weekStart,
        },
      },
    })

    return NextResponse.json({
      classesCount,
      studentsCount,
      weeklyAttempts,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإحصائيات" },
      { status: 500 }
    )
  }
}
