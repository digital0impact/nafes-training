"use client"

/**
 * لعبة مختبر الروابط الكيميائية – Chemical Bond Lab
 * الهدف التعليمي: توضيح مفهوم الرابطة الكيميائية، والمقارنة بين أنواعها (أيونية، تساهمية، فلزية، قطبية)،
 * وشرح كيفية ارتباط الذرات لتكوين المركبات.
 *
 * المستوى 1: مفهوم الرابطة + سؤال اختيار من متعدد
 * المستوى 2: سحب وإفلات ذرات (Na, Cl, H, O, Cu) لتكوين الرابطة مع عرض النوع والشرح
 * المستوى 3: جدول مقارنة + سحب الخصائص إلى نوع الرابطة
 * المستوى 4: نماذج جزيئية (H₂O, CO₂, NH₃) + سؤال قطبية مع تفسير
 * المستوى 5: بناء مركب محدد + تحديد نوع الرابطة + تفسير مختصر
 *
 * قابل للتوسعة: إضافة مركبات أو روابط جديدة عبر البيانات في gameData أو ثوابت.
 */
import { useState, useEffect, useCallback } from "react"
import type { ChemicalBondLabGameData } from "@/types/games"

type EducationalGameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type ChemicalBondLabProps = {
  gameData: ChemicalBondLabGameData
  game: EducationalGameMeta
  onComplete: (result: { score: number; answers?: Record<string, unknown>; timeSpent: number }) => void
}

// ─── ثوابت تعليمية (قابلة للتوسعة) ─────────────────────────────────────────
const ATOMS = [
  { id: "Na", symbol: "Na", name: "صوديوم", color: "bg-amber-400", bondHint: "فلز قلوي" },
  { id: "Cl", symbol: "Cl", name: "كلور", color: "bg-green-400", bondHint: "لافلز" },
  { id: "H", symbol: "H", name: "هيدروجين", color: "bg-slate-300", bondHint: "لافلز" },
  { id: "O", symbol: "O", name: "أكسجين", color: "bg-red-400", bondHint: "لافلز" },
  { id: "Cu", symbol: "Cu", name: "نحاس", color: "bg-amber-700", bondHint: "فلز" },
] as const

type BondType = "ionic" | "covalent" | "metallic"

/** تحديد نوع الرابطة من زوج الذرات (قابل للتوسعة بمركبات أخرى) */
function getBondType(a: string, b: string): BondType | null {
  const pair = [a, b].sort().join("-")
  if (pair === "Cl-Na") return "ionic"
  if (pair === "H-O" || pair === "O-O" || pair === "H-H") return "covalent"
  if (pair === "Cu-Cu") return "metallic"
  return null
}

const BOND_EXPLANATIONS: Record<BondType, { title: string; short: string; color: string }> = {
  ionic: {
    title: "رابطة أيونية",
    short: "انتقال إلكترون من الذرة الأقل سالبية (فلز) إلى الأكثر سالبية (لافلز) فيتكون أيونان متجاذبان.",
    color: "bg-amber-100 border-amber-300 text-amber-900",
  },
  covalent: {
    title: "رابطة تساهمية",
    short: "مشاركة زوج أو أكثر من الإلكترونات بين ذرتين لتحقيق الاستقرار (غالباً بين اللافلزات).",
    color: "bg-blue-100 border-blue-300 text-blue-900",
  },
  metallic: {
    title: "رابطة فلزية",
    short: "بحر من الإلكترونات الحرة يربط أيونات الفلز الموجبة معاً.",
    color: "bg-amber-200 border-amber-500 text-amber-900",
  },
}

const LEVEL1_QUESTION = {
  question: "ما السبب الرئيسي لارتباط الذرات معاً لتكوين مركبات؟",
  options: [
    "للوصول إلى استقرار إلكتروني (مثل الغازات النبيلة)",
    "بسبب الجاذبية بين النوى",
    "بسبب الحرارة فقط",
    "بسبب الضغط الجوي",
  ],
  correct: "للوصول إلى استقرار إلكتروني (مثل الغازات النبيلة)",
}

const LEVEL3_PROPERTIES = [
  { id: "p1", text: "انتقال إلكترونات", bond: "ionic" as BondType },
  { id: "p2", text: "مشاركة إلكترونات", bond: "covalent" as BondType },
  { id: "p3", text: "بحر من الإلكترونات", bond: "metallic" as BondType },
  { id: "p4", text: "فرق كبير في السالبية الكهربائية", bond: "ionic" as BondType },
]

const LEVEL4_MOLECULES = [
  { id: "h2o", formula: "H₂O", name: "الماء", polar: true, reason: "الرابطة O-H قطبية والجزيء غير متماثل (زاوي)." },
  { id: "co2", formula: "CO₂", name: "ثاني أكسيد الكربون", polar: false, reason: "الرابطة C=O قطبية لكن الجزيء خطي متماثل فالشحنات تلغي بعضها." },
  { id: "nh3", formula: "NH₃", name: "الأمونيا", polar: true, reason: "الرابطة N-H قطبية والجزيء هرمي غير متماثل." },
]

const LEVEL5_CHALLENGES = [
  { compound: "NaCl", bondType: "ionic" as BondType, hint: "مركب أيوني شائع (ملح الطعام)." },
  { compound: "H₂O", bondType: "covalent" as BondType, hint: "جزيء تساهمي قطبي." },
  { compound: "سلك نحاس Cu", bondType: "metallic" as BondType, hint: "فلز؛ الرابطة بين ذرات النحاس." },
]

export default function ChemicalBondLab({ gameData, game, onComplete }: ChemicalBondLabProps) {
  const [currentLevel, setCurrentLevel] = useState(1)
  const [startTime] = useState(Date.now())
  const [totalScore, setTotalScore] = useState(0)
  const [levelScores, setLevelScores] = useState<Record<number, number>>({})

  // المستوى 1: اختيار من متعدد
  const [level1Selected, setLevel1Selected] = useState<string | null>(null)
  const [level1Feedback, setLevel1Feedback] = useState<"correct" | "wrong" | null>(null)

  // المستوى 2: سحب وإفلات
  const [level2Slot1, setLevel2Slot1] = useState<string | null>(null)
  const [level2Slot2, setLevel2Slot2] = useState<string | null>(null)
  const [level2ShownBond, setLevel2ShownBond] = useState<BondType | null>(null)
  const [level2CompletedPairs, setLevel2CompletedPairs] = useState<Set<string>>(new Set())

  // المستوى 3: سحب الخصائص إلى نوع الرابطة
  const [level3Placements, setLevel3Placements] = useState<Record<string, BondType | "">>({
    p1: "", p2: "", p3: "", p4: "",
  })
  const [level3Dragging, setLevel3Dragging] = useState<string | null>(null)

  // المستوى 4: قطبية
  const [level4MoleculeIndex, setLevel4MoleculeIndex] = useState(0)
  const [level4Answer, setLevel4Answer] = useState<boolean | null>(null)
  const [level4ShowReason, setLevel4ShowReason] = useState(false)

  // المستوى 5: بناء مركب
  const [level5ChallengeIndex, setLevel5ChallengeIndex] = useState(0)
  const [level5SelectedBond, setLevel5SelectedBond] = useState<BondType | "">("")
  const [level5Explanation, setLevel5Explanation] = useState("")
  const [level5Submitted, setLevel5Submitted] = useState(false)
  const [level5Correct, setLevel5Correct] = useState(false)

  const finishGame = useCallback(() => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const avg = Object.values(levelScores).length
      ? Math.round(Object.values(levelScores).reduce((a, b) => a + b, 0) / Object.keys(levelScores).length)
      : 0
    const finalScore = avg > 0 ? avg : totalScore
    onComplete({ score: finalScore, timeSpent })
  }, [startTime, levelScores, totalScore, onComplete])

  useEffect(() => {
    if (currentLevel === 6) finishGame()
  }, [currentLevel, finishGame])

  // ─── المستوى 1: مفهوم الرابطة + سؤال ─────────────────────────────────────
  const handleLevel1Submit = () => {
    if (!level1Selected) return
    const correct = level1Selected === LEVEL1_QUESTION.correct
    setLevel1Feedback(correct ? "correct" : "wrong")
    const score = correct ? 100 : 0
    setLevelScores((s) => ({ ...s, 1: score }))
    setTotalScore((t) => t + score)
  }

  // ─── المستوى 2: تكوين الرابطة ───────────────────────────────────────────
  const handleLevel2Drop = (slot: 1 | 2, atomId: string) => {
    if (slot === 1) {
      setLevel2Slot1(atomId)
      if (level2Slot2) tryLevel2Bond(atomId, level2Slot2)
    } else {
      setLevel2Slot2(atomId)
      if (level2Slot1) tryLevel2Bond(level2Slot1, atomId)
    }
  }

  const tryLevel2Bond = (a: string, b: string) => {
    const bond = getBondType(a, b)
    setLevel2ShownBond(bond ?? null)
    if (bond) setLevel2CompletedPairs((prev) => new Set(prev).add([a, b].sort().join("-")))
  }

  const level2Required = ["Cl-Na", "Cu-Cu", "H-O"]
  const level2Got = level2Required.filter((r) => level2CompletedPairs.has(r)).length
  const level2Score = level2Got >= 3 ? 100 : Math.round((level2Got / 3) * 100)

  const goLevel2Next = () => {
    setLevelScores((s) => ({ ...s, 2: level2Score }))
    setTotalScore((t) => t + level2Score)
    setCurrentLevel(3)
    setLevel2Slot1(null)
    setLevel2Slot2(null)
    setLevel2ShownBond(null)
  }

  // ─── المستوى 3: سحب الخصائص ──────────────────────────────────────────────
  const handleLevel3Drop = (propId: string, bond: BondType) => {
    setLevel3Placements((p) => ({ ...p, [propId]: bond }))
    setLevel3Dragging(null)
  }

  const level3Correct = LEVEL3_PROPERTIES.every((p) => level3Placements[p.id] === p.bond)
  const level3Filled = LEVEL3_PROPERTIES.every((p) => level3Placements[p.id] !== "")

  const goLevel3Next = () => {
    const score = level3Correct ? 100 : level3Filled ? 50 : 0
    setLevelScores((s) => ({ ...s, 3: score }))
    setTotalScore((t) => t + score)
    setCurrentLevel(4)
  }

  // ─── المستوى 4: قطبية ───────────────────────────────────────────────────
  const mol = LEVEL4_MOLECULES[level4MoleculeIndex]
  const handleLevel4Submit = (polar: boolean) => {
    setLevel4Answer(polar === mol.polar)
    setLevel4ShowReason(true)
  }

  const goLevel4Next = () => {
    const score = level4Answer ? 100 : 0
    setLevelScores((s) => ({ ...s, 4: score }))
    setTotalScore((t) => t + score)
    setLevel4Answer(null)
    setLevel4ShowReason(false)
    if (level4MoleculeIndex < LEVEL4_MOLECULES.length - 1) {
      setLevel4MoleculeIndex((i) => i + 1)
    } else {
      setCurrentLevel(5)
    }
  }

  // ─── المستوى 5: بناء مركب ───────────────────────────────────────────────
  const challenge = LEVEL5_CHALLENGES[level5ChallengeIndex]
  const handleLevel5Submit = () => {
    const correct = level5SelectedBond === challenge.bondType && level5Explanation.trim().length >= 5
    setLevel5Correct(correct)
    setLevel5Submitted(true)
    const score = correct ? 100 : level5SelectedBond === challenge.bondType ? 60 : 0
    setLevelScores((s) => ({ ...s, 5: score }))
    setTotalScore((t) => t + score)
  }

  const goLevel5Next = () => {
    if (level5ChallengeIndex < LEVEL5_CHALLENGES.length - 1) {
      setLevel5ChallengeIndex((i) => i + 1)
      setLevel5SelectedBond("")
      setLevel5Explanation("")
      setLevel5Submitted(false)
    } else {
      setCurrentLevel(6)
    }
  }

  // ─── واجهة المستخدم ─────────────────────────────────────────────────────
  const progressPercent = (currentLevel / 6) * 100

  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 sm:p-6" dir="rtl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-violet-900">مختبر الروابط الكيميائية</h2>
        <span className="text-sm font-semibold text-slate-500">المستوى {currentLevel} من 5</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* المستوى 1: مفهوم الرابطة + سؤال اختيار من متعدد */}
      {currentLevel === 1 && (
        <section className="space-y-4">
          <div className="rounded-xl bg-violet-50 border border-violet-200 p-4">
            <h3 className="font-bold text-violet-900 mb-2">مفهوم الرابطة الكيميائية</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              الرابطة الكيميائية هي قوة تجذب الذرات معاً. تبحث الذرات عن <strong>الاستقرار</strong> بأن
              تصبح مستواها الخارجي ممتلئاً بالإلكترونات (مثل الغازات النبيلة)، إما بنقل إلكترونات أو
              بمشاركتها أو بتشكيل بحر إلكتروني في الفلزات.
            </p>
            <div className="mt-3 flex items-center gap-2 text-violet-600">
              <span className="inline-block h-2 w-2 animate-ping rounded-full bg-violet-500" />
              <span className="text-xs font-medium">الذرات ترتبط للوصول إلى الاستقرار</span>
            </div>
          </div>
          <div className="rounded-xl border-2 border-slate-200 p-4">
            <p className="font-semibold text-slate-800 mb-3">{LEVEL1_QUESTION.question}</p>
            <div className="space-y-2">
              {LEVEL1_QUESTION.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={level1Feedback !== null}
                  onClick={() => setLevel1Selected(opt)}
                  className={`w-full rounded-lg border-2 p-3 text-right text-sm font-medium transition ${
                    level1Selected === opt
                      ? "border-violet-500 bg-violet-100"
                      : "border-slate-200 hover:border-violet-300"
                  } ${level1Feedback ? "opacity-90" : ""}`}
                >
                  {opt}
                  {level1Feedback && level1Selected === opt && (
                    <span className="mr-2">{level1Feedback === "correct" ? "✓ صحيح" : "✗ خطأ"}</span>
                  )}
                </button>
              ))}
            </div>
            {level1Feedback === "correct" && (
              <p className="mt-3 text-sm font-medium text-emerald-700">ممتاز! الذرات ترتبط للوصول إلى الاستقرار.</p>
            )}
            {level1Feedback === null ? (
              <button
                type="button"
                disabled={!level1Selected}
                onClick={handleLevel1Submit}
                className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentLevel(2)}
                className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
              >
                التالي: كوّن الرابطة
              </button>
            )}
          </div>
        </section>
      )}

      {/* المستوى 2: سحب وإفلات ذرات */}
      {currentLevel === 2 && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">
            اسحبي ذرتين إلى المربعين لتكوين رابطة. أمثلة: Na+Cl (أيونية)، H+O (تساهمية)، Cu+Cu (فلزية).
          </p>
          <div className="flex flex-wrap gap-3">
            {ATOMS.map((atom) => (
              <div
                key={atom.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("atom", atom.id)
                  e.dataTransfer.effectAllowed = "move"
                }}
                className={`cursor-grab rounded-xl border-2 border-slate-200 p-3 ${atom.color} font-bold text-slate-900 shadow touch-manipulation active:cursor-grabbing`}
              >
                {atom.symbol}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleLevel2Drop(1, e.dataTransfer.getData("atom"))
              }}
              className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-lg font-bold"
            >
              {level2Slot1 ? ATOMS.find((a) => a.id === level2Slot1)?.symbol : "؟"}
            </div>
            <span className="text-2xl text-slate-400">+</span>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleLevel2Drop(2, e.dataTransfer.getData("atom"))
              }}
              className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-slate-300 bg-white text-lg font-bold"
            >
              {level2Slot2 ? ATOMS.find((a) => a.id === level2Slot2)?.symbol : "؟"}
            </div>
          </div>
          {level2ShownBond && (
            <div className={`rounded-xl border-2 p-4 ${BOND_EXPLANATIONS[level2ShownBond].color}`}>
              <p className="font-bold">{BOND_EXPLANATIONS[level2ShownBond].title}</p>
              <p className="mt-1 text-sm">{BOND_EXPLANATIONS[level2ShownBond].short}</p>
            </div>
          )}
          <p className="text-xs text-slate-500">أمثلة مطلوبة: Na+Cl (أيونية)، H+O (تساهمية)، Cu+Cu (فلزية). أكملت {level2Got} من 3.</p>
          <button
            type="button"
            onClick={goLevel2Next}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
          >
            التالي: قارن بين الروابط
          </button>
        </section>
      )}

      {/* المستوى 3: جدول مقارنة + سحب الخصائص */}
      {currentLevel === 3 && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">اسحبي كل خاصية إلى نوع الرابطة المناسب.</p>
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-200 p-2 text-center text-xs font-bold sm:grid-cols-3">
            <div className="rounded-lg bg-amber-100 py-2 text-amber-900">أيونية</div>
            <div className="rounded-lg bg-blue-100 py-2 text-blue-900">تساهمية</div>
            <div className="rounded-lg bg-amber-200 py-2 text-amber-900">فلزية</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {LEVEL3_PROPERTIES.map((p) => (
              <div
                key={p.id}
                draggable
                onDragStart={() => setLevel3Dragging(p.id)}
                onDragEnd={() => setLevel3Dragging(null)}
                className={`cursor-grab rounded-lg border-2 px-3 py-2 text-sm font-medium ${
                  level3Placements[p.id] ? "bg-slate-100 border-slate-300" : "border-violet-300 bg-violet-50"
                } touch-manipulation`}
              >
                {p.text}
                {level3Placements[p.id] && (
                  <span className="mr-1 text-xs">→ {BOND_EXPLANATIONS[level3Placements[p.id]].title}</span>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["ionic", "covalent", "metallic"] as const).map((bond) => (
              <div
                key={bond}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (level3Dragging) handleLevel3Drop(level3Dragging, bond)
                }}
                className="min-h-[60px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-2"
              >
                <p className="text-xs font-bold text-slate-600 mb-1">{BOND_EXPLANATIONS[bond].title}</p>
                {LEVEL3_PROPERTIES.filter((q) => level3Placements[q.id] === bond).map((q) => (
                  <span key={q.id} className="block text-xs">{q.text}</span>
                ))}
              </div>
            ))}
          </div>
          {level3Filled && (
            <p className={level3Correct ? "text-emerald-700 font-medium" : "text-amber-700"}>
              {level3Correct ? "✓ جميع الإجابات صحيحة!" : "راجعي التصنيف."}
            </p>
          )}
          <button
            type="button"
            onClick={goLevel3Next}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
          >
            التالي: الرابطة القطبية
          </button>
        </section>
      )}

      {/* المستوى 4: الرابطة القطبية */}
      {currentLevel === 4 && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">هل الجزيء التالي قطبي أم غير قطبي؟</p>
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{mol.formula}</p>
            <p className="text-sm text-slate-600">{mol.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={level4Answer !== null}
              onClick={() => handleLevel4Submit(true)}
              className={`flex-1 rounded-xl border-2 py-3 font-semibold ${
                level4Answer === true && mol.polar ? "border-emerald-500 bg-emerald-100" : "border-slate-200"
              }`}
            >
              قطبي
            </button>
            <button
              type="button"
              disabled={level4Answer !== null}
              onClick={() => handleLevel4Submit(false)}
              className={`flex-1 rounded-xl border-2 py-3 font-semibold ${
                level4Answer === false && !mol.polar ? "border-emerald-500 bg-emerald-100" : "border-slate-200"
              }`}
            >
              غير قطبي
            </button>
          </div>
          {level4ShowReason && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {mol.reason}
            </div>
          )}
          <button
            type="button"
            onClick={goLevel4Next}
            disabled={!level4ShowReason}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {level4MoleculeIndex < LEVEL4_MOLECULES.length - 1 ? "جزيء التالي" : "التحدي النهائي"}
          </button>
        </section>
      )}

      {/* المستوى 5: ابنِ مركبًا */}
      {currentLevel === 5 && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">حددي نوع الرابطة في المركب/المادة التالية واكتبي تفسيراً مختصراً.</p>
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-4">
            <p className="text-xl font-bold text-violet-900">{challenge.compound}</p>
            <p className="text-xs text-violet-700">{challenge.hint}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">نوع الرابطة:</p>
            <div className="flex flex-wrap gap-2">
              {(["ionic", "covalent", "metallic"] as const).map((bond) => (
                <button
                  key={bond}
                  type="button"
                  disabled={level5Submitted}
                  onClick={() => setLevel5SelectedBond(bond)}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${
                    level5SelectedBond === bond ? "border-violet-500 bg-violet-100" : "border-slate-200"
                  }`}
                >
                  {BOND_EXPLANATIONS[bond].title}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">تفسير مختصر (سبب تكون الرابطة):</label>
            <textarea
              value={level5Explanation}
              onChange={(e) => setLevel5Explanation(e.target.value)}
              disabled={level5Submitted}
              placeholder="مثال: لأن الصوديوم فلز والكلور لافلز فينتقل إلكترون..."
              className="w-full rounded-xl border-2 border-slate-200 p-3 text-sm"
              rows={3}
            />
          </div>
          {level5Submitted && (
            <p className={level5Correct ? "text-emerald-700 font-medium" : "text-amber-700"}>
              {level5Correct ? "✓ إجابة صحيحة وتفسير جيد!" : "راجعي نوع الرابطة والتفسير."}
            </p>
          )}
          {!level5Submitted ? (
            <button
              type="button"
              disabled={!level5SelectedBond || level5Explanation.trim().length < 5}
              onClick={handleLevel5Submit}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              تحقق
            </button>
          ) : (
            <button
              type="button"
              onClick={goLevel5Next}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {level5ChallengeIndex < LEVEL5_CHALLENGES.length - 1 ? "مركب التالي" : "إنهاء اللعبة"}
            </button>
          )}
        </section>
      )}

      {currentLevel === 6 && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-2xl font-bold text-emerald-800">🎉 انتهيت من المختبر!</p>
          <p className="mt-2 text-emerald-700">ستظهر نتيجتك في شاشة النتائج.</p>
        </div>
      )}
    </div>
  )
}
