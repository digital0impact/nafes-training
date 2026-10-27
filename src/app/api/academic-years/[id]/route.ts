import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

/**
 * DELETE - حذف سنة دراسية مملوكة للمعلمة الحالية
 *
 * لا يحذف أي فصول/طالبات/محاولات: Prisma يفصل فصول هذه السنة تلقائياً
 * (academicYearId → null) بدلاً من حذفها، فتبقى بياناتها محفوظة وتظهر
 * ضمن "السنة الحالية" (انظر currentYearClassFilter).
 *
 * لا يمكن حذف السنة النشطة حالياً - يجب تعطيلها أولاً (ببدء سنة جديدة).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    if (user.role !== "teacher" && user.role !== "admin") {
      return NextResponse.json(
        { error: "هذا الإجراء متاح للمعلمات فقط" },
        { status: 403 }
      )
    }

    const { id } = await params

    const academicYear = await prisma.academicYear.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        label: true,
        isActive: true,
        _count: { select: { classes: true } },
      },
    })

    if (!academicYear) {
      return NextResponse.json(
        { error: "السنة الدراسية غير موجودة" },
        { status: 404 }
      )
    }

    if (academicYear.isActive) {
      return NextResponse.json(
        {
          error:
            "لا يمكن حذف السنة الدراسية النشطة. ابدئي سنة دراسية جديدة أولاً ثم احذفي هذه السنة من الأرشيف",
        },
        { status: 400 }
      )
    }

    await prisma.academicYear.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      unlinkedClasses: academicYear._count.classes,
    })
  } catch (error) {
    console.error("Error deleting academic year:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف السنة الدراسية" },
      { status: 500 }
    )
  }
}
