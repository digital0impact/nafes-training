import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

/**
 * GET - جلب السنوات الدراسية للمعلمة الحالية (الأحدث أولاً) مع عدد فصول كل سنة
 */
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const academicYears = await prisma.academicYear.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        label: true,
        isActive: true,
        createdAt: true,
        _count: { select: { classes: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ academicYears })
  } catch (error) {
    console.error("Error fetching academic years:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب السنوات الدراسية" },
      { status: 500 }
    )
  }
}
