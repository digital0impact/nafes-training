"use client"

/**
 * لعبة مختبر سرعة التفاعلات – Reaction Rates, Activation Energy & Catalysts
 * أهداف: تعريف سرعة التفاعل وقياسها، التلقائي وغير التلقائي، العوامل المؤثرة (تركيز، حرارة، ضغط، مساحة سطح، محفزات)،
 * طاقة التنشيط، تعريف المحفز والتمييز بين المحفز والمثبط.
 *
 * المستوى 1: تعريف سرعة التفاعل وقياسها
 * المستوى 2: التفاعلات التلقائية وغير التلقائية
 * المستوى 3: العوامل المؤثرة في سرعة التفاعل
 * المستوى 4: طاقة التنشيط
 * المستوى 5: المحفزات والتمييز
 */
import { useState, useCallback, useEffect, useMemo } from "react"
import type { ReactionRatesLabGameData } from "@/types/games"

/** خلط عناصر المصفوفة عشوائياً (لخيارات الاختيار من متعدد) */
function shuffleOptions<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

type EducationalGameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type ReactionRatesLabProps = {
  gameData: ReactionRatesLabGameData
  game: EducationalGameMeta
  onComplete: (result: { score: number; answers?: Record<string, unknown>; timeSpent: number }) => void
}

// ─── المستوى 1: تعريف سرعة التفاعل وقياسها ─────────────────────────────────
const LEVEL1_QUESTIONS = [
  {
    id: "q1",
    question: "ما المقصود بسرعة التفاعل الكيميائي؟",
    options: [
      "التغيّر في كمية المتفاعلات أو النواتج في وحدة الزمن",
      "درجة الحرارة اللازمة لبدء التفاعل",
      "كمية الطاقة المنطلقة عند اكتمال التفاعل",
      "عدد الذرات في المعادلة",
    ],
    correctAnswer: "التغيّر في كمية المتفاعلات أو النواتج في وحدة الزمن",
    explanation: "سرعة التفاعل تُعرف بأنها مقدار التغيّر في تركيز المتفاعلات أو النواتج خلال وحدة الزمن (مثلاً مول/لتر.ثانية).",
  },
  {
    id: "q2",
    question: "كيف يمكن قياس سرعة تفاعل كيميائي؟",
    options: [
      "بقياس تغيّر كمية المتفاعلات أو النواتج مع الزمن",
      "بقياس درجة الحرارة فقط",
      "بقياس اللون فقط",
      "بعد عدد الذرات في بداية التفاعل فقط",
    ],
    correctAnswer: "بقياس تغيّر كمية المتفاعلات أو النواتج مع الزمن",
    explanation: "نقيس سرعة التفاعل إما بنقصان تركيز المتفاعلات مع الزمن أو بزيادة تركيز النواتج مع الزمن.",
  },
]

// ─── المستوى 2: تلقائي / غير تلقائي ────────────────────────────────────────
const LEVEL2_ITEMS = [
  {
    id: "a1",
    text: "احتراق الخشب في الهواء",
    type: "تلقائي" as const,
    reason: "يحدث تلقائياً عند توفر الأكسجين والحرارة، ويطلق طاقة.",
  },
  {
    id: "a2",
    text: "صدأ الحديد",
    type: "تلقائي" as const,
    reason: "يحدث تلقائياً بوجود الرطوبة والأكسجين.",
  },
  {
    id: "a3",
    text: "تحليل الماء إلى هيدروجين وأكسجين بالكهرباء",
    type: "غير تلقائي" as const,
    reason: "لا يحدث من تلقاء نفسه؛ يحتاج طاقة كهربائية.",
  },
  {
    id: "a4",
    text: "تكوين غاز ثاني أكسيد الكربون من تفاعل الحمض مع كربونات",
    type: "تلقائي" as const,
    reason: "يحدث عند خلط الحمض مع الكربونات دون حاجة لمصدر طاقة خارجي.",
  },
]

// ─── المستوى 3: العوامل المؤثرة في سرعة التفاعل ───────────────────────────
const LEVEL3_FACTORS = [
  {
    id: "f1",
    factor: "زيادة تركيز المتفاعلات",
    effect: "يزيد عدد التصادمات بين الجزيئات في وحدة الزمن فتزداد السرعة",
  },
  {
    id: "f2",
    factor: "رفع درجة الحرارة",
    effect: "تزداد طاقة الجزيئات وعدد التصادمات الفعالة فتزداد السرعة",
  },
  {
    id: "f3",
    factor: "زيادة الضغط (في التفاعلات الغازية)",
    effect: "تقارب الجزيئات وزيادة التصادمات فترتفع السرعة",
  },
  {
    id: "f4",
    factor: "زيادة مساحة السطح (مثلاً طحن مادة صلبة)",
    effect: "تزداد نقاط التماس بين المتفاعلات فترتفع السرعة",
  },
  {
    id: "f5",
    factor: "إضافة محفز",
    effect: "يقلل طاقة التنشيط دون أن يُستهلك في التفاعل فيزداد معدل التفاعل",
  },
]

// ─── المستوى 4: طاقة التنشيط ───────────────────────────────────────────────
const LEVEL4_QUESTIONS = [
  {
    id: "q4-1",
    question: "ما المقصود بطاقة التنشيط؟",
    options: [
      "أقل طاقة يجب أن تمتلكها الجزيئات لتحقق تصادماً فعالاً يفضي إلى التفاعل",
      "الطاقة المنطلقة عند اكتمال التفاعل",
      "الطاقة المخزنة في الروابط فقط",
      "درجة حرارة الغرفة",
    ],
    correctAnswer: "أقل طاقة يجب أن تمتلكها الجزيئات لتحقق تصادماً فعالاً يفضي إلى التفاعل",
    explanation: "طاقة التنشيط هي حاجز الطاقة الذي يجب تجاوزه لبدء التفاعل؛ كلما كانت أقل كان التفاعل أسرع.",
  },
  {
    id: "q4-2",
    question: "ما دور طاقة التنشيط في سرعة التفاعل؟",
    options: [
      "كلما زادت طاقة التنشيط قل عدد الجزيئات القادرة على تجاوز الحاجز فتنخفض السرعة",
      "طاقة التنشيط لا تؤثر في السرعة",
      "كلما زادت طاقة التنشيط زادت السرعة",
      "طاقة التنشيط تحدد لون الناتج فقط",
    ],
    correctAnswer: "كلما زادت طاقة التنشيط قل عدد الجزيئات القادرة على تجاوز الحاجز فتنخفض السرعة",
    explanation: "تفاعلات ذات طاقة تنشيط منخفضة تحدث أسرع لأن جزيئات أكثر لديها طاقة كافية للتجاوز.",
  },
]

// ─── المستوى 5: المحفزات ───────────────────────────────────────────────────
const LEVEL5_QUESTIONS = [
  {
    id: "q5-1",
    question: "ما تعريف المحفز؟",
    options: [
      "مادة تزيد سرعة التفاعل دون أن تُستهلك فيه؛ تعمل بتخفيض طاقة التنشيط",
      "مادة تبطئ التفاعل",
      "مادة تشارك في التفاعل وتُستهلك",
      "مادة تزيد درجة الحرارة فقط",
    ],
    correctAnswer: "مادة تزيد سرعة التفاعل دون أن تُستهلك فيه؛ تعمل بتخفيض طاقة التنشيط",
    explanation: "المحفز يوفّر مساراً بديلاً للتفاعل بحاجز طاقة أقل، ويُستعاد في النهاية.",
  },
  {
    id: "q5-2",
    question: "كيف نُميّز بين المحفز والمثبط؟",
    options: [
      "المحفز يزيد سرعة التفاعل، والمثبط يقللها",
      "كلاهما يزيد السرعة",
      "المثبط يزيد السرعة والمحفز يقللها",
      "لا فرق بينهما",
    ],
    correctAnswer: "المحفز يزيد سرعة التفاعل، والمثبط يقللها",
    explanation: "المحفز يسرّع التفاعل؛ المثبط يبطئه أو يوقفه (مثل بعض المواد الحافظة).",
  },
]

const BADGES = [
  { id: "rate_expert", name: "خبير سرعة التفاعل", minLevel: 1 },
  { id: "factors_master", name: "متمكن من العوامل المؤثرة", minLevel: 3 },
  { id: "catalyst_scientist", name: "عالم المحفزات", minLevel: 5 },
]

export default function ReactionRatesLab({ gameData, game, onComplete }: ReactionRatesLabProps) {
  const [startTime] = useState(Date.now())
  const [currentLevel, setCurrentLevel] = useState(1)
  const [totalScore, setTotalScore] = useState(0)
  const [levelScores, setLevelScores] = useState<{ [key: number]: number }>({})
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])

  const [level1Index, setLevel1Index] = useState(0)
  const [level1Answer, setLevel1Answer] = useState("")
  const [level1Submitted, setLevel1Submitted] = useState(false)

  const [level2Selected, setLevel2Selected] = useState<{ [key: string]: "تلقائي" | "غير تلقائي" }>({})
  const [level2Submitted, setLevel2Submitted] = useState(false)

  const [level3Matches, setLevel3Matches] = useState<{ [key: string]: string }>({})
  const [level3Submitted, setLevel3Submitted] = useState(false)

  const [level4Index, setLevel4Index] = useState(0)
  const [level4Answer, setLevel4Answer] = useState("")
  const [level4Submitted, setLevel4Submitted] = useState(false)

  const [level5Index, setLevel5Index] = useState(0)
  const [level5Answer, setLevel5Answer] = useState("")
  const [level5Submitted, setLevel5Submitted] = useState(false)

  const finishGame = useCallback(() => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const avg =
      Object.keys(levelScores).length > 0
        ? Math.round(
            Object.values(levelScores).reduce((a, b) => a + b, 0) / Object.keys(levelScores).length
          )
        : totalScore
    const finalScore = Math.min(100, avg > 0 ? avg : totalScore)
    onComplete({ score: finalScore, answers: { levelScores, earnedBadges }, timeSpent })
  }, [startTime, levelScores, totalScore, onComplete, earnedBadges])

  useEffect(() => {
    if (currentLevel === 6) finishGame()
  }, [currentLevel, finishGame])

  useEffect(() => {
    const badges: string[] = []
    if (currentLevel >= 1) badges.push("rate_expert")
    if (currentLevel >= 3) badges.push("factors_master")
    if (currentLevel >= 5) badges.push("catalyst_scientist")
    setEarnedBadges(badges)
  }, [currentLevel])

  const progressPercent = (currentLevel / 6) * 100
  const stars = Math.min(5, Math.floor((totalScore / 100) * 5) + (currentLevel >= 5 ? 1 : 0))

  const q1 = LEVEL1_QUESTIONS[level1Index]
  const level1Correct = q1 && level1Answer === q1.correctAnswer
  const level1OptionsShuffled = useMemo(
    () => (q1 ? shuffleOptions(q1.options) : []),
    [level1Index]
  )

  const handleLevel1Submit = () => {
    if (!level1Answer) return
    setLevel1Submitted(true)
    const score = level1Correct ? 100 : 0
    setLevelScores((s) => {
      const prev = s[1] ?? 0
      const avg = level1Index === 0 ? score : Math.round((prev + score) / 2)
      return { ...s, 1: avg }
    })
    setTotalScore((t) => t + score)
  }

  const goLevel1Next = () => {
    if (level1Index < LEVEL1_QUESTIONS.length - 1) {
      setLevel1Index((i) => i + 1)
      setLevel1Answer("")
      setLevel1Submitted(false)
    } else setCurrentLevel(2)
  }

  const handleLevel2Submit = () => {
    const correctCount = LEVEL2_ITEMS.filter((item) => level2Selected[item.id] === item.type).length
    const score = Math.round((correctCount / LEVEL2_ITEMS.length) * 100)
    setLevel2Submitted(true)
    setLevelScores((s) => ({ ...s, 2: score }))
    setTotalScore((t) => t + score)
  }

  const goLevel2Next = () => setCurrentLevel(3)

  const level3EffectTexts = [...new Set(LEVEL3_FACTORS.map((f) => f.effect))]

  const handleLevel3Submit = () => {
    const correctCount = LEVEL3_FACTORS.filter((f) => level3Matches[f.id] === f.effect).length
    const score = Math.round((correctCount / LEVEL3_FACTORS.length) * 100)
    setLevel3Submitted(true)
    setLevelScores((s) => ({ ...s, 3: score }))
    setTotalScore((t) => t + score)
  }

  const goLevel3Next = () => setCurrentLevel(4)

  const q4 = LEVEL4_QUESTIONS[level4Index]
  const level4Correct = q4 && level4Answer === q4.correctAnswer
  const level4OptionsShuffled = useMemo(
    () => (q4 ? shuffleOptions(q4.options) : []),
    [level4Index]
  )

  const handleLevel4Submit = () => {
    if (!level4Answer) return
    setLevel4Submitted(true)
    const score = level4Correct ? 100 : 0
    setLevelScores((s) => {
      const prev = s[4] ?? 0
      const avg = level4Index === 0 ? score : Math.round((prev + score) / 2)
      return { ...s, 4: avg }
    })
    setTotalScore((t) => t + score)
  }

  const goLevel4Next = () => {
    if (level4Index < LEVEL4_QUESTIONS.length - 1) {
      setLevel4Index((i) => i + 1)
      setLevel4Answer("")
      setLevel4Submitted(false)
    } else setCurrentLevel(5)
  }

  const q5 = LEVEL5_QUESTIONS[level5Index]
  const level5Correct = q5 && level5Answer === q5.correctAnswer
  const level5OptionsShuffled = useMemo(
    () => (q5 ? shuffleOptions(q5.options) : []),
    [level5Index]
  )

  const handleLevel5Submit = () => {
    if (!level5Answer) return
    setLevel5Submitted(true)
    const score = level5Correct ? 100 : 0
    setLevelScores((s) => {
      const prev = s[5] ?? 0
      const avg = level5Index === 0 ? score : Math.round((prev + score) / 2)
      return { ...s, 5: avg }
    })
    setTotalScore((t) => t + score)
  }

  const goLevel5Next = () => {
    if (level5Index < LEVEL5_QUESTIONS.length - 1) {
      setLevel5Index((i) => i + 1)
      setLevel5Answer("")
      setLevel5Submitted(false)
    } else setCurrentLevel(6)
  }

  return (
    <div className="rounded-2xl border-2 border-teal-200 bg-white p-4 sm:p-6" dir="rtl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-teal-900">مختبر سرعة التفاعلات</h2>
        <span className="text-sm font-semibold text-slate-500">
          المستوى {currentLevel} من 5
        </span>
        <div className="flex items-center gap-2">
          <span className="text-teal-600">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">
            {totalScore} نقطة
          </span>
        </div>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {earnedBadges.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {BADGES.filter((b) => earnedBadges.includes(b.id)).map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-800"
            >
              🏅 {b.name}
            </span>
          ))}
        </div>
      )}

      {/* المستوى 1 */}
      {currentLevel === 1 && q1 && (
        <section className="space-y-4">
          <h3 className="font-bold text-teal-900">المستوى 1: تعريف سرعة التفاعل وقياسها</h3>
          <p className="text-sm text-slate-600">{q1.question}</p>
          <div className="space-y-2">
            {level1OptionsShuffled.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={level1Submitted}
                onClick={() => setLevel1Answer(opt)}
                className={`block w-full rounded-xl border-2 p-3 text-right text-sm ${
                  level1Answer === opt ? "border-teal-500 bg-teal-50" : "border-slate-200"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {level1Submitted && (
            <div
              className={`rounded-xl border-2 p-3 text-sm ${
                level1Correct ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
              }`}
            >
              {level1Correct ? "✓ إجابة صحيحة." : "الإجابة الصحيحة: " + q1.correctAnswer}
              <p className="mt-2 text-slate-700">{q1.explanation}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            {level1Index > 0 && (
              <button
                type="button"
                onClick={() => {
                  setLevel1Index((i) => i - 1)
                  setLevel1Answer("")
                  setLevel1Submitted(false)
                }}
                className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← السابق
              </button>
            )}
            {!level1Submitted ? (
              <button
                type="button"
                disabled={!level1Answer}
                onClick={handleLevel1Submit}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <button
                type="button"
                onClick={goLevel1Next}
                className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                التالي ←
              </button>
            )}
          </div>
        </section>
      )}

      {/* المستوى 2 */}
      {currentLevel === 2 && (
        <section className="space-y-4">
          <h3 className="font-bold text-teal-900">المستوى 2: التفاعلات التلقائية وغير التلقائية</h3>
          <p className="text-sm text-slate-600">صنّفي كل تفاعل: تلقائي أو غير تلقائي.</p>
          <div className="space-y-3">
            {LEVEL2_ITEMS.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border-2 border-slate-200 p-3"
              >
                <p className="font-medium text-slate-900">{item.text}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={level2Submitted}
                    onClick={() => setLevel2Selected((s) => ({ ...s, [item.id]: "تلقائي" }))}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm ${
                      level2Selected[item.id] === "تلقائي"
                        ? "border-teal-500 bg-teal-100"
                        : "border-slate-200"
                    }`}
                  >
                    تلقائي
                  </button>
                  <button
                    type="button"
                    disabled={level2Submitted}
                    onClick={() => setLevel2Selected((s) => ({ ...s, [item.id]: "غير تلقائي" }))}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm ${
                      level2Selected[item.id] === "غير تلقائي"
                        ? "border-teal-500 bg-teal-100"
                        : "border-slate-200"
                    }`}
                  >
                    غير تلقائي
                  </button>
                </div>
                {level2Submitted && (
                  <p className="mt-2 text-xs text-slate-600">
                    {level2Selected[item.id] === item.type ? "✓ صحيح." : "الإجابة الصحيحة: " + item.type + ". "}
                    {item.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={() => setCurrentLevel(1)}
              className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← السابق
            </button>
            {!level2Submitted ? (
              <button
                type="button"
                onClick={handleLevel2Submit}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
              >
                تحقق
              </button>
            ) : (
              <button
                type="button"
                onClick={goLevel2Next}
                className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                التالي ←
              </button>
            )}
          </div>
        </section>
      )}

      {/* المستوى 3: العوامل المؤثرة – مطابقة */}
      {currentLevel === 3 && (
        <section className="space-y-4">
          <h3 className="font-bold text-teal-900">المستوى 3: العوامل المؤثرة في سرعة التفاعل</h3>
          <p className="text-sm text-slate-600">اختياري لكل عامل: انقري على عامل ثم على التأثير المناسب لربطهما.</p>
          <div className="space-y-3">
            {LEVEL3_FACTORS.map((f) => (
              <div key={f.id} className="rounded-xl border-2 border-slate-200 p-3">
                <p className="font-medium text-slate-900 mb-2">{f.factor}</p>
                <p className="text-xs text-slate-500 mb-2">اختيار التأثير:</p>
                <div className="flex flex-wrap gap-2">
                  {level3EffectTexts.map((eff) => (
                    <button
                      key={eff}
                      type="button"
                      disabled={level3Submitted}
                      onClick={() => setLevel3Matches((m) => ({ ...m, [f.id]: eff }))}
                      className={`rounded-lg border-2 px-3 py-1.5 text-xs text-right ${
                        level3Matches[f.id] === eff ? "border-teal-500 bg-teal-100" : "border-slate-200"
                      }`}
                    >
                      {eff.slice(0, 50)}{eff.length > 50 ? "…" : ""}
                    </button>
                  ))}
                </div>
                {level3Submitted && level3Matches[f.id] && (
                  <p className="mt-2 text-xs text-slate-600">
                    {level3Matches[f.id] === f.effect ? "✓ صحيح." : "الصحيح: " + f.effect}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={() => setCurrentLevel(2)}
              className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← السابق
            </button>
            {!level3Submitted ? (
              <button
                type="button"
                onClick={handleLevel3Submit}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
              >
                تحقق
              </button>
            ) : (
              <button
                type="button"
                onClick={goLevel3Next}
                className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                التالي ←
              </button>
            )}
          </div>
        </section>
      )}

      {/* المستوى 4 */}
      {currentLevel === 4 && q4 && (
        <section className="space-y-4">
          <h3 className="font-bold text-teal-900">المستوى 4: طاقة التنشيط</h3>
          <p className="text-sm text-slate-600">{q4.question}</p>
          <div className="space-y-2">
            {level4OptionsShuffled.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={level4Submitted}
                onClick={() => setLevel4Answer(opt)}
                className={`block w-full rounded-xl border-2 p-3 text-right text-sm ${
                  level4Answer === opt ? "border-teal-500 bg-teal-50" : "border-slate-200"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {level4Submitted && (
            <div
              className={`rounded-xl border-2 p-3 text-sm ${
                level4Correct ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
              }`}
            >
              {level4Correct ? "✓ إجابة صحيحة." : "الإجابة الصحيحة: " + q4.correctAnswer}
              <p className="mt-2 text-slate-700">{q4.explanation}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={() => setCurrentLevel(3)}
              className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← السابق
            </button>
            {!level4Submitted ? (
              <button
                type="button"
                disabled={!level4Answer}
                onClick={handleLevel4Submit}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <button
                type="button"
                onClick={goLevel4Next}
                className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                التالي ←
              </button>
            )}
          </div>
        </section>
      )}

      {/* المستوى 5 */}
      {currentLevel === 5 && q5 && (
        <section className="space-y-4">
          <h3 className="font-bold text-teal-900">المستوى 5: المحفزات والتمييز</h3>
          <p className="text-sm text-slate-600">{q5.question}</p>
          <div className="space-y-2">
            {level5OptionsShuffled.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={level5Submitted}
                onClick={() => setLevel5Answer(opt)}
                className={`block w-full rounded-xl border-2 p-3 text-right text-sm ${
                  level5Answer === opt ? "border-teal-500 bg-teal-50" : "border-slate-200"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {level5Submitted && (
            <div
              className={`rounded-xl border-2 p-3 text-sm ${
                level5Correct ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"
              }`}
            >
              {level5Correct ? "✓ إجابة صحيحة." : "الإجابة الصحيحة: " + q5.correctAnswer}
              <p className="mt-2 text-slate-700">{q5.explanation}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={() => setCurrentLevel(4)}
              className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← السابق
            </button>
            {!level5Submitted ? (
              <button
                type="button"
                disabled={!level5Answer}
                onClick={handleLevel5Submit}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <button
                type="button"
                onClick={goLevel5Next}
                className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
              >
                التالي ←
              </button>
            )}
          </div>
        </section>
      )}

      {/* شاشة النهاية */}
      {currentLevel === 6 && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6" dir="rtl">
          <p className="text-2xl font-bold text-emerald-800">🎉 انتهيت من مختبر سرعة التفاعلات!</p>
          <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4">
            <h4 className="font-bold text-slate-800 mb-2">ملخص الأداء</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              {[1, 2, 3, 4, 5].map((l) => (
                <li key={l}>المستوى {l}: {levelScores[l] ?? 0}%</li>
              ))}
            </ul>
            <p className="mt-2 font-semibold text-slate-800">النقاط الإجمالية: {totalScore}</p>
          </div>
        </div>
      )}
    </div>
  )
}
