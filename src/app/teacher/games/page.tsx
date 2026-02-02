"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { SectionHeader } from "@/components/ui/section-header"
import { PageBackground } from "@/components/layout/page-background"
import { gamesData } from "@/data/games-data"
import InteractiveCircuit from "@/components/games/InteractiveCircuit"
import AtomBuilder from "@/components/games/AtomBuilder"
import VolcanoTypesGame from "@/components/games/VolcanoTypesGame"

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

type Student = {
  id: string
  studentId: string
  name: string
  classCode: string
}

export default function TeacherGamesPage() {
  const [games, setGames] = useState<EducationalGame[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState<EducationalGame | null>(null)
  const [previewTab, setPreviewTab] = useState<"info" | "play">("info")
  const [showShareModal, setShowShareModal] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [shareToAll, setShareToAll] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [previewData, setPreviewData] = useState<any>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  // حالات اللعب
  const [orderingItems, setOrderingItems] = useState<Array<{ id: string; text: string; correctOrder: number }>>([])
  const [orderingSelected, setOrderingSelected] = useState<string[]>([])

  const [mcSelected, setMcSelected] = useState("")

  const [matchingPairs, setMatchingPairs] = useState<Array<{ id: string; label: string; target: string }>>([])
  const [matchingTargets, setMatchingTargets] = useState<string[]>([])
  const [matchingSelectedLabel, setMatchingSelectedLabel] = useState<string | null>(null)
  const [matchingMatches, setMatchingMatches] = useState<Record<string, string>>({})

  const [ddItems, setDdItems] = useState<Array<{ id: string; text: string; category: string }>>([])
  const [ddCategories, setDdCategories] = useState<string[]>([])
  const [ddPlacement, setDdPlacement] = useState<Record<string, string>>({})

  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<string, string>>({})

  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set())

  // Interactive circuit state
  const [circuitScenarioIndex, setCircuitScenarioIndex] = useState(0)
  const [circuitStates, setCircuitStates] = useState<Record<string, Record<string, boolean>>>({})

  // Atom builder state
  const [atomScenarioIndex, setAtomScenarioIndex] = useState(0)
  const [electronDistributions, setElectronDistributions] = useState<Record<string, { K: number; L: number; M: number; N: number }>>({})

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch("/api/educational-games")
        const data = await res.json()
        setGames(data.games || [])
      } catch (e) {
        console.error("Error loading games", e)
      } finally {
        setLoading(false)
      }
    }
    loadGames()
  }, [])

  const byChapter = useMemo(() => {
    const map: Record<string, EducationalGame[]> = {}
    for (const g of games) {
      map[g.chapter] ||= []
      map[g.chapter].push(g)
    }
    return map
  }, [games])

  const openPreview = (game: EducationalGame) => {
    setSelectedGame(game)
    setPreviewTab("info")
    setSubmitted(false)
    setScore(0)

    const d = (gamesData as any)[game.game_id]
    setPreviewData(d || null)

    // تهيئة
    setOrderingSelected([])
    setMcSelected("")
    setMatchingSelectedLabel(null)
    setMatchingMatches({})
    setDdPlacement({})
    setScenarioIndex(0)
    setScenarioAnswers({})
    setSelectedRegions(new Set())
    setCircuitScenarioIndex(0)
    setCircuitStates({})
    setAtomScenarioIndex(0)
    setElectronDistributions({})

    if (d?.type === "ordering") {
      setOrderingItems([...d.items].sort(() => Math.random() - 0.5))
    } else if (d?.type === "matching") {
      const shuffledPairs = [...d.pairs].sort(() => Math.random() - 0.5)
      setMatchingPairs(shuffledPairs)
      setMatchingTargets(shuffledPairs.map((p) => p.target).sort(() => Math.random() - 0.5))
    } else if (d?.type === "drag_drop") {
      setDdItems([...d.items].sort(() => Math.random() - 0.5))
      setDdCategories(d.categories || [])
    }
  }

  const handleCircuitStateChange = (scenarioId: string, componentId: string, state: boolean) => {
    setCircuitStates((prev) => ({
      ...prev,
      [scenarioId]: {
        ...prev[scenarioId],
        [componentId]: state
      }
    }))
  }

  const handleDistributionChange = (scenarioId: string, level: "K" | "L" | "M" | "N", delta: number) => {
    setElectronDistributions((prev) => {
      const current = prev[scenarioId] || { K: 0, L: 0, M: 0, N: 0 }
      const newValue = Math.max(0, current[level] + delta)
      return {
        ...prev,
        [scenarioId]: {
          ...current,
          [level]: newValue
        }
      }
    })
  }

  const closePreview = () => {
    setSelectedGame(null)
    setPreviewTab("info")
    setPreviewData(null)
    setSubmitted(false)
    setScore(0)
  }

  const openShareModal = async (game: EducationalGame) => {
    setSelectedGame(game)
    setShowShareModal(true)
    setSelectedStudents(new Set())
    setShareToAll(false)
    await fetchStudents()
  }

  const closeShareModal = () => {
    setShowShareModal(false)
    setSelectedGame(null)
    setSelectedStudents(new Set())
    setShareToAll(false)
  }

  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      const response = await fetch("/api/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoadingStudents(false)
    }
  }

  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  const toggleSelectAll = () => {
    if (shareToAll) {
      setShareToAll(false)
      setSelectedStudents(new Set())
    } else {
      setShareToAll(true)
      setSelectedStudents(new Set(students.map((s) => s.id)))
    }
  }

  const handleShareGame = async () => {
    if (!selectedGame) return

    if (selectedStudents.size === 0 && !shareToAll) {
      setMessage({ type: "error", text: "الرجاء اختيار طالبة واحدة على الأقل أو اختيار جميع الطالبات" })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setSharing(true)
    try {
      const response = await fetch("/api/game-shares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: selectedGame.game_id,
          shareToAll,
          studentIds: shareToAll ? [] : Array.from(selectedStudents),
        }),
      })

      if (response.ok) {
        setMessage({
          type: "success",
          text: `تم مشاركة اللعبة مع ${shareToAll ? "جميع الطالبات" : selectedStudents.size + " طالبة"}`,
        })
        closeShareModal()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const data = await response.json()
        setMessage({ type: "error", text: data.error || "حدث خطأ أثناء مشاركة اللعبة" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Error sharing game:", error)
      setMessage({ type: "error", text: "حدث خطأ أثناء مشاركة اللعبة" })
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setSharing(false)
    }
  }

  const calcScore = () => {
    if (!previewData) return 0
    let correct = 0
    let total = 0

    switch (previewData.type) {
      case "ordering":
        total = orderingItems.length
        orderingSelected.forEach((id, idx) => {
          const it = orderingItems.find((x) => x.id === id)
          if (it && it.correctOrder === idx + 1) correct++
        })
        break
      case "multiple_choice":
        total = 1
        correct = mcSelected === previewData.correctAnswer ? 1 : 0
        break
      case "matching":
        total = matchingPairs.length
        for (const p of matchingPairs) if (matchingMatches[p.id] === p.target) correct++
        break
      case "drag_drop":
        total = ddItems.length
        for (const it of ddItems) if (ddPlacement[it.id] === it.category) correct++
        break
      case "scenario_choice":
        total = previewData.scenarios.length
        for (const s of previewData.scenarios) if (scenarioAnswers[s.id] === s.correctAnswer) correct++
        break
      case "map_selection":
        total = previewData.regions.filter((r: any) => r.isCorrect).length
        for (const r of previewData.regions) {
          if (r.isCorrect && selectedRegions.has(r.id)) correct++
          if (!r.isCorrect && selectedRegions.has(r.id)) correct = Math.max(0, correct - 0.5)
        }
        break
      case "interactive_circuit":
        total = previewData.scenarios.length
        for (const scenario of previewData.scenarios) {
          const scenarioState = circuitStates[scenario.id] || {}
          const isCorrect = Object.keys(scenario.correctState).every(
            (key) => scenarioState[key] === scenario.correctState[key]
          )
          if (isCorrect) correct++
        }
        break
      case "atom_builder":
        total = previewData.scenarios.length
        for (const scenario of previewData.scenarios) {
          const distribution = electronDistributions[scenario.id] || { K: 0, L: 0, M: 0, N: 0 }
          const isCorrect =
            distribution.K === scenario.correctDistribution.K &&
            distribution.L === scenario.correctDistribution.L &&
            distribution.M === scenario.correctDistribution.M &&
            distribution.N === scenario.correctDistribution.N
          if (isCorrect) correct++
        }
        break
    }

    return Math.round((correct / total) * 100)
  }

  const canSubmit = () => {
    if (!previewData) return false
    switch (previewData.type) {
      case "ordering":
        return orderingSelected.length === orderingItems.length
      case "multiple_choice":
        return mcSelected !== ""
      case "matching":
        return Object.keys(matchingMatches).length === matchingPairs.length
      case "drag_drop":
        return Object.keys(ddPlacement).length === ddItems.length
      case "scenario_choice":
        return Object.keys(scenarioAnswers).length === previewData.scenarios.length
      case "map_selection":
        return selectedRegions.size > 0
      case "interactive_circuit":
        return previewData.scenarios.every((scenario: any) => {
          const scenarioState = circuitStates[scenario.id] || {}
          return Object.keys(scenario.correctState).every(
            (key) => scenarioState[key] !== undefined
          )
        })
      case "atom_builder":
        return previewData.scenarios.every((scenario: any) => {
          const distribution = electronDistributions[scenario.id] || { K: 0, L: 0, M: 0, N: 0 }
          const total = distribution.K + distribution.L + distribution.M + distribution.N
          return total === scenario.totalElectrons
        })
      default:
        return false
    }
  }

  const submit = () => {
    if (!canSubmit()) return
    setSubmitted(true)
    setScore(calcScore())
  }

  const reset = () => {
    if (!selectedGame || !previewData) return
    setSubmitted(false)
    setScore(0)

    setOrderingSelected([])
    setMcSelected("")
    setMatchingSelectedLabel(null)
    setMatchingMatches({})
    setDdPlacement({})
    setScenarioIndex(0)
    setScenarioAnswers({})
    setSelectedRegions(new Set())
    setCircuitStates({})
    setElectronDistributions({})

    if (previewData.type === "ordering") setOrderingItems([...previewData.items].sort(() => Math.random() - 0.5))
    if (previewData.type === "matching") {
      const shuffledPairs = [...previewData.pairs].sort(() => Math.random() - 0.5)
      setMatchingPairs(shuffledPairs)
      setMatchingTargets(shuffledPairs.map((p) => p.target).sort(() => Math.random() - 0.5))
    }
    if (previewData.type === "drag_drop") setDdItems([...previewData.items].sort(() => Math.random() - 0.5))
  }

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
        <PageBackground />
        <div className="relative z-10 space-y-6 p-4 py-8">
          <div className="card text-center py-12">
            <p className="text-slate-500">جاري تحميل الألعاب...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
        <header className="card bg-gradient-to-br from-white to-purple-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">الألعاب التعليمية</h1>
              <p className="mt-2 text-slate-600">معاينة الألعاب وتجربتها قبل استخدامها مع الطالبات</p>
            </div>
            <Link
              href="/teacher/games/attempts"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium whitespace-nowrap"
            >
              عرض محاولات الطلاب
            </Link>
          </div>
        </header>

        <SectionHeader title="قائمة الألعاب" subtitle={`${games.length} لعبة`} />

        <div className="space-y-6">
          {Object.keys(byChapter).map((chapter) => (
            <div key={chapter} className="card">
              <h2 className="text-lg font-bold text-slate-900">{chapter}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {byChapter[chapter].map((g) => (
                  <div key={g.game_id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-slate-900">{g.title}</p>
                      <span className="text-2xl">🎮</span>
                    </div>
                    <p className="text-xs text-slate-500">المستوى: {g.level} • النقاط: {g.points}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openPreview(g)}
                        className="flex-1 rounded-2xl bg-purple-600 py-2.5 font-semibold text-white hover:bg-purple-700"
                      >
                        معاينة اللعبة
                      </button>
                      <button
                        onClick={() => openShareModal(g)}
                        className="flex-1 rounded-2xl bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700"
                      >
                        مشاركة اللعبة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="border-b border-slate-200 p-6 bg-gradient-to-br from-white to-purple-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">معاينة اللعبة</h2>
                    <p className="mt-1 text-sm text-slate-600">{selectedGame.title}</p>
                  </div>
                  <button onClick={closePreview} className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                    ✕
                  </button>
                </div>
                <div className="mt-4 flex gap-2 border-b border-purple-200">
                  <button
                    onClick={() => setPreviewTab("info")}
                    className={`px-4 py-2 font-semibold border-b-2 ${previewTab === "info" ? "text-purple-700 border-purple-600" : "text-slate-500 border-transparent"}`}
                  >
                    معلومات اللعبة
                  </button>
                  <button
                    onClick={() => setPreviewTab("play")}
                    className={`px-4 py-2 font-semibold border-b-2 ${previewTab === "play" ? "text-purple-700 border-purple-600" : "text-slate-500 border-transparent"}`}
                  >
                    تجربة اللعب
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {previewTab === "info" ? (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                      <p className="text-sm font-semibold text-blue-900 mb-1">مؤشر التعلم</p>
                      <p className="text-sm text-blue-800">{selectedGame.learning_indicator}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                      <p className="text-sm font-semibold text-emerald-900 mb-1">الهدف</p>
                      <p className="text-sm text-emerald-800">{selectedGame.objective}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                        <p className="text-xs text-slate-600">المستوى</p>
                        <p className="font-bold text-slate-900">{selectedGame.level}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                        <p className="text-xs text-slate-600">الصعوبة</p>
                        <p className="font-bold text-slate-900">{selectedGame.difficulty}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!previewData ? (
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                        <p className="text-sm text-amber-800">بيانات اللعبة غير متاحة</p>
                      </div>
                    ) : previewData.type === "volcano_types" ? (
                      submitted ? (
                        <div className="rounded-xl border-2 border-emerald-200 p-6 text-center bg-emerald-50">
                          <p className="font-semibold text-emerald-900">انتهيت من المعاينة</p>
                          <p className="text-lg font-bold text-emerald-800 mt-2">النتيجة: {score}%</p>
                          <button
                            onClick={closePreview}
                            className="mt-4 px-6 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                          >
                            إغلاق
                          </button>
                        </div>
                      ) : (
                        <VolcanoTypesGame
                          gameData={previewData}
                          game={{
                            game_id: selectedGame.game_id,
                            title: selectedGame.title,
                            chapter: selectedGame.chapter,
                            objective: selectedGame.objective,
                            points: selectedGame.points,
                          }}
                          onComplete={(result) => {
                            setScore(result.score)
                            setSubmitted(true)
                          }}
                        />
                      )
                    ) : (
                      <>
                        {previewData.type === "ordering" && (
                          <div className="rounded-xl border-2 border-purple-200 p-4">
                            <p className="font-semibold mb-3">رتبي العناصر بالترتيب الصحيح</p>
                            {orderingSelected.length > 0 && (
                              <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 mb-4">
                                {orderingSelected.map((id, idx) => {
                                  const it = orderingItems.find((x) => x.id === id)
                                  const ok = submitted ? it?.correctOrder === idx + 1 : null
                                  return (
                                    <div key={id} className={`flex items-center gap-2 p-2 rounded border ${submitted ? (ok ? "bg-emerald-100 border-emerald-300" : "bg-rose-100 border-rose-300") : "bg-white border-purple-200"}`}>
                                      <span className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                                      <span className="font-semibold">{it?.text}</span>
                                      {submitted && <span className="mr-auto">{ok ? "✓" : "✗"}</span>}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                            <div className="grid gap-2 md:grid-cols-2">
                              {orderingItems.filter((x) => !orderingSelected.includes(x.id)).map((it) => (
                                <button
                                  key={it.id}
                                  disabled={submitted}
                                  onClick={() => setOrderingSelected([...orderingSelected, it.id])}
                                  className="p-3 rounded-lg border-2 border-slate-200 hover:border-purple-300 text-right disabled:opacity-50"
                                >
                                  {it.text}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {previewData.type === "multiple_choice" && (
                          <div className="rounded-xl border-2 border-purple-200 p-4">
                            <p className="font-semibold mb-3">{previewData.question}</p>
                            <div className="space-y-2">
                              {previewData.options.map((opt: string, i: number) => {
                                const isSel = mcSelected === opt
                                const isOk = submitted && opt === previewData.correctAnswer
                                const isBad = submitted && isSel && opt !== previewData.correctAnswer
                                return (
                                  <button
                                    key={i}
                                    disabled={submitted}
                                    onClick={() => setMcSelected(opt)}
                                    className={`w-full p-3 rounded-lg border-2 text-right ${isBad ? "bg-rose-100 border-rose-300" : isOk ? "bg-emerald-100 border-emerald-300" : isSel ? "bg-purple-100 border-purple-300" : "bg-white border-slate-200 hover:border-purple-300"} disabled:opacity-50`}
                                  >
                                    {opt} {submitted ? (isOk ? "✓" : isBad ? "✗" : "") : ""}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {previewData.type === "matching" && (
                          <div className="rounded-xl border-2 border-purple-200 p-4">
                            <p className="font-semibold mb-3">مطابقة</p>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                {matchingPairs.map((p) => {
                                  const sel = matchingSelectedLabel === p.id
                                  const matched = matchingMatches[p.id]
                                  const ok = submitted && matched === p.target
                                  const bad = submitted && matched && matched !== p.target
                                  return (
                                    <button
                                      key={p.id}
                                      disabled={submitted || !!matched}
                                      onClick={() => setMatchingSelectedLabel(sel ? null : p.id)}
                                      className={`w-full p-3 rounded-lg border-2 text-right ${sel ? "bg-purple-200 border-purple-400" : ok ? "bg-emerald-100 border-emerald-300" : bad ? "bg-rose-100 border-rose-300" : "bg-white border-slate-200 hover:border-purple-300"} disabled:opacity-50`}
                                    >
                                      {p.label} {submitted && matched ? (ok ? "✓" : "✗") : ""}
                                    </button>
                                  )
                                })}
                              </div>
                              <div className="space-y-2">
                                {matchingTargets.map((target) => (
                                  <button
                                    key={target}
                                    disabled={submitted || !matchingSelectedLabel || Object.values(matchingMatches).includes(target)}
                                    onClick={() => {
                                      if (!matchingSelectedLabel) return
                                      setMatchingMatches({ ...matchingMatches, [matchingSelectedLabel]: target })
                                      setMatchingSelectedLabel(null)
                                    }}
                                    className="w-full p-3 rounded-lg border-2 text-right bg-slate-50 border-slate-200 disabled:opacity-50"
                                  >
                                    {target}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {previewData.type === "drag_drop" && (
                          <div className="rounded-xl border-2 border-purple-200 p-4">
                            <p className="font-semibold mb-3">تصنيف</p>
                            <div className="grid md:grid-cols-3 gap-3 mb-4">
                              {ddCategories.map((c) => (
                                <div key={c} className="rounded-lg bg-purple-50 border border-purple-200 p-3 min-h-[160px]">
                                  <p className="font-semibold text-purple-900 mb-2">{c}</p>
                                  <div className="space-y-2">
                                    {ddItems.filter((it) => ddPlacement[it.id] === c).map((it) => {
                                      const ok = submitted && it.category === c
                                      const bad = submitted && it.category !== c
                                      return (
                                        <div key={it.id} className={`p-2 rounded border ${submitted ? (ok ? "bg-emerald-100 border-emerald-300" : bad ? "bg-rose-100 border-rose-300" : "bg-white border-purple-200") : "bg-white border-purple-200"}`}>
                                          {it.text} {submitted ? (ok ? "✓" : "✗") : ""}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="grid md:grid-cols-3 gap-2">
                              {ddItems.filter((it) => !ddPlacement[it.id]).map((it) => (
                                <button
                                  key={it.id}
                                  disabled={submitted}
                                  onClick={() => {
                                    const currentIndex = ddCategories.indexOf(ddPlacement[it.id] || "")
                                    const nextIndex = (currentIndex + 1) % ddCategories.length
                                    setDdPlacement({ ...ddPlacement, [it.id]: ddCategories[nextIndex] })
                                  }}
                                  className="p-3 rounded-lg border-2 border-slate-200 hover:border-purple-300 text-right disabled:opacity-50"
                                >
                                  {it.text}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {previewData.type === "scenario_choice" && (
                          <div className="rounded-xl border-2 border-purple-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-semibold">السيناريو {scenarioIndex + 1} من {previewData.scenarios.length}</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setScenarioIndex(Math.max(0, scenarioIndex - 1))}
                                  disabled={scenarioIndex === 0}
                                  className="px-3 py-1 rounded-lg border border-slate-300 disabled:opacity-50"
                                >
                                  السابق
                                </button>
                                <button
                                  onClick={() => setScenarioIndex(Math.min(previewData.scenarios.length - 1, scenarioIndex + 1))}
                                  disabled={scenarioIndex === previewData.scenarios.length - 1}
                                  className="px-3 py-1 rounded-lg border border-slate-300 disabled:opacity-50"
                                >
                                  التالي
                                </button>
                              </div>
                            </div>
                            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-3">
                              {previewData.scenarios[scenarioIndex].scenario}
                            </div>
                            <div className="space-y-2">
                              {previewData.scenarios[scenarioIndex].choices.map((c: string, i: number) => {
                                const sid = previewData.scenarios[scenarioIndex].id
                                const isSel = scenarioAnswers[sid] === c
                                const isOk = submitted && c === previewData.scenarios[scenarioIndex].correctAnswer
                                const isBad = submitted && isSel && c !== previewData.scenarios[scenarioIndex].correctAnswer
                                return (
                                  <button
                                    key={i}
                                    disabled={submitted}
                                    onClick={() => setScenarioAnswers({ ...scenarioAnswers, [sid]: c })}
                                    className={`w-full p-3 rounded-lg border-2 text-right ${isBad ? "bg-rose-100 border-rose-300" : isOk ? "bg-emerald-100 border-emerald-300" : isSel ? "bg-purple-100 border-purple-300" : "bg-white border-slate-200 hover:border-purple-300"} disabled:opacity-50`}
                                  >
                                    {c} {submitted ? (isOk ? "✓" : isBad ? "✗" : "") : ""}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {previewData.type === "map_selection" && (
                          <div className="rounded-xl border-2 border-purple-200 p-4">
                            <p className="font-semibold mb-3">{previewData.question}</p>
                            <div className="relative w-full h-80 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg">
                              {previewData.regions.map((r: any) => {
                                const isSel = selectedRegions.has(r.id)
                                const isOk = submitted && r.isCorrect
                                return (
                                  <button
                                    key={r.id}
                                    disabled={submitted}
                                    onClick={() => {
                                      const next = new Set(selectedRegions)
                                      next.has(r.id) ? next.delete(r.id) : next.add(r.id)
                                      setSelectedRegions(next)
                                    }}
                                    className={`absolute rounded-lg border-2 ${isSel ? (isOk ? "bg-emerald-300 border-emerald-600" : "bg-rose-300 border-rose-600") : "bg-white/50 border-slate-400 hover:border-purple-500"} disabled:opacity-50`}
                                    style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.width}%`, height: `${r.height}%` }}
                                  >
                                    <span className="text-xs font-semibold">{r.name}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {previewData.type === "interactive_circuit" && (
                          <div className="rounded-xl border-2 border-purple-200 p-4">
                            <InteractiveCircuit
                              gameData={previewData}
                              currentScenarioIndex={circuitScenarioIndex}
                              circuitStates={circuitStates}
                              onStateChange={handleCircuitStateChange}
                              isSubmitted={submitted}
                              showFeedback={submitted}
                            />
                            
                            {previewData.scenarios.length > 1 && (
                              <div className="mt-4 flex items-center justify-between">
                                <button
                                  onClick={() => setCircuitScenarioIndex(Math.max(0, circuitScenarioIndex - 1))}
                                  disabled={circuitScenarioIndex === 0 || submitted}
                                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50"
                                >
                                  السابق
                                </button>
                                <span className="text-sm text-slate-600">
                                  السيناريو {circuitScenarioIndex + 1} من {previewData.scenarios.length}
                                </span>
                                <button
                                  onClick={() => setCircuitScenarioIndex(Math.min(previewData.scenarios.length - 1, circuitScenarioIndex + 1))}
                                  disabled={circuitScenarioIndex === previewData.scenarios.length - 1 || submitted}
                                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50"
                                >
                                  التالي
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {previewData.type === "atom_builder" && (
                          <div className="rounded-xl border-2 border-purple-200 p-4">
                            <AtomBuilder
                              gameData={previewData}
                              currentScenarioIndex={atomScenarioIndex}
                              electronDistributions={electronDistributions}
                              onDistributionChange={handleDistributionChange}
                              isSubmitted={submitted}
                              showFeedback={submitted}
                            />
                            
                            {previewData.scenarios.length > 1 && (
                              <div className="mt-4 flex items-center justify-between">
                                <button
                                  onClick={() => setAtomScenarioIndex(Math.max(0, atomScenarioIndex - 1))}
                                  disabled={atomScenarioIndex === 0 || submitted}
                                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50"
                                >
                                  السابق
                                </button>
                                <span className="text-sm text-slate-600">
                                  السيناريو {atomScenarioIndex + 1} من {previewData.scenarios.length}
                                </span>
                                <button
                                  onClick={() => setAtomScenarioIndex(Math.min(previewData.scenarios.length - 1, atomScenarioIndex + 1))}
                                  disabled={atomScenarioIndex === previewData.scenarios.length - 1 || submitted}
                                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50"
                                >
                                  التالي
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {submitted && (
                          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-700">النتيجة: {score}%</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={submit}
                            disabled={submitted || !canSubmit()}
                            className="flex-1 rounded-2xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                          >
                            {submitted ? "تم الإرسال" : "تأكيد الإجابة"}
                          </button>
                          <button
                            onClick={reset}
                            className="px-6 rounded-2xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            إعادة تعيين
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && selectedGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="border-b border-slate-200 p-6 bg-gradient-to-br from-white to-emerald-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">مشاركة اللعبة</h2>
                    <p className="mt-1 text-slate-600">{selectedGame.title}</p>
                  </div>
                  <button
                    onClick={closeShareModal}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {message && (
                  <div
                    className={`rounded-lg p-4 ${
                      message.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Share Options */}
                <div className="space-y-4">
                  <div className="rounded-xl border-2 border-emerald-200 p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareToAll}
                        onChange={toggleSelectAll}
                        className="w-5 h-5 text-emerald-600 rounded"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">مشاركة مع جميع الطالبات</p>
                        <p className="text-sm text-slate-600">ستكون اللعبة متاحة لجميع الطالبات في جميع الفصول</p>
                      </div>
                    </label>
                  </div>

                  {!shareToAll && (
                    <div className="rounded-xl border-2 border-slate-200 p-4">
                      <p className="font-semibold text-slate-900 mb-3">أو اختر طالبات محددين:</p>
                      {loadingStudents ? (
                        <div className="text-center py-8">
                          <p className="text-slate-500">جاري تحميل قائمة الطالبات...</p>
                        </div>
                      ) : students.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-slate-500">لا توجد طالبات مسجلات</p>
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-y-auto space-y-2">
                          {students.map((student) => (
                            <label
                              key={student.id}
                              className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedStudents.has(student.id)}
                                onChange={() => toggleStudent(student.id)}
                                className="w-4 h-4 text-emerald-600 rounded"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">{student.name}</p>
                                <p className="text-sm text-slate-600">
                                  {student.studentId} • {student.classCode}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 p-6 bg-slate-50 flex gap-3">
                <button
                  onClick={closeShareModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-white"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleShareGame}
                  disabled={sharing || (selectedStudents.size === 0 && !shareToAll)}
                  className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sharing ? "جاري المشاركة..." : "مشاركة اللعبة"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

