import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { updateSchoolSchema } from "@/lib/validations"

/**
 * PATCH - تحديث بيانات مدرسة (اسم/مدينة) أو تعطيلها (isActive) - للمدير فقط
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "تعديل المدارس متاح للمدير فقط" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validationResult = updateSchoolSchema.safeParse(body)

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

    const existing = await prisma.school.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "المدرسة غير موجودة" }, { status: 404 })
    }

    const { name, city, isActive } = validationResult.data

    const school = await prisma.school.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(city !== undefined && { city: city?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ school })
  } catch (error) {
    console.error("Error updating school:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث المدرسة" },
      { status: 500 }
    )
  }
}
