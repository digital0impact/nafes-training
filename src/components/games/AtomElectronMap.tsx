"use client"

/**
 * لعبة خريطة إلكترونات الذرة
 * المؤشر: يوضح التوزيع الإلكتروني لعدد من مجموعات الجدول الدوري، والتمثيل النقطي (لويس)، ورسمها.
 * الهدف: تمكين الطالب من فهم التوزيع الإلكتروني، وتحديد إلكترونات التكافؤ، وتمثيلها بالنقاط ورسمها.
 *
 * المرحلة 1: وزّع الإلكترونات – اختيار عنصر وسحب الإلكترونات إلى مستويات الطاقة.
 * المرحلة 2: حدّد إلكترونات التكافؤ – إبراز المستوى الخارجي والإجابة عن العدد.
 * المرحلة 3: التمثيل النقطي – إضافة نقاط لويس حول الرمز.
 * المرحلة 4: ارسم التمثيل النقطي – لوحة رسم ومقارنة بالنموذج ثم إنهاء اللعبة.
 */
import { useState, useCallback, useRef, useEffect } from "react"
import type { AtomElectronMapGameData } from "@/types/games"

type GameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

// سعات مستويات الطاقة (مبسطة للمرحلة المتوسطة: K, L, M حتى 8 ثم N)
const LEVEL_NAMES = ["K", "L", "M", "N"] as const
const LEVEL_CAPACITY: Record<string, number> = { K: 2, L: 8, M: 8, N: 18 }

type ElementDef = {
  id: string
  symbol: string
  nameAr: string
  group: number
  groupNameAr: string
  totalElectrons: number
  /** توزيع صحيح: K, L, M, N */
  distribution: { K: number; L: number; M: number; N: number }
  valence: number
}

// عناصر من مجموعات 1، 2، 13، 14، 17، 18 (مناسب للمرحلة المتوسطة)
const ELEMENTS: ElementDef[] = [
  { id: "li", symbol: "Li", nameAr: "ليثيوم", group: 1, groupNameAr: "الفلزات القلوية", totalElectrons: 3, distribution: { K: 2, L: 1, M: 0, N: 0 }, valence: 1 },
  { id: "na", symbol: "Na", nameAr: "صوديوم", group: 1, groupNameAr: "الفلزات القلوية", totalElectrons: 11, distribution: { K: 2, L: 8, M: 1, N: 0 }, valence: 1 },
  { id: "k", symbol: "K", nameAr: "بوتاسيوم", group: 1, groupNameAr: "الفلزات القلوية", totalElectrons: 19, distribution: { K: 2, L: 8, M: 8, N: 1 }, valence: 1 },
  { id: "be", symbol: "Be", nameAr: "بيريليوم", group: 2, groupNameAr: "الفلزات القلوية الترابية", totalElectrons: 4, distribution: { K: 2, L: 2, M: 0, N: 0 }, valence: 2 },
  { id: "mg", symbol: "Mg", nameAr: "مغنيسيوم", group: 2, groupNameAr: "الفلزات القلوية الترابية", totalElectrons: 12, distribution: { K: 2, L: 8, M: 2, N: 0 }, valence: 2 },
  { id: "ca", symbol: "Ca", nameAr: "كالسيوم", group: 2, groupNameAr: "الفلزات القلوية الترابية", totalElectrons: 20, distribution: { K: 2, L: 8, M: 8, N: 2 }, valence: 2 },
  { id: "b", symbol: "B", nameAr: "بورون", group: 13, groupNameAr: "مجموعة البورون", totalElectrons: 5, distribution: { K: 2, L: 3, M: 0, N: 0 }, valence: 3 },
  { id: "al", symbol: "Al", nameAr: "ألومنيوم", group: 13, groupNameAr: "مجموعة البورون", totalElectrons: 13, distribution: { K: 2, L: 8, M: 3, N: 0 }, valence: 3 },
  { id: "c", symbol: "C", nameAr: "كربون", group: 14, groupNameAr: "مجموعة الكربون", totalElectrons: 6, distribution: { K: 2, L: 4, M: 0, N: 0 }, valence: 4 },
  { id: "si", symbol: "Si", nameAr: "سيليكون", group: 14, groupNameAr: "مجموعة الكربون", totalElectrons: 14, distribution: { K: 2, L: 8, M: 4, N: 0 }, valence: 4 },
  { id: "f", symbol: "F", nameAr: "فلور", group: 17, groupNameAr: "الهالوجينات", totalElectrons: 9, distribution: { K: 2, L: 7, M: 0, N: 0 }, valence: 7 },
  { id: "cl", symbol: "Cl", nameAr: "كلور", group: 17, groupNameAr: "الهالوجينات", totalElectrons: 17, distribution: { K: 2, L: 8, M: 7, N: 0 }, valence: 7 },
  { id: "he", symbol: "He", nameAr: "هيليوم", group: 18, groupNameAr: "الغازات النبيلة", totalElectrons: 2, distribution: { K: 2, L: 0, M: 0, N: 0 }, valence: 2 },
  { id: "ne", symbol: "Ne", nameAr: "نيون", group: 18, groupNameAr: "الغازات النبيلة", totalElectrons: 10, distribution: { K: 2, L: 8, M: 0, N: 0 }, valence: 8 },
  { id: "ar", symbol: "Ar", nameAr: "أرجون", group: 18, groupNameAr: "الغازات النبيلة", totalElectrons: 18, distribution: { K: 2, L: 8, M: 8, N: 0 }, valence: 8 },
]

const GROUPS = [
  { num: 1, nameAr: "الفلزات القلوية" },
  { num: 2, nameAr: "الفلزات القلوية الترابية" },
  { num: 13, nameAr: "مجموعة البورون" },
  { num: 14, nameAr: "مجموعة الكربون" },
  { num: 17, nameAr: "الهالوجينات" },
  { num: 18, nameAr: "الغازات النبيلة" },
]

// ─── مساعد: التحقق من صحة التوزيع ─────────────────────────────────────────────
function isDistributionCorrect(
  current: { K: number; L: number; M: number; N: number },
  correct: { K: number; L: number; M: number; N: number }
): boolean {
  return (
    current.K === correct.K &&
    current.L === correct.L &&
    current.M === correct.M &&
    current.N === correct.N
  )
}

// ─── مرحلة 1: واجهة مستويات الطاقة (دوائر) مع سحب الإلكترونات ─────────────────
function EnergyLevelsStage1({
  element,
  distribution,
  onDistributionChange,
  isCorrect,
}: {
  element: ElementDef
  distribution: { K: number; L: number; M: number; N: number }
  onDistributionChange: (level: string, delta: number) => void
  isCorrect: boolean
}) {
  const totalPlaced = distribution.K + distribution.L + distribution.M + distribution.N
  const poolCount = element.totalElectrons - totalPlaced

  return (
    <div className="space-y-4">
      <style>{`@keyframes electron-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <p className="text-sm text-slate-600">
        اسحب الإلكترونات (النقاط) من المخزن إلى مستويات الطاقة حول النواة. المستوى K يستوعب 2، L و M يستوعبان 8، N يستوعب 18.
      </p>
      {/* النواة + المستويات */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center min-h-[140px]">
          {/* دوائر المستويات من الداخل للخارج: K, L, M, N */}
          {(["K", "L", "M", "N"] as const).map((level, idx) => {
            const cap = LEVEL_CAPACITY[level]
            const count = distribution[level]
            const radius = 22 + idx * 26
            const outerLevel = (["K", "L", "M", "N"] as const).filter((l) => element.distribution[l] > 0).pop() ?? "K"
            const isOuter = level === outerLevel
            const dotSize = 6
            // مركز كل إلكترون على محيط الدائرة بالضبط
            const orbitR = radius
            return (
              <div
                key={level}
                className="absolute rounded-full border-2 border-dashed flex items-center justify-center"
                style={{
                  width: radius * 2,
                  height: radius * 2,
                  borderColor: isOuter ? "#6366f1" : "#cbd5e1",
                  backgroundColor: isOuter ? "rgba(99, 102, 241, 0.08)" : "transparent",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const delta = e.dataTransfer.getData("electron") === "add" ? 1 : -1
                  if (delta === 1 && count < cap && poolCount > 0) onDistributionChange(level, 1)
                  if (delta === -1 && count > 0) onDistributionChange(level, -1)
                }}
              >
                {/* إلكترونات على محيط الدائرة مع دوران بطيء؛ L و M تظهر كأزواج */}
                {count > 0 && (() => {
                  const usePairs = (level === "L" || level === "M" || level === "N") && count >= 2
                  const pairOffset = 0.14
                  const positions: { x: number; y: number }[] = []
                  if (usePairs) {
                    const numPairs = Math.floor(count / 2)
                    for (let i = 0; i < numPairs; i++) {
                      const baseAngle = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, numPairs)
                      positions.push(
                        { x: radius + orbitR * Math.cos(baseAngle - pairOffset) - dotSize / 2, y: radius + orbitR * Math.sin(baseAngle - pairOffset) - dotSize / 2 },
                        { x: radius + orbitR * Math.cos(baseAngle + pairOffset) - dotSize / 2, y: radius + orbitR * Math.sin(baseAngle + pairOffset) - dotSize / 2 }
                      )
                    }
                    if (count % 2 === 1) {
                      const unpairedAngle = -Math.PI / 2 + (2 * Math.PI * numPairs) / Math.max(1, numPairs + 1)
                      positions.push(
                        { x: radius + orbitR * Math.cos(unpairedAngle) - dotSize / 2, y: radius + orbitR * Math.sin(unpairedAngle) - dotSize / 2 }
                      )
                    }
                  } else {
                    for (let i = 0; i < count; i++) {
                      const angle = -Math.PI / 2 + (2 * Math.PI * i) / count
                      positions.push(
                        { x: radius + orbitR * Math.cos(angle) - dotSize / 2, y: radius + orbitR * Math.sin(angle) - dotSize / 2 }
                      )
                    }
                  }
                  return (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        animation: "electron-orbit 24s linear infinite",
                        transformOrigin: "center center",
                      }}
                    >
                      {positions.map((pos, i) => (
                        <span
                          key={`${level}-${i}`}
                          className="absolute rounded-full bg-red-500 border border-red-600"
                          style={{
                            width: dotSize,
                            height: dotSize,
                            left: pos.x,
                            top: pos.y,
                          }}
                        />
                      ))}
                    </div>
                  )
                })()}
                <span className="text-[10px] font-bold text-slate-500 bg-white/90 px-0.5 rounded z-10">
                  {level} ({count}/{cap})
                </span>
              </div>
            )
          })}
          {/* النواة */}
          <div
            className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-[10px] shadow-md z-10"
            draggable
            onDragStart={(e) => e.dataTransfer.setData("electron", "nucleus")}
          >
            نواة
          </div>
        </div>
        {/* مخزن الإلكترونات + أزرار زيادة/نقصان لكل مستوى */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <div className="rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-2">
            <span className="font-semibold text-slate-700">مخزن الإلكترونات: {poolCount}</span>
          </div>
          {LEVEL_NAMES.map((level) => {
            const cap = LEVEL_CAPACITY[level]
            const count = distribution[level]
            return (
              <div key={level} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-2">
                <button
                  type="button"
                  disabled={count <= 0}
                  onClick={() => onDistributionChange(level, -1)}
                  className="w-8 h-8 rounded bg-slate-200 text-slate-700 font-bold disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-16 text-center font-bold text-indigo-700">{level}: {count}/{cap}</span>
                <button
                  type="button"
                  disabled={count >= cap || poolCount <= 0}
                  onClick={() => onDistributionChange(level, 1)}
                  className="w-8 h-8 rounded bg-indigo-100 text-indigo-700 font-bold disabled:opacity-40"
                >
                  +
                </button>
              </div>
            )
          })}
        </div>
      </div>
      {isCorrect && (
        <p className="text-center text-emerald-700 font-semibold">✓ توزيع صحيح! يمكنك الانتقال للمرحلة التالية.</p>
      )}
    </div>
  )
}

// ─── مرحلة 2: إبراز المستوى الخارجي وسؤال التكافؤ ───────────────────────────────
function ValenceQuestionStage2({
  element,
  selectedValence,
  onSelect,
  showFeedback,
  isCorrect,
}: {
  element: ElementDef
  selectedValence: number | null
  onSelect: (n: number) => void
  showFeedback: boolean
  isCorrect: boolean
}) {
  const outerLevel = element.distribution.N > 0 ? "N" : element.distribution.M > 0 ? "M" : element.distribution.L > 0 ? "L" : "K"
  const valenceCount = element.valence

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        المستوى الخارجي لهذا العنصر هو <strong>{outerLevel}</strong> وبه <strong>{element.distribution[outerLevel]}</strong> إلكترون. هذه هي إلكترونات التكافؤ.
      </p>
      <p className="font-semibold text-slate-800">كم عدد إلكترونات التكافؤ لعنصر {element.nameAr} ({element.symbol})؟</p>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={`w-12 h-12 rounded-xl border-2 font-bold transition ${
              selectedValence === n
                ? showFeedback && n === valenceCount
                  ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                  : showFeedback && n !== valenceCount
                    ? "border-rose-500 bg-rose-100 text-rose-800"
                    : "border-indigo-500 bg-indigo-100 text-indigo-800"
                : "border-slate-200 bg-white hover:border-indigo-300"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {showFeedback && (
        <div className={`rounded-xl border-2 p-3 text-sm ${isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          {isCorrect
            ? "✓ صحيح! عدد إلكترونات التكافؤ في عناصر المجموعة الواحدة متساوٍ، ويساوي رقم المجموعة للمجموعات 1–2 و 13–18."
            : `الإجابة الصحيحة: ${valenceCount}. إلكترونات التكافؤ هي الإلكترونات في المستوى الخارجي، وعددها يساوي رقم المجموعة للعناصر الرئيسية.`}
        </div>
      )}
    </div>
  )
}

// ─── مرحلة 3: التمثيل النقطي (لويس) – نقاط قابلة للإضافة حول الرمز ───────────
const LEWIS_POSITIONS = [
  { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 },
  { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 2, col: 1 }, { row: 1, col: 1 },
]

function LewisDotStage3({
  element,
  dotCount,
  onDotChange,
  isCorrect,
}: {
  element: ElementDef
  dotCount: number
  onDotChange: (delta: number) => void
  isCorrect: boolean
}) {
  const maxDots = Math.min(8, element.valence)
  const canAdd = dotCount < maxDots
  const canRemove = dotCount > 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        ضع نقاط إلكترونات التكافؤ حول رمز العنصر حسب قواعد التمثيل النقطي (لويس). استخدم الأزرار أو اضغط على المواضع.
      </p>
      <div className="flex flex-col items-center gap-4">
        <div className="inline-grid grid-cols-3 grid-rows-3 gap-0 w-20 h-20 place-items-center relative">
          {LEWIS_POSITIONS.slice(0, 8).map((pos, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (i < dotCount) onDotChange(-1)
                else if (dotCount < maxDots) onDotChange(1)
              }}
              className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-indigo-400"
              style={{ gridRow: pos.row, gridColumn: pos.col }}
            >
              {i < dotCount && <span className="w-3 h-3 rounded-full bg-indigo-600" />}
            </button>
          ))}
          <span className="text-xl font-bold text-slate-800 col-start-2 row-start-2">{element.symbol}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canRemove}
            onClick={() => onDotChange(-1)}
            className="rounded-lg border-2 border-slate-300 px-4 py-2 font-bold disabled:opacity-40"
          >
            − نقطة
          </button>
          <span className="font-semibold text-indigo-700">النقاط: {dotCount} / {maxDots}</span>
          <button
            type="button"
            disabled={!canAdd}
            onClick={() => onDotChange(1)}
            className="rounded-lg border-2 border-indigo-300 bg-indigo-50 px-4 py-2 font-bold disabled:opacity-40"
          >
            + نقطة
          </button>
        </div>
      </div>
      {isCorrect && (
        <p className="text-center text-emerald-700 font-semibold">✓ تمثيل نقطي صحيح!</p>
      )}
    </div>
  )
}

// ─── مرحلة 4: لوحة رسم ومقارنة بالنموذج ───────────────────────────────────────
function DrawingCanvasStage4({
  element,
  onDone,
  onPrev,
}: {
  element: ElementDef
  onDone: () => void
  onPrev?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showModel, setShowModel] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#e2e8f0"
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.fillStyle = "#4f46e5"
    ctx.fill()
    setHasDrawn(true)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#e2e8f0"
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        ارسم التمثيل النقطي لعنصر <strong>{element.nameAr} ({element.symbol})</strong> في المربع أدناه: رمز العنصر في المنتصف ونقاط التكافؤ حوله.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-semibold text-slate-600">رسمك</span>
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            className="border-2 border-slate-300 rounded-xl bg-white cursor-crosshair touch-none"
            onMouseDown={startDraw}
          />
          <div className="flex gap-2">
            <button type="button" onClick={clearCanvas} className="rounded-lg border border-slate-300 px-3 py-1 text-sm">
              مسح
            </button>
          </div>
        </div>
        {showModel && (
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-semibold text-indigo-600">الرسم النموذجي</span>
            <LewisDotModel symbol={element.symbol} valence={element.valence} />
            <p className="text-xs text-slate-600 max-w-[200px]">
              عدد إلكترونات التكافؤ: {element.valence}. راجع موضع النقاط حول الرمز (أعلى، أسفل، يمين، يسار، وزوايا).
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-between gap-3 flex-wrap">
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            السابق
          </button>
        )}
        <div className="flex gap-2">
          {!showModel ? (
            <button
              type="button"
              onClick={() => setShowModel(true)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              عرض الرسم النموذجي
            </button>
          ) : (
            <button
              type="button"
              onClick={onDone}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              إنهاء اللعبة وعرض التقرير
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// نموذج لويس للعرض فقط (مرحلة 4)
function LewisDotModel({ symbol, valence }: { symbol: string; valence: number }) {
  const n = Math.min(8, valence)
  return (
    <div className="inline-grid grid-cols-3 grid-rows-3 gap-0 w-20 h-20 place-items-center border-2 border-indigo-200 rounded-xl bg-indigo-50/50 p-1">
      {LEWIS_POSITIONS.slice(0, n).map((pos, i) => (
        <span
          key={i}
          className="w-3 h-3 rounded-full bg-indigo-600"
          style={{ gridRow: pos.row, gridColumn: pos.col }}
        />
      ))}
      <span className="text-xl font-bold text-slate-800 col-start-2 row-start-2">{symbol}</span>
    </div>
  )
}

// ─── المكوّن الرئيسي ─────────────────────────────────────────────────────────
export default function AtomElectronMap({
  gameData,
  game,
  onComplete,
}: {
  gameData: AtomElectronMapGameData
  game: GameMeta
  onComplete: (result: { score: number; answers?: Record<string, unknown>; timeSpent: number }) => void
}) {
  const [stage, setStage] = useState(1)
  const [startTime] = useState(Date.now())

  // مرحلة 1: اختيار عنصر + توزيع
  const [stage1Group, setStage1Group] = useState<number | null>(null)
  const [stage1Element, setStage1Element] = useState<ElementDef | null>(null)
  const [stage1Distribution, setStage1Distribution] = useState<{ K: number; L: number; M: number; N: number }>({ K: 0, L: 0, M: 0, N: 0 })
  const [scores, setScores] = useState<Record<number, number>>({})
  const [totalScore, setTotalScore] = useState(0)

  // مرحلة 2: إجابة التكافؤ
  const [stage2Valence, setStage2Valence] = useState<number | null>(null)
  const [stage2ShowFeedback, setStage2ShowFeedback] = useState(false)

  // مرحلة 3: نقاط لويس
  const [stage3DotCount, setStage3DotCount] = useState(0)

  // مرحلة 4: (لا حاجة state إضافي؛ ننتقل عند الضغط على "متابعة")

  const elementsForGroup = stage1Group != null ? ELEMENTS.filter((e) => e.group === stage1Group) : []

  const stage1Correct = stage1Element != null && isDistributionCorrect(stage1Distribution, stage1Element.distribution)
  const stage2Correct = stage1Element != null && stage2Valence === stage1Element.valence
  const stage3Correct = stage1Element != null && stage3DotCount === stage1Element.valence

  const goStage1Next = () => {
    if (!stage1Correct) return
    const score = 100
    setScores((s) => ({ ...s, 1: score }))
    setTotalScore((t) => t + score)
    setStage(2)
    setStage2Valence(null)
    setStage2ShowFeedback(false)
  }

  const goStage2Next = () => {
    if (stage2Valence == null && !stage2ShowFeedback) return
    if (!stage2ShowFeedback) {
      setStage2ShowFeedback(true)
      return
    }
    const score = stage2Correct ? 100 : 50
    setScores((s) => ({ ...s, 2: score }))
    setTotalScore((t) => t + score)
    setStage(3)
    setStage3DotCount(0)
  }

  const goStage3Next = () => {
    if (!stage3Correct) return
    setScores((s) => ({ ...s, 3: 100 }))
    setTotalScore((t) => t + 100)
    setStage(4)
  }

  const goStage4Next = () => {
    setScores((s) => ({ ...s, 4: 80 }))
    setTotalScore((t) => t + 80)
    setStage(6)
  }

  /** الرجوع للمرحلة السابقة مع إزالة نقاط المرحلة الحالية لتفادي العد المزدوج */
  const goStagePrev = () => {
    if (stage <= 1) return
    const currentScore = scores[stage]
    if (currentScore != null) {
      setTotalScore((t) => t - currentScore)
      setScores((s) => {
        const next = { ...s }
        delete next[stage]
        return next
      })
    }
    setStage(stage - 1)
  }

  const finishGame = useCallback(() => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const stagesCount = 4
    const maxTotal = stagesCount * 100
    const avg = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0
    onComplete({
      score: avg,
      answers: { scores, totalScore, stages: stage },
      timeSpent,
    })
  }, [startTime, totalScore, scores, stage, onComplete])

  useEffect(() => {
    if (stage === 6) finishGame()
  }, [stage, finishGame])

  // عند اختيار عنصر في المرحلة 1، نُصفّر التوزيع
  useEffect(() => {
    if (stage1Element) setStage1Distribution({ K: 0, L: 0, M: 0, N: 0 })
  }, [stage1Element?.id])

  const updateDistribution = useCallback((level: string, delta: number) => {
    setStage1Distribution((prev) => {
      const next = { ...prev }
      const cap = LEVEL_CAPACITY[level]
      const current = next[level as keyof typeof next]
      if (delta === 1 && current < cap) {
        const total = prev.K + prev.L + prev.M + prev.N
        if (total < (stage1Element?.totalElectrons ?? 0)) next[level as keyof typeof next] = current + 1
      }
      if (delta === -1 && current > 0) next[level as keyof typeof next] = current - 1
      return next
    })
  }, [stage1Element])

  const maxScore = 400
  const progressPercent = Math.min(100, (totalScore / maxScore) * 100)

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border-2 border-indigo-100 bg-white p-6 shadow-lg">
      <div className="text-center">
        <h2 className="text-xl font-bold text-indigo-900">{game.title}</h2>
        <p className="text-sm text-slate-600 mt-1">{game.objective}</p>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">النتيجة: {totalScore} / {maxScore}</p>
      </div>

      {/* المرحلة 1 */}
      {stage === 1 && (
        <section className="space-y-4">
          <h3 className="font-bold text-indigo-800">المرحلة 1: وزّع الإلكترونات</h3>
          {!stage1Element ? (
            <>
              <p className="text-sm text-slate-600">اختر مجموعة ثم عنصراً.</p>
              <div className="flex flex-wrap gap-2">
                {GROUPS.map((g) => (
                  <button
                    key={g.num}
                    type="button"
                    onClick={() => { setStage1Group(g.num); setStage1Element(null) }}
                    className={`rounded-xl border-2 px-4 py-2 text-sm ${stage1Group === g.num ? "border-indigo-500 bg-indigo-100" : "border-slate-200"}`}
                  >
                    {g.nameAr}
                  </button>
                ))}
              </div>
              {stage1Group != null && (
                <div className="flex flex-wrap gap-2">
                  {elementsForGroup.map((el) => (
                    <button
                      key={el.id}
                      type="button"
                      onClick={() => setStage1Element(el)}
                      className="rounded-xl border-2 border-slate-200 px-4 py-2 text-sm hover:border-indigo-300"
                    >
                      {el.symbol} – {el.nameAr}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">العنصر: <strong>{stage1Element.nameAr} ({stage1Element.symbol})</strong> – عدد البروتونات والإلكترونات: {stage1Element.totalElectrons}</p>
              <EnergyLevelsStage1
                element={stage1Element}
                distribution={stage1Distribution}
                onDistributionChange={updateDistribution}
                isCorrect={stage1Correct}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={goStage1Next}
                  disabled={!stage1Correct}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  التالي: حدّد إلكترونات التكافؤ
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {/* المرحلة 2 */}
      {stage === 2 && stage1Element && (
        <section className="space-y-4">
          <h3 className="font-bold text-indigo-800">المرحلة 2: حدّد إلكترونات التكافؤ</h3>
          <ValenceQuestionStage2
            element={stage1Element}
            selectedValence={stage2Valence}
            onSelect={setStage2Valence}
            showFeedback={stage2ShowFeedback}
            isCorrect={stage2Correct}
          />
          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={goStagePrev}
              className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              السابق
            </button>
            <button
              type="button"
              onClick={goStage2Next}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {!stage2ShowFeedback ? "تحقق" : "التالي: التمثيل النقطي"}
            </button>
          </div>
        </section>
      )}

      {/* المرحلة 3 */}
      {stage === 3 && stage1Element && (
        <section className="space-y-4">
          <h3 className="font-bold text-indigo-800">المرحلة 3: التمثيل النقطي للإلكترونات</h3>
          <LewisDotStage3
            element={stage1Element}
            dotCount={stage3DotCount}
            onDotChange={(delta) => setStage3DotCount((prev) => Math.max(0, Math.min(stage1Element.valence, prev + delta)))}
            isCorrect={stage3Correct}
          />
          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={goStagePrev}
              className="rounded-xl border-2 border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              السابق
            </button>
            <button
              type="button"
              onClick={goStage3Next}
              disabled={!stage3Correct}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              التالي: ارسم التمثيل النقطي
            </button>
          </div>
        </section>
      )}

      {/* المرحلة 4 */}
      {stage === 4 && stage1Element && (
        <section className="space-y-4">
          <h3 className="font-bold text-indigo-800">المرحلة 4: ارسم التمثيل النقطي</h3>
          <DrawingCanvasStage4 element={stage1Element} onDone={goStage4Next} onPrev={goStagePrev} />
        </section>
      )}

    </div>
  )
}
