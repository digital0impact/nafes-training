import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

/**
 * GET - جلب مهارات/مؤشرات الإتقان لطالبة (للمعلم فقط)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireTeacher()

    // تأكد أن الطالبة تابعة للمعلم
    const student = await prisma.student.findFirst({
      where: {
        id: params.id,
        class: { userId: user.id },
      },
      select: { id: true, studentId: true, name: true },
    })

    if (!student) {
      return NextResponse.json(
        { error: "الطالبة غير موجودة" },
        { status: 404 }
      )
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
      { error: "حدث خطأ أثناء جلب المهارات" },
      { status: 500 }
    )
  }
}

