import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
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

const createGameAttemptSchema = z.object({
  nickname: z.string().min(1, "الاسم المستعار مطلوب"),
  classCode: z.string().min(1, "كود الفصل مطلوب"),
  studentDbId: z.string().min(1, "معرف الطالبة مطلوب"),
  gameId: z.string().min(1, "معرف اللعبة مطلوب"),
  gameTitle: z.string().min(1, "عنوان اللعبة مطلوب"),
  gameType: z.string().min(1, "نوع اللعبة مطلوب"),
  chapter: z.string().min(1, "الفصل مطلوب"),
  answers: z.record(z.string(), z.any()),
  score: z.number().int().min(0),
  totalScore: z.number().int().min(1),
  percentage: z.number().min(0).max(100),
  timeSpent: z.number().int().min(0),
})

/**
 * POST - حفظ محاولة لعبة تعليمية جديدة
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const validationResult = createGameAttemptSchema.safeParse(body)

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
      gameId,
      gameTitle,
      gameType,
      chapter,
      answers,
      score,
      totalScore,
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

    // حفظ المحاولة (أولاً حتى تظهر اللعبة في «الألعاب المنجزة»)
    let attempt
    try {
      attempt = await prisma.gameAttempt.create({
        data: {
          nickname,
          classCode: classCode.toUpperCase(),
          classId: classData?.id || null,
          studentDbId: student.id,
          gameId,
          gameTitle,
          gameType,
          chapter,
          answers: JSON.stringify(answers),
          score,
          totalScore,
          percentage,
          timeSpent,
        },
      })
    } catch (createError) {
      const message =
        createError instanceof Error ? createError.message : String(createError)
      console.error("Error creating game attempt:", createError)
      return NextResponse.json(
        {
          error: "حدث خطأ أثناء حفظ محاولة اللعبة",
          details: message,
        },
        { status: 500 }
      )
    }

    // تحديث إتقان الطالبة (إن فشل لا نُفشّل الاستجابة — المحاولة محفوظة)
    const status = percentage >= 80 ? "mastered" : "not_mastered"
    try {
      await upsertMastery({
        studentDbId: student.id,
        key: `game:${gameId}`,
        status,
        score: percentage,
        sourceType: "game",
        sourceId: gameId,
      })
      const SKILL_DOMAINS = ["علوم الحياة", "العلوم الفيزيائية", "علوم الأرض والفضاء", "جميع المجالات"]
      const chapterAsSkill = SKILL_DOMAINS.includes(chapter.trim()) ? chapter.trim() : null
      if (chapterAsSkill) {
        await upsertMastery({
          studentDbId: student.id,
          key: `skill:${chapterAsSkill}`,
          status,
          score: percentage,
          sourceType: "game",
          sourceId: gameId,
        })
      }
    } catch (masteryError) {
      console.error("Error updating mastery (game attempt was saved):", masteryError)
    }

    return NextResponse.json(
      {
        message: "تم حفظ محاولة اللعبة بنجاح",
        attempt: {
          id: attempt.id,
          score: attempt.score,
          totalScore: attempt.totalScore,
          percentage: attempt.percentage,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Error creating game attempt:", error)
    return NextResponse.json(
      {
        error: "حدث خطأ أثناء حفظ محاولة اللعبة",
        details: message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET - جلب محاولات الألعاب (للمعلم فقط)
 */
export async function GET(request: Request) {
  try {
    const user = await requireTeacher()

    const { searchParams } = new URL(request.url)
    const classCode = searchParams.get("classCode")
    const classId = searchParams.get("classId")
    const gameId = searchParams.get("gameId")
    const nickname = searchParams.get("nickname")

    const where: {
      classCode?: string
      classId?: string
      gameId?: string
      nickname?: string
      class?: {
        userId: string
      }
    } = {
      class: {
        userId: user.id,
      },
    }

    if (classCode) {
      where.classCode = classCode.toUpperCase()
    }

    if (classId) {
      where.classId = classId
    }

    if (gameId) {
      where.gameId = gameId
    }

    if (nickname) {
      where.nickname = nickname
    }

    const attempts = await prisma.gameAttempt.findMany({
      where,
      orderBy: {
        completedAt: "desc",
      },
      take: 100,
    })

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error("Error fetching game attempts:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب محاولات الألعاب" },
      { status: 500 }
    )
  }
}
