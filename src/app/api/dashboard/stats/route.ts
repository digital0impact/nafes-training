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

    // حساب متوسط الدرجات
    const attempts = await prisma.trainingAttempt.findMany({
      where: {
        class: {
          userId: user.id,
        },
      },
      select: {
        percentage: true,
      },
    })

    const averageScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / attempts.length)
      : 0

    // عدد الطالبات المتقدمات (درجة أعلى من 80%)
    const advancedStudents = await prisma.trainingAttempt.groupBy({
      by: ['nickname'],
      where: {
        class: {
          userId: user.id,
        },
        percentage: {
          gte: 80,
        },
      },
      _count: {
        nickname: true,
      },
    })

    // عدد الطالبات بحاجة لدعم (درجة أقل من 60%)
    const needSupportStudents = await prisma.trainingAttempt.groupBy({
      by: ['nickname'],
      where: {
        class: {
          userId: user.id,
        },
        percentage: {
          lt: 60,
        },
      },
      _count: {
        nickname: true,
      },
    })

    // عدد الألعاب المنجزة هذا الأسبوع
    const weeklyActivities = await prisma.gameAttempt.count({
      where: {
        class: {
          userId: user.id,
        },
        completedAt: {
          gte: weekStart,
        },
      },
    })

    // جلب آخر المحاولات مع درجاتهن
    // استخدام groupBy للحصول على آخر محاولة لكل طالبة
    const latestAttemptsByStudent = await prisma.trainingAttempt.groupBy({
      by: ['nickname'],
      where: {
        class: {
          userId: user.id,
        },
      },
      _max: {
        completedAt: true,
      },
    })

    // جلب آخر محاولتين لكل طالبة (أول 10 طالبات)
    const studentsWithStats = await Promise.all(
      latestAttemptsByStudent.slice(0, 10).map(async (group) => {
        const studentAttempts = await prisma.trainingAttempt.findMany({
          where: {
            nickname: group.nickname,
            class: {
              userId: user.id,
            },
          },
          orderBy: {
            completedAt: 'desc',
          },
          take: 2,
          select: {
            percentage: true,
          },
        })

        const latest = studentAttempts[0]?.percentage || 0
        const previous = studentAttempts[1]?.percentage || 0
        const trend = latest - previous

        return {
          nickname: group.nickname,
          latestScore: latest,
          trend: trend,
        }
      })
    )

    return NextResponse.json({
      classesCount,
      studentsCount,
      weeklyAttempts,
      averageScore,
      advancedStudents: advancedStudents.length,
      needSupportStudents: needSupportStudents.length,
      weeklyActivities,
      recentStudents: studentsWithStats,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإحصائيات" },
      { status: 500 }
    )
  }
}
