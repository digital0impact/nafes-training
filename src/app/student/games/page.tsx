"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { StudentAuthGuard, useStudentAuth } from "@/components/student"

/** إيقاف دخول المتعلم إلى الألعاب الإلكترونية مؤقتاً — غيّر إلى false لإعادة التفعيل */
const GAMES_PAGE_DISABLED = false

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

type GameTab = "new" | "completed"

type CompletedGameAttempt = {
  id: string
  gameId: string
  gameTitle: string
  gameType: string
  chapter: string
  score: number
  totalScore: number
  percentage: number
  timeSpent: number
  completedAt: string
}

export default function GamesPage() {
  const { student } = useStudentAuth()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<GameTab>("new")

  if (GAMES_PAGE_DISABLED) {
    return (
      <StudentAuthGuard>
        <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6">
          <div className="card max-w-md border-amber-200 bg-amber-50/50 text-center">
            <p className="text-2xl">🎮</p>
            <h1 className="mt-2 text-xl font-bold text-slate-900">الألعاب الإلكترونية</h1>
            <p className="mt-2 text-slate-600">
              الدخول إلى الألعاب الإلكترونية معطل مؤقتاً.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              سيتم إعادة التفعيل قريباً.
            </p>
            <Link
              href="/student"
              className="mt-6 inline-block rounded-2xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              العودة للرئيسية
            </Link>
          </div>
        </main>
      </StudentAuthGuard>
    )
  }
  const [games, setGames] = useState<EducationalGame[]>([])
  const [completedAttempts, setCompletedAttempts] = useState<CompletedGameAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCompleted, setLoadingCompleted] = useState(false)

  // جلب الألعاب المشتركة من المعلم فقط — لا يعرض أي ألعاب أخرى
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
          setGames([])
        }
      } catch (error) {
        console.error("Error loading shared games", error)
        setGames([])
      } finally {
        setLoading(false)
      }
    }
    loadGames()
  }, [student])

  const fetchCompletedAttempts = useCallback(() => {
    if (!student?.id) return
    setLoadingCompleted(true)
    fetch(`/api/student/game-attempts?studentId=${encodeURIComponent(student.id)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setCompletedAttempts(data.attempts ?? []))
      .catch(() => setCompletedAttempts([]))
      .finally(() => setLoadingCompleted(false))
  }, [student?.id])

  // فتح تبويب «الألعاب المنجزة» عند العودة من صفحة النتيجة (رابط ?tab=completed)
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "completed") setActiveTab("completed")
  }, [searchParams])

  // جلب الألعاب المنجزة (محاولات الطالبة) — عند فتح الصفحة أو التبويب
  useEffect(() => {
    fetchCompletedAttempts()
  }, [fetchCompletedAttempts, activeTab])

  // عند العودة من صفحة نتيجة اللعبة أو عند ظهور الصفحة، تحديث قائمة الألعاب المنجزة
  useEffect(() => {
    const onRefresh = () => fetchCompletedAttempts()
    window.addEventListener("focus", onRefresh)
    const onVisible = () => {
      if (document.visibilityState === "visible") onRefresh()
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.removeEventListener("focus", onRefresh)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [fetchCompletedAttempts])

  // الألعاب الجديدة فقط = المشتركة من المعلم والتي لم تُحل بعد
  const newGamesOnly = games.filter(
    (game) => !completedAttempts.some((a) => a.gameId === game.game_id)
  )

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
            <h1 className="text-3xl font-bold text-slate-900">التدريب السريع</h1>
            <p className="mt-2 text-slate-600">
              الألعاب المشتركة من المعلم. الجديدة للعب أو المنجزة لمتابعة نتائجك.
            </p>
          </div>
          <div className="mt-4 flex gap-1 overflow-x-auto border-b border-purple-200 pb-px sm:mt-6">
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`min-h-[44px] flex-shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition touch-manipulation ${
                activeTab === "new"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              الألعاب الجديدة
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={`min-h-[44px] flex-shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition touch-manipulation ${
                activeTab === "completed"
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              الألعاب المنجزة
            </button>
          </div>
        </header>

        {/* تبويب الألعاب المنجزة */}
        {activeTab === "completed" && (
          <section className="card overflow-hidden p-0">
            {loadingCompleted ? (
              <div className="p-8 text-center text-slate-500">جاري تحميل الألعاب المنجزة...</div>
            ) : completedAttempts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-600">لا توجد ألعاب منجزة بعد.</p>
                <p className="mt-1 text-sm text-slate-500">
                  ابدئي من تبويب &quot;الألعاب الجديدة&quot; للعب.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completedAttempts.map((a) => (
                  <div
                    key={a.id}
                    className="card flex flex-col border-slate-200 p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900">{a.gameTitle}</h3>
                      <p className="mt-1 text-xs text-slate-500">{a.chapter}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(a.completedAt).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="mb-2 text-xs font-semibold text-slate-600">
                        مدى الدرجة / النسبة
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-bold ${
                            a.percentage >= 80
                              ? "bg-emerald-100 text-emerald-700"
                              : a.percentage >= 60
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {a.percentage}%
                        </span>
                        <span className="text-sm text-slate-600">
                          ({a.score} / {a.totalScore} نقطة)
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/student/games/${a.gameId}/play`}
                      className="mt-4 block w-full rounded-2xl bg-purple-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-purple-700"
                    >
                      إعادة اللعب
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* تبويب الألعاب الجديدة */}
        {activeTab === "new" && (
        <>
        {newGamesOnly.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-500">
              {games.length === 0
                ? "لا توجد ألعاب مشتركة من المعلم بعد."
                : "جميع الألعاب المشتركة تم إنجازها. يمكنك مراجعة النتائج في تبويب «الألعاب المنجزة»."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newGamesOnly.map((game) => {
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
        </>
        )}
      </main>
    </StudentAuthGuard>
  )
}
