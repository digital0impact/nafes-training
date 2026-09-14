import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { setTeacherSchoolSchema } from "@/lib/validations"

/**
 * PATCH - ربط المعلمة الحالية بمدرسة، أو فك الارتباط (schoolId: null)
 * خدمة ذاتية: لا تتطلب دور مدير، فقط أن تختار المعلمة مدرستها من القائمة المتاحة
 */
export async function PATCH(request: Request) {
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

    const body = await request.json()
    const validationResult = setTeacherSchoolSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error:
            validationResult.error.errors[0]?.message ||
            "البيانات المدخلة غير صحيحة",
        },
        { status: 400 }
      )
    }

    const { schoolId } = validationResult.data

    if (schoolId) {
      const school = await prisma.school.findUnique({ where: { id: schoolId } })
      if (!school || !school.isActive) {
        return NextResponse.json(
          { error: "المدرسة المحددة غير موجودة أو غير مفعّلة" },
          { status: 404 }
        )
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { schoolId },
      select: {
        schoolId: true,
        school: { select: { name: true } },
      },
    })

    return NextResponse.json({
      schoolId: updated.schoolId,
      schoolName: updated.school?.name ?? null,
    })
  } catch (error) {
    console.error("Error updating teacher school:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث المدرسة" },
      { status: 500 }
    )
  }
}
