"use client"

import { useState, useEffect } from "react"
import type { AtomBuilderGameData, AtomScenario } from "@/types/games"

interface AtomBuilderProps {
  gameData: AtomBuilderGameData
  currentScenarioIndex: number
  electronDistributions: Record<string, { K: number; L: number; M: number; N: number }>
  onDistributionChange: (scenarioId: string, level: "K" | "L" | "M" | "N", delta: number) => void
  isSubmitted: boolean
  showFeedback: boolean
}

export default function AtomBuilder({
  gameData,
  currentScenarioIndex,
  electronDistributions,
  onDistributionChange,
  isSubmitted,
  showFeedback
}: AtomBuilderProps) {
  const scenario = gameData.scenarios[currentScenarioIndex]
  const distribution = electronDistributions[scenario.id] || { K: 0, L: 0, M: 0, N: 0 }
  const totalPlaced = distribution.K + distribution.L + distribution.M + distribution.N
  const remainingElectrons = scenario.totalElectrons - totalPlaced

  const isCorrect = () => {
    if (!showFeedback) return null
    return (
      distribution.K === scenario.correctDistribution.K &&
      distribution.L === scenario.correctDistribution.L &&
      distribution.M === scenario.correctDistribution.M &&
      distribution.N === scenario.correctDistribution.N
    )
  }

  const canAddElectron = (level: "K" | "L" | "M" | "N") => {
    if (isSubmitted) return false
    if (remainingElectrons <= 0) return false
    const current = distribution[level]
    const capacity = gameData.energyLevelCapacities[level]
    return current < capacity
  }

  const canRemoveElectron = (level: "K" | "L" | "M" | "N") => {
    if (isSubmitted) return false
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
            // نصف قطر الدائرة ناقص نصف قطر الإلكترون (8px) وسمك الحدود (4px)
            const electronRadius = radius / 2 - 8 - 2
            // سرعة الدوران: 8 ثوانٍ لدورة كاملة (سرعة متوسطة)
            const animationDuration = 8
            // تأخير مختلف لكل إلكترون للحفاظ على التوزيع
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

  useEffect(() => {
    // إضافة CSS animations ديناميكياً
    const style = document.createElement('style')
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
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Scenario Info */}
      <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-blue-900">
            {scenario.elementName} ({scenario.elementSymbol})
          </h3>
          <div className="text-sm text-blue-700">
            العدد الذري: {scenario.atomicNumber} | إجمالي الإلكترونات: {scenario.totalElectrons}
          </div>
        </div>
        {scenario.question && (
          <p className="text-blue-800 font-semibold mt-2">{scenario.question}</p>
        )}
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
          {/* Energy Levels - All concentric circles */}
          {/* Level N (outermost) */}
          {renderEnergyLevel(
            "N",
            480,
            gameData.energyLevelCapacities.N,
            distribution.N,
            "المستوى N"
          )}

          {/* Level M */}
          {renderEnergyLevel(
            "M",
            360,
            gameData.energyLevelCapacities.M,
            distribution.M,
            "المستوى M"
          )}

          {/* Level L */}
          {renderEnergyLevel(
            "L",
            240,
            gameData.energyLevelCapacities.L,
            distribution.L,
            "المستوى L"
          )}

          {/* Level K (innermost) */}
          {renderEnergyLevel(
            "K",
            120,
            gameData.energyLevelCapacities.K,
            distribution.K,
            "المستوى K"
          )}

          {/* Nucleus - on top of all energy levels */}
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

      {/* Controls for each energy level */}
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

      {/* Overall Feedback */}
      {showFeedback && (
        <div
          className={`rounded-lg p-4 border-2 ${
            isCorrect()
              ? "bg-emerald-50 border-emerald-400"
              : "bg-rose-50 border-rose-400"
          }`}
        >
          <p className={`font-semibold text-center ${
            isCorrect() ? "text-emerald-900" : "text-rose-900"
          }`}>
            {isCorrect()
              ? "✓ ممتاز! لقد قمت بتوزيع الإلكترونات بشكل صحيح"
              : "✗ التوزيع غير صحيح. حاول مرة أخرى"}
          </p>
          {!isCorrect() && (
            <p className="text-sm text-rose-800 mt-2 text-center">
              التوزيع الصحيح: K={scenario.correctDistribution.K}, L={scenario.correctDistribution.L}, M={scenario.correctDistribution.M}, N={scenario.correctDistribution.N}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
