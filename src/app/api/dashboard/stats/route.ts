import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

const isTableMissingError = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { code?: string }).code === "P2021"

/**
 * GET - جلب إحصائيات Dashboard للمعلم
 * يعرض: عدد الفصول، عدد الطالبات، عدد المحاولات الأسبوعية
 * إذا كان جدول training_attempts أو game_attempts غير موجود، تُعاد أصفار للإحصائيات المرتبطة.
 */
export async function GET() {
  try {
    const user = await requireTeacher()

    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToSaturday = dayOfWeek === 6 ? 0 : (6 - dayOfWeek) % 7
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - daysToSaturday)
    weekStart.setHours(0, 0, 0, 0)

    const classesCount = await prisma.class.count({
      where: { userId: user.id },
    })

    const studentsCount = await prisma.student.count({
      where: {
        class: { userId: user.id },
      },
    })

    const classFilter = { class: { userId: user.id } }

    let weeklyAttempts = 0
    let averageScore = 0
    let advancedStudentsCount = 0
    let needSupportCount = 0
    let weeklyActivities = 0
    let recentStudents: { nickname: string; latestScore: number; trend: number }[] = []

    try {
      weeklyAttempts = await prisma.trainingAttempt.count({
        where: {
          ...classFilter,
          completedAt: { gte: weekStart },
        },
      })

      const attempts = await prisma.trainingAttempt.findMany({
        where: classFilter,
        select: { percentage: true },
      })
      averageScore =
        attempts.length > 0
          ? Math.round(
              attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length
            )
          : 0

      const [advancedStudents, needSupportStudents] = await Promise.all([
        prisma.trainingAttempt.groupBy({
          by: ["nickname"],
          where: { ...classFilter, percentage: { gte: 80 } },
          _count: { nickname: true },
        }),
        prisma.trainingAttempt.groupBy({
          by: ["nickname"],
          where: { ...classFilter, percentage: { lt: 60 } },
          _count: { nickname: true },
        }),
      ])
      advancedStudentsCount = advancedStudents.length
      needSupportCount = needSupportStudents.length

      const latestAttemptsByStudent = await prisma.trainingAttempt.groupBy({
        by: ["nickname"],
        where: classFilter,
        _max: { completedAt: true },
      })

      recentStudents = await Promise.all(
        latestAttemptsByStudent.slice(0, 10).map(async (group) => {
          const studentAttempts = await prisma.trainingAttempt.findMany({
            where: {
              nickname: group.nickname,
              ...classFilter,
            },
            orderBy: { completedAt: "desc" },
            take: 2,
            select: { percentage: true },
          })
          const latest = studentAttempts[0]?.percentage || 0
          const previous = studentAttempts[1]?.percentage || 0
          return {
            nickname: group.nickname,
            latestScore: latest,
            trend: latest - previous,
          }
        })
      )
    } catch (trainingError) {
      if (isTableMissingError(trainingError)) {
        console.warn("training_attempts table missing; run docs/TRAINING_ATTEMPTS_MIGRATION.sql")
      } else {
        throw trainingError
      }
    }

    try {
      weeklyActivities = await prisma.gameAttempt.count({
        where: {
          ...classFilter,
          completedAt: { gte: weekStart },
        },
      })
    } catch (gameError) {
      if (isTableMissingError(gameError)) {
        console.warn("game_attempts table may be missing")
      } else {
        throw gameError
      }
    }

    return NextResponse.json({
      classesCount,
      studentsCount,
      weeklyAttempts,
      averageScore,
      advancedStudents: advancedStudentsCount,
      needSupportStudents: needSupportCount,
      weeklyActivities,
      recentStudents,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الإحصائيات" },
      { status: 500 }
    )
  }
}
