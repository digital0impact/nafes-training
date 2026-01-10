import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { updateClassSchema } from "@/lib/validations"

/**
 * GET - جلب فصل محدد
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireTeacher()

    const classData = await prisma.class.findUnique({
      where: {
        id: params.id,
        userId: user.id, // التأكد من أن الفصل يخص المعلم
      },
      include: {
        students: {
          select: {
            id: true,
            studentId: true,
            name: true,
            grade: true,
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    if (!classData) {
      return NextResponse.json(
        { error: "الفصل غير موجود" },
        { status: 404 }
      )
    }

    return NextResponse.json({ class: classData })
  } catch (error) {
    console.error("Error fetching class:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الفصل" },
      { status: 500 }
    )
  }
}

/**
 * PATCH - تحديث فصل
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireTeacher()

    const body = await request.json()

    // التحقق من البيانات باستخدام Zod
    const validationResult = updateClassSchema.safeParse(body)

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

    const updateData = validationResult.data

    // التحقق من وجود الفصل وأنه يخص المعلم
    const existingClass = await prisma.class.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "الفصل غير موجود" },
        { status: 404 }
      )
    }

    // إذا تم تحديث الرمز، التحقق من عدم التكرار
    if (updateData.code && updateData.code.toUpperCase() !== existingClass.code) {
      const codeExists = await prisma.class.findUnique({
        where: { code: updateData.code.toUpperCase() },
      })

      if (codeExists) {
        return NextResponse.json(
          { error: "رمز الفصل مستخدم بالفعل" },
          { status: 400 }
        )
      }
    }

    // تحديث الفصل
    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: {
        ...updateData,
        code: updateData.code?.toUpperCase(),
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "تم تحديث الفصل بنجاح",
      class: updatedClass,
    })
  } catch (error) {
    console.error("Error updating class:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث الفصل" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - حذف فصل
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireTeacher()

    // التحقق من وجود الفصل وأنه يخص المعلم
    const existingClass = await prisma.class.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "الفصل غير موجود" },
        { status: 404 }
      )
    }

    // حذف الفصل (الطالبات لن تُحذف، classId سيصبح null)
    await prisma.class.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "تم حذف الفصل بنجاح",
    })
  } catch (error) {
    console.error("Error deleting class:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء حذف الفصل" },
      { status: 500 }
    )
  }
}

