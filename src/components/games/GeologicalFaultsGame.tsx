"use client"

/**
 * لعبة الصدوع الجيولوجية - ثلاث مراحل متتابعة
 * المرحلة 1: مفهوم الصدع (تعريف + سؤال اختيار من متعدد)
 * المرحلة 2: أنواع الصدوع (محاكاة بصرية + اختيار النوع)
 * المرحلة 3: التمييز بالرسم (اتجاه الحركة + نوع الصدع)
 */
import { useState, useCallback } from "react"
import type { FaultsGameData } from "@/types/games"

type EducationalGameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type GeologicalFaultsGameProps = {
  gameData: FaultsGameData
  game: EducationalGameMeta
  onComplete: (result: { score: number; answers: Record<string, unknown>; timeSpent: number }) => void
}

// تعريف الصدع ونص المرحلة الأولى
const FAULT_DEFINITION =
  "الصدع الجيولوجي هو كسر في صخور القشرة الأرضية تصاحبه حركة للكتل الصخرية على جانبي سطح الكسر. ينتج عن قوى الضغط أو الشد التي تؤثر في الصخور."

// سؤال المرحلة الأولى وبدائله
const STAGE1_QUESTION = "ما هو الصدع الجيولوجي؟"
const STAGE1_OPTIONS = [
  "كسر في الصخور تتحرك على جانبه كتل صخرية",
  "طبقة من الحمم البركانية",
  "انثناء في الطبقات الصخرية",
  "فتحة في القشرة الأرضية",
]
const STAGE1_CORRECT = "كسر في الصخور تتحرك على جانبه كتل صخرية"

// مسارات صور أنواع الصدوع من مجلد public/images/activities/انواع الصدوع
const FAULT_IMAGES: Record<string, string> = {
  normal: "/images/activities/انواع الصدوع/صدع عادي.png",
  reverse: "/images/activities/انواع الصدوع/صدع عكسي.png",
  strike_slip: "/images/activities/انواع الصدوع/صدع جانبي انزلاقي.png",
}

// أنواع الصدوع للمرحلة 2 و 3
const FAULT_TYPES = [
  { id: "normal", nameAr: "صدع عادي", description: "الكتلة العلوية تتحرك لأسفل بالنسبة للكتلة السفلى.", imagePath: FAULT_IMAGES.normal },
  { id: "reverse", nameAr: "صدع عكسي", description: "الكتلة العلوية تتحرك لأعلى بالنسبة للكتلة السفلى (قوى ضغط).", imagePath: FAULT_IMAGES.reverse },
  { id: "strike_slip", nameAr: "صدع جانبي (انزلاقي)", description: "الكتل تتحرك أفقياً جنباً إلى جنب دون حركة رأسية.", imagePath: FAULT_IMAGES.strike_slip },
] as const

type MovementType = "up" | "down" | "side"
const MOVEMENT_TO_FAULT: Record<MovementType, string> = {
  up: "reverse",
  down: "normal",
  side: "strike_slip",
}

export default function GeologicalFaultsGame({ gameData, game, onComplete }: GeologicalFaultsGameProps) {
  const startTime = useState(Date.now())[0]
  const [stage, setStage] = useState(1)
  const [points, setPoints] = useState(0)
  const [stage1Answer, setStage1Answer] = useState<string | null>(null)
  const [stage1Correct, setStage1Correct] = useState<boolean | null>(null)
  const [stage2Movement, setStage2Movement] = useState<MovementType | null>(null)
  const [stage2Choice, setStage2Choice] = useState<string | null>(null)
  const [stage2Correct, setStage2Correct] = useState<boolean | null>(null)
  const [stage3Scenario, setStage3Scenario] = useState<typeof FAULT_TYPES[number] | null>(null)
  const [stage3Direction, setStage3Direction] = useState<string | null>(null)
  const [stage3FaultType, setStage3FaultType] = useState<string | null>(null)
  const [stage3Checked, setStage3Checked] = useState(false)
  const [encouragement, setEncouragement] = useState<string | null>(null)

  const question = gameData.stage1Question ?? STAGE1_QUESTION
  const options = gameData.stage1Options ?? STAGE1_OPTIONS
  const correctAnswer = gameData.stage1CorrectAnswer ?? STAGE1_CORRECT

  const handleStage1Submit = useCallback(() => {
    if (!stage1Answer) return
    const correct = stage1Answer === correctAnswer
    setStage1Correct(correct)
    if (correct) {
      setPoints((p) => p + 10)
      setEncouragement("أحسنت! أنتِ تفهمين مفهوم الصدع. انتقلي للمرحلة الثانية.")
    } else {
      setEncouragement("الإجابة غير صحيحة. راجعي التعريف وحاولي مرة أخرى.")
    }
  }, [stage1Answer, correctAnswer])

  const advanceToStage2 = useCallback(() => {
    setStage1Correct(null)
    setStage1Answer(null)
    setEncouragement(null)
    setStage(2)
  }, [])

  const handleStage2Move = useCallback((movement: MovementType) => {
    setStage2Movement(movement)
    setStage2Choice(null)
    setStage2Correct(null)
  }, [])

  const handleStage2Choose = useCallback((faultId: string) => {
    if (!stage2Movement) return
    setStage2Choice(faultId)
    const expected = MOVEMENT_TO_FAULT[stage2Movement]
    const correct = faultId === expected
    setStage2Correct(correct)
    if (correct) {
      setPoints((p) => p + 15)
      setEncouragement("ممتاز! تمييزك صحيح. انتقلي للمرحلة الثالثة.")
    } else {
      setEncouragement("نوع الصدع لا يتطابق مع اتجاه الحركة. جرّبي مرة أخرى.")
    }
  }, [stage2Movement])

  const advanceToStage3 = useCallback(() => {
    setStage2Movement(null)
    setStage2Choice(null)
    setStage2Correct(null)
    setEncouragement(null)
    setStage(3)
    setStage3Scenario(FAULT_TYPES[Math.floor(Math.random() * FAULT_TYPES.length)])
    setStage3Direction(null)
    setStage3FaultType(null)
    setStage3Checked(false)
  }, [])

  const getExpectedDirection = useCallback((faultId: string) => {
    if (faultId === "normal") return "لأسفل"
    if (faultId === "reverse") return "لأعلى"
    return "جانبي"
  }, [])

  const handleStage3Submit = useCallback(() => {
    if (!stage3Scenario || !stage3Direction || !stage3FaultType) return
    const directionCorrect =
      (stage3Scenario.id === "normal" && stage3Direction === "لأسفل") ||
      (stage3Scenario.id === "reverse" && stage3Direction === "لأعلى") ||
      (stage3Scenario.id === "strike_slip" && stage3Direction === "جانبي")
    const typeCorrect = stage3FaultType === stage3Scenario.id
    setStage3Checked(true)
    if (directionCorrect && typeCorrect) {
      setPoints((p) => p + 15)
      setEncouragement("ممتاز! أتقنتِ التمييز بين أنواع الصدوع.")
    } else if (!typeCorrect) {
      setEncouragement(`نوع الصدع الصحيح: ${stage3Scenario.nameAr}. اتجاه الحركة: ${getExpectedDirection(stage3Scenario.id)}.`)
    } else {
      setEncouragement(`اتجاه الحركة المتوقع: ${getExpectedDirection(stage3Scenario.id)}. نوع الصدع: ${stage3Scenario.nameAr}.`)
    }
  }, [stage3Scenario, stage3Direction, stage3FaultType, getExpectedDirection])

  const finishGame = useCallback(() => {
    const maxPoints = 40
    const score = Math.round((Math.min(points, maxPoints) / maxPoints) * 100)
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    onComplete({
      score,
      answers: {
        stage1: { answer: stage1Answer, correct: stage1Correct },
        stage2: { movement: stage2Movement, choice: stage2Choice, correct: stage2Correct },
        stage3: { scenario: stage3Scenario?.id, direction: stage3Direction, faultType: stage3FaultType },
      },
      timeSpent,
    })
  }, [points, startTime, onComplete, stage1Answer, stage1Correct, stage2Movement, stage2Choice, stage2Correct, stage3Scenario, stage3Direction, stage3FaultType])

  return (
    <div className="space-y-6" dir="rtl">
      {/* شريط المراحل والنقاط */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                stage === s ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
              }`}
            >
          المرحلة {s}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
            النقاط: {points}
          </span>
        </div>
      </div>

      {/* المرحلة 1: مفهوم الصدع */}
      {stage === 1 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">المرحلة الأولى: مفهوم الصدع</h3>
          {/* مقطع أرضي بسيط (طبقات صخرية) */}
          <div className="flex justify-center my-4 p-4 bg-slate-50 rounded-xl">
            <svg viewBox="0 0 280 120" className="w-full max-w-md h-auto" aria-hidden>
              <defs>
                <linearGradient id="rock1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#78716c" />
                  <stop offset="100%" stopColor="#57534e" />
                </linearGradient>
                <linearGradient id="rock2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a8a29e" />
                  <stop offset="100%" stopColor="#78716c" />
                </linearGradient>
                <linearGradient id="rock3" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#57534e" />
                  <stop offset="100%" stopColor="#44403c" />
                </linearGradient>
              </defs>
              {/* طبقات قبل الصدع */}
              <rect x="20" y="20" width="100" height="25" fill="url(#rock1)" stroke="#444" strokeWidth="1" />
              <rect x="20" y="45" width="100" height="25" fill="url(#rock2)" stroke="#444" strokeWidth="1" />
              <rect x="20" y="70" width="100" height="30" fill="url(#rock3)" stroke="#444" strokeWidth="1" />
              {/* خط الصدع */}
              <line x1="120" y1="20" x2="120" y2="100" stroke="#b91c1c" strokeWidth="3" strokeDasharray="4 2" />
              {/* طبقات بعد الصدع (مزاحة قليلاً) */}
              <rect x="123" y="35" width="97" height="25" fill="url(#rock1)" stroke="#444" strokeWidth="1" />
              <rect x="123" y="60" width="97" height="25" fill="url(#rock2)" stroke="#444" strokeWidth="1" />
              <rect x="123" y="85" width="97" height="25" fill="url(#rock3)" stroke="#444" strokeWidth="1" />
              <text x="140" y="58" textAnchor="middle" className="text-[10px] fill-slate-600" fill="#475569">حركة</text>
            </svg>
          </div>
          <p className="text-slate-700 mb-4 leading-relaxed">{FAULT_DEFINITION}</p>
          <p className="font-semibold text-slate-900 mb-2">{question}</p>
          <div className="space-y-2">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => !stage1Correct && setStage1Answer(opt)}
                disabled={stage1Correct !== null}
                className={`w-full text-right p-4 rounded-xl border-2 transition ${
                  stage1Answer === opt
                    ? "border-teal-500 bg-teal-50"
                    : stage1Correct !== null
                      ? "border-slate-200 bg-slate-50 opacity-80"
                      : "border-slate-200 hover:border-teal-300 bg-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {stage1Correct !== null && (
            <p className={`mt-3 text-sm font-medium ${stage1Correct ? "text-emerald-700" : "text-rose-700"}`}>
              {stage1Correct ? "إجابة صحيحة ✓" : "إجابة خاطئة. الصدع هو كسر في الصخور تتحرك على جانبه كتل صخرية."}
            </p>
          )}
          {encouragement && <p className="mt-2 text-sm text-teal-700">{encouragement}</p>}
          <div className="mt-6 flex gap-3">
            {stage1Correct === null && (
              <button
                onClick={handleStage1Submit}
                disabled={!stage1Answer}
                className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
              >
                تحقق من الإجابة
              </button>
            )}
            {stage1Correct === true && (
              <button
                onClick={advanceToStage2}
                className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
              >
                التالي ← المرحلة الثانية
              </button>
            )}
            {stage1Correct === false && (
              <button
                onClick={() => { setStage1Correct(null); setStage1Answer(null); setEncouragement(null); }}
                className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                حاولي مرة أخرى
              </button>
            )}
          </div>
        </div>
      )}

      {/* المرحلة 2: أنواع الصدوع (محاكاة) */}
      {stage === 2 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">المرحلة الثانية: أنواع الصدوع</h3>
          <p className="text-sm text-slate-600 mb-4">حرّكي الجانب الأيسر من الصخر ثم اختاري نوع الصدع الناتج.</p>
          {/* عرض صورة الصدع الناتج عن الحركة المختارة (من مجلد انواع الصدوع) */}
          <div className="flex justify-center my-6 p-4 bg-slate-50 rounded-xl overflow-x-auto">
            {stage2Movement ? (
              <img
                src={FAULT_IMAGES[MOVEMENT_TO_FAULT[stage2Movement]]}
                alt={FAULT_TYPES.find((f) => f.id === MOVEMENT_TO_FAULT[stage2Movement])?.nameAr ?? "صدع"}
                className="max-w-full h-auto max-h-[280px] object-contain"
              />
            ) : (
              <p className="text-slate-500 py-8">اختياري حركة من الأزرار أدناه لرؤية شكل الصدع.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-semibold text-slate-700">تحريك الجانب الأيسر:</span>
            <button
              type="button"
              onClick={() => handleStage2Move("up")}
              className={`px-4 py-2 rounded-lg border-2 font-medium ${
                stage2Movement === "up" ? "border-teal-500 bg-teal-100" : "border-slate-200 hover:border-teal-300"
              }`}
            >
              لأعلى
            </button>
            <button
              type="button"
              onClick={() => handleStage2Move("down")}
              className={`px-4 py-2 rounded-lg border-2 font-medium ${
                stage2Movement === "down" ? "border-teal-500 bg-teal-100" : "border-slate-200 hover:border-teal-300"
              }`}
            >
              لأسفل
            </button>
            <button
              type="button"
              onClick={() => handleStage2Move("side")}
              className={`px-4 py-2 rounded-lg border-2 font-medium ${
                stage2Movement === "side" ? "border-teal-500 bg-teal-100" : "border-slate-200 hover:border-teal-300"
              }`}
            >
              جانبي
            </button>
          </div>
          {stage2Movement && (
            <>
              <p className="text-sm font-semibold text-slate-700 mb-2">ما نوع هذا الصدع؟</p>
              <div className="flex flex-wrap gap-2">
                {FAULT_TYPES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => handleStage2Choose(f.id)}
                    disabled={stage2Correct !== null}
                    className={`px-4 py-3 rounded-xl border-2 text-sm font-medium ${
                      stage2Choice === f.id
                        ? stage2Correct
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-rose-500 bg-rose-50"
                        : "border-slate-200 hover:border-teal-300 bg-white"
                    }`}
                  >
                    {f.nameAr}
                  </button>
                ))}
              </div>
              {stage2Correct !== null && (
                <p className="mt-2 text-sm text-slate-700">
                  {FAULT_TYPES.find((f) => f.id === MOVEMENT_TO_FAULT[stage2Movement])?.description}
                </p>
              )}
            </>
          )}
          {encouragement && <p className="mt-3 text-sm text-teal-700">{encouragement}</p>}
          {stage2Correct === true && (
            <button
              onClick={advanceToStage3}
              className="mt-4 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
            >
              التالي ← المرحلة الثالثة
            </button>
          )}
          {stage2Correct === false && (
            <button
              onClick={() => { setStage2Movement(null); setStage2Choice(null); setStage2Correct(null); setEncouragement(null); }}
              className="mt-4 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              جرّبي حركة أخرى
            </button>
          )}
        </div>
      )}

      {/* المرحلة 3: التمييز بالرسم */}
      {stage === 3 && stage3Scenario && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">المرحلة الثالثة: التمييز بالرسم</h3>
          <p className="text-sm text-slate-600 mb-4">حددي اتجاه حركة الكتلة اليسرى ثم اختاري نوع الصدع المناسب.</p>
          <div className="flex justify-center my-4 p-4 bg-slate-50 rounded-xl">
            <img
              src={stage3Scenario.imagePath}
              alt={stage3Scenario.nameAr}
              className="max-w-full h-auto max-h-[300px] object-contain"
            />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-2">اتجاه حركة الكتلة اليسرى:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {["لأعلى", "لأسفل", "جانبي"].map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setStage3Direction(dir)}
                disabled={stage3Checked}
                className={`px-4 py-2 rounded-lg border-2 font-medium ${
                  stage3Direction === dir ? "border-teal-500 bg-teal-100" : "border-slate-200 hover:border-teal-300"
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-2">نوع الصدع:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {FAULT_TYPES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStage3FaultType(f.id)}
                disabled={stage3Checked}
                className={`px-4 py-2 rounded-lg border-2 font-medium ${
                  stage3FaultType === f.id ? "border-teal-500 bg-teal-100" : "border-slate-200 hover:border-teal-300"
                }`}
              >
                {f.nameAr}
              </button>
            ))}
          </div>
          {encouragement && stage3Checked && <p className="mb-4 text-sm text-teal-700">{encouragement}</p>}
          <div className="flex flex-wrap gap-3">
            {!stage3Checked && (
              <button
                onClick={handleStage3Submit}
                disabled={!stage3Direction || !stage3FaultType}
                className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50"
              >
                تحقق من الإجابة
              </button>
            )}
            {stage3Checked && (
              <>
                <button
                  onClick={finishGame}
                  className="px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700"
                >
                  إنهاء اللعبة وعرض الملخص
                </button>
                <button
                  onClick={() => {
                    setStage3Direction(null)
                    setStage3FaultType(null)
                    setStage3Checked(false)
                    setEncouragement(null)
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  حاولي مرة أخرى
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ملخص نهائي (يظهر بعد النقر على إنهاء اللعبة عبر finishGame) */}
    </div>
  )
}
