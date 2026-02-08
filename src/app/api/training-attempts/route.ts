import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireTeacher } from "@/lib/auth-server"
import { z } from "zod"

async function upsertMastery(params: {
  studentDbId: string
  key: string
  status: "mastered" | "not_mastered"
  score?: number
  sourceType?: string
  sourceId?: string | null
}) {
  const { studentDbId, key, status, score, sourceType, sourceId } = params
  await prisma.studentMastery.upsert({
    where: {
      studentDbId_key: { studentDbId, key },
    },
    create: {
      studentDbId,
      key,
      status,
      score: typeof score === "number" ? score : null,
      sourceType: sourceType || null,
      sourceId: sourceId || null,
    },
    update: {
      status,
      score: typeof score === "number" ? score : null,
      sourceType: sourceType || null,
      sourceId: sourceId || null,
    },
  })
}

const createTrainingAttemptSchema = z.object({
  nickname: z.string().min(1, "الاسم المستعار مطلوب"),
  classCode: z.string().min(1, "كود الفصل مطلوب"),
  studentDbId: z.string().min(1, "معرف الطالبة مطلوب"),
  testModelId: z.string().optional(),
  testModelTitle: z.string().optional(),
  skill: z.string().optional(), // مجال الاختبار (لتحديث المهارة عند النماذج غير المخزنة في DB)
  answers: z.record(z.string(), z.string()),
  score: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  percentage: z.number().min(0).max(100),
  timeSpent: z.number().int().min(0),
})

/**
 * POST - حفظ محاولة تدريب جديدة
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const validationResult = createTrainingAttemptSchema.safeParse(body)

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

    const {
      nickname,
      classCode,
      studentDbId,
      testModelId,
      testModelTitle,
      skill: bodySkill,
      answers,
      score,
      totalQuestions,
      percentage,
      timeSpent,
    } = validationResult.data

    // البحث عن الفصل
    const classData = await prisma.class.findUnique({
      where: { code: classCode.toUpperCase() },
    })

    // التحقق من أن الطالبة تنتمي لهذا الفصل (وربط المحاولة بها)
    const student = await prisma.student.findFirst({
      where: {
        id: studentDbId,
        class: { code: classCode.toUpperCase() },
      },
      select: { id: true },
    })

    if (!student) {
      return NextResponse.json(
        { error: "الطالبة غير موجودة أو لا تنتمي لهذا الفصل" },
        { status: 403 }
      )
    }

    // حفظ المحاولة
    const attempt = await prisma.trainingAttempt.create({
      data: {
        nickname,
        classCode: classCode.toUpperCase(),
        classId: classData?.id || null,
        studentDbId: student.id,
        testModelId: testModelId || null,
        testModelTitle: testModelTitle || null,
        answers: JSON.stringify(answers),
        score,
        totalQuestions,
        percentage,
        timeSpent,
      },
    })

    // تحديث إتقان الطالبة (مبدئيًا: حسب الاختبار نفسه)
    if (testModelId) {
      const status = percentage >= 80 ? "mastered" : "not_mastered"
      await upsertMastery({
        studentDbId: student.id,
        key: `testModel:${testModelId}`,
        status,
        score: percentage,
        sourceType: "training",
        sourceId: testModelId,
      })

      // إن كان للاختبار skill (من DB أو من الجسم للنماذج الجاهزة)، سجله كمؤشر عام أيضًا
      const model = await prisma.testModel.findUnique({
        where: { id: testModelId },
        select: { skill: true },
      })
      const skillToUse = model?.skill ?? (bodySkill?.trim() || null)
      if (skillToUse) {
        await upsertMastery({
          studentDbId: student.id,
          key: `skill:${skillToUse}`,
          status,
          score: percentage,
          sourceType: "training",
          sourceId: testModelId,
        })
      }
    }

    return NextResponse.json(
      {
        message: "تم حفظ المحاولة بنجاح",
        attempt: {
          id: attempt.id,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          percentage: attempt.percentage,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating training attempt:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ المحاولة" },
      { status: 500 }
    )
  }
}

/**
 * GET - جلب محاولات التدريب (للمعلم فقط)
 */
export async function GET(request: Request) {
  try {
    const user = await requireTeacher()
    const { searchParams } = new URL(request.url)
    const classCode = searchParams.get("classCode")
    const classId = searchParams.get("classId")

    if (!classCode && !classId) {
      return NextResponse.json(
        { error: "يجب توفير كود الفصل أو معرف الفصل" },
        { status: 400 }
      )
    }

    const where: {
      classCode?: string
      classId?: string
      class?: { userId: string }
    } = {
      class: { userId: user.id },
    }

    if (classCode) {
      where.classCode = classCode.toUpperCase()
    }

    if (classId) {
      where.classId = classId
    }

    const attempts = await prisma.trainingAttempt.findMany({
      where,
      orderBy: {
        completedAt: "desc",
      },
      take: 100,
    })

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error("Error fetching training attempts:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب المحاولات" },
      { status: 500 }
    )
  }
}
