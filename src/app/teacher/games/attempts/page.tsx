"use client"

import { useState, useEffect } from "react"
import { PageBackground } from "@/components/layout/page-background"
import { requireAuth } from "@/lib/auth-server"

type GameAttempt = {
  id: string
  nickname: string
  classCode: string
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

type Class = {
  id: string
  code: string
  name: string
}

export default function GameAttemptsPage() {
  const [attempts, setAttempts] = useState<GameAttempt[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClassCode, setSelectedClassCode] = useState<string>("all")
  const [selectedGameId, setSelectedGameId] = useState<string>("all")
  const [selectedNickname, setSelectedNickname] = useState<string>("")

  useEffect(() => {
    fetchClasses()
    fetchAttempts()
  }, [])

  useEffect(() => {
    fetchAttempts()
  }, [selectedClassCode, selectedGameId, selectedNickname])

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    }
  }

  const fetchAttempts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedClassCode !== "all") {
        params.append("classCode", selectedClassCode)
      }
      if (selectedGameId !== "all") {
        params.append("gameId", selectedGameId)
      }
      if (selectedNickname) {
        params.append("nickname", selectedNickname)
      }

      const response = await fetch(`/api/game-attempts?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAttempts(data.attempts || [])
      }
    } catch (error) {
      console.error("Error fetching game attempts:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins} د ${secs} ث`
    }
    return `${secs} ث`
  }

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "text-emerald-700 bg-emerald-50"
    if (percentage >= 60) return "text-blue-700 bg-blue-50"
    if (percentage >= 50) return "text-amber-700 bg-amber-50"
    return "text-rose-700 bg-rose-50"
  }

  const getGameTypeLabel = (gameType: string) => {
    const types: Record<string, string> = {
      ordering: "ترتيب",
      multiple_choice: "اختيار من متعدد",
      matching: "مطابقة",
      drag_drop: "سحب وإفلات",
      scenario_choice: "اختيار السيناريو",
      map_selection: "اختيار الخريطة",
    }
    return types[gameType] || gameType
  }

  // الحصول على قائمة الألعاب الفريدة من المحاولات
  const uniqueGames = Array.from(
    new Set(attempts.map((a) => `${a.gameId}|${a.gameTitle}`))
  ).map((g) => {
    const [gameId, gameTitle] = g.split("|")
    return { gameId, gameTitle }
  })

  // الحصول على قائمة الأسماء المستعارة الفريدة
  const uniqueNicknames = Array.from(new Set(attempts.map((a) => a.nickname))).sort()

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 px-4 py-6">
        <div className="card bg-white">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            محاولات الألعاب التعليمية
          </h1>
        </div>

        {/* Filters */}
        <div className="card bg-white p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">تصفية المحاولات</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Filter by Class */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الفصل
              </label>
              <select
                value={selectedClassCode}
                onChange={(e) => setSelectedClassCode(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">جميع الفصول</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.code}>
                    {cls.name} ({cls.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Game */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                اللعبة
              </label>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">جميع الألعاب</option>
                {uniqueGames.map((game) => (
                  <option key={game.gameId} value={game.gameId}>
                    {game.gameTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Student */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الطالبة
              </label>
              <select
                value={selectedNickname}
                onChange={(e) => setSelectedNickname(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">جميع الطالبات</option>
                {uniqueNicknames.map((nickname) => (
                  <option key={nickname} value={nickname}>
                    {nickname}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        {attempts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="card bg-white p-4">
              <div className="text-sm text-slate-600">إجمالي المحاولات</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {attempts.length}
              </div>
            </div>
            <div className="card bg-white p-4">
              <div className="text-sm text-slate-600">متوسط النتيجة</div>
              <div className="text-2xl font-bold text-slate-800 mt-1">
                {Math.round(
                  attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
                )}
                %
              </div>
            </div>
            <div className="card bg-white p-4">
              <div className="text-sm text-slate-600">أعلى نتيجة</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {Math.max(...attempts.map((a) => a.percentage))}%
              </div>
            </div>
            <div className="card bg-white p-4">
              <div className="text-sm text-slate-600">أقل نتيجة</div>
              <div className="text-2xl font-bold text-rose-700 mt-1">
                {Math.min(...attempts.map((a) => a.percentage))}%
              </div>
            </div>
          </div>
        )}

        {/* Attempts List */}
        <div className="card bg-white p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            قائمة المحاولات ({attempts.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500">جاري تحميل المحاولات...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">لا توجد محاولات لعرضها</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                      الطالبة
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                      الفصل
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                      اللعبة
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                      النوع
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                      النتيجة
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                      الوقت
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                      التاريخ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr
                      key={attempt.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {attempt.nickname}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {attempt.classCode}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {attempt.gameTitle}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {getGameTypeLabel(attempt.gameType)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPercentageColor(
                            attempt.percentage
                          )}`}
                        >
                          {attempt.percentage.toFixed(0)}% ({attempt.score}/{attempt.totalScore})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatTime(attempt.timeSpent)}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatDate(attempt.completedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
