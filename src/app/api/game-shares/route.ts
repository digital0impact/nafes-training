import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createGameShareSchema = z.object({
  gameId: z.string().min(1, "معرف اللعبة مطلوب"),
  shareToAll: z.boolean(),
  studentIds: z.array(z.string()).optional(),
  classId: z.string().optional(),
})

/**
 * POST - مشاركة لعبة مع الطلاب
 */
export async function POST(request: Request) {
  try {
    const user = await requireTeacher()
    const body = await request.json()

    const validationResult = createGameShareSchema.safeParse(body)

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

    let { gameId, shareToAll, studentIds, classId } = validationResult.data

    // إن تم إرسال classId: يجب أن يكون الفصل تابعًا للمعلم
    if (classId) {
      const cls = await prisma.class.findFirst({
        where: { id: classId, userId: user.id },
        select: { id: true },
      })
      if (!cls) {
        return NextResponse.json(
          { error: "الفصل غير موجود أو لا يخص هذا المعلم" },
          { status: 400 }
        )
      }
    }

    // إن تم إرسال studentIds: التحقق من أن الطالبات تابعات للمعلم، واستنتاج classId إن لزم
    if (studentIds && studentIds.length > 0) {
      const teacherClasses = await prisma.class.findMany({
        where: { userId: user.id },
        select: { id: true, code: true },
      })
      if (teacherClasses.length === 0) {
        return NextResponse.json(
          { error: "لا يوجد فصول لديك. أنشئي فصلاً ثم أضيفي الطالبات قبل المشاركة." },
          { status: 400 }
        )
      }
      const teacherClassIds = teacherClasses.map((c) => c.id)
      const teacherClassCodesSet = new Set(
        teacherClasses.map((c) => c.code.toUpperCase().trim())
      )

      const studentsToCheck = await prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: { id: true, classId: true, classCode: true },
      })
      const allBelongToTeacher = studentsToCheck.every(
        (s) =>
          (s.classId && teacherClassIds.includes(s.classId)) ||
          (s.classCode &&
            teacherClassCodesSet.has(String(s.classCode).toUpperCase().trim()))
      )
      if (!allBelongToTeacher || studentsToCheck.length !== studentIds.length) {
        return NextResponse.json(
          { error: "توجد طالبات غير تابعة لهذا المعلم ضمن القائمة" },
          { status: 400 }
        )
      }
      if (!classId && studentsToCheck.length > 0) {
        const first = studentsToCheck[0]
        if (first.classId) {
          classId = first.classId
        } else if (first.classCode) {
          const cls = teacherClasses.find(
            (c) =>
              c.code.toUpperCase().trim() ===
              String(first.classCode).toUpperCase().trim()
          )
          if (cls) classId = cls.id
        }
      }
    }

    // التحقق من وجود مشاركة سابقة لنفس اللعبة من نفس المعلم
    const existingShare = await prisma.gameShare.findFirst({
      where: {
        gameId,
        userId: user.id,
      },
    })

    if (existingShare) {
      // تحديث المشاركة الموجودة
      const updated = await prisma.gameShare.update({
        where: { id: existingShare.id },
        data: {
          shareToAll,
          studentIds: JSON.stringify(studentIds || []),
          classId: classId || null,
        },
      })

      return NextResponse.json(
        {
          message: "تم تحديث مشاركة اللعبة بنجاح",
          share: updated,
        },
        { status: 200 }
      )
    }

    // إنشاء مشاركة جديدة
    const share = await prisma.gameShare.create({
      data: {
        gameId,
        userId: user.id,
        shareToAll,
        studentIds: JSON.stringify(studentIds || []),
        classId: classId || null,
      },
    })

    return NextResponse.json(
      {
        message: "تم مشاركة اللعبة بنجاح",
        share,
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "حدث خطأ غير متوقع"
    console.error("Error sharing game:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء مشاركة اللعبة", details: message },
      { status: 500 }
    )
  }
}

/**
 * GET - جلب مشاركات الألعاب
 */
export async function GET(request: Request) {
  try {
    const user = await requireTeacher()
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")

    const where: {
      userId: string
      gameId?: string
    } = {
      userId: user.id,
    }

    if (gameId) {
      where.gameId = gameId
    }

    const shares = await prisma.gameShare.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        sharedAt: "desc",
      },
    })

    return NextResponse.json({ shares })
  } catch (error) {
    console.error("Error fetching game shares:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب مشاركات الألعاب" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - إلغاء مشاركة لعبة
 */
export async function DELETE(request: Request) {
  try {
    const user = await requireTeacher()
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get("shareId")
    const gameId = searchParams.get("gameId")

    if (!shareId && !gameId) {
      return NextResponse.json(
        { error: "يجب توفير معرف المشاركة أو معرف اللعبة" },
        { status: 400 }
      )
    }

    const where: {
      userId: string
      id?: string
      gameId?: string
    } = {
      userId: user.id,
    }

    if (shareId) {
      where.id = shareId
    } else if (gameId) {
      where.gameId = gameId
    }

    await prisma.gameShare.deleteMany({
      where,
    })

    return NextResponse.json(
      { message: "تم إلغاء مشاركة اللعبة بنجاح" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting game share:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إلغاء مشاركة اللعبة" },
      { status: 500 }
    )
  }
}
