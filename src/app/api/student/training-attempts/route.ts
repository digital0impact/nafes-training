import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET - جلب محاولات التدريب للطالبة (للاستخدام من واجهة الطالبة)
 * Query: studentId = id الطالبة (من جدول students)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId?.trim()) {
      return NextResponse.json(
        { error: "معرف الطالبة مطلوب", attempts: [] },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId.trim() },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json({ attempts: [] })
    }

    const attempts = await prisma.trainingAttempt.findMany({
      where: { studentDbId: student.id },
      orderBy: { completedAt: "desc" },
      take: 50,
    })

    return NextResponse.json({
      attempts: attempts.map((a) => ({
        id: a.id,
        testModelId: a.testModelId,
        testModelTitle: a.testModelTitle,
        score: a.score,
        totalQuestions: a.totalQuestions,
        percentage: a.percentage,
        timeSpent: a.timeSpent,
        completedAt: a.completedAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching student training attempts:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المحاولات", attempts: [] },
      { status: 500 }
    )
  }
}
