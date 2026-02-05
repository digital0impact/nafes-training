import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET - جلب قائمة نماذج الاختبارات المُرسلة للطالبة
 * Query: studentId = معرف الطالبة (id من جدول students)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json(
        { error: "معرف الطالبة مطلوب", modelIds: [] },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, classId: true, class: { select: { userId: true } } },
    })

    if (!student || !student.class) {
      return NextResponse.json({ modelIds: [] })
    }

    const teacherId = student.class.userId

    const allShares = await prisma.testShare.findMany({
      where: { userId: teacherId },
      select: { modelId: true, shareToAll: true, studentIds: true },
    })

    const modelIds: string[] = []
    for (const s of allShares) {
      if (s.shareToAll) {
        modelIds.push(s.modelId)
        continue
      }
      try {
        const ids = JSON.parse(s.studentIds) as string[]
        if (Array.isArray(ids) && ids.includes(studentId)) {
          modelIds.push(s.modelId)
        }
      } catch {
        // ignore invalid JSON
      }
    }

    return NextResponse.json({ modelIds })
  } catch (error) {
    console.error("Error fetching assigned tests:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الاختبارات", modelIds: [] },
      { status: 500 }
    )
  }
}
