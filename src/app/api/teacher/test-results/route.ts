import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

/**
 * GET - تقرير نتائج الطالبات لاختبار مرسل (حسب modelId)
 * ?modelId=prebuilt-1
 */
export async function GET(request: Request) {
  try {
    const user = await requireTeacher()
    const { searchParams } = new URL(request.url)
    const modelId = searchParams.get("modelId")

    if (!modelId || !modelId.trim()) {
      return NextResponse.json(
        { error: "معرف النموذج مطلوب (modelId)" },
        { status: 400 }
      )
    }

    // التأكد أن هذا النموذج مُرسل من المعلم
    const share = await prisma.testShare.findUnique({
      where: {
        userId_modelId: { userId: user.id, modelId: modelId.trim() },
      },
    })
    if (!share) {
      return NextResponse.json(
        { error: "لم يتم إرسال هذا الاختبار أو لا يخصك" },
        { status: 404 }
      )
    }

    // محاولات الطالبات: testModelId مطابق أو من نوع custom-xxx-modelId
    const suffix = `-${modelId}`
    const attempts = await prisma.trainingAttempt.findMany({
      where: {
        class: { userId: user.id },
        OR: [
          { testModelId: modelId },
          { testModelId: { endsWith: suffix } },
        ],
      },
      orderBy: { completedAt: "desc" },
      include: {
        student: { select: { name: true } },
      },
    })

    const list = attempts.map((a) => ({
      id: a.id,
      studentName: a.student?.name ?? a.nickname,
      nickname: a.nickname,
      score: a.score,
      totalQuestions: a.totalQuestions,
      percentage: a.percentage,
      timeSpent: a.timeSpent,
      completedAt: a.completedAt,
    }))

    return NextResponse.json({
      modelId,
      testTitle: attempts[0]?.testModelTitle ?? null,
      attempts: list,
    })
  } catch (error) {
    console.error("Error fetching test results:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب تقرير النتائج" },
      { status: 500 }
    )
  }
}
