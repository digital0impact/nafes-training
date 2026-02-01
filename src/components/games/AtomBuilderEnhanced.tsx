"use client"

import { useState, useEffect } from "react"
import type { AtomBuilderGameData, AtomScenario } from "@/types/games"

// أنواع المراحل
type GameStage = "construction" | "analysis" | "periodic" | "energy"

interface AtomBuilderEnhancedProps {
  gameData: AtomBuilderGameData
  currentScenarioIndex: number
  electronDistributions: Record<string, { K: number; L: number; M: number; N: number }>
  onDistributionChange: (scenarioId: string, level: "K" | "L" | "M" | "N", delta: number) => void
  isSubmitted: boolean
  showFeedback: boolean
  onStageComplete?: (scenarioId: string, stage: GameStage, score: number) => void
}

export default function AtomBuilderEnhanced({
  gameData,
  currentScenarioIndex,
  electronDistributions,
  onDistributionChange,
  isSubmitted,
  showFeedback,
  onStageComplete
}: AtomBuilderEnhancedProps) {
  const scenario = gameData.scenarios[currentScenarioIndex]
  const distribution = electronDistributions[scenario.id] || { K: 0, L: 0, M: 0, N: 0 }
  const totalPlaced = distribution.K + distribution.L + distribution.M + distribution.N
  const remainingElectrons = scenario.totalElectrons - totalPlaced

  // حالة المراحل
  const [currentStage, setCurrentStage] = useState<GameStage>("construction")
  const [analysisAnswers, setAnalysisAnswers] = useState<Record<string, string>>({})
  const [periodicAnswers, setPeriodicAnswers] = useState<{ period: number | null; group: number | null }>({ period: null, group: null })
  const [energySelection, setEnergySelection] = useState<{ lowest: string | null; highest: string | null }>({ lowest: null, highest: null })
  const [stageScores, setStageScores] = useState<Record<GameStage, number>>({
    construction: 0,
    analysis: 0,
    periodic: 0,
    energy: 0
  })

  // حساب المستويات المشغولة
  const getOccupiedLevels = () => {
    const levels: string[] = []
    if (distribution.K > 0) levels.push("K")
    if (distribution.L > 0) levels.push("L")
    if (distribution.M > 0) levels.push("M")
    if (distribution.N > 0) levels.push("N")
    return levels
  }

  // الحصول على المستوى الخارجي
  const getOutermostLevel = () => {
    const occupied = getOccupiedLevels()
    return occupied[occupied.length - 1] || null
  }

  // الحصول على عدد الإلكترونات في المستوى الخارجي
  const getOutermostElectrons = () => {
    const outermost = getOutermostLevel()
    if (!outermost) return 0
    return distribution[outermost as "K" | "L" | "M" | "N"]
  }

  // التحقق من اكتمال مرحلة البناء
  const isConstructionComplete = () => {
    return totalPlaced === scenario.totalElectrons &&
      distribution.K === scenario.correctDistribution.K &&
      distribution.L === scenario.correctDistribution.L &&
      distribution.M === scenario.correctDistribution.M &&
      distribution.N === scenario.correctDistribution.N
  }

  // أسئلة التحليل
  const analysisQuestions = [
    {
      id: "lowest_energy",
      question: "ما هو المستوى الأقل طاقة في ذرة " + scenario.elementName + "؟",
      options: ["المستوى K", "المستوى L", "المستوى M", "المستوى N"],
      correctAnswer: "المستوى K",
      explanation: "المستوى K هو الأقل طاقة لأنه الأقرب إلى النواة. الطاقة تزداد كلما ابتعدنا عن النواة."
    },
    {
      id: "highest_energy",
      question: "ما هو المستوى الأعلى طاقة في ذرة " + scenario.elementName + "؟",
      options: ["المستوى K", "المستوى L", "المستوى M", "المستوى N"],
      correctAnswer: getOutermostLevel() ? `المستوى ${getOutermostLevel()}` : "المستوى K",
      explanation: `المستوى ${getOutermostLevel()} هو الأعلى طاقة لأنه الأبعد عن النواة. الطاقة تزداد مع البعد عن النواة.`
    },
    {
      id: "filled_first",
      question: "أي مستوى امتلأ أولاً بالإلكترونات؟",
      options: ["المستوى K", "المستوى L", "المستوى M", "المستوى N"],
      correctAnswer: "المستوى K",
      explanation: "المستوى K يمتلأ أولاً لأنه الأقل طاقة. الإلكترونات تملأ المستويات من الأقل إلى الأعلى طاقة."
    },
    {
      id: "capacity_comparison",
      question: `كم إلكترون في المستوى L مقارنة بسعته القصوى؟`,
      options: [
        `${distribution.L} إلكترون من أصل ${gameData.energyLevelCapacities.L}`,
        `${gameData.energyLevelCapacities.L} إلكترون من أصل ${distribution.L}`,
        "المستوى L ممتلئ بالكامل",
        "المستوى L فارغ"
      ],
      correctAnswer: `${distribution.L} إلكترون من أصل ${gameData.energyLevelCapacities.L}`,
      explanation: `المستوى L يحتوي على ${distribution.L} إلكترونات من أصل ${gameData.energyLevelCapacities.L} إلكترون (سعته القصوى).`
    }
  ]

  // الانتقال للمرحلة التالية
  const handleNextStage = () => {
    if (currentStage === "construction" && isConstructionComplete()) {
      setCurrentStage("analysis")
      setStageScores(prev => ({ ...prev, construction: 100 }))
      onStageComplete?.(scenario.id, "construction", 100)
    } else if (currentStage === "analysis") {
      // حساب نقاط التحليل
      const correct = analysisQuestions.filter(q => analysisAnswers[q.id] === q.correctAnswer).length
      const score = Math.round((correct / analysisQuestions.length) * 100)
      setStageScores(prev => ({ ...prev, analysis: score }))
      onStageComplete?.(scenario.id, "analysis", score)
      setCurrentStage("periodic")
    } else if (currentStage === "periodic") {
      // حساب نقاط الجدول الدوري
      const periodCorrect = periodicAnswers.period === scenario.period
      const groupCorrect = periodicAnswers.group === scenario.group
      const score = periodCorrect && groupCorrect ? 100 : periodCorrect || groupCorrect ? 50 : 0
      setStageScores(prev => ({ ...prev, periodic: score }))
      onStageComplete?.(scenario.id, "periodic", score)
      setCurrentStage("energy")
    }
  }

  // التحقق من اكتمال جميع المراحل
  const allStagesComplete = () => {
    return currentStage === "energy" && energySelection.lowest === "K" && energySelection.highest === getOutermostLevel()
  }

  // حساب النقاط الإجمالية (بدون تحديث state داخل render)
  const calculateTotalScore = () => {
    if (currentStage === "energy" && allStagesComplete()) {
      return Math.round((stageScores.construction + stageScores.analysis + stageScores.periodic + 100) / 4)
    }
    return Math.round((stageScores.construction + stageScores.analysis + stageScores.periodic + stageScores.energy) / 4)
  }

  // تحديث نقاط مرحلة الطاقة عند اكتمالها
  useEffect(() => {
    if (currentStage === "energy" && allStagesComplete() && stageScores.energy === 0) {
      const energyScore = 100
      setStageScores(prev => ({ ...prev, energy: energyScore }))
      onStageComplete?.(scenario.id, "energy", energyScore)
    }
  }, [currentStage, energySelection.lowest, energySelection.highest, stageScores.energy, scenario.id, onStageComplete])

  // دوال مساعدة للبناء
  const canAddElectron = (level: "K" | "L" | "M" | "N") => {
    if (isSubmitted || currentStage !== "construction") return false
    if (remainingElectrons <= 0) return false
    const current = distribution[level]
    const capacity = gameData.energyLevelCapacities[level]
    return current < capacity
  }

  const canRemoveElectron = (level: "K" | "L" | "M" | "N") => {
    if (isSubmitted || currentStage !== "construction") return false
    return distribution[level] > 0
  }

  const handleAddElectron = (level: "K" | "L" | "M" | "N") => {
    if (canAddElectron(level)) {
      onDistributionChange(scenario.id, level, 1)
    }
  }

  const handleRemoveElectron = (level: "K" | "L" | "M" | "N") => {
    if (canRemoveElectron(level)) {
      onDistributionChange(scenario.id, level, -1)
    }
  }

  const renderEnergyLevel = (
    level: "K" | "L" | "M" | "N",
    radius: number,
    capacity: number,
    current: number,
    levelName: string
  ) => {
    const isLevelCorrect = showFeedback && current === scenario.correctDistribution[level]
    const isLevelWrong = showFeedback && current !== scenario.correctDistribution[level]

    return (
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 transition-all ${
          isLevelCorrect
            ? "border-emerald-500 bg-emerald-50"
            : isLevelWrong
            ? "border-rose-500 bg-rose-50"
            : "border-purple-400 bg-purple-50"
        }`}
        style={{
          width: `${radius}px`,
          height: `${radius}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {/* Electrons visualization */}
        <div className="absolute inset-0" style={{ transformOrigin: 'center center' }}>
          {Array.from({ length: current }).map((_, i) => {
            const electronRadius = radius / 2 - 8 - 2
            const animationDuration = 8
            const animationDelay = current > 0 ? (i / current) * animationDuration : 0
            
            return (
              <div
                key={i}
                className={`absolute w-4 h-4 rounded-full border-2 shadow-md z-20 ${
                  isLevelCorrect
                    ? "bg-red-500 border-red-700"
                    : isLevelWrong
                    ? "bg-red-400 border-red-600"
                    : "bg-red-500 border-red-700"
                }`}
                style={{
                  left: '50%',
                  top: '50%',
                  transformOrigin: 'center center',
                  animation: `electronOrbit${level} ${animationDuration}s linear infinite`,
                  animationDelay: `${-animationDelay}s`
                }}
              />
            )
          })}
        </div>

        {/* Level Label */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-sm font-bold text-slate-700">{levelName}</span>
        </div>

        {/* Capacity Info */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-slate-600 whitespace-nowrap">
          {current}/{capacity}
        </div>
      </div>
    )
  }

  // إضافة CSS animations (مرة واحدة فقط)
  useEffect(() => {
    // التحقق من وجود الأنيميشن مسبقاً
    if (document.getElementById('atom-builder-animations')) {
      return
    }

    const style = document.createElement('style')
    style.id = 'atom-builder-animations'
    style.textContent = `
      @keyframes electronOrbitK {
        from {
          transform: translate(-50%, -50%) rotate(0deg) translateX(${120 / 2 - 8 - 2}px) rotate(0deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(360deg) translateX(${120 / 2 - 8 - 2}px) rotate(-360deg);
        }
      }
      @keyframes electronOrbitL {
        from {
          transform: translate(-50%, -50%) rotate(0deg) translateX(${240 / 2 - 8 - 2}px) rotate(0deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(360deg) translateX(${240 / 2 - 8 - 2}px) rotate(-360deg);
        }
      }
      @keyframes electronOrbitM {
        from {
          transform: translate(-50%, -50%) rotate(0deg) translateX(${360 / 2 - 8 - 2}px) rotate(0deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(360deg) translateX(${360 / 2 - 8 - 2}px) rotate(-360deg);
        }
      }
      @keyframes electronOrbitN {
        from {
          transform: translate(-50%, -50%) rotate(0deg) translateX(${480 / 2 - 8 - 2}px) rotate(0deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(360deg) translateX(${480 / 2 - 8 - 2}px) rotate(-360deg);
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      const existingStyle = document.getElementById('atom-builder-animations')
      if (existingStyle && document.head.contains(existingStyle)) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [])

  // ========== مرحلة البناء ==========
  const renderConstructionStage = () => {
    const isCorrect = isConstructionComplete()
    
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            المرحلة 1: بناء الذرة - {scenario.elementName} ({scenario.elementSymbol})
          </h3>
          <p className="text-blue-800">
            {scenario.learningFocus}
          </p>
          <p className="text-sm text-blue-700 mt-2">
            العدد الذري: {scenario.atomicNumber} | إجمالي الإلكترونات: {scenario.totalElectrons}
          </p>
        </div>

        {/* Remaining Electrons */}
        <div className="text-center">
          <div className="inline-block px-4 py-2 rounded-lg bg-purple-100 border-2 border-purple-300">
            <span className="text-sm font-semibold text-purple-900">
              الإلكترونات المتبقية: {remainingElectrons}
            </span>
          </div>
        </div>

        {/* Atom Visualization */}
        <div className="flex justify-center items-center py-8">
          <div className="relative" style={{ width: "500px", height: "500px" }}>
            {/* Energy Levels */}
            {renderEnergyLevel("N", 480, gameData.energyLevelCapacities.N, distribution.N, "المستوى N")}
            {renderEnergyLevel("M", 360, gameData.energyLevelCapacities.M, distribution.M, "المستوى M")}
            {renderEnergyLevel("L", 240, gameData.energyLevelCapacities.L, distribution.L, "المستوى L")}
            {renderEnergyLevel("K", 120, gameData.energyLevelCapacities.K, distribution.K, "المستوى K")}

            {/* Nucleus */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-20 h-20 rounded-full bg-yellow-500 border-4 border-yellow-600 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-xs font-bold text-yellow-900">{scenario.elementSymbol}</div>
                  <div className="text-xs text-yellow-800">{scenario.atomicNumber}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        {!isSubmitted && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            {(["K", "L", "M", "N"] as const).map((level) => {
              const levelNames = { K: "المستوى K", L: "المستوى L", M: "المستوى M", N: "المستوى N" }
              const capacities = gameData.energyLevelCapacities[level]
              const current = distribution[level]
              
              return (
                <div key={level} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-sm font-semibold text-slate-700">{levelNames[level]}</span>
                  <span className="text-xs text-slate-600">{current}/{capacities}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemoveElectron(level)}
                      disabled={!canRemoveElectron(level)}
                      className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleAddElectron(level)}
                      disabled={!canAddElectron(level)}
                      className="px-3 py-1 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      +
                    </button>
                  </div>
                  {showFeedback && (
                    <div className="text-xs font-semibold mt-1">
                      {current === scenario.correctDistribution[level] ? (
                        <span className="text-emerald-600">✓ صحيح</span>
                      ) : (
                        <span className="text-rose-600">
                          ✗ يجب أن يكون {scenario.correctDistribution[level]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Energy Level Capacities Reference */}
        <div className="rounded-lg bg-slate-50 border-2 border-slate-200 p-4">
          <h4 className="font-semibold text-slate-900 mb-2">سعة مستويات الطاقة:</h4>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <span className="font-bold text-purple-600">K: {gameData.energyLevelCapacities.K}</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-purple-600">L: {gameData.energyLevelCapacities.L}</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-purple-600">M: {gameData.energyLevelCapacities.M}</span>
            </div>
            <div className="text-center">
              <span className="font-bold text-purple-600">N: {gameData.energyLevelCapacities.N}</span>
            </div>
          </div>
        </div>
        
        {/* زر الانتقال - يظهر عند اكتمال التوزيع */}
        {totalPlaced === scenario.totalElectrons && (
          <div className={`rounded-lg border-2 p-4 ${
            isCorrect 
              ? "bg-emerald-50 border-emerald-400" 
              : "bg-rose-50 border-rose-400"
          }`}>
            {isCorrect ? (
              <>
                <p className="font-semibold text-emerald-900 text-center mb-4">
                  ✓ ممتاز! لقد قمت بتوزيع الإلكترونات بشكل صحيح
                </p>
                <button
                  onClick={handleNextStage}
                  className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 transition"
                >
                  الانتقال إلى مرحلة التحليل →
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold text-rose-900 text-center mb-2">
                  ✗ التوزيع غير صحيح
                </p>
                <p className="text-sm text-rose-800 mb-4 text-center">
                  التوزيع الصحيح: K={scenario.correctDistribution.K}, L={scenario.correctDistribution.L}, M={scenario.correctDistribution.M}, N={scenario.correctDistribution.N}
                </p>
                <button
                  onClick={handleNextStage}
                  className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 transition"
                >
                  المتابعة إلى مرحلة التحليل (يمكنك المحاولة مرة أخرى لاحقاً) →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // ========== مرحلة التحليل ==========
  const renderAnalysisStage = () => {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            المرحلة 2: التحليل - {scenario.elementName}
          </h3>
          <p className="text-blue-800">
            أجب على الأسئلة التالية حول توزيع الإلكترونات
          </p>
        </div>

        <div className="space-y-4">
          {analysisQuestions.map((q) => {
            const selected = analysisAnswers[q.id]
            const isCorrect = selected === q.correctAnswer
            const showAnswer = showFeedback || isSubmitted

            return (
              <div key={q.id} className="rounded-lg border-2 p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3">{q.question}</h4>
                <div className="space-y-2">
                  {q.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => !isSubmitted && setAnalysisAnswers(prev => ({ ...prev, [q.id]: option }))}
                      disabled={isSubmitted}
                      className={`w-full p-3 rounded-lg border-2 text-right transition ${
                        selected === option
                          ? showAnswer && isCorrect
                            ? "bg-emerald-100 border-emerald-400"
                            : showAnswer && !isCorrect
                            ? "bg-rose-100 border-rose-400"
                            : "bg-purple-100 border-purple-400"
                          : "bg-white border-slate-200 hover:border-purple-300"
                      } disabled:opacity-50`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {showAnswer && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"
                  }`}>
                    <p className={`text-sm font-semibold ${isCorrect ? "text-emerald-900" : "text-rose-900"}`}>
                      {isCorrect ? "✓ صحيح" : "✗ غير صحيح"}
                    </p>
                    <p className="text-xs text-slate-700 mt-1">{q.explanation}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* زر الانتقال - يظهر عند الإجابة على جميع الأسئلة */}
        {Object.keys(analysisAnswers).length === analysisQuestions.length ? (
          <button
            onClick={handleNextStage}
            className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 transition"
          >
            الانتقال إلى مرحلة الجدول الدوري →
          </button>
        ) : (
          <div className="rounded-lg bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-600">
              يرجى الإجابة على جميع الأسئلة ({Object.keys(analysisAnswers).length} / {analysisQuestions.length})
            </p>
          </div>
        )}
      </div>
    )
  }

  // ========== مرحلة الجدول الدوري ==========
  const renderPeriodicStage = () => {
    const periodCorrect = periodicAnswers.period === scenario.period
    const groupCorrect = periodicAnswers.group === scenario.group
    const showAnswer = showFeedback || isSubmitted

    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            المرحلة 3: الجدول الدوري - {scenario.elementName}
          </h3>
          <p className="text-blue-800">
            حدد موقع العنصر في الجدول الدوري بناءً على التوزيع الإلكتروني
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* تحديد الدورة */}
          <div className="rounded-lg border-2 p-4 bg-white">
            <h4 className="font-semibold text-slate-900 mb-3">
              الدورة = عدد مستويات الطاقة المشغولة
            </h4>
            <p className="text-sm text-slate-600 mb-3">
              المستويات المشغولة: {getOccupiedLevels().join(", ")}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((p) => (
                <button
                  key={p}
                  onClick={() => !isSubmitted && setPeriodicAnswers(prev => ({ ...prev, period: p }))}
                  disabled={isSubmitted}
                  className={`p-3 rounded-lg border-2 transition ${
                    periodicAnswers.period === p
                      ? showAnswer && periodCorrect
                        ? "bg-emerald-100 border-emerald-400"
                        : showAnswer && !periodCorrect
                        ? "bg-rose-100 border-rose-400"
                        : "bg-purple-100 border-purple-400"
                      : "bg-white border-slate-200 hover:border-purple-300"
                  } disabled:opacity-50`}
                >
                  {p}
                </button>
              ))}
            </div>
            {showAnswer && (
              <div className={`mt-3 p-3 rounded-lg ${
                periodCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"
              }`}>
                <p className={`text-sm font-semibold ${periodCorrect ? "text-emerald-900" : "text-rose-900"}`}>
                  {periodCorrect ? "✓ صحيح" : `✗ غير صحيح. الدورة الصحيحة: ${scenario.period}`}
                </p>
                <p className="text-xs text-slate-700 mt-1">
                  الدورة = عدد مستويات الطاقة المشغولة = {scenario.period}
                </p>
              </div>
            )}
          </div>

          {/* تحديد المجموعة */}
          <div className="rounded-lg border-2 p-4 bg-white">
            <h4 className="font-semibold text-slate-900 mb-3">
              المجموعة = عدد الإلكترونات في المستوى الخارجي
            </h4>
            <p className="text-sm text-slate-600 mb-3">
              المستوى الخارجي ({getOutermostLevel()}): {getOutermostElectrons()} إلكترون
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 6, 8].map((g) => (
                <button
                  key={g}
                  onClick={() => !isSubmitted && setPeriodicAnswers(prev => ({ ...prev, group: g }))}
                  disabled={isSubmitted}
                  className={`p-3 rounded-lg border-2 transition ${
                    periodicAnswers.group === g
                      ? showAnswer && groupCorrect
                        ? "bg-emerald-100 border-emerald-400"
                        : showAnswer && !groupCorrect
                        ? "bg-rose-100 border-rose-400"
                        : "bg-purple-100 border-purple-400"
                      : "bg-white border-slate-200 hover:border-purple-300"
                  } disabled:opacity-50`}
                >
                  {g}
                </button>
              ))}
            </div>
            {showAnswer && (
              <div className={`mt-3 p-3 rounded-lg ${
                groupCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"
              }`}>
                <p className={`text-sm font-semibold ${groupCorrect ? "text-emerald-900" : "text-rose-900"}`}>
                  {groupCorrect ? "✓ صحيح" : `✗ غير صحيح. المجموعة الصحيحة: ${scenario.group}`}
                </p>
                <p className="text-xs text-slate-700 mt-1">
                  المجموعة = عدد الإلكترونات في المستوى الخارجي = {scenario.group}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* زر الانتقال - يظهر عند تحديد الدورة والمجموعة */}
        {periodicAnswers.period !== null && periodicAnswers.group !== null ? (
          <button
            onClick={handleNextStage}
            className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 transition"
          >
            الانتقال إلى مرحلة تحديد الطاقة →
          </button>
        ) : (
          <div className="rounded-lg bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-600">
              يرجى تحديد الدورة والمجموعة
            </p>
          </div>
        )}
      </div>
    )
  }

  // ========== مرحلة تحديد الطاقة ==========
  const renderEnergyStage = () => {
    const lowestCorrect = energySelection.lowest === "K"
    const highestCorrect = energySelection.highest === getOutermostLevel()
    const showAnswer = showFeedback || isSubmitted

    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            المرحلة 4: تحديد مستويات الطاقة - {scenario.elementName}
          </h3>
          <p className="text-blue-800">
            حدد المستوى الأقل والأعلى طاقة في الذرة
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* تحديد المستوى الأقل طاقة */}
          <div className="rounded-lg border-2 p-4 bg-white">
            <h4 className="font-semibold text-slate-900 mb-3">
              المستوى الأقل طاقة
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {["K", "L", "M", "N"].filter(l => distribution[l as "K" | "L" | "M" | "N"] > 0).map((level) => (
                <button
                  key={level}
                  onClick={() => !isSubmitted && setEnergySelection(prev => ({ ...prev, lowest: level }))}
                  disabled={isSubmitted}
                  className={`p-3 rounded-lg border-2 transition ${
                    energySelection.lowest === level
                      ? showAnswer && lowestCorrect
                        ? "bg-emerald-100 border-emerald-400"
                        : showAnswer && !lowestCorrect
                        ? "bg-rose-100 border-rose-400"
                        : "bg-purple-100 border-purple-400"
                      : "bg-white border-slate-200 hover:border-purple-300"
                  } disabled:opacity-50`}
                >
                  المستوى {level}
                </button>
              ))}
            </div>
            {showAnswer && (
              <div className={`mt-3 p-3 rounded-lg ${
                lowestCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"
              }`}>
                <p className={`text-sm font-semibold ${lowestCorrect ? "text-emerald-900" : "text-rose-900"}`}>
                  {lowestCorrect ? "✓ صحيح" : "✗ غير صحيح. المستوى K هو الأقل طاقة"}
                </p>
                <p className="text-xs text-slate-700 mt-1">
                  المستوى K هو الأقل طاقة لأنه الأقرب إلى النواة. الطاقة تزداد كلما ابتعدنا عن النواة.
                </p>
              </div>
            )}
          </div>

          {/* تحديد المستوى الأعلى طاقة */}
          <div className="rounded-lg border-2 p-4 bg-white">
            <h4 className="font-semibold text-slate-900 mb-3">
              المستوى الأعلى طاقة
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {["K", "L", "M", "N"].filter(l => distribution[l as "K" | "L" | "M" | "N"] > 0).map((level) => (
                <button
                  key={level}
                  onClick={() => !isSubmitted && setEnergySelection(prev => ({ ...prev, highest: level }))}
                  disabled={isSubmitted}
                  className={`p-3 rounded-lg border-2 transition ${
                    energySelection.highest === level
                      ? showAnswer && highestCorrect
                        ? "bg-emerald-100 border-emerald-400"
                        : showAnswer && !highestCorrect
                        ? "bg-rose-100 border-rose-400"
                        : "bg-purple-100 border-purple-400"
                      : "bg-white border-slate-200 hover:border-purple-300"
                  } disabled:opacity-50`}
                >
                  المستوى {level}
                </button>
              ))}
            </div>
            {showAnswer && (
              <div className={`mt-3 p-3 rounded-lg ${
                highestCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"
              }`}>
                <p className={`text-sm font-semibold ${highestCorrect ? "text-emerald-900" : "text-rose-900"}`}>
                  {highestCorrect ? "✓ صحيح" : `✗ غير صحيح. المستوى ${getOutermostLevel()} هو الأعلى طاقة`}
                </p>
                <p className="text-xs text-slate-700 mt-1">
                  المستوى {getOutermostLevel()} هو الأعلى طاقة لأنه الأبعد عن النواة. الطاقة تزداد مع البعد عن النواة.
                </p>
              </div>
            )}
          </div>
        </div>

        {allStagesComplete() && (
          <div className="rounded-lg bg-emerald-50 border-2 border-emerald-400 p-4">
            <p className="font-semibold text-emerald-900 text-center text-lg mb-2">
              🏆 مبروك! لقد أكملت جميع المراحل
            </p>
            <p className="text-center text-emerald-800 mb-4">
              النقاط الإجمالية: {calculateTotalScore()}%
            </p>
            {currentScenarioIndex < gameData.scenarios.length - 1 ? (
              <p className="text-center text-sm text-slate-600">
                يمكنك الانتقال إلى السيناريو التالي
              </p>
            ) : (
              <div className="rounded-lg bg-yellow-50 border-2 border-yellow-400 p-4 mt-4">
                <p className="font-bold text-yellow-900 text-center text-lg">
                  🎖️ حصلت على شارة: "خبير التوزيع الإلكتروني"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // اختيار المرحلة للعرض
  const renderCurrentStage = () => {
    switch (currentStage) {
      case "construction":
        return renderConstructionStage()
      case "analysis":
        return renderAnalysisStage()
      case "periodic":
        return renderPeriodicStage()
      case "energy":
        return renderEnergyStage()
      default:
        return renderConstructionStage()
    }
  }

  // إعادة تعيين المرحلة عند تغيير السيناريو
  useEffect(() => {
    setCurrentStage("construction")
    setAnalysisAnswers({})
    setPeriodicAnswers({ period: null, group: null })
    setEnergySelection({ lowest: null, highest: null })
    setStageScores({
      construction: 0,
      analysis: 0,
      periodic: 0,
      energy: 0
    })
  }, [currentScenarioIndex, scenario.id])

  return (
    <div className="space-y-6">
      {/* مؤشر التقدم */}
      <div className="rounded-lg bg-slate-50 border-2 border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">المرحلة الحالية:</span>
          <span className="text-sm font-bold text-purple-600">
            {currentStage === "construction" && "1. بناء الذرة"}
            {currentStage === "analysis" && "2. التحليل"}
            {currentStage === "periodic" && "3. الجدول الدوري"}
            {currentStage === "energy" && "4. تحديد الطاقة"}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentScenarioIndex + 1) / gameData.scenarios.length) * 100}%`
            }}
          />
        </div>
        {/* مؤشر مراحل السيناريو */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className={currentStage === "construction" ? "font-bold text-purple-600" : ""}>بناء</span>
          <span className={currentStage === "analysis" ? "font-bold text-purple-600" : ""}>تحليل</span>
          <span className={currentStage === "periodic" ? "font-bold text-purple-600" : ""}>جدول</span>
          <span className={currentStage === "energy" ? "font-bold text-purple-600" : ""}>طاقة</span>
        </div>
      </div>

      {/* أزرار التنقل بين المراحل (للاختبار والتنقل السريع) */}
      {!isSubmitted && (
        <div className="rounded-lg bg-yellow-50 border-2 border-yellow-200 p-3">
          <p className="text-xs text-yellow-800 mb-2 text-center font-semibold">التنقل السريع بين المراحل:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setCurrentStage("construction")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                currentStage === "construction" 
                  ? "bg-purple-600 text-white shadow-md" 
                  : "bg-white border-2 border-slate-300 text-slate-700 hover:border-purple-400"
              }`}
            >
              1. بناء الذرة
            </button>
            <button
              onClick={() => setCurrentStage("analysis")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                currentStage === "analysis" 
                  ? "bg-purple-600 text-white shadow-md" 
                  : "bg-white border-2 border-slate-300 text-slate-700 hover:border-purple-400"
              }`}
            >
              2. التحليل
            </button>
            <button
              onClick={() => setCurrentStage("periodic")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                currentStage === "periodic" 
                  ? "bg-purple-600 text-white shadow-md" 
                  : "bg-white border-2 border-slate-300 text-slate-700 hover:border-purple-400"
              }`}
            >
              3. الجدول الدوري
            </button>
            <button
              onClick={() => setCurrentStage("energy")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                currentStage === "energy" 
                  ? "bg-purple-600 text-white shadow-md" 
                  : "bg-white border-2 border-slate-300 text-slate-700 hover:border-purple-400"
              }`}
            >
              4. تحديد الطاقة
            </button>
          </div>
        </div>
      )}

      {renderCurrentStage()}
    </div>
  )
}
