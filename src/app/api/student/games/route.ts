import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import path from "path"

/**
 * GET - جلب الألعاب المشتركة مع الطالب
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const nickname = searchParams.get("nickname")
    const classCode = searchParams.get("classCode")

    if (!nickname || !classCode) {
      return NextResponse.json(
        { error: "يجب توفير الاسم المستعار وكود الفصل" },
        { status: 400 }
      )
    }

    // جلب جميع الألعاب
    const gamesFile = path.join(process.cwd(), "src", "data", "educational-games.json")
    const fileContent = await readFile(gamesFile, "utf-8")
    const gamesData = JSON.parse(fileContent)
    const allGames = gamesData.games || []

    // تحديد المعلم/الفصل بناءً على كود الفصل (الكود فريد عالميًا)
    const classData = await prisma.class.findUnique({
      where: { code: classCode.toUpperCase() },
      select: { id: true, userId: true, code: true },
    })

    if (!classData) {
      return NextResponse.json(
        { error: "كود الفصل غير صحيح" },
        { status: 401 }
      )
    }

    // جلب الألعاب المشتركة
    const shares = await prisma.gameShare.findMany({
      where: {
        userId: classData.userId,
        OR: [
          { shareToAll: true },
          {
            class: {
              id: classData.id,
            },
          },
        ],
      },
      include: {
        class: {
          select: {
            code: true,
          },
        },
      },
    })

    // استخراج معرفات الألعاب المشتركة
    const sharedGameIds = new Set<string>()
    shares.forEach((share) => {
      if (share.shareToAll) {
        // مشاركة مع الجميع = هذه اللعبة تظهر لجميع طلاب المعلم
        sharedGameIds.add(share.gameId)
      } else if (share.class?.code === classCode.toUpperCase()) {
        // مشاركة مع فصل معين
        sharedGameIds.add(share.gameId)
      }
    })

    // تصفية الألعاب المشتركة فقط
    const sharedGames = allGames.filter((game: any) =>
      sharedGameIds.has(game.game_id)
    )

    return NextResponse.json({ games: sharedGames })
  } catch (error) {
    console.error("Error fetching shared games:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الألعاب" },
      { status: 500 }
    )
  }
}
