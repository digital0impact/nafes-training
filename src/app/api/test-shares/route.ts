import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTestShareSchema = z.object({
  modelId: z.string().min(1, "معرف النموذج مطلوب"),
  shareToAll: z.boolean(),
  studentIds: z.array(z.string()).optional(),
})

/**
 * POST - مشاركة/إرسال اختبار للطالبات
 */
export async function POST(request: Request) {
  try {
    const user = await requireTeacher()
    const body = await request.json()

    const validationResult = createTestShareSchema.safeParse(body)
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

    let { modelId, shareToAll, studentIds } = validationResult.data

    // النماذج المخصصة (من localStorage) لها معرف مثل custom-123-prebuilt-1؛ الطالبة لا تملكها.
    // نستخدم معرف النموذج الجاهز الأصلي حتى تظهر الاختبارات للطالبة.
    if (modelId.startsWith("custom-")) {
      const parts = modelId.split("-")
      if (parts.length >= 3) modelId = parts.slice(2).join("-")
    }

    if (studentIds && studentIds.length > 0) {
      const count = await prisma.student.count({
        where: {
          id: { in: studentIds },
          class: { userId: user.id },
        },
      })
      if (count !== studentIds.length) {
        return NextResponse.json(
          { error: "توجد طالبات غير تابعة لهذا المعلم ضمن القائمة" },
          { status: 400 }
        )
      }
    }

    const existing = await prisma.testShare.findUnique({
      where: {
        userId_modelId: { userId: user.id, modelId },
      },
    })

    const data = {
      shareToAll,
      studentIds: JSON.stringify(studentIds || []),
    }

    if (existing) {
      await prisma.testShare.update({
        where: { id: existing.id },
        data,
      })
      return NextResponse.json({
        message: "تم تحديث إرسال الاختبار بنجاح",
        share: { ...existing, ...data },
      })
    }

    const share = await prisma.testShare.create({
      data: {
        modelId,
        userId: user.id,
        ...data,
      },
    })

    return NextResponse.json(
      { message: "تم إرسال الاختبار للطالبات بنجاح", share },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error sharing test:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال الاختبار" },
      { status: 500 }
    )
  }
}

/**
 * GET - قائمة مشاركات الاختبارات (للمعلم)
 */
export async function GET(request: Request) {
  try {
    const user = await requireTeacher()
    const shares = await prisma.testShare.findMany({
      where: { userId: user.id },
      orderBy: { sharedAt: "desc" },
    })
    return NextResponse.json({ shares })
  } catch (error) {
    console.error("Error fetching test shares:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المشاركات" },
      { status: 500 }
    )
  }
}
