import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

/**
 * GET - جلب تقارير الفصول للمعلم
 * يعرض عدد المحاولات ومتوسط الدرجات لكل فصل
 */
export async function GET() {
  try {
    const user = await requireTeacher()

    // جلب جميع فصول المعلم
    const classes = await prisma.class.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            trainingAttempts: true,
          },
        },
      },
    })

    // جلب إحصائيات كل فصل
    const reports = await Promise.all(
      classes.map(async (classData) => {
        const attempts = await prisma.trainingAttempt.findMany({
          where: {
            classId: classData.id,
          },
          select: {
            score: true,
            totalQuestions: true,
            percentage: true,
            completedAt: true,
            nickname: true,
          },
        })

        const totalAttempts = attempts.length
        const averageScore =
          totalAttempts > 0
            ? attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
            : 0

        // إحصائيات حسب الطالب (الاسم المستعار)
        const studentStats = attempts.reduce(
          (acc, attempt) => {
            if (!acc[attempt.nickname]) {
              acc[attempt.nickname] = {
                nickname: attempt.nickname,
                attempts: 0,
                totalScore: 0,
                bestScore: 0,
                lastAttempt: null as Date | null,
              }
            }
            acc[attempt.nickname].attempts++
            acc[attempt.nickname].totalScore += attempt.percentage
            if (attempt.percentage > acc[attempt.nickname].bestScore) {
              acc[attempt.nickname].bestScore = attempt.percentage
            }
            if (
              !acc[attempt.nickname].lastAttempt ||
              attempt.completedAt > acc[attempt.nickname].lastAttempt!
            ) {
              acc[attempt.nickname].lastAttempt = attempt.completedAt
            }
            return acc
          },
          {} as Record<
            string,
            {
              nickname: string
              attempts: number
              totalScore: number
              bestScore: number
              lastAttempt: Date | null
            }
          >
        )

        const studentReports = Object.values(studentStats).map((stat) => ({
          nickname: stat.nickname,
          attempts: stat.attempts,
          averageScore: Math.round((stat.totalScore / stat.attempts) * 100) / 100,
          bestScore: stat.bestScore,
          lastAttempt: stat.lastAttempt,
        }))

        return {
          classId: classData.id,
          className: classData.name,
          classCode: classData.code,
          grade: classData.grade,
          totalAttempts,
          averageScore: Math.round(averageScore * 100) / 100,
          studentReports: studentReports.sort(
            (a, b) => b.averageScore - a.averageScore
          ),
        }
      })
    )

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب التقارير" },
      { status: 500 }
    )
  }
}
