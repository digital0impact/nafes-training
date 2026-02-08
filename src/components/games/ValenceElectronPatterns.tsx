"use client"

/**
 * لعبة سر العائلة الدورية – Valence Electron Patterns
 * المؤشر: يصف كيفية عكس دورية الخصائص الكيميائية لأنماط إلكترونات التكافؤ.
 * الهدف: تمكين الطالب من فهم أن عناصر العائلة الواحدة تمتلك نفس نمط إلكترونات التكافؤ.
 *
 * المرحلة 1: اكتشف العائلة – عمود واحد، ضغط على عنصر يعرض المستوى الخارجي وعدد التكافؤ.
 * المرحلة 2: ماذا يتكرر؟ – مقارنة عنصرين، اختيار من متعدد (التشابه: تكافؤ / خصائص / نوع الأيون).
 * المرحلة 3: اربط الخاصية بالإلكترونات – سحب خصائص إلى أعداد تكافؤ (1–8).
 * المرحلة 4: من لا ينتمي؟ – أربعة عناصر، واحد دخيل، مع شرح.
 * المرحلة 5: التحدي الختامي – إعطاء تكافؤ ووصف، تحديد العائلة وتبرير.
 *
 * قابل للتوسعة: إضافة عائلات أو عناصر عبر البيانات.
 */
import { useState, useEffect, useCallback } from "react"
import type { ValenceElectronPatternsGameData } from "@/types/games"

type GameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type ElementInfo = { symbol: string; nameAr: string; valence: number }
type FamilyInfo = { id: string; nameAr: string; color: string; elements: ElementInfo[] }

// ─── بيانات العائلات الدورية (قابلة للتوسعة) ─────────────────────────────────
const FAMILIES: FamilyInfo[] = [
  {
    id: "alkali",
    nameAr: "الفلزات القلوية",
    color: "bg-amber-400",
    elements: [
      { symbol: "Li", nameAr: "ليثيوم", valence: 1 },
      { symbol: "Na", nameAr: "صوديوم", valence: 1 },
      { symbol: "K", nameAr: "بوتاسيوم", valence: 1 },
    ],
  },
  {
    id: "alkaline",
    nameAr: "الفلزات القلوية الترابية",
    color: "bg-lime-400",
    elements: [
      { symbol: "Be", nameAr: "بيريليوم", valence: 2 },
      { symbol: "Mg", nameAr: "مغنيسيوم", valence: 2 },
      { symbol: "Ca", nameAr: "كالسيوم", valence: 2 },
    ],
  },
  {
    id: "halogens",
    nameAr: "الهالوجينات",
    color: "bg-cyan-400",
    elements: [
      { symbol: "F", nameAr: "فلور", valence: 7 },
      { symbol: "Cl", nameAr: "كلور", valence: 7 },
      { symbol: "Br", nameAr: "بروم", valence: 7 },
    ],
  },
  {
    id: "noble",
    nameAr: "الغازات النبيلة",
    color: "bg-violet-400",
    elements: [
      { symbol: "He", nameAr: "هيليوم", valence: 2 },
      { symbol: "Ne", nameAr: "نيون", valence: 8 },
      { symbol: "Ar", nameAr: "أرجون", valence: 8 },
    ],
  },
]

// مرحلة 2: ما المتشابه بين عنصرين من نفس العائلة؟
const STAGE2_OPTIONS = [
  "عدد إلكترونات التكافؤ",
  "الخصائص الكيميائية",
  "نوع الأيون المتكون",
]
const STAGE2_FEEDBACK =
  "جميعها مرتبطة! السبب الرئيسي هو تشابه عدد إلكترونات التكافؤ في المستوى الخارجي، مما يؤدي إلى تشابه الخصائص ونوع الأيون."

// مرحلة 3: ربط خاصية بعدد تكافؤ (1–8)
const STAGE3_ITEMS: { id: string; text: string; valence: number }[] = [
  { id: "s1", text: "نشاط كيميائي عالي – يميل لفقد إلكترون بسهولة", valence: 1 },
  { id: "s2", text: "يفقد إلكترونين – يكون أيون +2", valence: 2 },
  { id: "s3", text: "يميل لكسب إلكترون واحد – يكون أيون -1", valence: 7 },
  { id: "s4", text: "مستقر جداً – لا يميل للتفاعل (مستوى ممتلئ)", valence: 8 },
]

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// مرحلة 4: مجموعات (3 من عائلة + 1 دخيل)
const STAGE4_SETS: { elements: ElementInfo[]; intruderIndex: number; familyId: string }[] = [
  {
    elements: [
      FAMILIES[0].elements[0],
      FAMILIES[0].elements[1],
      { symbol: "Mg", nameAr: "مغنيسيوم", valence: 2 },
      FAMILIES[0].elements[2],
    ],
    intruderIndex: 2,
    familyId: "alkali",
  },
  {
    elements: [
      FAMILIES[2].elements[0],
      FAMILIES[2].elements[1],
      { symbol: "O", nameAr: "أكسجين", valence: 6 },
      FAMILIES[2].elements[2],
    ],
    intruderIndex: 2,
    familyId: "halogens",
  },
  {
    elements: [
      FAMILIES[1].elements[0],
      { symbol: "Na", nameAr: "صوديوم", valence: 1 },
      FAMILIES[1].elements[1],
      FAMILIES[1].elements[2],
    ],
    intruderIndex: 1,
    familyId: "alkaline",
  },
]

// مرحلة 5: تحديات (تكافؤ + وصف → عائلة)
const STAGE5_CHALLENGES: { valence: number; description: string; familyId: string }[] = [
  { valence: 1, description: "نشط جداً، يفقد إلكترون واحد بسهولة، يكون أيون +1", familyId: "alkali" },
  { valence: 7, description: "يميل لكسب إلكترون، يكون أيون -1، لا فلز", familyId: "halogens" },
  { valence: 8, description: "مستقر، لا يتفاعل تقريباً، مستوى تكافؤ ممتلئ", familyId: "noble" },
]

type ValenceElectronPatternsProps = {
  gameData: ValenceElectronPatternsGameData
  game: GameMeta
  onComplete: (result: { score: number; answers?: Record<string, unknown>; timeSpent: number }) => void
}

/** رسم دائري مبسط للمستوى الخارجي (نقاط = إلكترونات) */
function OuterShellVisual({ valence, color = "bg-primary-500" }: { valence: number; color?: string }) {
  const maxDots = 8
  const dots = Math.min(valence, maxDots)
  return (
    <div className="flex flex-wrap justify-center gap-1.5 p-3">
      {Array.from({ length: dots }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-3 w-3 rounded-full ${color} animate-pulse`}
          style={{ animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  )
}

/**
 * تمثيل نقطي لإلكترونات التكافؤ حول رمز العنصر (أسلوب لويس).
 * النقاط تُوضَع في 8 مواقع حول الرمز: أعلى، أسفل، يمين، يسار، والزوايا.
 */
function LewisDotView({ symbol, valence }: { symbol: string; valence: number }) {
  const n = Math.min(Math.max(0, valence), 8)
  // ترتيب المواضع: أعلى، أعلى-يمين، يمين، أسفل-يمين، أسفل، أسفل-يسار، يسار، أعلى-يسار
  const positions = [
    { gridRow: 1, gridColumn: 2 }, // top
    { gridRow: 1, gridColumn: 3 }, // top-right
    { gridRow: 2, gridColumn: 3 }, // right
    { gridRow: 3, gridColumn: 3 }, // bottom-right
    { gridRow: 3, gridColumn: 2 }, // bottom
    { gridRow: 3, gridColumn: 1 }, // bottom-left
    { gridRow: 2, gridColumn: 1 }, // left
    { gridRow: 1, gridColumn: 1 }, // top-left
  ]
  return (
    <div className="inline-grid grid-cols-3 grid-rows-3 place-items-center gap-0 w-14 h-14">
      {positions.slice(0, n).map((pos, i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"
          style={{ gridRow: pos.gridRow, gridColumn: pos.gridColumn }}
        />
      ))}
      <span className="text-base font-bold text-slate-800" style={{ gridRow: 2, gridColumn: 2 }}>
        {symbol}
      </span>
    </div>
  )
}

export default function ValenceElectronPatterns({ gameData, game, onComplete }: ValenceElectronPatternsProps) {
  const [stage, setStage] = useState(1)
  const [startTime] = useState(Date.now())
  const [scores, setScores] = useState<Record<number, number>>({})
  const [totalScore, setTotalScore] = useState(0)

  // المرحلة 1: العائلة المعروضة والعنصر المختار
  const [stage1FamilyIndex, setStage1FamilyIndex] = useState(0)
  const [stage1Selected, setStage1Selected] = useState<ElementInfo | null>(null)
  const [stage1Viewed, setStage1Viewed] = useState<Set<string>>(new Set())

  // المرحلة 2: اختيار من متعدد
  const [stage2Selected, setStage2Selected] = useState<string | null>(null)
  const [stage2ShowFeedback, setStage2ShowFeedback] = useState(false)

  // المرحلة 3: سحب وإفلات (خاصية → تكافؤ) — ترتيب عشوائي للعرض
  const [stage3Placements, setStage3Placements] = useState<Record<string, number>>({})
  const [stage3Dragging, setStage3Dragging] = useState<string | null>(null)
  const [stage3ItemOrder, setStage3ItemOrder] = useState<typeof STAGE3_ITEMS>([])
  const [stage3ValenceOrder, setStage3ValenceOrder] = useState<number[]>([])

  // المرحلة 4: العنصر المختار (الدخيل)
  const [stage4SetIndex, setStage4SetIndex] = useState(0)
  const [stage4Selected, setStage4Selected] = useState<number | null>(null)
  const [stage4ShowResult, setStage4ShowResult] = useState(false)

  // المرحلة 5: التحدي الختامي
  const [stage5ChallengeIndex, setStage5ChallengeIndex] = useState(0)
  const [stage5SelectedFamily, setStage5SelectedFamily] = useState<string | null>(null)
  const [stage5Justification, setStage5Justification] = useState("")
  const [stage5Submitted, setStage5Submitted] = useState(false)
  const [stage5Correct, setStage5Correct] = useState(false)

  const finishGame = useCallback(() => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const avg =
      Object.keys(scores).length > 0
        ? Math.round(
            Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
          )
        : totalScore
    onComplete({ score: avg, timeSpent })
  }, [startTime, scores, totalScore, onComplete])

  useEffect(() => {
    if (stage === 6) finishGame()
  }, [stage, finishGame])

  const family = FAMILIES[stage1FamilyIndex]
  const stage4Set = STAGE4_SETS[stage4SetIndex]
  const stage5Challenge = STAGE5_CHALLENGES[stage5ChallengeIndex]

  // ─── المرحلة 1: الانتقال للتالي بعد مشاهدة عنصر واحد على الأقل ─────────────
  const stage1CanNext = stage1Viewed.size >= 1
  const goStage1Next = () => {
    setScores((s) => ({ ...s, 1: stage1Viewed.size >= 2 ? 100 : 80 }))
    setTotalScore((t) => t + (stage1Viewed.size >= 2 ? 100 : 80))
    setStage(2)
    setStage1Selected(null)
  }

  // ─── المرحلة 2: أي إجابة تعتبر صحيحة (كلها مرتبطة بالتكافؤ) ─────────────────
  const handleStage2Submit = () => {
    if (!stage2Selected) return
    setStage2ShowFeedback(true)
    setScores((s) => ({ ...s, 2: 100 }))
    setTotalScore((t) => t + 100)
  }
  const goStage2Next = () => {
    setStage3ItemOrder(shuffleArray([...STAGE3_ITEMS]))
    setStage3ValenceOrder(shuffleArray([1, 2, 7, 8]))
    setStage(3)
    setStage2Selected(null)
    setStage2ShowFeedback(false)
  }

  // ─── المرحلة 3: التحقق من التطابق ───────────────────────────────────────────
  const stage3Correct = STAGE3_ITEMS.every((item) => stage3Placements[item.id] === item.valence)
  const stage3Filled = STAGE3_ITEMS.every((item) => stage3Placements[item.id] != null)
  const goStage3Next = () => {
    const score = stage3Correct ? 100 : stage3Filled ? 50 : 0
    setScores((s) => ({ ...s, 3: score }))
    setTotalScore((t) => t + score)
    setStage(4)
  }

  // ─── المرحلة 4: اختيار الدخيل ─────────────────────────────────────────────────
  const handleStage4Select = (index: number) => {
    if (stage4ShowResult) return
    setStage4Selected(index)
    const correct = index === stage4Set.intruderIndex
    setStage4ShowResult(true)
    const score = correct ? 100 : 0
    setScores((s) => ({ ...s, 4: score }))
    setTotalScore((t) => t + score)
  }
  const goStage4Next = () => {
    if (stage4SetIndex < STAGE4_SETS.length - 1) {
      setStage4SetIndex((i) => i + 1)
      setStage4Selected(null)
      setStage4ShowResult(false)
    } else {
      setStage(5)
    }
  }

  // ─── المرحلة 5: التحدي الختامي ───────────────────────────────────────────────
  const handleStage5Submit = () => {
    const correct = stage5SelectedFamily === stage5Challenge.familyId && stage5Justification.trim().length >= 5
    setStage5Correct(correct)
    setStage5Submitted(true)
    const score = correct ? 100 : stage5SelectedFamily === stage5Challenge.familyId ? 60 : 0
    setScores((s) => ({ ...s, 5: score }))
    setTotalScore((t) => t + score)
  }
  const goStage5Next = () => {
    if (stage5ChallengeIndex < STAGE5_CHALLENGES.length - 1) {
      setStage5ChallengeIndex((i) => i + 1)
      setStage5SelectedFamily(null)
      setStage5Justification("")
      setStage5Submitted(false)
    } else {
      setStage(6)
    }
  }

  const progressPercent = (stage / 6) * 100

  return (
    <div className="rounded-2xl border-2 border-indigo-200 bg-white p-4 sm:p-6" dir="rtl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-indigo-900">سر العائلة الدورية</h2>
        <span className="text-sm font-semibold text-slate-500">المرحلة {stage} من 5</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* المرحلة 1: اكتشف العائلة */}
      {stage === 1 && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">
            اختر عائلة ثم عنصراً لترى المستوى الخارجي وعدد إلكترونات التكافؤ. لاحظ أن العدد يتكرر في العائلة.
          </p>
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
            <label className="mb-2 block text-sm font-semibold text-slate-700">العائلة:</label>
            <select
              value={stage1FamilyIndex}
              onChange={(e) => {
                setStage1FamilyIndex(Number(e.target.value))
                setStage1Selected(null)
              }}
              className="mb-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {FAMILIES.map((f, i) => (
                <option key={f.id} value={i}>{f.nameAr}</option>
              ))}
            </select>
            <p className="text-center font-bold text-slate-800">{family.nameAr}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {family.elements.map((el) => (
                <button
                  key={el.symbol}
                  type="button"
                  onClick={() => {
                    setStage1Selected(el)
                    setStage1Viewed((prev) => new Set(prev).add(el.symbol))
                  }}
                  className={`rounded-xl border-2 px-4 py-3 font-bold transition ${
                    stage1Selected?.symbol === el.symbol
                      ? `border-indigo-500 ${family.color} text-white`
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  {el.symbol}
                </button>
              ))}
            </div>
          </div>
          {stage1Selected && (
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
              <p className="font-bold text-indigo-900">{stage1Selected.nameAr} ({stage1Selected.symbol})</p>
              <p className="mt-1 text-sm text-indigo-700">المستوى الخارجي (إلكترونات التكافؤ):</p>
              <OuterShellVisual valence={stage1Selected.valence} color="bg-indigo-500" />
              <p className="mt-2 font-semibold text-indigo-800">عدد إلكترونات التكافؤ: {stage1Selected.valence}</p>
              <p className="mt-1 text-xs text-indigo-600">نفس العدد يتكرر في جميع عناصر العائلة.</p>
            </div>
          )}
          <button
            type="button"
            onClick={goStage1Next}
            disabled={!stage1CanNext}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            التالي: ماذا يتكرر؟
          </button>
        </section>
      )}

      {/* المرحلة 2: ماذا يتكرر؟ */}
      {stage === 2 && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">
            عند مقارنة عنصرين من نفس العائلة (مثل Li و Na)، ما الذي يتشابه بينهما؟
          </p>
          <div className="space-y-2">
            {STAGE2_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={stage2ShowFeedback}
                onClick={() => setStage2Selected(opt)}
                className={`w-full rounded-xl border-2 p-3 text-right text-sm font-medium ${
                  stage2Selected === opt ? "border-indigo-500 bg-indigo-100" : "border-slate-200"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {stage2ShowFeedback && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {STAGE2_FEEDBACK}
            </div>
          )}
          {!stage2ShowFeedback ? (
            <button
              type="button"
              disabled={!stage2Selected}
              onClick={handleStage2Submit}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              تحقق
            </button>
          ) : (
            <button type="button" onClick={goStage2Next} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              التالي: اربط الخاصية بالإلكترونات
            </button>
          )}
        </section>
      )}

      {/* المرحلة 3: اربط الخاصية بالإلكترونات */}
      {stage === 3 && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">اسحبي كل خاصية إلى عدد إلكترونات التكافؤ المناسب (1، 2، 7، 8).</p>
          <div className="flex flex-wrap gap-2">
            {(stage3ItemOrder.length ? stage3ItemOrder : STAGE3_ITEMS).map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setStage3Dragging(item.id)}
                onDragEnd={() => setStage3Dragging(null)}
                className={`cursor-grab rounded-lg border-2 px-3 py-2 text-sm ${
                  stage3Placements[item.id] != null ? "border-slate-300 bg-slate-100" : "border-indigo-300 bg-indigo-50"
                } touch-manipulation`}
              >
                {item.text}
                {stage3Placements[item.id] != null && (
                  <span className="mr-1 text-xs">→ تكافؤ {stage3Placements[item.id]}</span>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(stage3ValenceOrder.length ? stage3ValenceOrder : [1, 2, 7, 8]).map((v) => (
              <div
                key={v}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (stage3Dragging) setStage3Placements((p) => ({ ...p, [stage3Dragging]: v }))
                  setStage3Dragging(null)
                }}
                className="min-h-[60px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-2 text-center"
              >
                <p className="font-bold text-slate-700">تكافؤ {v}</p>
                {STAGE3_ITEMS.filter((i) => stage3Placements[i.id] === v).map((i) => (
                  <p key={i.id} className="text-xs text-slate-600">{i.text.split("–")[0]}</p>
                ))}
              </div>
            ))}
          </div>
          {stage3Filled && (
            <p className={stage3Correct ? "text-emerald-700 font-medium" : "text-amber-700"}>
              {stage3Correct ? "✓ ربط صحيح!" : "راجعي الربط."}
            </p>
          )}
          <button
            type="button"
            onClick={goStage3Next}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            التالي: من لا ينتمي؟
          </button>
        </section>
      )}

      {/* المرحلة 4: من لا ينتمي للعائلة؟ */}
      {stage === 4 && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">ثلاثة عناصر من عائلة واحدة، وواحد دخيل. اختر العنصر المختلف.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {stage4Set.elements.map((el, idx) => (
              <button
                key={`${el.symbol}-${idx}`}
                type="button"
                disabled={stage4ShowResult}
                onClick={() => handleStage4Select(idx)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-3 font-bold transition ${
                  stage4Selected === idx
                    ? stage4ShowResult && idx === stage4Set.intruderIndex
                      ? "border-emerald-500 bg-emerald-100"
                      : stage4ShowResult && idx !== stage4Set.intruderIndex
                        ? "border-rose-500 bg-rose-100"
                        : "border-indigo-500 bg-indigo-100"
                    : "border-slate-200 bg-white hover:border-indigo-300"
                }`}
              >
                <LewisDotView symbol={el.symbol} valence={el.valence} />
                <span>{el.symbol} – {el.nameAr}</span>
                {stage4ShowResult && idx === stage4Set.intruderIndex && (
                  <span className="block text-xs font-normal text-emerald-700">الدخيل – تكافؤ مختلف ({el.valence})</span>
                )}
              </button>
            ))}
          </div>
          {stage4ShowResult && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800">
              العنصر الدخيل له عدد إلكترونات تكافؤ مختلف عن بقية العائلة، لذلك لا ينتمي لها.
            </div>
          )}
          <button
            type="button"
            onClick={goStage4Next}
            disabled={!stage4ShowResult}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {stage4SetIndex < STAGE4_SETS.length - 1 ? "مجموعة التالية" : "التحدي الختامي"}
          </button>
        </section>
      )}

      {/* المرحلة 5: التحدي الختامي */}
      {stage === 5 && (
        <section className="space-y-4">
          <p className="text-sm text-slate-600">
            حسب عدد إلكترونات التكافؤ والخصائص، حدد العائلة الدورية المناسبة واكتب تبريراً قصيراً.
          </p>
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
            <p className="font-bold text-indigo-900">عدد إلكترونات التكافؤ: {stage5Challenge.valence}</p>
            <p className="mt-1 text-sm text-indigo-800">{stage5Challenge.description}</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">العائلة الدورية:</p>
            <div className="flex flex-wrap gap-2">
              {FAMILIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  disabled={stage5Submitted}
                  onClick={() => setStage5SelectedFamily(f.id)}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium ${
                    stage5SelectedFamily === f.id ? "border-indigo-500 bg-indigo-100" : "border-slate-200"
                  }`}
                >
                  {f.nameAr}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">تبرير (جملة تفسيرية):</label>
            <textarea
              value={stage5Justification}
              onChange={(e) => setStage5Justification(e.target.value)}
              disabled={stage5Submitted}
              placeholder="مثال: لأن التكافؤ 1 يميز الفلزات القلوية..."
              className="w-full rounded-xl border-2 border-slate-200 p-3 text-sm"
              rows={2}
            />
          </div>
          {stage5Submitted && (
            <p className={stage5Correct ? "text-emerald-700 font-medium" : "text-amber-700"}>
              {stage5Correct ? "✓ إجابة وتبرير صحيحان!" : "راجعي العائلة والتبرير."}
            </p>
          )}
          {!stage5Submitted ? (
            <button
              type="button"
              disabled={!stage5SelectedFamily || stage5Justification.trim().length < 5}
              onClick={handleStage5Submit}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              تحقق
            </button>
          ) : (
            <button type="button" onClick={goStage5Next} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              {stage5ChallengeIndex < STAGE5_CHALLENGES.length - 1 ? "تحدٍّ التالي" : "إنهاء اللعبة"}
            </button>
          )}
        </section>
      )}

      {stage === 6 && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-2xl font-bold text-emerald-800">🎉 انتهيت من سر العائلة الدورية!</p>
          <p className="mt-2 text-emerald-700">ستظهر نتيجتك في التقرير الختامي.</p>
        </div>
      )}
    </div>
  )
}
