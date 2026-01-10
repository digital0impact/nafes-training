import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createTrainingAttemptSchema = z.object({
  nickname: z.string().min(1, "الاسم المستعار مطلوب"),
  classCode: z.string().min(1, "كود الفصل مطلوب"),
  testModelId: z.string().optional(),
  testModelTitle: z.string().optional(),
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
      testModelId,
      testModelTitle,
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

    // حفظ المحاولة
    const attempt = await prisma.trainingAttempt.create({
      data: {
        nickname,
        classCode: classCode.toUpperCase(),
        classId: classData?.id || null,
        testModelId: testModelId || null,
        testModelTitle: testModelTitle || null,
        answers: JSON.stringify(answers),
        score,
        totalQuestions,
        percentage,
        timeSpent,
      },
    })

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
    } = {}

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
