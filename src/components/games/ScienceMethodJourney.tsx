"use client"

/**
 * رحلة المحقق العلمي - ترتيب خطوات المنهج العلمي
 *
 * إطار قصصي (محقق يحل لغز علمي) حول ميكانيكية الترتيب الأساسية: مسار مرقّم
 * من الفتحات يُملأ بالنقر على بطاقات الخطوات، مع تلوين وأيقونة مميزة لكل
 * خطوة، تغذية راجعة فورية ملوّنة عند التحقق، احتفال بصري عند الإجابة
 * الكاملة، ومؤقّت زمني (للأجواء فقط، لا يؤثر في الدرجة).
 */
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ScienceMethodJourneyGameData } from "@/types/games"

type EducationalGameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type ScienceMethodJourneyProps = {
  gameData: ScienceMethodJourneyGameData
  game: EducationalGameMeta
  onComplete: (result: { score: number; answers: Record<string, unknown>; timeSpent: number }) => void
}

type StepColor = {
  ring: string
  bg: string
  text: string
}

type Step = {
  id: string
  order: number
  title: string
  icon: string
  hint: string
  color: StepColor
}

const STEPS: Step[] = [
  {
    id: "observe",
    order: 1,
    title: "الملاحظة",
    icon: "🔍",
    hint: "تلاحظين شيئاً مثيراً للانتباه في محيطك",
    color: { ring: "border-sky-400", bg: "bg-sky-50", text: "text-sky-700" },
  },
  {
    id: "question",
    order: 2,
    title: "طرح السؤال",
    icon: "❓",
    hint: "تتساءلين: لماذا يحدث هذا بالتحديد؟",
    color: { ring: "border-purple-400", bg: "bg-purple-50", text: "text-purple-700" },
  },
  {
    id: "hypothesis",
    order: 3,
    title: "صياغة الفرضية",
    icon: "💡",
    hint: "تقترحين تفسيراً أولياً يمكن اختباره",
    color: { ring: "border-amber-400", bg: "bg-amber-50", text: "text-amber-700" },
  },
  {
    id: "experiment",
    order: 4,
    title: "التجربة",
    icon: "🧪",
    hint: "تختبرين فرضيتك عملياً خطوة بخطوة",
    color: { ring: "border-teal-400", bg: "bg-teal-50", text: "text-teal-700" },
  },
  {
    id: "analyze",
    order: 5,
    title: "تحليل النتائج",
    icon: "📊",
    hint: "تدرسين البيانات التي جمعتِها بعناية",
    color: { ring: "border-indigo-400", bg: "bg-indigo-50", text: "text-indigo-700" },
  },
  {
    id: "conclude",
    order: 6,
    title: "الاستنتاج",
    icon: "✅",
    hint: "تقررين هل كانت فرضيتك صحيحة أم لا",
    color: { ring: "border-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700" },
  },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function resultMessage(correctCount: number) {
  if (correctCount === STEPS.length) {
    return "🎉 رائع! حللتِ لغز المنهج العلمي بترتيب صحيح تماماً!"
  }
  if (correctCount >= 4) {
    return "👏 قريبة جداً من الحل الكامل! راجعي الخطوات المحددة باللون الأحمر."
  }
  if (correctCount >= 2) {
    return "💪 بداية جيدة! فكّري في التسلسل الطبيعي للتفكير العلمي وحاولي مرة أخرى."
  }
  return "🤔 لا بأس، كل محقق يحتاج بعض المحاولات! راجعي معنى كل خطوة وحاولي مرة أخرى."
}

export default function ScienceMethodJourney({ game, onComplete }: ScienceMethodJourneyProps) {
  const [startTime] = useState(() => Date.now())
  const [bank, setBank] = useState<Step[]>(() => shuffle(STEPS))
  const [slots, setSlots] = useState<Array<Step | null>>(() => Array(STEPS.length).fill(null))
  const [checked, setChecked] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (checked) return
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [checked, startTime])

  const filledCount = slots.filter(Boolean).length
  const allFilled = filledCount === STEPS.length

  const correctCount = useMemo(
    () => slots.reduce((acc: number, step, idx) => acc + (step && step.order === idx + 1 ? 1 : 0), 0),
    [slots]
  )
  const score = Math.round((correctCount / STEPS.length) * 100)
  const isPerfect = checked && correctCount === STEPS.length

  const placeStep = useCallback(
    (step: Step) => {
      if (checked) return
      setSlots((prev) => {
        const firstEmpty = prev.findIndex((s) => s === null)
        if (firstEmpty === -1) return prev
        const next = [...prev]
        next[firstEmpty] = step
        return next
      })
      setBank((prev) => prev.filter((s) => s.id !== step.id))
    },
    [checked]
  )

  const removeFromSlot = useCallback(
    (index: number) => {
      if (checked) return
      setSlots((prev) => {
        const step = prev[index]
        if (!step) return prev
        setBank((b) => [...b, step])
        const next = [...prev]
        next[index] = null
        return next
      })
    },
    [checked]
  )

  const handleCheck = useCallback(() => {
    if (!allFilled) return
    setChecked(true)
    setAttempts((a) => a + 1)
  }, [allFilled])

  const handleRetry = useCallback(() => {
    setSlots(Array(STEPS.length).fill(null))
    setBank(shuffle(STEPS))
    setChecked(false)
  }, [])

  const handleFinish = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    onComplete({
      score,
      answers: {
        finalOrder: slots.map((s) => s?.id ?? null),
        correctCount,
        attempts,
      },
      timeSpent,
    })
  }, [score, slots, correctCount, attempts, startTime, onComplete])

  return (
    <div dir="rtl" className="space-y-6">
      {/* بطاقة المهمة */}
      <div className="card border border-primary-100 bg-gradient-to-br from-primary-50 to-white">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🕵️‍♀️</span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">مهمة المحقق العلمي</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {game.objective || "ساعدي المحققة العلمية على حل اللغز! رتّبي خطوات المنهج العلمي بالنقر عليها بالترتيب الصحيح من البداية إلى النهاية."}
            </p>
          </div>
        </div>
      </div>

      {/* شريط الحالة: التقدم + المحاولات + الوقت */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge bg-primary-100 text-primary-800">
            {filledCount} / {STEPS.length} خطوات
          </span>
          {attempts > 0 && (
            <span className="badge bg-accent-100 text-accent-700">المحاولة {attempts}</span>
          )}
        </div>
        <span className="badge bg-slate-100 text-slate-600">⏱ {formatTime(elapsed)}</span>
      </div>

      {/* مسار اللغز: الفتحات المرقّمة */}
      <div className="card relative overflow-hidden">
        {isPerfect && <Confetti />}
        <p className="mb-4 text-sm font-semibold text-slate-700">مسار حل اللغز:</p>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {slots.map((step, idx) => {
            const isCorrectSlot = checked && step && step.order === idx + 1
            const isWrongSlot = checked && step && step.order !== idx + 1
            return (
              <button
                key={idx}
                type="button"
                onClick={() => removeFromSlot(idx)}
                disabled={checked || !step}
                className={`relative flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 text-center transition-all duration-300 sm:h-28 sm:w-28 ${
                  !step
                    ? "border-dashed border-slate-300 bg-slate-50"
                    : isCorrectSlot
                      ? "scale-105 border-emerald-400 bg-emerald-50"
                      : isWrongSlot
                        ? "border-rose-400 bg-rose-50 animate-shake"
                        : `animate-pop-in ${step.color.ring} ${step.color.bg} hover:scale-105`
                }`}
              >
                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-[11px] font-bold text-white">
                  {idx + 1}
                </span>
                {step ? (
                  <>
                    <span className="text-2xl">{step.icon}</span>
                    <span className={`text-xs font-semibold leading-tight ${step.color.text}`}>
                      {step.title}
                    </span>
                    {checked && (
                      <span className="absolute -bottom-2 -left-2 text-lg">
                        {isCorrectSlot ? "✅" : "❌"}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-2xl text-slate-300">؟</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* نتيجة التحقق */}
      {checked && (
        <div
          className={`card border-2 ${isPerfect ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}
        >
          <p className={`font-semibold ${isPerfect ? "text-emerald-800" : "text-amber-800"}`}>
            {resultMessage(correctCount)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            النتيجة: {correctCount} من {STEPS.length} خطوات صحيحة ({score}%)
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {!isPerfect && (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
              >
                🔄 حاولي مرة أخرى
              </button>
            )}
            <button
              type="button"
              onClick={handleFinish}
              className={`rounded-xl px-6 py-3 font-semibold transition ${
                isPerfect
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isPerfect ? "✨ إنهاء المهمة" : "إنهاء بهذه النتيجة"}
            </button>
          </div>
        </div>
      )}

      {/* بنك بطاقات الخطوات */}
      {!checked && (
        <div className="card">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            انقري على الخطوة لإضافتها للمسار (حسب ترتيبها الصحيح من وجهة نظرك):
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {bank.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => placeStep(step)}
                className={`flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white p-4 text-right transition hover:scale-[1.02] hover:shadow-md ${step.color.ring.replace("border-", "hover:border-")}`}
              >
                <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl ${step.color.bg}`}>
                  {step.icon}
                </span>
                <span>
                  <span className="block font-semibold text-slate-900">{step.title}</span>
                  <span className="block text-xs text-slate-500">{step.hint}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleCheck}
              disabled={!allFilled}
              className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              🔎 تحقق من الترتيب
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** احتفال بصري بسيط (CSS فقط) عند الإجابة الكاملة الصحيحة */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        delay: Math.round(Math.random() * 400),
        emoji: ["🎉", "✨", "⭐", "🔬"][i % 4],
      })),
    []
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="animate-confetti-fall absolute top-0 text-xl"
          style={{ left: `${p.left}%`, animationDelay: `${p.delay}ms` }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
