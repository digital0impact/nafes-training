import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { startNewAcademicYearSchema } from "@/lib/validations"

/**
 * POST - بدء سنة دراسية جديدة للمعلمة الحالية
 *
 * لا يحذف أي بيانات: فصول/طالبات/محاولات السنوات السابقة تبقى كما هي في قاعدة
 * البيانات، فقط تُستثنى من العرض الافتراضي (تُعرض من خلال اختيار سنة سابقة).
 *
 * أول استدعاء لهذه الميزة (لا توجد سنة نشطة بعد): كل فصول المعلمة الحالية
 * (التي لم تُنسب لأي سنة دراسية بعد) تُنقل تلقائياً إلى سنة "أرشيف" غير نشطة،
 * حتى لا تختلط ببيانات السنة الجديدة. الاستدعاءات التالية فقط تُعطّل السنة
 * النشطة الحالية (تبقى فصولها كما هي، مرتبطة بها) وتُنشئ السنة الجديدة نشطة.
 */
export async function POST(request: Request) {
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
    const validationResult = startNewAcademicYearSchema.safeParse(body)

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

    const label = validationResult.data.label.trim()

    const duplicate = await prisma.academicYear.findUnique({
      where: { userId_label: { userId: user.id, label } },
    })

    if (duplicate) {
      return NextResponse.json(
        { error: "يوجد سنة دراسية بنفس الاسم من قبل" },
        { status: 400 }
      )
    }

    const newYear = await prisma.$transaction(async (tx) => {
      const currentActive = await tx.academicYear.findFirst({
        where: { userId: user.id, isActive: true },
      })

      if (currentActive) {
        // تعطيل السنة النشطة الحالية - فصولها تبقى مرتبطة بها كسنة سابقة الآن
        await tx.academicYear.update({
          where: { id: currentActive.id },
          data: { isActive: false },
        })
      } else {
        // أول استخدام للميزة: أرشفة أي فصول قديمة لم تُنسب لسنة بعد
        const legacyClassesCount = await tx.class.count({
          where: { userId: user.id, academicYearId: null },
        })

        if (legacyClassesCount > 0) {
          const archiveYear = await tx.academicYear.create({
            data: {
              userId: user.id,
              label: "الأرشيف (قبل تفعيل السنوات الدراسية)",
              isActive: false,
            },
          })

          await tx.class.updateMany({
            where: { userId: user.id, academicYearId: null },
            data: { academicYearId: archiveYear.id },
          })
        }
      }

      return tx.academicYear.create({
        data: { userId: user.id, label, isActive: true },
      })
    })

    return NextResponse.json({ academicYear: newYear }, { status: 201 })
  } catch (error) {
    console.error("Error starting new academic year:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء بدء السنة الدراسية الجديدة" },
      { status: 500 }
    )
  }
}
