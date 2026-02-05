import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET - جلب نموذج اختبار (مخصص من DB) للطالبة إذا كان مُشاراً معها
 * Query: studentId = id الطالبة
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: modelId } = await params
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json(
        { error: "معرف الطالبة مطلوب" },
        { status: 400 }
      )
    }

    const testModel = await prisma.testModel.findUnique({
      where: { id: modelId },
    })

    if (!testModel) {
      return NextResponse.json(
        { error: "النموذج غير موجود" },
        { status: 404 }
      )
    }

    const share = await prisma.testShare.findFirst({
      where: {
        modelId,
        userId: testModel.userId,
      },
    })

    if (!share) {
      return NextResponse.json(
        { error: "هذا الاختبار غير مُشار معك" },
        { status: 403 }
      )
    }

    if (share.shareToAll) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { class: { select: { userId: true } } },
      })
      if (!student || student.class?.userId !== share.userId) {
        return NextResponse.json(
          { error: "هذا الاختبار غير مُشار معك" },
          { status: 403 }
        )
      }
    } else {
      try {
        const ids = JSON.parse(share.studentIds) as string[]
        if (!Array.isArray(ids) || !ids.includes(studentId)) {
          return NextResponse.json(
            { error: "هذا الاختبار غير مُشار معك" },
            { status: 403 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: "هذا الاختبار غير مُشار معك" },
          { status: 403 }
        )
      }
    }

    const modelWithParsedData = {
      ...testModel,
      weeks: testModel.weeks ? JSON.parse(testModel.weeks) : [],
      relatedOutcomes: testModel.relatedOutcomes
        ? JSON.parse(testModel.relatedOutcomes)
        : [],
      questionIds: testModel.questionIds ? JSON.parse(testModel.questionIds) : [],
    }

    return NextResponse.json(modelWithParsedData)
  } catch (error) {
    console.error("Failed to fetch shared test model", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب النموذج" },
      { status: 500 }
    )
  }
}
