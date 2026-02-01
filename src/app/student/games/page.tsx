"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SectionHeader } from "@/components/ui/section-header"
import { StudentAuthGuard, useStudentAuth } from "@/components/student"

type EducationalGame = {
  game_id: string
  chapter: string
  title: string
  game_type: string
  learning_indicator: string
  objective: string
  level: string
  difficulty: number
  remedial: boolean
  points: number
}

export default function GamesPage() {
  const { student } = useStudentAuth()
  const [games, setGames] = useState<EducationalGame[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChapter, setSelectedChapter] = useState<string>("all")

  useEffect(() => {
    async function loadGames() {
      if (!student) return
      try {
        const response = await fetch(
          `/api/student/games?nickname=${encodeURIComponent(student.name)}&classCode=${encodeURIComponent(student.classCode)}`
        )
        if (response.ok) {
          const data = await response.json()
          setGames(data.games || [])
        } else {
          // في حالة الخطأ، جلب جميع الألعاب كبديل
          const fallbackResponse = await fetch("/api/educational-games")
          const fallbackData = await fallbackResponse.json()
          setGames(fallbackData.games || [])
        }
      } catch (error) {
        console.error("Error loading games", error)
        // في حالة الخطأ، جلب جميع الألعاب كبديل
        try {
          const fallbackResponse = await fetch("/api/educational-games")
          const fallbackData = await fallbackResponse.json()
          setGames(fallbackData.games || [])
        } catch (e) {
          console.error("Error loading fallback games", e)
        }
      } finally {
        setLoading(false)
      }
    }
    loadGames()
  }, [student])

  // تجميع الألعاب حسب الفصل
  const gamesByChapter: Record<string, EducationalGame[]> = {}
  games.forEach((game) => {
    if (!gamesByChapter[game.chapter]) {
      gamesByChapter[game.chapter] = []
    }
    gamesByChapter[game.chapter].push(game)
  })

  const chapters = Object.keys(gamesByChapter)
  const filteredGames = selectedChapter === "all" 
    ? games 
    : games.filter((g) => g.chapter === selectedChapter)

  const gameTypeIcons: Record<string, string> = {
    "multiple_choice": "📝",
    "interactive_circuit": "⚡",
    "drag_drop": "🖱️",
    "matching": "🔗",
    "ordering": "🔢",
    "scenario_choice": "🎯",
    "map_selection": "🗺️",
    "atom_builder": "⚛️",
    "periodic_family_comparison": "🧪"
  }

  const gameTypeLabels: Record<string, string> = {
    "multiple_choice": "اختيار متعدد",
    "drag_drop": "سحب وإفلات",
    "matching": "مطابقة",
    "ordering": "ترتيب",
    "scenario_choice": "سيناريو",
    "map_selection": "خريطة",
    "interactive_circuit": "دائرة تفاعلية",
    "atom_builder": "بناء الذرة",
    "periodic_family_comparison": "مقارنة العائلة"
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="card text-center py-12">
          <p className="text-slate-500">جاري تحميل الألعاب...</p>
        </div>
      </main>
    )
  }

  return (
    <StudentAuthGuard>
      <main className="space-y-6">
        <header className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">الألعاب التعليمية</h1>
            <p className="mt-2 text-slate-600">
              اختاري لعبة لبدء التعلم والتدريب
            </p>
          </div>
        </header>

        {/* Filter by Chapter */}
        {chapters.length > 0 && (
          <div className="card">
            <SectionHeader title="تصفية حسب الفصل" />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedChapter("all")}
                className={`px-4 py-2 rounded-xl font-semibold transition ${
                  selectedChapter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                الكل ({games.length})
              </button>
              {chapters.map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => setSelectedChapter(chapter)}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    selectedChapter === chapter
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {chapter} ({gamesByChapter[chapter].length})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Games List */}
        <SectionHeader
          title={selectedChapter === "all" ? "جميع الألعاب" : selectedChapter}
          subtitle={`${filteredGames.length} لعبة متاحة`}
        />

        {filteredGames.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-500">لا توجد ألعاب متاحة</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game) => {
              const levelColors: Record<string, string> = {
                "سهل": "bg-emerald-50 text-emerald-700 border-emerald-200",
                "متوسط": "bg-blue-50 text-blue-700 border-blue-200"
              }

              return (
                <div
                  key={game.game_id}
                  className="card group space-y-4 transition-all hover:shadow-lg"
                >
                  {/* Header */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="flex-1 text-lg font-bold text-slate-900">{game.title}</h3>
                      <span className="text-2xl">{gameTypeIcons[game.game_type] || "🎮"}</span>
                    </div>
                    <p className="text-xs text-slate-500">{game.chapter}</p>
                  </div>

                  {/* Game Info */}
                  <div className="space-y-2 rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">نوع اللعبة:</span>
                      <span className="font-semibold text-slate-900">
                        {gameTypeLabels[game.game_type] || game.game_type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">المستوى:</span>
                      <span className={`badge border ${levelColors[game.level] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                        {game.level}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">النقاط:</span>
                      <span className="font-semibold text-purple-700">{game.points} نقطة</span>
                    </div>
                    {game.remedial && (
                      <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-2 text-center">
                        <span className="text-xs font-semibold text-amber-700">✓ لعبة علاجية</span>
                      </div>
                    )}
                  </div>

                  {/* Learning Indicator */}
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <p className="text-xs font-semibold text-blue-900 mb-1">الهدف:</p>
                    <p className="text-sm text-blue-800">{game.objective}</p>
                  </div>

                  {/* Action Button */}
                  <Link
                    href={`/student/games/${game.game_id}/play`}
                    className="block w-full text-center rounded-2xl bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700"
                  >
                    ابدأ اللعبة
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </StudentAuthGuard>
  )
}
