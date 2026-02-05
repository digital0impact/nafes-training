import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * GET - جلب مهارات/إتقان الطالبة (للاستخدام من واجهة الطالبة نفسها)
 * Query: studentId = id الطالبة (من جدول students)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json(
        { error: "معرف الطالبة مطلوب", mastery: [] },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, studentId: true, name: true },
    })

    if (!student) {
      return NextResponse.json({ mastery: [], student: null })
    }

    const mastery = await prisma.studentMastery.findMany({
      where: { studentDbId: student.id },
      orderBy: { updatedAt: "desc" },
      take: 500,
    })

    return NextResponse.json({
      student: {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
      },
      mastery,
    })
  } catch (error) {
    console.error("Error fetching student mastery:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المهارات", mastery: [] },
      { status: 500 }
    )
  }
}
