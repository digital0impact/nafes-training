"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
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

export default function GameResultPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { student } = useStudentAuth()
  const gameId = params.game_id as string
  const score = parseInt(searchParams.get("score") || "0")

  const [game, setGame] = useState<EducationalGame | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch("/api/educational-games")
        const data = await response.json()
        const foundGame = (data.games || []).find((g: EducationalGame) => g.game_id === gameId)
        if (foundGame) {
          setGame(foundGame)
        }
      } catch (error) {
        console.error("Error loading game", error)
      } finally {
        setLoading(false)
      }
    }
    loadGame()
  }, [gameId])

  const getStatusMessage = () => {
    if (score === 100) {
      return {
        text: "ممتاز! لقد أتقنت هذا الموضوع",
        color: "text-emerald-700",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        icon: "⭐"
      }
    } else if (score >= 70) {
      return {
        text: "جيد جداً! استمري في الممارسة",
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: "👍"
      }
    } else if (score >= 50) {
      return {
        text: "تحتاجين إلى مزيد من الممارسة",
        color: "text-amber-700",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        icon: "⚠️"
      }
    } else {
      return {
        text: "يحتاج إلى مراجعة فورية",
        color: "text-rose-700",
        bgColor: "bg-rose-50",
        borderColor: "border-rose-200",
        icon: "🔔"
      }
    }
  }

  const status = getStatusMessage()

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="card text-center py-12">
          <p className="text-slate-500">جاري تحميل النتيجة...</p>
        </div>
      </main>
    )
  }

  if (!game) {
    return (
      <main className="space-y-6">
        <div className="card text-center py-12">
          <p className="text-slate-500">اللعبة غير موجودة</p>
          <Link href="/student/games" className="mt-4 inline-block text-purple-600 hover:underline">
            العودة إلى قائمة الألعاب
          </Link>
        </div>
      </main>
    )
  }

  return (
    <StudentAuthGuard>
      <main className="space-y-6">
        {/* Header */}
        <header className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">انتهت اللعبة</h1>
            <p className="mt-1 text-sm text-slate-600">{game.title}</p>
          </div>
        </header>

        {/* Score Display */}
        <div className="card text-center">
          <div className="mb-6">
            <p className="text-sm text-slate-600 mb-2">نتيجتك</p>
            <div className="relative inline-flex items-center justify-center">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - score / 100)}`}
                  className={`transition-all duration-1000 ${
                    score >= 70 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-rose-600"
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${
                  score >= 70 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-rose-600"
                }`}>
                  {score}%
                </span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`rounded-xl p-4 border-2 ${status.bgColor} ${status.borderColor}`}>
            <p className="text-2xl mb-2">{status.icon}</p>
            <p className={`font-semibold ${status.color}`}>{status.text}</p>
          </div>
        </div>

        {/* Game Info */}
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-3">معلومات اللعبة</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">الفصل:</span>
              <span className="font-semibold text-slate-900">{game.chapter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">المستوى:</span>
              <span className="font-semibold text-slate-900">{game.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">النقاط:</span>
              <span className="font-semibold text-purple-700">{game.points} نقطة</span>
            </div>
          </div>
        </div>

        {/* Remedial Alert */}
        {score < 50 && (
          <div className="card bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">تنبيه</h3>
                <p className="text-sm text-amber-800">
                  سيتم إضافة ألعاب علاجية إلى خطتك لمساعدتك على تحسين أدائك
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="card">
          <div className="flex flex-col gap-3">
            {score < 70 && (
              <button
                onClick={() => router.push(`/student/games/${gameId}/play`)}
                className="w-full rounded-2xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 transition"
              >
                إعادة المحاولة
              </button>
            )}
            <Link
              href="/student/games?tab=completed"
              className="w-full text-center rounded-2xl bg-slate-100 py-3 font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              العودة إلى قائمة الألعاب
            </Link>
            <Link
              href="/student"
              className="w-full text-center rounded-2xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </main>
    </StudentAuthGuard>
  )
}
