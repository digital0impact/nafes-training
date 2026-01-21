import { NextResponse } from "next/server"
import { requireTeacher } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import path from "path"

type GamePerformance = {
  game_id: string
  chapter: string
  score: number
}

type RemedialPlanRequest = {
  student_id: string
  game_performance: GamePerformance[]
}

export async function POST(request: Request) {
  try {
    const user = await requireTeacher()
    
    const body: RemedialPlanRequest = await request.json()
    const { student_id, game_performance } = body
    
    if (!student_id || !game_performance || !Array.isArray(game_performance)) {
      return NextResponse.json(
        { error: "البيانات المدخلة غير صحيحة" },
        { status: 400 }
      )
    }

    // التحقق من أن الطالبة تابعة لفصول هذا المعلم
    const student = await prisma.student.findFirst({
      where: {
        studentId: student_id.toUpperCase(),
        class: { userId: user.id },
      },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json(
        { error: "الطالبة غير موجودة أو لا تتبع لهذا المعلم" },
        { status: 403 }
      )
    }
    
    // قراءة الألعاب التعليمية
    const gamesFile = path.join(process.cwd(), "src", "data", "educational-games.json")
    const fileContent = await readFile(gamesFile, "utf-8")
    const gamesData = JSON.parse(fileContent)
    const allGames = gamesData.games || []
    
    // تجميع النقاط حسب الفصل
    const chapterScores: Record<string, number[]> = {}
    game_performance.forEach((perf) => {
      if (!chapterScores[perf.chapter]) {
        chapterScores[perf.chapter] = []
      }
      chapterScores[perf.chapter].push(perf.score)
    })
    
    // حساب متوسط النقاط لكل فصل
    const chapterAverages: Record<string, number> = {}
    Object.keys(chapterScores).forEach((chapter) => {
      const scores = chapterScores[chapter]
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
      chapterAverages[chapter] = Math.round(average)
    })
    
    // تحديد الحالة العامة
    const allScores = game_performance.map((p) => p.score)
    const overallAverage = allScores.length > 0
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
      : 0
    
    let overallStatus = "متقن"
    if (overallAverage < 50) {
      overallStatus = "بحاجة إلى معالجة عاجلة"
    } else if (overallAverage < 70) {
      overallStatus = "بحاجة إلى دعم"
    }
    
    // إنشاء خطة علاجية لكل فصل
    const remedialPlan = Object.keys(chapterScores).map((chapter) => {
      const averageScore = chapterAverages[chapter]
      let studentStatus = "متقن"
      let assignedGames: string[] = []
      let recommendation = ""
      
      if (averageScore < 50) {
        studentStatus = "بحاجة إلى معالجة عاجلة"
        assignedGames = allGames
          .filter(
            (game: any) =>
              game.chapter === chapter &&
              game.remedial === true &&
              game.difficulty === 1
          )
          .map((game: any) => game.game_id)
        recommendation = `يحتاج الطالب إلى مراجعة أساسية شاملة لهذا الفصل من خلال الألعاب العلاجية البسيطة`
      } else if (averageScore < 70) {
        studentStatus = "بحاجة إلى دعم"
        assignedGames = allGames
          .filter(
            (game: any) =>
              game.chapter === chapter &&
              game.remedial === true &&
              game.difficulty <= 2
          )
          .map((game: any) => game.game_id)
        recommendation = `يحتاج الطالب إلى دعم إضافي في هذا الفصل من خلال الألعاب العلاجية المتوسطة`
      } else {
        recommendation = `الطالب متقن لهذا الفصل ولا يحتاج إلى ألعاب علاجية`
      }
      
      return {
        chapter,
        student_status: studentStatus,
        assigned_games: assignedGames,
        recommendation,
      }
    })
    
    // إضافة الفصول التي لم يلعبها الطالب بعد
    const playedChapters = new Set(Object.keys(chapterScores))
    const allChapters = new Set<string>(
      allGames.map((game: any) => String(game.chapter))
    )
    
    allChapters.forEach((chapter) => {
      // chapter هنا string بسبب Set<string> أعلاه
      if (!playedChapters.has(chapter)) {
        remedialPlan.push({
          chapter,
          student_status: "لم يتم التقييم بعد",
          assigned_games: [],
          recommendation: "الطالب لم يلعب أي ألعاب في هذا الفصل بعد",
        })
      }
    })
    
    return NextResponse.json({
      student_id,
      overall_status: overallStatus,
      remedial_plan: remedialPlan,
    })
  } catch (error) {
    console.error("Failed to generate remedial plan", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الخطة العلاجية" },
      { status: 500 }
    )
  }
}
