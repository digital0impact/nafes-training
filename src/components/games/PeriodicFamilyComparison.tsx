"use client"

import { useState, useEffect } from "react"
import type { PeriodicFamilyGameData, PeriodicFamilyElement } from "@/types/games"

/**
 * مكون لعبة مقارنة عناصر العائلة الواحدة في الجدول الدوري
 * 
 * الهدف التعليمي:
 * - بناء الذرة بإضافة مستويات الطاقة وتوزيع إلكترونات التكافؤ
 * - مقارنة عناصر العائلة الواحدة وملاحظة تأثير زيادة عدد مستويات الطاقة
 * - مشاهدة تمثيل بصري للمستوى الخارجي مع التأكيد على ثبات عدد إلكترونات التكافؤ
 */

interface PeriodicFamilyComparisonProps {
  gameData: PeriodicFamilyGameData
  currentElementIndex: number
  electronDistributions: Record<string, { K: number; L: number; M: number; N: number }>
  onDistributionChange: (elementId: string, level: "K" | "L" | "M" | "N", delta: number) => void
  comparisonAnswers?: Record<string, string>
  onComparisonAnswer?: (questionId: string, answer: string) => void
  isSubmitted: boolean
  showFeedback: boolean
}

export default function PeriodicFamilyComparison({
  gameData,
  currentElementIndex,
  electronDistributions,
  onDistributionChange,
  comparisonAnswers = {},
  onComparisonAnswer,
  isSubmitted,
  showFeedback
}: PeriodicFamilyComparisonProps) {
  const currentElement = gameData.elements[currentElementIndex]
  const distribution = electronDistributions[currentElement.id] || { K: 0, L: 0, M: 0, N: 0 }
  const totalPlaced = distribution.K + distribution.L + distribution.M + distribution.N
  const remainingElectrons = currentElement.totalElectrons - totalPlaced

  // حالة المراحل: بناء الذرة -> مقارنة الخصائص
  const [currentStage, setCurrentStage] = useState<"construction" | "comparison">("construction")
  const [completedElements, setCompletedElements] = useState<Set<string>>(new Set())

  // التحقق من اكتمال بناء الذرة
  const isConstructionComplete = () => {
    return totalPlaced === currentElement.totalElectrons &&
      distribution.K === currentElement.correctDistribution.K &&
      distribution.L === currentElement.correctDistribution.L &&
      distribution.M === currentElement.correctDistribution.M &&
      distribution.N === currentElement.correctDistribution.N
  }

  // الحصول على المستوى الخارجي
  const getOutermostLevel = () => {
    if (distribution.N > 0) return "N"
    if (distribution.M > 0) return "M"
    if (distribution.L > 0) return "L"
    if (distribution.K > 0) return "K"
    return null
  }

  // الحصول على عدد إلكترونات التكافؤ (المستوى الخارجي)
  const getValenceElectrons = () => {
    const outermost = getOutermostLevel()
    if (!outermost) return 0
    return distribution[outermost as "K" | "L" | "M" | "N"]
  }

  // الانتقال للمرحلة التالية
  const handleNextStage = () => {
    if (currentStage === "construction" && isConstructionComplete()) {
      setCurrentStage("comparison")
      setCompletedElements(prev => new Set(prev).add(currentElement.id))
    }
  }

  // الانتقال للعنصر التالي
  const handleNextElement = () => {
    if (currentElementIndex < gameData.elements.length - 1) {
      setCurrentStage("construction")
    }
  }

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
      onDistributionChange(currentElement.id, level, 1)
    }
  }

  const handleRemoveElectron = (level: "K" | "L" | "M" | "N") => {
    if (canRemoveElectron(level)) {
      onDistributionChange(currentElement.id, level, -1)
    }
  }

  // رسم مستوى الطاقة
  const renderEnergyLevel = (
    level: "K" | "L" | "M" | "N",
    radius: number,
    capacity: number,
    current: number,
    levelName: string
  ) => {
    const isLevelCorrect = showFeedback && current === currentElement.correctDistribution[level]
    const isLevelWrong = showFeedback && current !== currentElement.correctDistribution[level]
    const isOutermost = getOutermostLevel() === level

    return (
      <div
        className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 transition-all ${
          isOutermost
            ? "border-blue-500 bg-blue-50 shadow-lg"
            : isLevelCorrect
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
        {/* تمثيل الإلكترونات */}
        <div className="absolute inset-0" style={{ transformOrigin: 'center center' }}>
          {Array.from({ length: current }).map((_, i) => {
            const electronRadius = radius / 2 - 8 - 2
            const animationDuration = 8
            const animationDelay = current > 0 ? (i / current) * animationDuration : 0
            
            return (
              <div
                key={i}
                className={`absolute w-4 h-4 rounded-full border-2 shadow-md z-20 ${
                  isOutermost
                    ? "bg-blue-500 border-blue-700"
                    : isLevelCorrect
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

        {/* تسمية المستوى */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className={`text-sm font-bold ${isOutermost ? "text-blue-700" : "text-slate-700"}`}>
            {levelName}
            {isOutermost && " (مستوى التكافؤ)"}
          </span>
        </div>

        {/* معلومات السعة */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-slate-600 whitespace-nowrap">
          {current}/{capacity}
        </div>
      </div>
    )
  }

  // إضافة CSS animations
  useEffect(() => {
    if (document.getElementById('periodic-family-animations')) {
      return
    }

    const style = document.createElement('style')
    style.id = 'periodic-family-animations'
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
      const existingStyle = document.getElementById('periodic-family-animations')
      if (existingStyle && document.head.contains(existingStyle)) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [])

  // ========== مرحلة بناء الذرة ==========
  const renderConstructionStage = () => {
    const isCorrect = isConstructionComplete()
    
    return (
      <div className="space-y-6">
        {/* معلومات العائلة والعنصر */}
        <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 p-4">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            {gameData.familyName}
          </h3>
          <p className="text-blue-800 mb-3">{gameData.familyDescription}</p>
          <div className="border-t border-blue-200 pt-3 mt-3">
            <h4 className="font-semibold text-purple-900 mb-1">
              العنصر الحالي: {currentElement.elementName} ({currentElement.elementSymbol})
            </h4>
            <p className="text-sm text-slate-700">
              العدد الذري: {currentElement.atomicNumber} | الدورة: {currentElement.period} | المجموعة: {currentElement.group}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              إجمالي الإلكترونات: {currentElement.totalElectrons}
            </p>
          </div>
        </div>

        {/* معلومات إلكترونات التكافؤ */}
        <div className="rounded-lg bg-yellow-50 border-2 border-yellow-300 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-900 mb-1">
                إلكترونات التكافؤ (المستوى الخارجي)
              </p>
              <p className="text-sm text-yellow-800">
                جميع عناصر {gameData.familyName} لها نفس عدد إلكترونات التكافؤ: {currentElement.group}
              </p>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {getValenceElectrons()}
            </div>
          </div>
        </div>

        {/* الإلكترونات المتبقية */}
        <div className="text-center">
          <div className="inline-block px-4 py-2 rounded-lg bg-purple-100 border-2 border-purple-300">
            <span className="text-sm font-semibold text-purple-900">
              الإلكترونات المتبقية: {remainingElectrons}
            </span>
          </div>
        </div>

        {/* تمثيل الذرة */}
        <div className="flex justify-center items-center py-8">
          <div className="relative" style={{ width: "500px", height: "500px" }}>
            {/* مستويات الطاقة */}
            {renderEnergyLevel("N", 480, gameData.energyLevelCapacities.N, distribution.N, "المستوى N")}
            {renderEnergyLevel("M", 360, gameData.energyLevelCapacities.M, distribution.M, "المستوى M")}
            {renderEnergyLevel("L", 240, gameData.energyLevelCapacities.L, distribution.L, "المستوى L")}
            {renderEnergyLevel("K", 120, gameData.energyLevelCapacities.K, distribution.K, "المستوى K")}

            {/* النواة */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-20 h-20 rounded-full bg-yellow-500 border-4 border-yellow-600 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-xs font-bold text-yellow-900">{currentElement.elementSymbol}</div>
                  <div className="text-xs text-yellow-800">{currentElement.atomicNumber}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار التحكم */}
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
                      {current === currentElement.correctDistribution[level] ? (
                        <span className="text-emerald-600">✓ صحيح</span>
                      ) : (
                        <span className="text-rose-600">
                          ✗ يجب أن يكون {currentElement.correctDistribution[level]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* سعة مستويات الطاقة */}
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
        
        {/* زر الانتقال */}
        {totalPlaced === currentElement.totalElectrons && (
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
                  الانتقال إلى مرحلة المقارنة →
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold text-rose-900 text-center mb-2">
                  ✗ التوزيع غير صحيح
                </p>
                <p className="text-sm text-rose-800 mb-4 text-center">
                  التوزيع الصحيح: K={currentElement.correctDistribution.K}, L={currentElement.correctDistribution.L}, M={currentElement.correctDistribution.M}, N={currentElement.correctDistribution.N}
                </p>
                <button
                  onClick={handleNextStage}
                  className="w-full rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 transition"
                >
                  المتابعة إلى مرحلة المقارنة →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    )
  }

  // ========== مرحلة المقارنة ==========
  const renderComparisonStage = () => {
    // مقارنة الخصائص بين العناصر
    const sortedElements = [...gameData.elements].sort((a, b) => a.atomicNumber - b.atomicNumber)
    
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 p-4">
          <h3 className="text-lg font-bold text-green-900 mb-2">
            مقارنة عناصر {gameData.familyName}
          </h3>
          <p className="text-green-800">
            لاحظ كيف تتغير الخصائص مع زيادة عدد مستويات الطاقة، مع ثبات عدد إلكترونات التكافؤ
          </p>
        </div>

        {/* جدول المقارنة */}
        <div className="rounded-lg border-2 border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-100">
                <tr>
                  <th className="p-3 text-right font-semibold text-slate-900">العنصر</th>
                  <th className="p-3 text-right font-semibold text-slate-900">العدد الذري</th>
                  <th className="p-3 text-right font-semibold text-slate-900">الدورة</th>
                  <th className="p-3 text-right font-semibold text-slate-900">المجموعة</th>
                  <th className="p-3 text-right font-semibold text-slate-900">إلكترونات التكافؤ</th>
                  <th className="p-3 text-right font-semibold text-slate-900">نصف القطر الذري (pm)</th>
                  <th className="p-3 text-right font-semibold text-slate-900">طاقة التأين (kJ/mol)</th>
                  <th className="p-3 text-right font-semibold text-slate-900">النشاط الكيميائي</th>
                </tr>
              </thead>
              <tbody>
                {sortedElements.map((element, index) => {
                  const elementDist = electronDistributions[element.id] || { K: 0, L: 0, M: 0, N: 0 }
                  const isCurrent = element.id === currentElement.id
                  const valence = element.group // عدد إلكترونات التكافؤ ثابت في العائلة
                  
                  return (
                    <tr
                      key={element.id}
                      className={`border-t border-slate-200 ${
                        isCurrent ? "bg-blue-50" : index % 2 === 0 ? "bg-white" : "bg-slate-50"
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">
                          {element.elementName} ({element.elementSymbol})
                        </div>
                        {isCurrent && (
                          <span className="text-xs text-blue-600 font-semibold">← العنصر الحالي</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-700">{element.atomicNumber}</td>
                      <td className="p-3 text-slate-700">{element.period}</td>
                      <td className="p-3 text-slate-700">{element.group}</td>
                      <td className="p-3">
                        <span className="font-bold text-blue-600">{valence}</span>
                        <span className="text-xs text-slate-500 mr-1"> (ثابت)</span>
                      </td>
                      <td className="p-3 text-slate-700">{element.properties.atomicRadius}</td>
                      <td className="p-3 text-slate-700">{element.properties.ionizationEnergy}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          element.properties.reactivity === "عالية"
                            ? "bg-red-100 text-red-800"
                            : element.properties.reactivity === "متوسطة"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {element.properties.reactivity}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ملاحظات تعليمية */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-blue-50 border-2 border-blue-200 p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📊 نصف القطر الذري</h4>
            <p className="text-sm text-blue-800">
              يزداد نصف القطر الذري مع زيادة عدد مستويات الطاقة (الانتقال من أعلى إلى أسفل في العائلة)
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 border-2 border-purple-200 p-4">
            <h4 className="font-semibold text-purple-900 mb-2">⚡ طاقة التأين</h4>
            <p className="text-sm text-purple-800">
              تقل طاقة التأين مع زيادة عدد مستويات الطاقة (الإلكترونات الخارجية أبعد عن النواة)
            </p>
          </div>
          <div className="rounded-lg bg-green-50 border-2 border-green-200 p-4">
            <h4 className="font-semibold text-green-900 mb-2">🔬 النشاط الكيميائي</h4>
            <p className="text-sm text-green-800">
              يزداد النشاط الكيميائي مع زيادة عدد مستويات الطاقة (سهولة فقد الإلكترونات)
            </p>
          </div>
        </div>

        {/* ملاحظة مهمة */}
        <div className="rounded-lg bg-yellow-50 border-2 border-yellow-300 p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">💡 ملاحظة مهمة</h4>
          <p className="text-sm text-yellow-800">
            جميع عناصر {gameData.familyName} لها نفس عدد إلكترونات التكافؤ ({currentElement.group})، 
            وهذا يفسر تشابه خصائصها الكيميائية. الفرق في الخصائص الفيزيائية (مثل نصف القطر وطاقة التأين) 
            يعود إلى اختلاف عدد مستويات الطاقة.
          </p>
        </div>

        {/* أزرار التنقل */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStage("construction")}
            className="flex-1 rounded-lg bg-slate-100 py-3 font-semibold text-slate-700 hover:bg-slate-200 transition"
          >
            ← العودة إلى بناء الذرة
          </button>
          {currentElementIndex < gameData.elements.length - 1 && (
            <button
              onClick={handleNextElement}
              className="flex-1 rounded-lg bg-purple-600 py-3 font-semibold text-white hover:bg-purple-700 transition"
            >
              العنصر التالي →
            </button>
          )}
        </div>
      </div>
    )
  }

  // إعادة تعيين المرحلة عند تغيير العنصر
  useEffect(() => {
    setCurrentStage("construction")
  }, [currentElementIndex])

  return (
    <div className="space-y-6">
      {/* مؤشر التقدم */}
      <div className="rounded-lg bg-slate-50 border-2 border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">
            العنصر {currentElementIndex + 1} من {gameData.elements.length}
          </span>
          <span className="text-sm font-bold text-purple-600">
            {currentStage === "construction" ? "مرحلة البناء" : "مرحلة المقارنة"}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentElementIndex + 1) / gameData.elements.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* عرض المرحلة الحالية */}
      {currentStage === "construction" ? renderConstructionStage() : renderComparisonStage()}
    </div>
  )
}
