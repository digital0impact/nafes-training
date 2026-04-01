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
            studentDbId: true,
            student: {
              select: {
                name: true,
              },
            },
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
            // Use stable student ID when available to avoid merging/splitting
            // attempts by nickname changes or duplicate nicknames.
            const studentKey =
              attempt.studentDbId && attempt.studentDbId.trim().length > 0
                ? `student:${attempt.studentDbId}`
                : `nickname:${attempt.nickname}`
            const displayName = attempt.student?.name || attempt.nickname

            if (!acc[studentKey]) {
              acc[studentKey] = {
                nickname: attempt.nickname,
                displayName,
                attempts: 0,
                totalScore: 0,
                bestScore: 0,
                lastAttempt: null as Date | null,
              }
            }
            acc[studentKey].attempts++
            acc[studentKey].totalScore += attempt.percentage
            if (attempt.percentage > acc[studentKey].bestScore) {
              acc[studentKey].bestScore = attempt.percentage
            }
            if (
              !acc[studentKey].lastAttempt ||
              attempt.completedAt > acc[studentKey].lastAttempt!
            ) {
              acc[studentKey].lastAttempt = attempt.completedAt
            }
            return acc
          },
          {} as Record<
            string,
            {
              nickname: string
              displayName: string
              attempts: number
              totalScore: number
              bestScore: number
              lastAttempt: Date | null
            }
          >
        )

        const studentReports = Object.values(studentStats).map((stat) => ({
          nickname: stat.displayName || stat.nickname,
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
