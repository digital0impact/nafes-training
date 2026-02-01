"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { StudentAuthGuard, useStudentAuth } from "@/components/student"
import { gamesData } from "@/data/games-data"
import InteractiveCircuit from "@/components/games/InteractiveCircuit"
import AtomBuilder from "@/components/games/AtomBuilder"
import AtomBuilderEnhanced from "@/components/games/AtomBuilderEnhanced"
import PeriodicFamilyComparison from "@/components/games/PeriodicFamilyComparison"

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

export default function GamePlayPage() {
  const params = useParams()
  const router = useRouter()
  const { student } = useStudentAuth()
  const gameId = params.game_id as string

  const [game, setGame] = useState<EducationalGame | null>(null)
  const [loading, setLoading] = useState(true)
  const [gameData, setGameData] = useState<any>(null)
  
  // Ordering state
  const [orderingItems, setOrderingItems] = useState<Array<{ id: string; text: string; correctOrder: number }>>([])
  const [selectedOrderingItems, setSelectedOrderingItems] = useState<string[]>([])
  
  // Multiple choice state
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  
  // Matching state
  const [matchingPairs, setMatchingPairs] = useState<Array<{ id: string; label: string; target: string }>>([])
  const [matchingTargets, setMatchingTargets] = useState<string[]>([])
  const [selectedMatches, setSelectedMatches] = useState<Record<string, string>>({})
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  
  // Drag drop state
  const [dragDropItems, setDragDropItems] = useState<Array<{ id: string; text: string; category: string }>>([])
  const [dragDropCategories, setDragDropCategories] = useState<string[]>([])
  const [itemCategories, setItemCategories] = useState<Record<string, string>>({})
  
  // Scenario choice state
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0)
  const [scenarioAnswers, setScenarioAnswers] = useState<Record<string, string>>({})
  
  // Map selection state
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set())
  
  // Interactive circuit state
  const [circuitScenarioIndex, setCircuitScenarioIndex] = useState(0)
  const [circuitStates, setCircuitStates] = useState<Record<string, Record<string, boolean>>>({})
  
  const handleCircuitStateChange = (scenarioId: string, componentId: string, state: boolean) => {
    setCircuitStates((prev) => ({
      ...prev,
      [scenarioId]: {
        ...prev[scenarioId],
        [componentId]: state
      }
    }))
  }

  // Atom builder state
  const [atomScenarioIndex, setAtomScenarioIndex] = useState(0)
  const [electronDistributions, setElectronDistributions] = useState<Record<string, { K: number; L: number; M: number; N: number }>>({})

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

  // Periodic family comparison state
  const [periodicFamilyElementIndex, setPeriodicFamilyElementIndex] = useState(0)
  const [periodicFamilyDistributions, setPeriodicFamilyDistributions] = useState<Record<string, { K: number; L: number; M: number; N: number }>>({})
  const [periodicFamilyAnswers, setPeriodicFamilyAnswers] = useState<Record<string, string>>({})

  const handlePeriodicFamilyDistributionChange = (elementId: string, level: "K" | "L" | "M" | "N", delta: number) => {
    setPeriodicFamilyDistributions((prev) => {
      const current = prev[elementId] || { K: 0, L: 0, M: 0, N: 0 }
      const newValue = Math.max(0, current[level] + delta)
      return {
        ...prev,
        [elementId]: {
          ...current,
          [level]: newValue
        }
      }
    })
  }

  const handlePeriodicFamilyAnswer = (questionId: string, answer: string) => {
    if (isSubmitted) return
    setPeriodicFamilyAnswers({ ...periodicFamilyAnswers, [questionId]: answer })
  }
  
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch("/api/educational-games")
        const data = await response.json()
        const foundGame = (data.games || []).find((g: EducationalGame) => g.game_id === gameId)
        
        if (foundGame) {
          setGame(foundGame)
          
          // تحميل بيانات اللعبة
          const dataForGame = gamesData[gameId]
          if (dataForGame) {
            setGameData(dataForGame)
            
          // تهيئة البيانات حسب نوع اللعبة
          if (dataForGame.type === "ordering") {
            const shuffled = [...dataForGame.items].sort(() => Math.random() - 0.5)
            setOrderingItems(shuffled)
            setSelectedOrderingItems([])
          } else if (dataForGame.type === "matching") {
            const shuffledPairs = [...dataForGame.pairs].sort(() => Math.random() - 0.5)
            setMatchingPairs(shuffledPairs)
            // خلط الأوصاف بشكل مستقل حتى لا تكون مطابقة لترتيب المهارات
            setMatchingTargets(shuffledPairs.map((p: any) => p.target).sort(() => Math.random() - 0.5))
            setSelectedMatches({})
          } else if (dataForGame.type === "drag_drop") {
            const shuffledItems = [...dataForGame.items].sort(() => Math.random() - 0.5)
            setDragDropItems(shuffledItems)
            setDragDropCategories(dataForGame.categories)
            setItemCategories({})
          } else if (dataForGame.type === "scenario_choice") {
            setScenarioAnswers({})
            setCurrentScenarioIndex(0)
          } else if (dataForGame.type === "map_selection") {
            setSelectedRegions(new Set())
          } else if (dataForGame.type === "interactive_circuit") {
            setCircuitScenarioIndex(0)
            setCircuitStates({})
          } else if (dataForGame.type === "atom_builder") {
            setAtomScenarioIndex(0)
            setElectronDistributions({})
          } else if (dataForGame.type === "periodic_family_comparison") {
            setPeriodicFamilyElementIndex(0)
            setPeriodicFamilyDistributions({})
            setPeriodicFamilyAnswers({})
          }
          
          // بدء حساب الوقت
          setStartTime(Date.now())
          }
        }
      } catch (error) {
        console.error("Error loading game", error)
      } finally {
        setLoading(false)
      }
    }
    loadGame()
  }, [gameId])

  // Ordering handlers
  const handleOrderingItemClick = (itemId: string) => {
    if (isSubmitted) return
    if (selectedOrderingItems.includes(itemId)) {
      setSelectedOrderingItems(selectedOrderingItems.filter((id) => id !== itemId))
    } else {
      setSelectedOrderingItems([...selectedOrderingItems, itemId])
    }
  }

  // Matching handlers
  const handleMatchingLabelClick = (labelId: string) => {
    if (isSubmitted) return
    if (selectedLabel === labelId) {
      setSelectedLabel(null)
    } else {
      setSelectedLabel(labelId)
    }
  }

  const handleMatchingTargetClick = (target: string) => {
    if (isSubmitted || !selectedLabel) return
    setSelectedMatches({ ...selectedMatches, [selectedLabel]: target })
    setSelectedLabel(null)
  }

  // Drag drop handlers
  const handleDragDropItemClick = (itemId: string, category: string) => {
    if (isSubmitted) return
    setItemCategories({ ...itemCategories, [itemId]: category })
  }

  // Scenario handlers
  const handleScenarioAnswer = (scenarioId: string, answer: string) => {
    if (isSubmitted) return
    setScenarioAnswers({ ...scenarioAnswers, [scenarioId]: answer })
  }

  const handleNextScenario = () => {
    if (currentScenarioIndex < (gameData?.scenarios?.length || 0) - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1)
    }
  }

  const handlePreviousScenario = () => {
    if (currentScenarioIndex > 0) {
      setCurrentScenarioIndex(currentScenarioIndex - 1)
    }
  }

  // Map selection handlers
  const handleRegionClick = (regionId: string) => {
    if (isSubmitted) return
    const newSelected = new Set(selectedRegions)
    if (newSelected.has(regionId)) {
      newSelected.delete(regionId)
    } else {
      newSelected.add(regionId)
    }
    setSelectedRegions(newSelected)
  }

  const calculateScore = () => {
    if (!gameData) return 0

    let correct = 0
    let total = 0

    switch (gameData.type) {
      case "ordering":
        total = orderingItems.length
        selectedOrderingItems.forEach((itemId, index) => {
          const item = orderingItems.find((i) => i.id === itemId)
          if (item && item.correctOrder === index + 1) {
            correct++
          }
        })
        break

      case "multiple_choice":
        total = 1
        if (selectedAnswer === gameData.correctAnswer) {
          correct = 1
        }
        break

      case "matching":
        total = matchingPairs.length
        matchingPairs.forEach((pair) => {
          if (selectedMatches[pair.id] === pair.target) {
            correct++
          }
        })
        break

      case "drag_drop":
        total = dragDropItems.length
        dragDropItems.forEach((item) => {
          if (itemCategories[item.id] === item.category) {
            correct++
          }
        })
        break

      case "scenario_choice":
        total = gameData.scenarios.length
        gameData.scenarios.forEach((scenario: any) => {
          if (scenarioAnswers[scenario.id] === scenario.correctAnswer) {
            correct++
          }
        })
        break

      case "map_selection":
        total = gameData.regions.filter((r: any) => r.isCorrect).length
        gameData.regions.forEach((region: any) => {
          if (region.isCorrect && selectedRegions.has(region.id)) {
            correct++
          } else if (!region.isCorrect && selectedRegions.has(region.id)) {
            // خصم نقطة للاختيار الخاطئ
            correct = Math.max(0, correct - 0.5)
          }
        })
        break

      case "interactive_circuit":
        total = gameData.scenarios.length
        gameData.scenarios.forEach((scenario: any) => {
          const scenarioState = circuitStates[scenario.id] || {}
          const isCorrect = Object.keys(scenario.correctState).every(
            (key) => scenarioState[key] === scenario.correctState[key]
          )
          if (isCorrect) correct++
        })
        break

      case "atom_builder":
        total = gameData.scenarios.length
        gameData.scenarios.forEach((scenario: any) => {
          const distribution = electronDistributions[scenario.id] || { K: 0, L: 0, M: 0, N: 0 }
          const isCorrect =
            distribution.K === scenario.correctDistribution.K &&
            distribution.L === scenario.correctDistribution.L &&
            distribution.M === scenario.correctDistribution.M &&
            distribution.N === scenario.correctDistribution.N
          if (isCorrect) correct++
        })
        break

      case "periodic_family_comparison":
        total = gameData.elements.length
        gameData.elements.forEach((element: any) => {
          const distribution = periodicFamilyDistributions[element.id] || { K: 0, L: 0, M: 0, N: 0 }
          const isCorrect =
            distribution.K === element.correctDistribution.K &&
            distribution.L === element.correctDistribution.L &&
            distribution.M === element.correctDistribution.M &&
            distribution.N === element.correctDistribution.N
          if (isCorrect) correct++
        })
        break
    }

    return Math.round((correct / total) * 100)
  }

  const handleSubmit = async () => {
    if (!gameData) return

    // التحقق من اكتمال الإجابات
    let isComplete = false
    switch (gameData.type) {
      case "ordering":
        isComplete = selectedOrderingItems.length === orderingItems.length
        break
      case "multiple_choice":
        isComplete = selectedAnswer !== ""
        break
      case "matching":
        isComplete = Object.keys(selectedMatches).length === matchingPairs.length
        break
      case "drag_drop":
        isComplete = Object.keys(itemCategories).length === dragDropItems.length
        break
      case "scenario_choice":
        isComplete = Object.keys(scenarioAnswers).length === gameData.scenarios.length
        break
      case "map_selection":
        isComplete = selectedRegions.size > 0
        break
      case "interactive_circuit":
        isComplete = gameData.scenarios.every((scenario: any) => {
          const scenarioState = circuitStates[scenario.id] || {}
          return Object.keys(scenario.correctState).every(
            (key) => scenarioState[key] !== undefined
          )
        })
        break
      case "atom_builder":
        isComplete = gameData.scenarios.every((scenario: any) => {
          const distribution = electronDistributions[scenario.id] || { K: 0, L: 0, M: 0, N: 0 }
          const total = distribution.K + distribution.L + distribution.M + distribution.N
          return total === scenario.totalElectrons
        })
        break
      case "periodic_family_comparison":
        isComplete = gameData.elements.every((element: any) => {
          const distribution = periodicFamilyDistributions[element.id] || { K: 0, L: 0, M: 0, N: 0 }
          const total = distribution.K + distribution.L + distribution.M + distribution.N
          return total === element.totalElectrons
        })
        break
    }

    if (!isComplete) {
      setShowFeedback(true)
      setFeedbackMessage("الرجاء إكمال جميع الإجابات")
      setTimeout(() => setShowFeedback(false), 2000)
      return
    }

    setIsSubmitted(true)
    const percentage = calculateScore()
    setScore(percentage)

    // حساب الوقت المستغرق
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    // جمع الإجابات حسب نوع اللعبة
    let answersData: Record<string, any> = {}
    switch (gameData.type) {
      case "ordering":
        answersData = { selectedOrder: selectedOrderingItems }
        break
      case "multiple_choice":
        answersData = { selectedAnswer }
        break
      case "matching":
        answersData = { matches: selectedMatches }
        break
      case "drag_drop":
        answersData = { categories: itemCategories }
        break
      case "scenario_choice":
        answersData = { scenarioAnswers }
        break
      case "map_selection":
        answersData = { selectedRegions: Array.from(selectedRegions) }
        break
      case "interactive_circuit":
        answersData = { circuitStates }
        break
      case "atom_builder":
        answersData = { electronDistributions }
        break
      case "periodic_family_comparison":
        answersData = { 
          electronDistributions: periodicFamilyDistributions,
          comparisonAnswers: periodicFamilyAnswers
        }
        break
    }

    // حماية للـ TypeScript: أثناء التنفيذ قد لا تكون اللعبة محمّلة بعد
    if (!game) {
      return
    }

    // حفظ النتيجة في قاعدة البيانات
    if (student) {
      setSaving(true)
      try {
        await fetch("/api/game-attempts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickname: student.name,
            classCode: student.classCode,
            studentDbId: student.id,
            gameId: gameId,
            gameTitle: game.title,
            gameType: game.game_type,
            chapter: game.chapter,
            answers: answersData,
            score: Math.round((percentage / 100) * game.points),
            totalScore: game.points,
            percentage: percentage,
            timeSpent: timeSpent,
          }),
        })
      } catch (error) {
        console.error("Error saving game attempt:", error)
      } finally {
        setSaving(false)
      }
    }

    // رسالة التغذية الراجعة
    if (percentage === 100) {
      setFeedbackMessage("ممتاز! لقد أتقنت الإجابة")
    } else if (percentage >= 70) {
      setFeedbackMessage("جيد جداً! حاولي مرة أخرى لتحسين النتيجة")
    } else {
      setFeedbackMessage("تحتاجين إلى مزيد من الممارسة")
    }

    setShowFeedback(true)
    setTimeout(() => {
      setShowFeedback(false)
      router.push(`/student/games/${gameId}/result?score=${percentage}`)
    }, 2000)
  }

  const isOrderingItemCorrect = (itemId: string, position: number) => {
    if (!isSubmitted) return null
    const item = orderingItems.find((i) => i.id === itemId)
    if (!item) return null
    return item.correctOrder === position + 1
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <div className="card text-center py-12">
          <p className="text-slate-500">جاري تحميل اللعبة...</p>
        </div>
      </main>
    )
  }

  if (!game || !gameData) {
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
          <div className="flex items-start justify-between">
            <div>
              <Link
                href="/student/games"
                className="text-sm text-purple-600 hover:underline mb-2 inline-block"
              >
                ← العودة إلى الألعاب
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">{game.title}</h1>
              <p className="mt-1 text-sm text-slate-600">{game.chapter}</p>
            </div>
          </div>
        </header>

        {/* Instruction */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">الهدف</h3>
              <p className="text-sm text-blue-800">{game.objective}</p>
            </div>
          </div>
        </div>

        {/* Game Area - Ordering */}
        {gameData.type === "ordering" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              رتبي الخطوات بالترتيب الصحيح (من البداية إلى النهاية)
            </h3>
            
            {selectedOrderingItems.length > 0 && (
              <div className="rounded-lg bg-purple-50 border-2 border-purple-200 p-4 mb-6 min-h-[200px]">
                <p className="text-sm font-semibold text-purple-900 mb-3">الترتيب المختار:</p>
                <div className="space-y-2">
                  {selectedOrderingItems.map((itemId, index) => {
                    const item = orderingItems.find((i) => i.id === itemId)
                    const isCorrect = isOrderingItemCorrect(itemId, index)
                    
                    return (
                      <div
                        key={itemId}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition ${
                          isSubmitted
                            ? isCorrect
                              ? "bg-emerald-100 border-emerald-400"
                              : "bg-rose-100 border-rose-400"
                            : "bg-white border-purple-300"
                        }`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="flex-1 font-semibold text-slate-900">{item?.text}</span>
                        {isSubmitted && <span className="text-xl">{isCorrect ? "✓" : "✗"}</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">
                العناصر المتاحة (انقري على العنصر لإضافته للترتيب):
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {orderingItems
                  .filter((item) => !selectedOrderingItems.includes(item.id))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleOrderingItemClick(item.id)}
                      disabled={isSubmitted}
                      className="p-4 rounded-lg border-2 border-slate-200 bg-white hover:border-purple-400 hover:bg-purple-50 transition text-right disabled:opacity-50"
                    >
                      <span className="font-semibold text-slate-900">{item.text}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Area - Multiple Choice */}
        {gameData.type === "multiple_choice" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{gameData.question}</h3>
            <div className="space-y-3">
              {gameData.options.map((option: string, index: number) => {
                const isSelected = selectedAnswer === option
                const isCorrect = isSubmitted && option === gameData.correctAnswer
                const isWrong = isSubmitted && isSelected && option !== gameData.correctAnswer
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    disabled={isSubmitted}
                    className={`w-full p-4 rounded-lg border-2 text-right transition ${
                      isWrong
                        ? "bg-rose-100 border-rose-400"
                        : isCorrect
                        ? "bg-emerald-100 border-emerald-400"
                        : isSelected
                        ? "bg-purple-100 border-purple-400"
                        : "bg-white border-slate-200 hover:border-purple-300"
                    } disabled:opacity-50`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 font-semibold text-slate-900">{option}</span>
                      {isSubmitted && (isCorrect ? "✓" : isWrong ? "✗" : "")}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Game Area - Matching */}
        {gameData.type === "matching" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              ربط كل عنصر بالوصف المناسب
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Labels */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">العناصر:</p>
                <div className="space-y-2">
                  {matchingPairs.map((pair) => {
                    const isSelected = selectedLabel === pair.id
                    const matchedTarget = selectedMatches[pair.id]
                    
                    return (
                      <button
                        key={pair.id}
                        onClick={() => handleMatchingLabelClick(pair.id)}
                        disabled={isSubmitted || !!matchedTarget}
                        className={`w-full p-3 rounded-lg border-2 text-right transition ${
                          isSelected
                            ? "bg-purple-200 border-purple-500"
                            : matchedTarget
                            ? isSubmitted && matchedTarget === pair.target
                              ? "bg-emerald-100 border-emerald-400"
                              : "bg-rose-100 border-rose-400"
                            : "bg-white border-slate-200 hover:border-purple-300"
                        } disabled:opacity-50`}
                      >
                        <span className="font-semibold text-slate-900">{pair.label}</span>
                        {matchedTarget && isSubmitted && (
                          <span className="mr-2">{matchedTarget === pair.target ? "✓" : "✗"}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Targets */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">الأوصاف:</p>
                <div className="space-y-2">
                  {matchingTargets.map((target) => (
                    <button
                      key={target}
                      onClick={() => handleMatchingTargetClick(target)}
                      disabled={isSubmitted || !selectedLabel || Object.values(selectedMatches).includes(target)}
                      className={`w-full p-3 rounded-lg border-2 text-right transition ${
                        selectedLabel && !Object.values(selectedMatches).includes(target)
                          ? "bg-blue-50 border-blue-300 hover:border-blue-500"
                          : "bg-slate-50 border-slate-200"
                      } disabled:opacity-50`}
                    >
                      <span className="text-slate-700">{target}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Area - Drag Drop */}
        {gameData.type === "drag_drop" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              سحب كل عنصر إلى التصنيف المناسب
            </h3>
            
            {/* Categories */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {dragDropCategories.map((category) => {
                const itemsInCategory = dragDropItems.filter(
                  (item) => itemCategories[item.id] === category
                )
                
                return (
                  <div
                    key={category}
                    className="rounded-lg border-2 border-purple-300 bg-purple-50 p-4 min-h-[200px]"
                  >
                    <h4 className="font-semibold text-purple-900 mb-3">{category}</h4>
                    <div className="space-y-2">
                      {itemsInCategory.map((item) => {
                        const isCorrect = isSubmitted && item.category === category
                        
                        return (
                          <div
                            key={item.id}
                            className={`p-2 rounded border ${
                              isCorrect
                                ? "bg-emerald-100 border-emerald-400"
                                : isSubmitted
                                ? "bg-rose-100 border-rose-400"
                                : "bg-white border-purple-200"
                            }`}
                          >
                            <span className="text-sm font-semibold">{item.text}</span>
                            {isSubmitted && <span className="mr-2">{isCorrect ? "✓" : "✗"}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Available Items */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">العناصر المتاحة:</p>
              <div className="grid gap-2 md:grid-cols-3">
                {dragDropItems
                  .filter((item) => !itemCategories[item.id])
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        // دورة بين التصنيفات
                        const currentIndex = dragDropCategories.indexOf(itemCategories[item.id] || "")
                        const nextIndex = (currentIndex + 1) % dragDropCategories.length
                        handleDragDropItemClick(item.id, dragDropCategories[nextIndex])
                      }}
                      disabled={isSubmitted}
                      className="p-3 rounded-lg border-2 border-slate-200 bg-white hover:border-purple-400 hover:bg-purple-50 transition text-right disabled:opacity-50"
                    >
                      <span className="font-semibold text-slate-900">{item.text}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Game Area - Scenario Choice */}
        {gameData.type === "scenario_choice" && (
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                السيناريو {currentScenarioIndex + 1} من {gameData.scenarios.length}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousScenario}
                  disabled={currentScenarioIndex === 0}
                  className="px-3 py-1 rounded-lg border border-slate-300 disabled:opacity-50"
                >
                  السابق
                </button>
                <button
                  onClick={handleNextScenario}
                  disabled={currentScenarioIndex === gameData.scenarios.length - 1}
                  className="px-3 py-1 rounded-lg border border-slate-300 disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>

            {gameData.scenarios[currentScenarioIndex] && (
              <>
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-4">
                  <p className="font-semibold text-blue-900">
                    {gameData.scenarios[currentScenarioIndex].scenario}
                  </p>
                </div>

                <div className="space-y-3">
                  {gameData.scenarios[currentScenarioIndex].choices.map((choice: string, index: number) => {
                    const scenarioId = gameData.scenarios[currentScenarioIndex].id
                    const isSelected = scenarioAnswers[scenarioId] === choice
                    const isCorrect = isSubmitted && choice === gameData.scenarios[currentScenarioIndex].correctAnswer
                    const isWrong = isSubmitted && isSelected && choice !== gameData.scenarios[currentScenarioIndex].correctAnswer
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleScenarioAnswer(scenarioId, choice)}
                        disabled={isSubmitted}
                        className={`w-full p-4 rounded-lg border-2 text-right transition ${
                          isWrong
                            ? "bg-rose-100 border-rose-400"
                            : isCorrect
                            ? "bg-emerald-100 border-emerald-400"
                            : isSelected
                            ? "bg-purple-100 border-purple-400"
                            : "bg-white border-slate-200 hover:border-purple-300"
                        } disabled:opacity-50`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1 font-semibold text-slate-900">{choice}</span>
                          {isSubmitted && (isCorrect ? "✓" : isWrong ? "✗" : "")}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Game Area - Map Selection */}
        {gameData.type === "map_selection" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{gameData.question}</h3>
            <div className="relative bg-slate-100 border-2 border-slate-300 rounded-lg p-4" style={{ minHeight: "400px" }}>
              <p className="text-sm text-slate-600 mb-4 text-center">
                انقري على المناطق الصحيحة على الخريطة
              </p>
              <div className="relative w-full h-80 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg">
                {gameData.regions.map((region: any) => {
                  const isSelected = selectedRegions.has(region.id)
                  const isCorrect = isSubmitted && region.isCorrect
                  
                  return (
                    <button
                      key={region.id}
                      onClick={() => handleRegionClick(region.id)}
                      disabled={isSubmitted}
                      className={`absolute rounded-lg border-2 transition ${
                        isSelected
                          ? isCorrect
                            ? "bg-emerald-300 border-emerald-600"
                            : "bg-rose-300 border-rose-600"
                          : "bg-white/50 border-slate-400 hover:border-purple-500"
                      } disabled:opacity-50`}
                      style={{
                        left: `${region.x}%`,
                        top: `${region.y}%`,
                        width: `${region.width}%`,
                        height: `${region.height}%`
                      }}
                    >
                      <span className="text-xs font-semibold">{region.name}</span>
                      {isSelected && isSubmitted && <span className="mr-1">{isCorrect ? "✓" : "✗"}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Game Area - Interactive Circuit */}
        {gameData.type === "interactive_circuit" && (
          <div className="card">
            <InteractiveCircuit
              gameData={gameData}
              currentScenarioIndex={circuitScenarioIndex}
              circuitStates={circuitStates}
              onStateChange={handleCircuitStateChange}
              isSubmitted={isSubmitted}
              showFeedback={isSubmitted}
            />
            
            {/* Navigation for multiple scenarios */}
            {gameData.scenarios.length > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setCircuitScenarioIndex(Math.max(0, circuitScenarioIndex - 1))}
                  disabled={circuitScenarioIndex === 0 || isSubmitted}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="text-sm text-slate-600">
                  السيناريو {circuitScenarioIndex + 1} من {gameData.scenarios.length}
                </span>
                <button
                  onClick={() => setCircuitScenarioIndex(Math.min(gameData.scenarios.length - 1, circuitScenarioIndex + 1))}
                  disabled={circuitScenarioIndex === gameData.scenarios.length - 1 || isSubmitted}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        )}

        {/* Game Area - Atom Builder (Enhanced with 4 stages) */}
        {gameData.type === "atom_builder" && (
          <div className="card">
            <AtomBuilderEnhanced
              gameData={gameData}
              currentScenarioIndex={atomScenarioIndex}
              electronDistributions={electronDistributions}
              onDistributionChange={handleDistributionChange}
              isSubmitted={isSubmitted}
              showFeedback={isSubmitted}
            />
            
            {/* Navigation for multiple scenarios */}
            {gameData.scenarios.length > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setAtomScenarioIndex(Math.max(0, atomScenarioIndex - 1))}
                  disabled={atomScenarioIndex === 0 || isSubmitted}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="text-sm text-slate-600">
                  السيناريو {atomScenarioIndex + 1} من {gameData.scenarios.length}
                </span>
                <button
                  onClick={() => setAtomScenarioIndex(Math.min(gameData.scenarios.length - 1, atomScenarioIndex + 1))}
                  disabled={atomScenarioIndex === gameData.scenarios.length - 1 || isSubmitted}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        )}

        {/* Game Area - Periodic Family Comparison */}
        {gameData.type === "periodic_family_comparison" && (
          <div className="card">
            <PeriodicFamilyComparison
              gameData={gameData}
              currentElementIndex={periodicFamilyElementIndex}
              electronDistributions={periodicFamilyDistributions}
              onDistributionChange={handlePeriodicFamilyDistributionChange}
              comparisonAnswers={periodicFamilyAnswers}
              onComparisonAnswer={handlePeriodicFamilyAnswer}
              isSubmitted={isSubmitted}
              showFeedback={isSubmitted}
            />
            
            {/* Navigation for multiple elements */}
            {gameData.elements.length > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setPeriodicFamilyElementIndex(Math.max(0, periodicFamilyElementIndex - 1))}
                  disabled={periodicFamilyElementIndex === 0 || isSubmitted}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  السابق
                </button>
                <span className="text-sm text-slate-600">
                  العنصر {periodicFamilyElementIndex + 1} من {gameData.elements.length}
                </span>
                <button
                  onClick={() => setPeriodicFamilyElementIndex(Math.min(gameData.elements.length - 1, periodicFamilyElementIndex + 1))}
                  disabled={periodicFamilyElementIndex === gameData.elements.length - 1 || isSubmitted}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        )}

        {/* Feedback Overlay */}
        {showFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
              <p className="text-lg font-semibold text-slate-900">{feedbackMessage}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="card">
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitted}
              className="flex-1 rounded-2xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitted ? "تم الإرسال" : "تأكيد الإجابة"}
            </button>
            {!isSubmitted && (
              <button
                onClick={() => {
                  // إعادة تعيين حسب نوع اللعبة
                  if (gameData.type === "ordering") {
                    const shuffled = [...gameData.items].sort(() => Math.random() - 0.5)
                    setOrderingItems(shuffled)
                    setSelectedOrderingItems([])
                  } else if (gameData.type === "multiple_choice") {
                    setSelectedAnswer("")
                  } else if (gameData.type === "matching") {
                    setSelectedMatches({})
                    setSelectedLabel(null)
                  } else if (gameData.type === "drag_drop") {
                    setItemCategories({})
                  } else if (gameData.type === "scenario_choice") {
                    setScenarioAnswers({})
                    setCurrentScenarioIndex(0)
                  } else if (gameData.type === "map_selection") {
                    setSelectedRegions(new Set())
                  } else if (gameData.type === "atom_builder") {
                    setElectronDistributions({})
                    setAtomScenarioIndex(0)
                  } else if (gameData.type === "periodic_family_comparison") {
                    setPeriodicFamilyDistributions({})
                    setPeriodicFamilyElementIndex(0)
                    setPeriodicFamilyAnswers({})
                  }
                }}
                className="px-6 rounded-2xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                إعادة تعيين
              </button>
            )}
          </div>
        </div>
      </main>
    </StudentAuthGuard>
  )
}
