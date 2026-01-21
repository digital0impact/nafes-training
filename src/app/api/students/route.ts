import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

/**
 * GET - جلب جميع طالبات المعلم
 */
export async function GET() {
  try {
    const user = await requireTeacher()

    const students = await prisma.student.findMany({
      where: {
        class: {
          userId: user.id,
        },
      },
      select: {
        id: true,
        studentId: true,
        name: true,
        grade: true,
        classCode: true,
        classId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الطالبات" },
      { status: 500 }
    )
  }
}
