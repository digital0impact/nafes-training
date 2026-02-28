"use client"

/**
 * لعبة مختبر التفاعلات والطاقة – Chemical Reactions & Energy Lab
 * أهداف تعليمية: تفسير بيانات قبل/بعد التفاعل، أدلة التفاعل، معادلات كيميائية متزنة،
 * حفظ الكتلة، الطاقة الممتصة/المطلقة، تفاعلات طاردة وماصة للحرارة، تمثيل الطاقة في المعادلة.
 *
 * المستوى 1: هل سيحدث التفاعل؟ (بيانات + نعم/لا + سبب)
 * المستوى 2: أدلة التفاعل (اختيار المؤشرات الصحيحة)
 * المستوى 3: موازنة المعادلة (حفظ الكتلة)
 * المستوى 4: تغيّر الطاقة (طارد/ماص)
 * المستوى 5: وضع الطاقة في المعادلة
 */
import { useState, useCallback, useEffect, useMemo } from "react"
import type { ChemicalReactionsEnergyLabGameData } from "@/types/games"

/** خلط عناصر المصفوفة عشوائياً */
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

type ChemicalReactionsEnergyLabProps = {
  gameData: ChemicalReactionsEnergyLabGameData
  game: EducationalGameMeta
  onComplete: (result: { score: number; answers?: Record<string, unknown>; timeSpent: number }) => void
}

// ─── بيانات المستوى 1: هل سيحدث التفاعل؟ ─────────────────────────────────
type Level1Scenario = {
  id: string
  substance1: { state: string; color: string; temp: string; concentration: string }
  substance2: { state: string; color: string; temp: string; concentration: string }
  willOccur: boolean
  reasonCorrect: string
  reasonOptions: string[]
  explanation: string
}

const LEVEL1_SCENARIOS: Level1Scenario[] = [
  {
    id: "l1-1",
    substance1: { state: "سائل", color: "عديم اللون", temp: "25°م", concentration: "0.1 M" },
    substance2: { state: "سائل", color: "عديم اللون", temp: "25°م", concentration: "0.1 M" },
    willOccur: true,
    reasonCorrect: "المادتان قابلتان للتفاعل والظروف مناسبة (تركيز ودرجة حرارة كافيان)",
    reasonOptions: [
      "المادتان قابلتان للتفاعل والظروف مناسبة (تركيز ودرجة حرارة كافيان)",
      "لأن المادتين سائلتان فقط",
      "لأن درجة الحرارة مرتفعة",
    ],
    explanation: "عند خلط محلولين قابلين للتفاعل بتركيز ودرجة حرارة مناسبتين، يحدث التفاعل الكيميائي.",
  },
  {
    id: "l1-2",
    substance1: { state: "صلب", color: "أبيض", temp: "25°م", concentration: "—" },
    substance2: { state: "سائل", color: "عديم اللون", temp: "25°م", concentration: "مخفّف جداً" },
    willOccur: false,
    reasonCorrect: "التركيز منخفض جداً فلا يحدث تفاعل ملحوظ في الظروف العادية",
    reasonOptions: [
      "التركيز منخفض جداً فلا يحدث تفاعل ملحوظ في الظروف العادية",
      "لأن إحدى المادتين صلبة",
      "لأن اللون لا يتغير",
    ],
    explanation: "التركيز المنخفض جداً يقلل احتمال التصادمات الفعالة بين الجزيئات، فلا يلاحظ تفاعل.",
  },
]

// ─── بيانات المستوى 2: أدلة التفاعل ─────────────────────────────────────
type Level2Scenario = {
  id: string
  reactionName: string
  description: string
  correctEvidence: ("color" | "gas" | "precipitate" | "temperature")[]
  explanations: Record<string, string>
}

const LEVEL2_SCENARIOS: Level2Scenario[] = [
  {
    id: "l2-1",
    reactionName: "تفاعل حمض مع كربونات",
    description: "إضافة حمض الهيدروكلوريك إلى كربونات الصوديوم",
    correctEvidence: ["gas", "temperature"],
    explanations: {
      color: "لا يلاحظ تغيّر لون واضح في هذا التفاعل.",
      gas: "صحيح! ينتج غاز ثاني أكسيد الكربون (فقاعات).",
      precipitate: "لا يتكوّن راسب في هذا التفاعل.",
      temperature: "صحيح! قد ترتفع أو تنخفض درجة الحرارة قليلاً حسب الظروف.",
    },
  },
  {
    id: "l2-2",
    reactionName: "ترسيب كلوريد الفضة",
    description: "خلط نترات الفضة مع كلوريد الصوديوم",
    correctEvidence: ["precipitate", "color"],
    explanations: {
      color: "صحيح! يظهر راسب أبيض فيتعكر المحلول.",
      gas: "لا ينتج غاز في هذا التفاعل.",
      precipitate: "صحيح! يتكوّن راسب أبيض من كلوريد الفضة.",
      temperature: "التغيّر في درجة الحرارة ضئيل جداً.",
    },
  },
]

// ─── بيانات المستوى 3: موازنة المعادلة ───────────────────────────────────
type Level3Equation = {
  id: string
  wordEquation: string
  unbalanced: string
  correctCoefficients: number[]
  reactantFormulas: string[]
  productFormulas: string[]
}

function parseFormula(formula: string): Record<string, number> {
  const count: Record<string, number> = {}
  const regex = /([A-Z][a-z]?)(\d*)/g
  let m
  while ((m = regex.exec(formula)) !== null) {
    const sym = m[1]
    const num = m[2] ? parseInt(m[2], 10) : 1
    count[sym] = (count[sym] || 0) + num
  }
  return count
}

function countAtomsInSide(formulas: string[], coeffs: number[]): Record<string, number> {
  const total: Record<string, number> = {}
  formulas.forEach((formula, i) => {
    const c = coeffs[i] || 1
    const atoms = parseFormula(formula)
    Object.entries(atoms).forEach(([sym, n]) => {
      total[sym] = (total[sym] || 0) + n * c
    })
  })
  return total
}

function atomsEqual(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const k of keys) {
    if ((a[k] || 0) !== (b[k] || 0)) return false
  }
  return true
}

const LEVEL3_EQUATIONS: Level3Equation[] = [
  {
    id: "l3-1",
    wordEquation: "هيدروجين + أكسجين ← ماء",
    unbalanced: "H₂ + O₂ → H₂O",
    correctCoefficients: [2, 1, 2],
    reactantFormulas: ["H2", "O2"],
    productFormulas: ["H2O"],
  },
  {
    id: "l3-2",
    wordEquation: "ميثان + أكسجين ← ثاني أكسيد كربون + ماء",
    unbalanced: "CH₄ + O₂ → CO₂ + H₂O",
    correctCoefficients: [1, 2, 1, 2],
    reactantFormulas: ["CH4", "O2"],
    productFormulas: ["CO2", "H2O"],
  },
]

// ─── بيانات المستوى 4: تغيّر الطاقة ──────────────────────────────────────
type Level4Scenario = {
  id: string
  reactionName: string
  tempBefore: number
  tempAfter: number
  isExothermic: boolean
  explanation: string
}

const LEVEL4_SCENARIOS: Level4Scenario[] = [
  {
    id: "l4-1",
    reactionName: "احتراق المغنيسيوم",
    tempBefore: 25,
    tempAfter: 42,
    isExothermic: true,
    explanation: "ارتفعت درجة الحرارة؛ الطاقة انطلقت من التفاعل إلى الوسط (تفاعل طارد للحرارة).",
  },
  {
    id: "l4-2",
    reactionName: "تفكك كربونات الصوديوم الهيدروجينية (بيكربونات) بالحرارة",
    tempBefore: 22,
    tempAfter: 18,
    isExothermic: false,
    explanation: "انخفضت درجة الحرارة؛ التفاعل امتص طاقة من الوسط (تفاعل ماص للحرارة).",
  },
]

// ─── بيانات المستوى 5: وضع الطاقة في المعادلة ─────────────────────────────
type Level5Scenario = {
  id: string
  equationWithoutEnergy: string
  isExothermic: boolean
  correctSide: "reactants" | "products"
  explanation: string
}

const LEVEL5_SCENARIOS: Level5Scenario[] = [
  {
    id: "l5-1",
    equationWithoutEnergy: "2 H₂ + O₂ → 2 H₂O",
    isExothermic: true,
    correctSide: "products",
    explanation: "في التفاعل الطارد للحرارة تُكتب الطاقة مع النواتج (الطاقة تنطلق).",
  },
  {
    id: "l5-2",
    equationWithoutEnergy: "N₂ + O₂ → 2 NO",
    isExothermic: false,
    correctSide: "reactants",
    explanation: "في التفاعل الماص للحرارة تُكتب الطاقة مع المتفاعلات (الطاقة تُمتص).",
  },
]

// ─── الشارات ─────────────────────────────────────────────────────────────
const BADGES = [
  { id: "analyst", name: "محلل التفاعلات", nameEn: "Reaction Analyst", minLevel: 1 },
  { id: "conservation", name: "خبير حفظ الكتلة", nameEn: "Conservation of Mass Expert", minLevel: 3 },
  { id: "energy", name: "عالم الطاقة", nameEn: "Energy Scientist", minLevel: 5 },
]

const STARS_PER_LEVEL = 20
const TOTAL_POINTS = 100

export default function ChemicalReactionsEnergyLab({
  gameData,
  game,
  onComplete,
}: ChemicalReactionsEnergyLabProps) {
  const [startTime] = useState(Date.now())
  const [currentLevel, setCurrentLevel] = useState(1)
  const [totalScore, setTotalScore] = useState(0)
  const [levelScores, setLevelScores] = useState<Record<number, number>>({})
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])

  // المستوى 1
  const [level1Index, setLevel1Index] = useState(0)
  const [level1Occur, setLevel1Occur] = useState<boolean | null>(null)
  const [level1Reason, setLevel1Reason] = useState("")
  const [level1Submitted, setLevel1Submitted] = useState(false)

  // المستوى 2
  const [level2Index, setLevel2Index] = useState(0)
  const [level2Selected, setLevel2Selected] = useState<Set<string>>(new Set())
  const [level2Submitted, setLevel2Submitted] = useState(false)

  // المستوى 3
  const [level3Index, setLevel3Index] = useState(0)
  const [level3Coeffs, setLevel3Coeffs] = useState<number[]>([1, 1, 1])
  const [level3Submitted, setLevel3Submitted] = useState(false)

  // المستوى 4
  const [level4Index, setLevel4Index] = useState(0)
  const [level4Choice, setLevel4Choice] = useState<"exothermic" | "endothermic" | null>(null)
  const [level4Submitted, setLevel4Submitted] = useState(false)

  // المستوى 5
  const [level5Index, setLevel5Index] = useState(0)
  const [level5Side, setLevel5Side] = useState<"reactants" | "products" | null>(null)
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
    onComplete({
      score: finalScore,
      answers: { levelScores, earnedBadges },
      timeSpent,
    })
  }, [startTime, levelScores, totalScore, onComplete, earnedBadges])

  useEffect(() => {
    if (currentLevel === 6) finishGame()
  }, [currentLevel, finishGame])

  useEffect(() => {
    const badges: string[] = []
    if (currentLevel >= 1) badges.push("analyst")
    if (currentLevel >= 3 && (levelScores[3] ?? 0) >= 60) badges.push("conservation")
    if (currentLevel >= 5) badges.push("energy")
    setEarnedBadges(badges)
  }, [currentLevel, levelScores])

  const progressPercent = (currentLevel / 6) * 100
  const stars = Math.min(5, Math.floor((totalScore / 100) * 5) + (currentLevel >= 5 ? 1 : 0))

  // ─── المستوى 1: هل سيحدث التفاعل؟ ──────────────────────────────────────
  const scenario1 = LEVEL1_SCENARIOS[level1Index]
  const level1Correct =
    scenario1 &&
    level1Occur === scenario1.willOccur &&
    (level1Reason === scenario1.reasonCorrect || !scenario1.reasonOptions.length)

  const handleLevel1Submit = () => {
    if (level1Occur === null) return
    const correct = level1Correct
    setLevel1Submitted(true)
    const score = correct ? 100 : level1Occur === scenario1?.willOccur ? 50 : 0
    setLevelScores((s) => ({ ...s, 1: score }))
    setTotalScore((t) => t + score)
  }

  const goLevel1Next = () => {
    if (level1Index < LEVEL1_SCENARIOS.length - 1) {
      setLevel1Index((i) => i + 1)
      setLevel1Occur(null)
      setLevel1Reason("")
      setLevel1Submitted(false)
    } else {
      setCurrentLevel(2)
    }
  }

  // ─── المستوى 2: أدلة التفاعل ───────────────────────────────────────────
  const scenario2 = LEVEL2_SCENARIOS[level2Index]
  const level2CorrectSet = new Set(scenario2?.correctEvidence ?? [])
  const level2Correct =
    scenario2 &&
    level2CorrectSet.size === level2Selected.size &&
    [...level2Selected].every((e) => level2CorrectSet.has(e as any))

  const toggleLevel2Evidence = (key: string) => {
    if (level2Submitted) return
    setLevel2Selected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleLevel2Submit = () => {
    if (!scenario2) return
    setLevel2Submitted(true)
    const correctCount = [...level2Selected].filter((e) => level2CorrectSet.has(e as any)).length
    const wrongCount = [...level2Selected].filter((e) => !level2CorrectSet.has(e as any)).length
    const score = level2Correct ? 100 : Math.max(0, (correctCount - wrongCount) * 25)
    setLevelScores((s) => ({ ...s, 2: score }))
    setTotalScore((t) => t + score)
  }

  const goLevel2Next = () => {
    if (level2Index < LEVEL2_SCENARIOS.length - 1) {
      setLevel2Index((i) => i + 1)
      setLevel2Selected(new Set())
      setLevel2Submitted(false)
    } else {
      setCurrentLevel(3)
    }
  }

  // ─── المستوى 3: موازنة المعادلة ─────────────────────────────────────────
  const eq3 = LEVEL3_EQUATIONS[level3Index]
  const reactantCoeffs = eq3
    ? [level3Coeffs[0] || 1, level3Coeffs[1] || 1]
    : [1, 1]
  const productCoeffs = eq3
    ? eq3.productFormulas.length === 1
      ? [level3Coeffs[2] || 1]
      : [level3Coeffs[2] || 1, level3Coeffs[3] ?? 1]
    : [1]
  const allCoeffs = eq3
    ? [...reactantCoeffs, ...productCoeffs]
    : []
  const atomsLeft = eq3 ? countAtomsInSide(eq3.reactantFormulas, reactantCoeffs) : {}
  const atomsRight = eq3 ? countAtomsInSide(eq3.productFormulas, productCoeffs) : {}
  const level3Balanced = eq3 && atomsEqual(atomsLeft, atomsRight)

  const handleLevel3Submit = () => {
    if (!eq3) return
    setLevel3Submitted(true)
    const score = level3Balanced ? 100 : 0
    setLevelScores((s) => ({ ...s, 3: score }))
    setTotalScore((t) => t + score)
  }

  const goLevel3Next = () => {
    if (level3Index < LEVEL3_EQUATIONS.length - 1) {
      setLevel3Index((i) => i + 1)
      const nextEq = LEVEL3_EQUATIONS[level3Index + 1]
      setLevel3Coeffs(nextEq?.correctCoefficients.map(() => 1) ?? [1, 1, 1])
      setLevel3Submitted(false)
    } else {
      setCurrentLevel(4)
    }
  }

  // ─── المستوى 4: تغيّر الطاقة ────────────────────────────────────────────
  const scenario4 = LEVEL4_SCENARIOS[level4Index]
  const level4Correct = scenario4 && level4Choice === (scenario4.isExothermic ? "exothermic" : "endothermic")

  const handleLevel4Submit = () => {
    if (!level4Choice) return
    setLevel4Submitted(true)
    const score = level4Correct ? 100 : 0
    setLevelScores((s) => ({ ...s, 4: score }))
    setTotalScore((t) => t + score)
  }

  const goLevel4Next = () => {
    if (level4Index < LEVEL4_SCENARIOS.length - 1) {
      setLevel4Index((i) => i + 1)
      setLevel4Choice(null)
      setLevel4Submitted(false)
    } else {
      setCurrentLevel(5)
    }
  }

  // ─── المستوى 5: وضع الطاقة في المعادلة ──────────────────────────────────
  const scenario5 = LEVEL5_SCENARIOS[level5Index]
  const level5Correct = scenario5 && level5Side === scenario5.correctSide

  const handleLevel5Submit = () => {
    if (!level5Side) return
    setLevel5Submitted(true)
    const score = level5Correct ? 100 : 0
    setLevelScores((s) => ({ ...s, 5: score }))
    setTotalScore((t) => t + score)
  }

  const goLevel5Next = () => {
    if (level5Index < LEVEL5_SCENARIOS.length - 1) {
      setLevel5Index((i) => i + 1)
      setLevel5Side(null)
      setLevel5Submitted(false)
    } else {
      setCurrentLevel(6)
    }
  }

  const EVIDENCE_LABELS: { [key: string]: string } = {
    color: "تغيّر اللون",
    gas: "تصاعد غاز (فقاعات)",
    precipitate: "تكوّن راسب",
    temperature: "تغيّر درجة الحرارة",
  }

  const level1ReasonOptionsShuffled = useMemo(
    () => (scenario1 ? shuffleOptions(scenario1.reasonOptions) : []),
    [level1Index]
  )
  const level2EvidenceKeysShuffled = useMemo(
    () => shuffleOptions(["color", "gas", "precipitate", "temperature"] as const),
    [level2Index]
  )
  const level4ChoicesShuffled = useMemo(
    () => shuffleOptions([{ value: "exothermic" as const, label: "طارد للحرارة (طاقة مُطلقة)" }, { value: "endothermic" as const, label: "ماص للحرارة (طاقة مُمتصة)" }]),
    [level4Index]
  )
  const level5SidesShuffled = useMemo(
    () => shuffleOptions([{ value: "reactants" as const, label: "مع المتفاعلات (طاقة + متفاعلات → نواتج)" }, { value: "products" as const, label: "مع النواتج (متفاعلات → نواتج + طاقة)" }]),
    [level5Index]
  )

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 sm:p-6" dir="rtl">
      {/* شريط التقدّم والنجوم والشارات */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-amber-900">مختبر التفاعلات والطاقة</h2>
          <span className="text-sm font-semibold text-slate-500">
            المستوى {currentLevel} من 5
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-600" title="نجوم">
            {"★".repeat(stars)}{"☆".repeat(5 - stars)}
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
            {totalScore} نقطة
          </span>
        </div>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {earnedBadges.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {BADGES.filter((b) => earnedBadges.includes(b.id)).map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800"
            >
              🏅 {b.name}
            </span>
          ))}
        </div>
      )}

      {/* المستوى 1: هل سيحدث التفاعل؟ */}
      {currentLevel === 1 && scenario1 && (
        <section className="space-y-4">
          <h3 className="font-bold text-amber-900">المستوى 1: هل سيحدث التفاعل؟</h3>
          <p className="text-sm text-slate-600">اطّلعي على بيانات المادتين ثم قرري هل سيحدث تفاعل كيميائي.</p>
          <div className="overflow-x-auto rounded-xl border-2 border-slate-200">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="p-2 text-right">الخاصية</th>
                  <th className="p-2 text-right">المادة 1</th>
                  <th className="p-2 text-right">المادة 2</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2 font-medium">الحالة الفيزيائية</td><td className="p-2">{scenario1.substance1.state}</td><td className="p-2">{scenario1.substance2.state}</td></tr>
                <tr><td className="p-2 font-medium">اللون</td><td className="p-2">{scenario1.substance1.color}</td><td className="p-2">{scenario1.substance2.color}</td></tr>
                <tr><td className="p-2 font-medium">درجة الحرارة</td><td className="p-2">{scenario1.substance1.temp}</td><td className="p-2">{scenario1.substance2.temp}</td></tr>
                <tr><td className="p-2 font-medium">التركيز</td><td className="p-2">{scenario1.substance1.concentration}</td><td className="p-2">{scenario1.substance2.concentration}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <p className="mb-2 font-semibold text-slate-700">هل سيحدث تفاعل كيميائي؟</p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={level1Submitted}
                onClick={() => setLevel1Occur(true)}
                className={`rounded-xl border-2 px-4 py-2 font-medium ${level1Occur === true ? "border-amber-500 bg-amber-100" : "border-slate-200"}`}
              >
                نعم
              </button>
              <button
                type="button"
                disabled={level1Submitted}
                onClick={() => setLevel1Occur(false)}
                className={`rounded-xl border-2 px-4 py-2 font-medium ${level1Occur === false ? "border-amber-500 bg-amber-100" : "border-slate-200"}`}
              >
                لا
              </button>
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold text-slate-700">لماذا؟</p>
            <div className="space-y-2">
              {level1ReasonOptionsShuffled.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={level1Submitted}
                  onClick={() => setLevel1Reason(opt)}
                  className={`block w-full rounded-lg border-2 p-3 text-right text-sm ${level1Reason === opt ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {level1Submitted && (
            <div className={`rounded-xl border-2 p-3 text-sm ${level1Correct ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
              {level1Correct ? "✓ إجابة صحيحة." : "الإجابة الصحيحة: " + (scenario1.willOccur ? "نعم" : "لا") + " — " + scenario1.reasonCorrect}
              <p className="mt-2 text-slate-700">{scenario1.explanation}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3">
            {level1Index > 0 && (
              <button
                type="button"
                onClick={() => {
                  setLevel1Index((i) => i - 1)
                  setLevel1Occur(null)
                  setLevel1Reason("")
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
                disabled={level1Occur === null}
                onClick={handleLevel1Submit}
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goLevel1Next}
                  className="rounded-xl border-2 border-amber-500 bg-white px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                >
                  التالي ←
                </button>
                <span className="text-xs text-slate-500">
                  {level1Index < LEVEL1_SCENARIOS.length - 1 ? "سيناريو التالي" : "انتقال إلى المستوى 2"}
                </span>
              </>
            )}
          </div>
        </section>
      )}

      {/* المستوى 2: أدلة التفاعل */}
      {currentLevel === 2 && scenario2 && (
        <section className="space-y-4">
          <h3 className="font-bold text-amber-900">المستوى 2: أدلة التفاعل</h3>
          <p className="text-sm text-slate-600">اختاري كل الأدلة التي تُلاحظ في هذا التفاعل.</p>
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
            <p className="font-bold text-amber-900">{scenario2.reactionName}</p>
            <p className="text-sm text-slate-700">{scenario2.description}</p>
          </div>
          <div className="space-y-2">
            {level2EvidenceKeysShuffled.map((key) => (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${level2Selected.has(key) ? "border-amber-500 bg-amber-50" : "border-slate-200"}`}
              >
                <input
                  type="checkbox"
                  checked={level2Selected.has(key)}
                  onChange={() => toggleLevel2Evidence(key)}
                  disabled={level2Submitted}
                  className="h-5 w-5"
                />
                <span className="font-medium">{EVIDENCE_LABELS[key]}</span>
              </label>
            ))}
          </div>
          {level2Submitted && (
            <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              {[...level2Selected].map((key) => (
                <p key={key}>{scenario2.explanations[key]}</p>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3">
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
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
              >
                تحقق
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goLevel2Next}
                  className="rounded-xl border-2 border-amber-500 bg-white px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                >
                  التالي ←
                </button>
                <span className="text-xs text-slate-500">
                  {level2Index < LEVEL2_SCENARIOS.length - 1 ? "تفاعل التالي" : "انتقال إلى المستوى 3"}
                </span>
              </>
            )}
          </div>
        </section>
      )}

      {/* المستوى 3: موازنة المعادلة */}
      {currentLevel === 3 && eq3 && (
        <section className="space-y-4">
          <h3 className="font-bold text-amber-900">المستوى 3: موازنة المعادلة (حفظ الكتلة)</h3>
          <p className="text-sm text-slate-600">عدّلي المعاملات حتى يتساوى عدد ذرات كل عنصر في الطرفين.</p>
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-medium text-amber-900">المعادلة اللفظية: {eq3.wordEquation}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {eq3.reactantFormulas.map((formula, i) => (
              <span key={i} className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={reactantCoeffs[i] || 1}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10) || 1
                    setLevel3Coeffs((prev) => {
                      const next = [...prev]
                      next[i] = v
                      return next
                    })
                  }}
                  disabled={level3Submitted}
                  className="w-14 rounded border-2 border-slate-200 px-1 py-1 text-center text-sm"
                />
                <span className="font-mono">{formula}</span>
                {i < eq3.reactantFormulas.length - 1 && <span>+</span>}
              </span>
            ))}
            <span>→</span>
            {eq3.productFormulas.map((formula, i) => (
              <span key={i} className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={productCoeffs[i] ?? 1}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10) || 1
                    setLevel3Coeffs((prev) => {
                      const next = [...prev]
                      next[eq3.reactantFormulas.length + i] = v
                      return next
                    })
                  }}
                  disabled={level3Submitted}
                  className="w-14 rounded border-2 border-slate-200 px-1 py-1 text-center text-sm"
                />
                <span className="font-mono">{formula}</span>
                {i < eq3.productFormulas.length - 1 && <span>+</span>}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="font-semibold text-slate-700">الذرات (متفاعلات):</p>
              {Object.entries(atomsLeft).map(([sym, n]) => (
                <p key={sym}>{sym}: {n}</p>
              ))}
            </div>
            <div className="rounded-lg border border-slate-200 p-2">
              <p className="font-semibold text-slate-700">الذرات (نواتج):</p>
              {Object.entries(atomsRight).map(([sym, n]) => (
                <p key={sym}>{sym}: {n}</p>
              ))}
            </div>
          </div>
          {level3Balanced && (
            <p className="text-emerald-700 font-medium">✓ المعادلة متزنة — حفظ الكتلة محقق.</p>
          )}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3">
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
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
              >
                تحقق
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goLevel3Next}
                  className="rounded-xl border-2 border-amber-500 bg-white px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                >
                  التالي ←
                </button>
                <span className="text-xs text-slate-500">
                  {level3Index < LEVEL3_EQUATIONS.length - 1 ? "معادلة التالية" : "انتقال إلى المستوى 4"}
                </span>
              </>
            )}
          </div>
        </section>
      )}

      {/* المستوى 4: تغيّر الطاقة */}
      {currentLevel === 4 && scenario4 && (
        <section className="space-y-4">
          <h3 className="font-bold text-amber-900">المستوى 4: تغيّر الطاقة</h3>
          <p className="text-sm text-slate-600">حددي نوع التفاعل من حيث الطاقة (طارد أو ماص للحرارة).</p>
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
            <p className="font-bold text-amber-900">{scenario4.reactionName}</p>
            <p className="mt-2 text-sm">درجة الحرارة قبل التفاعل: <strong>{scenario4.tempBefore}°م</strong></p>
            <p className="text-sm">درجة الحرارة بعد التفاعل: <strong>{scenario4.tempAfter}°م</strong></p>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-700">تمثيل الطاقة:</p>
            <div className="flex items-end gap-1 h-16">
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs">قبل</span>
                <div className="w-full bg-slate-200 rounded-t" style={{ height: 24 }} />
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs">بعد</span>
                <div
                  className="w-full rounded-t bg-amber-400"
                  style={{
                    height: scenario4.isExothermic ? 40 : 12,
                  }}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {scenario4.isExothermic ? "ارتفاع درجة الحرارة → طاقة مُطلقة" : "انخفاض درجة الحرارة → طاقة مُمتصة"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {level4ChoicesShuffled.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                disabled={level4Submitted}
                onClick={() => setLevel4Choice(value)}
                className={`flex-1 min-w-[140px] rounded-xl border-2 py-3 font-medium ${level4Choice === value ? "border-amber-500 bg-amber-100" : "border-slate-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {level4Submitted && (
            <p className={`text-sm ${level4Correct ? "text-emerald-700" : "text-amber-700"}`}>
              {level4Correct ? "✓ صحيح." : "الإجابة الصحيحة: " + (scenario4.isExothermic ? "طارد للحرارة" : "ماص للحرارة")}
              <span className="block mt-1 text-slate-600">{scenario4.explanation}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3">
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
                disabled={!level4Choice}
                onClick={handleLevel4Submit}
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goLevel4Next}
                  className="rounded-xl border-2 border-amber-500 bg-white px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                >
                  التالي ←
                </button>
                <span className="text-xs text-slate-500">
                  {level4Index < LEVEL4_SCENARIOS.length - 1 ? "تفاعل التالي" : "انتقال إلى المستوى 5"}
                </span>
              </>
            )}
          </div>
        </section>
      )}

      {/* المستوى 5: وضع الطاقة في المعادلة */}
      {currentLevel === 5 && scenario5 && (
        <section className="space-y-4">
          <h3 className="font-bold text-amber-900">المستوى 5: تمثيل الطاقة في المعادلة</h3>
          <p className="text-sm text-slate-600">
            في التفاعل الطارد للحرارة تُكتب الطاقة مع النواتج؛ في الماص مع المتفاعلات. أين توضع الطاقة؟
          </p>
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3">
            <p className="font-mono text-center">{scenario5.equationWithoutEnergy}</p>
            <p className="mt-1 text-center text-sm text-slate-600">
              هذا التفاعل {scenario5.isExothermic ? "طارد" : "ماص"} للحرارة.
            </p>
          </div>
          <div className="space-y-2">
            {level5SidesShuffled.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                disabled={level5Submitted}
                onClick={() => setLevel5Side(value)}
                className={`w-full rounded-xl border-2 p-3 text-right ${level5Side === value ? "border-amber-500 bg-amber-100" : "border-slate-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {level5Submitted && (
            <p className={`text-sm ${level5Correct ? "text-emerald-700" : "text-amber-700"}`}>
              {level5Correct ? "✓ صحيح." : "الإجابة الصحيحة: " + (scenario5.correctSide === "reactants" ? "مع المتفاعلات" : "مع النواتج")}
              <span className="block mt-1 text-slate-600">{scenario5.explanation}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3">
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
                disabled={!level5Side}
                onClick={handleLevel5Submit}
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={goLevel5Next}
                  className="rounded-xl border-2 border-amber-500 bg-white px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                >
                  التالي ←
                </button>
                <span className="text-xs text-slate-500">
                  {level5Index < LEVEL5_SCENARIOS.length - 1 ? "معادلة التالية" : "إنهاء اللعبة"}
                </span>
              </>
            )}
          </div>
        </section>
      )}

      {/* شاشة النهاية والتقرير */}
      {currentLevel === 6 && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6" dir="rtl">
          <p className="text-2xl font-bold text-emerald-800">🎉 انتهيت من مختبر التفاعلات والطاقة!</p>
          <p className="mt-2 text-emerald-700">ستظهر نتيجتك في شاشة النتائج.</p>
          <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4">
            <h4 className="font-bold text-slate-800 mb-2">ملخص الأداء</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              {[1, 2, 3, 4, 5].map((l) => (
                <li key={l}>المستوى {l}: {levelScores[l] ?? 0}%</li>
              ))}
            </ul>
            <p className="mt-2 font-semibold text-slate-800">النقاط الإجمالية: {totalScore}</p>
            {earnedBadges.length > 0 && (
              <p className="mt-2 text-amber-700">الشارات: {BADGES.filter((b) => earnedBadges.includes(b.id)).map((b) => b.name).join("، ")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
