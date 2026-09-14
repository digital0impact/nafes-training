import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { currentYearClassFilter, getActiveAcademicYearId } from "@/lib/academic-year"

/**
 * GET - جلب طالبات المعلم
 * Query: academicYearId (اختياري) لعرض طالبات سنة دراسية سابقة (أرشيف)
 */
export async function GET(request: Request) {
  try {
    const user = await requireTeacher()

    const { searchParams } = new URL(request.url)
    const requestedYearId = searchParams.get("academicYearId")

    const yearFilter = requestedYearId
      ? { academicYearId: requestedYearId }
      : currentYearClassFilter(await getActiveAcademicYearId(user.id))

    const students = await prisma.student.findMany({
      where: {
        class: {
          userId: user.id,
          ...yearFilter,
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
