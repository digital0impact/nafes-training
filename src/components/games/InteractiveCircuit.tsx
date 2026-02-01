"use client"

import { useState, useEffect } from "react"
import type { InteractiveCircuitGameData, CircuitScenario } from "@/types/games"

interface InteractiveCircuitProps {
  gameData: InteractiveCircuitGameData
  currentScenarioIndex: number
  circuitStates: Record<string, Record<string, boolean>>
  onStateChange: (scenarioId: string, componentId: string, state: boolean) => void
  isSubmitted?: boolean
  showFeedback?: boolean
}

export default function InteractiveCircuit({
  gameData,
  currentScenarioIndex,
  circuitStates,
  onStateChange,
  isSubmitted = false,
  showFeedback = false
}: InteractiveCircuitProps) {
  const scenario = gameData.scenarios[currentScenarioIndex]
  const [localStates, setLocalStates] = useState<Record<string, boolean>>({})

  // تهيئة الحالات المحلية من circuitStates
  useEffect(() => {
    const scenarioState = circuitStates[scenario.id] || {}
    const initialStates: Record<string, boolean> = {}
    
    scenario.components.forEach((comp) => {
      if (comp.type === "switch") {
        initialStates[comp.id] = scenarioState[comp.id] ?? comp.initialState ?? false
      }
    })
    
    setLocalStates(initialStates)
  }, [scenario.id, circuitStates, scenario.components])

  const toggleSwitch = (componentId: string) => {
    if (isSubmitted) return
    
    const newState = !localStates[componentId]
    setLocalStates((prev) => ({ ...prev, [componentId]: newState }))
    onStateChange(scenario.id, componentId, newState)
  }

  // حساب حالة الدائرة (مغلقة إذا كان جميع المفاتيح مغلقة)
  // في دائرة بسيطة: الدائرة مغلقة إذا كان المفتاح مغلقاً
  const switches = scenario.components.filter((c) => c.type === "switch")
  const isCircuitClosed = switches.length > 0 
    ? switches.every((sw) => localStates[sw.id] === true)
    : false
  const isCorrect = isSubmitted && showFeedback
    ? Object.keys(scenario.correctState).every(
        (key) => localStates[key] === scenario.correctState[key]
      )
    : null

  return (
    <div className="space-y-6">
      {/* السؤال والتعليمات */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{scenario.question}</h3>
        {scenario.description && (
          <p className="text-sm text-slate-600">{scenario.description}</p>
        )}
        {gameData.instruction && (
          <p className="text-sm text-blue-700 mt-2 font-medium">{gameData.instruction}</p>
        )}
      </div>

      {/* الدائرة التفاعلية */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-8 relative overflow-hidden">
        <svg
          width="100%"
          height="300"
          viewBox="0 0 500 300"
          className="w-full"
          style={{ minHeight: "300px" }}
        >
          {/* الخلفية */}
          <rect width="500" height="300" fill="#f8fafc" />

          {/* رسم الأسلاك */}
          {scenario.components.map((comp, index, array) => {
            if (index === 0) return null
            
            const prevComp = array[index - 1]
            const isSwitch = comp.type === "switch"
            const switchState = isSwitch ? localStates[comp.id] ?? false : true
            
            // سلك من المكون السابق إلى الحالي
            // السلك يكون نشطاً (أخضر) إذا كانت الدائرة مغلقة
            return (
              <line
                key={`wire-${prevComp.id}-${comp.id}`}
                x1={prevComp.position.x + 30}
                y1={prevComp.position.y}
                x2={comp.position.x - 30}
                y2={comp.position.y}
                stroke={isCircuitClosed ? "#10b981" : "#94a3b8"}
                strokeWidth="4"
                strokeLinecap="round"
                className={isCircuitClosed ? "transition-colors duration-300" : ""}
              />
            )
          })}
          
          {/* سلك من آخر مكون إلى الأول (لإكمال الدائرة) */}
          {scenario.components.length > 1 && (
            <line
              x1={scenario.components[scenario.components.length - 1].position.x + 30}
              y1={scenario.components[scenario.components.length - 1].position.y}
              x2={scenario.components[0].position.x - 30}
              y2={scenario.components[0].position.y}
              stroke={isCircuitClosed ? "#10b981" : "#94a3b8"}
              strokeWidth="4"
              strokeLinecap="round"
              className={isCircuitClosed ? "transition-colors duration-300" : ""}
            />
          )}

          {/* رسم المكونات */}
          {scenario.components.map((comp) => {
            const x = comp.position.x
            const y = comp.position.y
            const isSwitch = comp.type === "switch"
            const switchState = isSwitch ? localStates[comp.id] : true
            const isActive = switchState && isCircuitClosed

            if (comp.type === "battery") {
              return (
                <g key={comp.id}>
                  {/* البطارية */}
                  <rect
                    x={x - 20}
                    y={y - 30}
                    width="40"
                    height="60"
                    fill="#fbbf24"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    rx="4"
                  />
                  <line
                    x1={x}
                    y1={y - 30}
                    x2={x}
                    y2={y - 20}
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />
                  <line
                    x1={x}
                    y1={y + 20}
                    x2={x}
                    y2={y + 30}
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />
                  {/* التسمية */}
                  <text
                    x={x}
                    y={y + 50}
                    textAnchor="middle"
                    className="text-xs fill-slate-700 font-semibold"
                  >
                    {comp.label || "بطارية"}
                  </text>
                </g>
              )
            }

            if (comp.type === "switch") {
              return (
                <g key={comp.id}>
                  {/* قاعدة المفتاح */}
                  <rect
                    x={x - 15}
                    y={y - 5}
                    width="30"
                    height="10"
                    fill="#64748b"
                    rx="2"
                  />
                  {/* ذراع المفتاح */}
                  <line
                    x1={x}
                    y1={y}
                    x2={switchState ? x + 25 : x + 15}
                    y2={switchState ? y - 20 : y - 10}
                    stroke={switchState ? "#10b981" : "#ef4444"}
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                    style={{ cursor: isSubmitted ? "default" : "pointer" }}
                    onClick={() => toggleSwitch(comp.id)}
                  />
                  {/* دائرة تفاعلية للمفتاح */}
                  <circle
                    cx={x}
                    cy={y}
                    r="25"
                    fill="transparent"
                    style={{ cursor: isSubmitted ? "default" : "pointer" }}
                    onClick={() => toggleSwitch(comp.id)}
                    className={isSubmitted ? "" : "hover:fill-blue-100 hover:fill-opacity-30 transition-all"}
                  />
                  {/* زر تفاعلي للمفتاح */}
                  {!isSubmitted && (
                    <circle
                      cx={switchState ? x + 25 : x + 15}
                      cy={switchState ? y - 20 : y - 10}
                      r="8"
                      fill={switchState ? "#10b981" : "#ef4444"}
                      stroke="white"
                      strokeWidth="2"
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleSwitch(comp.id)}
                      className="hover:scale-110 transition-transform"
                    />
                  )}
                  {/* التسمية */}
                  <text
                    x={x}
                    y={y + 40}
                    textAnchor="middle"
                    className="text-xs fill-slate-700 font-semibold"
                  >
                    {comp.label || "مفتاح"}
                  </text>
                  {/* حالة المفتاح */}
                  <text
                    x={x}
                    y={y - 35}
                    textAnchor="middle"
                    className={`text-xs font-bold ${
                      switchState ? "fill-green-600" : "fill-red-600"
                    }`}
                  >
                    {switchState ? "مغلق" : "مفتوح"}
                  </text>
                </g>
              )
            }

            if (comp.type === "bulb") {
              return (
                <g key={comp.id}>
                  {/* المصباح */}
                  <circle
                    cx={x}
                    cy={y}
                    r="25"
                    fill={isActive ? "#fbbf24" : "#e2e8f0"}
                    stroke={isActive ? "#f59e0b" : "#cbd5e1"}
                    strokeWidth="3"
                    className={isActive ? "animate-pulse" : ""}
                  />
                  {/* خط داخل المصباح */}
                  <line
                    x1={x - 15}
                    y1={y}
                    x2={x + 15}
                    y2={y}
                    stroke={isActive ? "#f59e0b" : "#94a3b8"}
                    strokeWidth="2"
                  />
                  {/* قاعدة المصباح */}
                  <rect
                    x={x - 8}
                    y={y + 20}
                    width="16"
                    height="8"
                    fill="#64748b"
                    rx="2"
                  />
                  {/* التسمية */}
                  <text
                    x={x}
                    y={y + 50}
                    textAnchor="middle"
                    className="text-xs fill-slate-700 font-semibold"
                  >
                    {comp.label || "مصباح"}
                  </text>
                  {/* حالة المصباح */}
                  <text
                    x={x}
                    y={y - 40}
                    textAnchor="middle"
                    className={`text-xs font-bold ${
                      isActive ? "fill-green-600" : "fill-slate-500"
                    }`}
                  >
                    {isActive ? "مضيء" : "منطفئ"}
                  </text>
                </g>
              )
            }

            return null
          })}
        </svg>

        {/* معلومات الدائرة */}
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">حالة الدائرة:</p>
              <p
                className={`text-lg font-bold mt-1 ${
                  isCircuitClosed ? "text-green-600" : "text-red-600"
                }`}
              >
                {isCircuitClosed ? "دائرة مغلقة" : "دائرة مفتوحة"}
              </p>
            </div>
            {isSubmitted && showFeedback && isCorrect !== null && (
              <div
                className={`px-4 py-2 rounded-lg font-semibold ${
                  isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {isCorrect ? "✓ صحيح" : "✗ غير صحيح"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* تعليمات الاستخدام */}
      {!isSubmitted && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            💡 <strong>تعليمات:</strong> انقر على المفتاح لفتحه أو إغلاقه ولاحظ التغيير في المصباح
          </p>
        </div>
      )}
    </div>
  )
}
