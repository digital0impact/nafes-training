"use client"

/**
 * لعبة مختبر الصيغ الذكية – Smart Formula Lab
 * الهدف التعليمي: التمييز بين الأيون والجزيء والمركب، أمثلة صحيحة (Na⁺، Cl⁻، O₂، H₂O، CO₂)،
 * وفهم معنى الصيغة الكيميائية (نوع وعدد الذرات، الشحنة إن وُجدت).
 *
 * المستوى 1: مطابقة المصطلح (أيون، جزيء، مركب) مع التعريف + أمثلة
 * المستوى 2: تصنيف صيغ إلى أيون / جزيء / مركب (سحب أو اختيار)
 * المستوى 3: قراءة الصيغة (عدد الذرات، الشحنة)
 * المستوى 4: تحدي: اختيار الصيغة الصحيحة من الوصف
 */
import { useState, useEffect, useCallback } from "react"
import type { SmartFormulaLabGameData } from "@/types/games"

type EducationalGameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type SmartFormulaLabProps = {
  gameData: SmartFormulaLabGameData
  game: EducationalGameMeta
  onComplete: (result: { score: number; answers?: Record<string, unknown>; timeSpent: number }) => void
}

// ─── تعاريف المصطلحات ─────────────────────────────────────────────────────
const TERM_DEFINITIONS = [
  {
    id: "ion",
    term: "أيون",
    definition: "ذرة أو مجموعة ذرات تحمل شحنة كهربائية (موجبة أو سالبة) بسبب فقد أو كسب إلكترونات.",
    examples: "مثل Na⁺، Cl⁻، Mg²⁺",
  },
  {
    id: "molecule",
    term: "جزيء",
    definition: "أصغر وحدة من مادة نقية تحتفظ بخصائصها؛ تتكون من ذرتين أو أكثر مرتبطة بروابط تساهمية. قد يكون من عنصر واحد (مثل O₂) أو مركب (مثل H₂O).",
    examples: "مثل O₂، N₂، H₂O",
  },
  {
    id: "compound",
    term: "مركب",
    definition: "مادة نقية تتكون من عنصرين أو أكثر متحدين بنسب ثابتة. المركب له صيغة كيميائية تعبر عن نوع وعدد الذرات.",
    examples: "مثل H₂O، CO₂، NaCl",
  },
] as const

type Category = "ion" | "molecule" | "compound"

// صيغ للتصنيف في المستوى 2
const FORMULAS_TO_CLASSIFY: { id: string; formula: string; category: Category }[] = [
  { id: "f1", formula: "Na⁺", category: "ion" },
  { id: "f2", formula: "Cl⁻", category: "ion" },
  { id: "f3", formula: "Mg²⁺", category: "ion" },
  { id: "f4", formula: "O₂", category: "molecule" },
  { id: "f5", formula: "N₂", category: "molecule" },
  { id: "f6", formula: "H₂O", category: "compound" },
  { id: "f7", formula: "CO₂", category: "compound" },
  { id: "f8", formula: "NaCl", category: "compound" },
]

// أسئلة قراءة الصيغة (المستوى 3)
const FORMULA_QUESTIONS: {
  id: string
  formula: string
  name: string
  atoms: { symbol: string; count: number }[]
  hasCharge: boolean
  chargeDescription: string
}[] = [
  {
    id: "q1",
    formula: "H₂O",
    name: "الماء",
    atoms: [{ symbol: "H", count: 2 }, { symbol: "O", count: 1 }],
    hasCharge: false,
    chargeDescription: "محايد (لا شحنة)",
  },
  {
    id: "q2",
    formula: "CO₂",
    name: "ثاني أكسيد الكربون",
    atoms: [{ symbol: "C", count: 1 }, { symbol: "O", count: 2 }],
    hasCharge: false,
    chargeDescription: "محايد (لا شحنة)",
  },
  {
    id: "q3",
    formula: "Na⁺",
    name: "أيون الصوديوم",
    atoms: [{ symbol: "Na", count: 1 }],
    hasCharge: true,
    chargeDescription: "شحنة موجبة واحدة (+1)",
  },
  {
    id: "q4",
    formula: "CaCl₂",
    name: "كلوريد الكالسيوم",
    atoms: [{ symbol: "Ca", count: 1 }, { symbol: "Cl", count: 2 }],
    hasCharge: false,
    chargeDescription: "محايد (مركب أيوني متعادل)",
  },
]

// تحدي المستوى 4: وصف → اختيار الصيغة الصحيحة
const FORMULA_CHALLENGES: {
  id: string
  description: string
  correctFormula: string
  options: string[]
}[] = [
  {
    id: "c1",
    description: "جزيء يتكون من ذرتي هيدروجين وذرة أكسجين واحدة",
    correctFormula: "H₂O",
    options: ["H₂O", "H₂O₂", "O₂", "HO"],
  },
  {
    id: "c2",
    description: "أيون الصوديوم (ذرة صوديوم فقدت إلكتروناً واحداً)",
    correctFormula: "Na⁺",
    options: ["Na⁺", "Na⁻", "Na", "Na²⁺"],
  },
  {
    id: "c3",
    description: "جزيء غاز يتكون من ذرتي أكسجين",
    correctFormula: "O₂",
    options: ["O", "O₂", "O₃", "O₂⁻"],
  },
  {
    id: "c4",
    description: "مركب من ذرة كربون وذرتي أكسجين",
    correctFormula: "CO₂",
    options: ["CO", "CO₂", "C₂O", "CO₃"],
  },
]

const CATEGORY_LABELS: Record<Category, string> = {
  ion: "أيون",
  molecule: "جزيء",
  compound: "مركب",
}

const CATEGORY_COLORS: Record<Category, string> = {
  ion: "bg-amber-100 border-amber-300 text-amber-900",
  molecule: "bg-blue-100 border-blue-300 text-blue-900",
  compound: "bg-emerald-100 border-emerald-300 text-emerald-900",
}

export default function SmartFormulaLab({ gameData, game, onComplete }: SmartFormulaLabProps) {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [startTime] = useState(Date.now())
  const [totalScore, setTotalScore] = useState(0)
  const [levelScores, setLevelScores] = useState<Record<number, number>>({})

  // المستوى 1: مطابقة مصطلح → تعريف (اختيار تعريف لكل مصطلح)
  const [level1Matches, setLevel1Matches] = useState<Record<string, string>>({}) // termId -> definitionId
  const [level1Submitted, setLevel1Submitted] = useState(false)
  const [level1SelectedTerm, setLevel1SelectedTerm] = useState<string | null>(null)

  // المستوى 2: تصنيف الصيغ (كل صيغة → أيون / جزيء / مركب)
  const [level2Classifications, setLevel2Classifications] = useState<Record<string, Category | "">>({})
  const [level2Submitted, setLevel2Submitted] = useState(false)

  // المستوى 3: أسئلة قراءة الصيغة (عدد ذرات، شحنة)
  const [level3QuestionIndex, setLevel3QuestionIndex] = useState(0)
  const [level3Answers, setLevel3Answers] = useState<Record<string, { atomCounts?: Record<string, number>; userCharged?: boolean }>>({})
  const [level3Submitted, setLevel3Submitted] = useState(false)

  // المستوى 4: تحدي اختيار الصيغة
  const [level4ChallengeIndex, setLevel4ChallengeIndex] = useState(0)
  const [level4Selected, setLevel4Selected] = useState<string | null>(null)
  const [level4Submitted, setLevel4Submitted] = useState(false)

  const finishGame = useCallback(() => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const avg =
      Object.keys(levelScores).length > 0
        ? Math.round(
            Object.values(levelScores).reduce((a, b) => a + b, 0) / Object.keys(levelScores).length
          )
        : totalScore
    const finalScore = avg > 0 ? avg : totalScore
    onComplete({
      score: finalScore,
      answers: {
        level1Matches,
        level2Classifications,
        level3Answers,
        level4: level4Selected,
      },
      timeSpent,
    })
  }, [startTime, levelScores, totalScore, onComplete, level1Matches, level2Classifications, level3Answers, level4Selected])

  useEffect(() => {
    if (currentLevel === 5) finishGame()
  }, [currentLevel, finishGame])

  // ─── المستوى 1: مطابقة المصطلحات ─────────────────────────────────────────
  const definitionsShuffled = [...TERM_DEFINITIONS].sort(() => Math.random() - 0.5)
  const level1AllMatched = TERM_DEFINITIONS.every(
    (t) => level1Matches[t.id] && definitionsShuffled.find((d) => d.id === level1Matches[t.id])?.id === t.id
  )
  const level1Correct = TERM_DEFINITIONS.every((t) => level1Matches[t.id] === t.id)
  const level1Score = level1Correct ? 100 : level1AllMatched ? 50 : 0

  const handleLevel1SelectDefinition = (defId: string) => {
    if (level1Submitted) return
    if (level1SelectedTerm) {
      setLevel1Matches((m) => ({ ...m, [level1SelectedTerm!]: defId }))
      setLevel1SelectedTerm(null)
    }
  }

  const handleLevel1Submit = () => {
    const filled = TERM_DEFINITIONS.every((t) => level1Matches[t.id])
    if (!filled) return
    setLevel1Submitted(true)
    setLevelScores((s) => ({ ...s, 1: level1Score }))
    setTotalScore((t) => t + level1Score)
  }

  const goLevel1Next = () => {
    setCurrentLevel(2)
  }

  // ─── المستوى 2: تصنيف الصيغ ─────────────────────────────────────────────
  const level2Filled = FORMULAS_TO_CLASSIFY.every((f) => level2Classifications[f.id] !== "")
  const level2CorrectCount = FORMULAS_TO_CLASSIFY.filter(
    (f) => level2Classifications[f.id] === f.category
  ).length
  const level2Score = level2Filled
    ? Math.round((level2CorrectCount / FORMULAS_TO_CLASSIFY.length) * 100)
    : 0

  const handleLevel2SetCategory = (formulaId: string, category: Category) => {
    if (level2Submitted) return
    setLevel2Classifications((c) => ({ ...c, [formulaId]: category }))
  }

  const handleLevel2Submit = () => {
    if (!level2Filled) return
    setLevel2Submitted(true)
    setLevelScores((s) => ({ ...s, 2: level2Score }))
    setTotalScore((t) => t + level2Score)
  }

  const goLevel2Next = () => {
    setCurrentLevel(3)
  }

  // ─── المستوى 3: قراءة الصيغة ────────────────────────────────────────────
  const q = FORMULA_QUESTIONS[level3QuestionIndex]
  const level3CurrentAnswer = level3Answers[q?.id] ?? {}
  const atomCounts = level3CurrentAnswer.atomCounts ?? {}
  const level3CanSubmit =
    q &&
    q.atoms.every((a) => typeof atomCounts[a.symbol] === "number") &&
    typeof level3CurrentAnswer.userCharged === "boolean"

  const level3IsCorrect =
    q &&
    q.atoms.every((a) => atomCounts[a.symbol] === a.count) &&
    level3CurrentAnswer.userCharged === q.hasCharge

  const handleLevel3Submit = () => {
    if (!q || !level3CanSubmit) return
    setLevel3Submitted(true)
    const score = level3IsCorrect ? 100 : 50
    setLevelScores((s) => ({ ...s, 3: score }))
    setTotalScore((t) => t + score)
  }

  const goLevel3Next = () => {
    if (level3QuestionIndex < FORMULA_QUESTIONS.length - 1) {
      setLevel3QuestionIndex((i) => i + 1)
      setLevel3Submitted(false)
    } else {
      setCurrentLevel(4)
    }
  }

  // ─── المستوى 4: تحدي الصيغة ─────────────────────────────────────────────
  const challenge = FORMULA_CHALLENGES[level4ChallengeIndex]
  const level4Correct = level4Selected === challenge?.correctFormula

  const handleLevel4Submit = () => {
    if (!level4Selected) return
    setLevel4Submitted(true)
    const score = level4Correct ? 100 : 0
    setLevelScores((s) => ({ ...s, 4: score }))
    setTotalScore((t) => t + score)
  }

  const goLevel4Next = () => {
    if (level4ChallengeIndex < FORMULA_CHALLENGES.length - 1) {
      setLevel4ChallengeIndex((i) => i + 1)
      setLevel4Selected(null)
      setLevel4Submitted(false)
    } else {
      setCurrentLevel(5)
    }
  }

  const progressPercent = (currentLevel / 5) * 100

  return (
    <div className="rounded-2xl border-2 border-teal-200 bg-white p-4 sm:p-6" dir="rtl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-teal-900">مختبر الصيغ الذكية</h2>
        <span className="text-sm font-semibold text-slate-500">
          المستوى {currentLevel} من 4
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-teal-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* المستوى 1: التمييز بين أيون، جزيء، مركب + مطابقة التعريف */}
      {currentLevel === 1 && (
        <section className="space-y-4">
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
            <h3 className="font-bold text-teal-900 mb-2">ما الفرق بين الأيون والجزيء والمركب؟</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>الأيون</strong> يحمل شحنة (مثل Na⁺، Cl⁻). <strong>الجزيء</strong> وحدة مكونة من ذرتين أو أكثر
              مرتبطة تساهمياً (مثل O₂، H₂O). <strong>المركب</strong> مادة من عنصرين أو أكثر بنسب ثابتة (مثل H₂O، CO₂).
              الصيغة الكيميائية تعبّر عن <strong>نوع وعدد الذرات</strong>، وإذا وُجدت <strong>شحنة</strong> تكتب أعلى اليمين.
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-700">ربطي كل مصطلح بالتعريف المناسب:</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {TERM_DEFINITIONS.map((t) => (
              <div
                key={t.id}
                onClick={() => !level1Submitted && setLevel1SelectedTerm(level1SelectedTerm === t.id ? null : t.id)}
                className={`rounded-xl border-2 p-3 text-sm font-medium transition ${
                  level1SelectedTerm === t.id ? "border-teal-500 bg-teal-100" : "border-slate-200 bg-white"
                } ${level1Matches[t.id] ? "ring-2 ring-teal-300" : ""}`}
              >
                <span className="font-bold text-teal-800">{t.term}</span>
                {level1Matches[t.id] && (
                  <span className="block mt-1 text-xs text-slate-600">
                    ← {TERM_DEFINITIONS.find((d) => d.id === level1Matches[t.id])?.definition.slice(0, 40)}...
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">انقري على المصطلح ثم على التعريف المناسب.</p>
          <p className="text-xs text-slate-500 mb-1">التعريفات (انقري على المصطلح أعلاه ثم على التعريف المناسب):</p>
          <div className="flex flex-wrap gap-2">
            {definitionsShuffled.map((d) => (
              <button
                key={d.id}
                type="button"
                disabled={level1Submitted || Object.values(level1Matches).includes(d.id)}
                onClick={() => handleLevel1SelectDefinition(d.id)}
                className={`rounded-lg border-2 px-3 py-2 text-right text-xs ${
                  level1SelectedTerm ? "border-teal-400 bg-teal-50" : "border-slate-200"
                } disabled:opacity-50`}
              >
                {d.definition.slice(0, 60)}{d.definition.length > 60 ? "…" : ""}
              </button>
            ))}
          </div>
          {level1Submitted && (
            <p className={level1Correct ? "text-emerald-700 font-medium" : "text-amber-700"}>
              {level1Correct ? "✓ جميع المطابقات صحيحة!" : "راجعي التعريفات."}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
            {!level1Submitted ? (
              <button
                type="button"
                disabled={!TERM_DEFINITIONS.every((t) => level1Matches[t.id])}
                onClick={handleLevel1Submit}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goLevel1Next}
                  className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                >
                  التالي ←
                </button>
                <span className="text-xs text-slate-500">انتقال إلى المستوى 2: تصنيف الصيغ</span>
              </>
            )}
          </div>
        </section>
      )}

      {/* المستوى 2: تصنيف الصيغ إلى أيون / جزيء / مركب */}
      {currentLevel === 2 && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">
            صنّفي كل صيغة: هل هي <strong>أيون</strong> (يحمل شحنة)، أو <strong>جزيء</strong> (عنصر ثنائي الذرة أو أكثر)، أو <strong>مركب</strong>؟
          </p>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {FORMULAS_TO_CLASSIFY.map((f) => (
              <div
                key={f.id}
                className={`rounded-xl border-2 p-3 ${
                  level2Classifications[f.id]
                    ? level2Submitted
                      ? level2Classifications[f.id] === f.category
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-rose-400 bg-rose-50"
                    : "border-teal-200 bg-teal-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-center text-lg font-bold text-slate-800 mb-2">{f.formula}</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {(["ion", "molecule", "compound"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      disabled={level2Submitted}
                      onClick={() => handleLevel2SetCategory(f.id, cat)}
                      className={`rounded-lg border px-2 py-1 text-xs font-medium ${
                        level2Classifications[f.id] === cat
                          ? CATEGORY_COLORS[cat]
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      } disabled:opacity-50`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {level2Submitted && (
            <p className="text-sm">
              صحيح: {level2CorrectCount} من {FORMULAS_TO_CLASSIFY.length}. النسبة: {level2Score}%
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
            {!level2Submitted ? (
              <button
                type="button"
                disabled={!level2Filled}
                onClick={handleLevel2Submit}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goLevel2Next}
                  className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                >
                  التالي ←
                </button>
                <span className="text-xs text-slate-500">انتقال إلى المستوى 3: قراءة الصيغة</span>
              </>
            )}
          </div>
        </section>
      )}

      {/* المستوى 3: قراءة الصيغة — عدد الذرات والشحنة */}
      {currentLevel === 3 && q && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">
            الصيغة الكيميائية تخبرنا <strong>بنوع وعدد الذرات</strong> في الجزيء أو الأيون، و<strong>الشحنة</strong> إن وُجدت.
          </p>
          <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{q.formula}</p>
            <p className="text-sm text-slate-600">{q.name}</p>
          </div>
          <div className="space-y-3">
            {q.atoms.map((a) => (
              <div key={a.symbol} className="flex items-center justify-between rounded-lg border border-slate-200 p-2">
                <span className="font-semibold text-slate-700">كم ذرة {a.symbol}؟</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={atomCounts[a.symbol] ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value
                    const v = raw === "" ? undefined : parseInt(raw, 10)
                    const num = typeof v === "number" && !isNaN(v) ? v : undefined
                    setLevel3Answers((prev) => {
                      const prevEntry = prev[q.id]
                      const prevCounts = prevEntry?.atomCounts ?? {}
                      const nextCounts: Record<string, number> = { ...prevCounts }
                      if (num !== undefined) nextCounts[a.symbol] = num
                      else delete nextCounts[a.symbol]
                      return {
                        ...prev,
                        [q.id]: { ...prevEntry, atomCounts: nextCounts },
                      }
                    })
                  }}
                  disabled={level3Submitted}
                  className="w-20 rounded-lg border-2 border-slate-200 px-2 py-1 text-center"
                />
              </div>
            ))}
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="font-semibold text-slate-700 mb-2">هل لهذه الصيغة شحنة كهربائية؟</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={level3Submitted}
                  onClick={() =>
                    setLevel3Answers((prev) => ({
                      ...prev,
                      [q.id]: { ...prev[q.id], userCharged: false },
                    }))
                  }
                  className={`rounded-lg border-2 px-4 py-2 text-sm ${
                    level3CurrentAnswer.userCharged === false
                      ? "border-teal-500 bg-teal-100"
                      : "border-slate-200"
                  }`}
                >
                  لا (محايد)
                </button>
                <button
                  type="button"
                  disabled={level3Submitted}
                  onClick={() =>
                    setLevel3Answers((prev) => ({
                      ...prev,
                      [q.id]: { ...prev[q.id], userCharged: true },
                    }))
                  }
                  className={`rounded-lg border-2 px-4 py-2 text-sm ${
                    level3CurrentAnswer.userCharged === true
                      ? "border-teal-500 bg-teal-100"
                      : "border-slate-200"
                  }`}
                >
                  نعم (مشحون)
                </button>
              </div>
            </div>
          </div>
          {level3Submitted && (
            <p className="text-sm text-slate-600">
              {q.chargeDescription}. عدد الذرات: {q.atoms.map((a) => `${a.symbol}=${a.count}`).join(", ")}.
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
            {!level3Submitted ? (
              <button
                type="button"
                disabled={!level3CanSubmit}
                onClick={handleLevel3Submit}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goLevel3Next}
                  className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                >
                  التالي ←
                </button>
                <span className="text-xs text-slate-500">
                  {level3QuestionIndex < FORMULA_QUESTIONS.length - 1
                    ? "السؤال التالي"
                    : "انتقال إلى المستوى 4: تحدي الصيغة"}
                </span>
              </>
            )}
          </div>
        </section>
      )}

      {/* المستوى 4: تحدي — اختيار الصيغة الصحيحة من الوصف */}
      {currentLevel === 4 && challenge && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">
            اختاري الصيغة الكيميائية التي تناسب الوصف.
          </p>
          <div className="rounded-xl border-2 border-teal-200 bg-teal-50 p-4">
            <p className="font-bold text-teal-900">{challenge.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {challenge.options.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={level4Submitted}
                onClick={() => setLevel4Selected(opt)}
                className={`rounded-xl border-2 p-3 text-lg font-bold transition ${
                  level4Selected === opt
                    ? level4Submitted
                      ? opt === challenge.correctFormula
                        ? "border-emerald-500 bg-emerald-100"
                        : "border-rose-400 bg-rose-100"
                      : "border-teal-500 bg-teal-100"
                    : "border-slate-200 bg-white hover:border-teal-300"
                } disabled:opacity-50`}
              >
                {opt}
              </button>
            ))}
          </div>
          {level4Submitted && (
            <p className={level4Correct ? "text-emerald-700 font-medium" : "text-amber-700"}>
              {level4Correct ? "✓ صحيح! الصيغة تعبّر عن نوع وعدد الذرات (والشحنة إن وُجدت)." : `الصيغة الصحيحة: ${challenge.correctFormula}`}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
            {!level4Submitted ? (
              <button
                type="button"
                disabled={!level4Selected}
                onClick={handleLevel4Submit}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goLevel4Next}
                  className="rounded-xl border-2 border-teal-500 bg-white px-5 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                >
                  التالي ←
                </button>
                <span className="text-xs text-slate-500">
                  {level4ChallengeIndex < FORMULA_CHALLENGES.length - 1
                    ? "التحدي التالي"
                    : "إنهاء اللعبة وعرض النتيجة"}
                </span>
              </>
            )}
          </div>
        </section>
      )}

      {currentLevel === 5 && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-2xl font-bold text-emerald-800">🎉 انتهيت من مختبر الصيغ الذكية!</p>
          <p className="mt-2 text-emerald-700">ستظهر نتيجتك في شاشة النتائج.</p>
        </div>
      )}
    </div>
  )
}
