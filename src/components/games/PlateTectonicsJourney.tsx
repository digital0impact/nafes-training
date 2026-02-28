"use client"

/**
 * لعبة رحلة في الصفائح التكتونية – Journey Through Tectonic Plates
 * أهداف: نظرية الصفائح، مكونات الصفائح، صفائح قارية ومحيطية، الغلاف الصخري واللدن والصفائح،
 * حدود الصفائح (تقاربية، تباعدية، انزلاقية)، البراكين والزلازل، الوديان المتصدعة، أسباب حركة الصفائح.
 *
 * المستوى 1: بنية الأرض – سحب التسميات (غلاف صخري، غلاف لدن، صفيحة تكتونية)
 * المستوى 2: أنواع الصفائح (قارية / محيطية)
 * المستوى 3: حدود الصفائح (تقاربية، تباعدية، انزلاقية)
 * المستوى 4: خريطة الزلازل والبراكين وربطها بحدود الصفائح
 * المستوى 5: الحدود التباعدية والوديان المتصدعة
 * المستوى 6: لماذا تتحرك الصفائح؟
 */
import { useState, useCallback, useEffect, useMemo } from "react"
import type { PlateTectonicsJourneyGameData } from "@/types/games"

type EducationalGameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type PlateTectonicsJourneyProps = {
  gameData: PlateTectonicsJourneyGameData
  game: EducationalGameMeta
  onComplete: (result: { score: number; answers?: { [key: string]: unknown }; timeSpent: number }) => void
}

function shuffleOptions<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// ─── المستوى 1: مناطق السحب (مقطع الأرض) ─────────────────────────────────
const LAYER_IDS = ["lithosphere", "asthenosphere", "plate"] as const
const LABELS: { id: (typeof LAYER_IDS)[number]; text: string }[] = [
  { id: "lithosphere", text: "الغلاف الصخري (ليثوسفير)" },
  { id: "asthenosphere", text: "الغلاف اللدن (أستينوسفير)" },
  { id: "plate", text: "صفيحة تكتونية" },
]

// ─── المستوى 2: أنواع الصفائح ─────────────────────────────────────────────
const PLATE_ITEMS = [
  { id: "p1", name: "صفيحة المحيط الهادئ", type: "محيطية" as const, thickness: "أرق (حوالي 5–10 كم)", density: "أكثر كثافة" },
  { id: "p2", name: "الصفيحة الأفريقية", type: "قارية" as const, thickness: "أسمك (حوالي 25–70 كم)", density: "أقل كثافة" },
  { id: "p3", name: "صفيحة نازكا", type: "محيطية" as const, thickness: "أرق", density: "أكثر كثافة" },
  { id: "p4", name: "الصفيحة الأوراسية", type: "قارية" as const, thickness: "أسمك", density: "أقل كثافة" },
]

// ─── المستوى 3: حدود الصفائح ──────────────────────────────────────────────
const BOUNDARY_SCENARIOS = [
  { id: "b1", motion: "تقارب الصفيحتين", correct: "تقاربية", features: "جبال، براكين، زلازل، خنادق محيطية" },
  { id: "b2", motion: "تباعد الصفيحتين", correct: "تباعدية", features: "أعراف وسط المحيط، براكين، زلازل، تشكل قشرة جديدة" },
  { id: "b3", motion: "انزلاق الصفيحتين جنباً إلى جنب", correct: "انزلاقية", features: "زلازل، صدوع تحويلية" },
]

// ─── المستوى 4: الزلازل والبراكين وحدود الصفائح ───────────────────────────
const EVENT_ITEMS = [
  { id: "e1", icon: "🌋", name: "حلقة النار (براكين المحيط الهادئ)", boundary: "تقاربية" },
  { id: "e2", icon: "🌊", name: "أعراف وسط المحيط الأطلسي", boundary: "تباعدية" },
  { id: "e3", icon: "⚠️", name: "صدع سان أندرياس (كاليفورنيا)", boundary: "انزلاقية" },
  { id: "e4", icon: "🌋", name: "براكين أيسلندا", boundary: "تباعدية" },
]

// ─── المستوى 5: الوديان المتصدعة ──────────────────────────────────────────
const RIFT_EXAMPLES = [
  { id: "r1", name: "الوادي المتصدع الأفريقي (شرق أفريقيا)", correct: true },
  { id: "r2", name: "خندق ماريانا", correct: false },
  { id: "r3", name: "جبال الهيمالايا", correct: false },
  { id: "r4", name: "البحر الأحمر (بداية صدع)", correct: true },
]

// ─── المستوى 6: أسباب حركة الصفائح ────────────────────────────────────────
const LEVEL6_QUESTIONS = [
  {
    id: "q1",
    question: "ما الذي يحرك الصفائح التكتونية؟",
    options: [
      "تيارات الحمل في الغلاف اللدن (الأسينوسفير) الناتجة عن اختلاف درجة الحرارة",
      "جاذبية القمر فقط",
      "دوران الأرض فقط",
      "الرياح",
    ],
    correct: "تيارات الحمل في الغلاف اللدن (الأسينوسفير) الناتجة عن اختلاف درجة الحرارة",
  },
  {
    id: "q2",
    question: "من فوائد حركة الصفائح:",
    options: [
      "تشكل الجبال واليابسة، تجديد الموارد، إعادة تدوير القشرة، تشكل المحيطات",
      "زيادة الزلازل فقط",
      "اختفاء البراكين",
      "لا توجد فوائد",
    ],
    correct: "تشكل الجبال واليابسة، تجديد الموارد، إعادة تدوير القشرة، تشكل المحيطات",
  },
]

const BADGES = [
  { id: "plate_expert", name: "خبير الصفائح التكتونية", minLevel: 1 },
  { id: "volcano_observer", name: "مراقب البراكين", minLevel: 4 },
  { id: "earthquake_analyst", name: "محلل الزلازل", minLevel: 6 },
]

export default function PlateTectonicsJourney({ gameData, game, onComplete }: PlateTectonicsJourneyProps) {
  const [startTime] = useState(Date.now())
  const [currentLevel, setCurrentLevel] = useState(1)
  const [totalScore, setTotalScore] = useState(0)
  const [levelScores, setLevelScores] = useState<{ [key: number]: number }>({})
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])

  const [level1Drops, setLevel1Drops] = useState<{ [key: string]: string }>({})
  const [level1SelectedLabel, setLevel1SelectedLabel] = useState<string>("")
  const [level1Submitted, setLevel1Submitted] = useState(false)

  const [level2Answers, setLevel2Answers] = useState<{ [key: string]: "قارية" | "محيطية" }>({})
  const [level2Submitted, setLevel2Submitted] = useState(false)

  const [level3Index, setLevel3Index] = useState(0)
  const [level3Choice, setLevel3Choice] = useState<string>("")
  const [level3Submitted, setLevel3Submitted] = useState(false)

  const [level4Matches, setLevel4Matches] = useState<{ [key: string]: string }>({})
  const [level4Submitted, setLevel4Submitted] = useState(false)

  const [level5Selected, setLevel5Selected] = useState<string[]>([])
  const [level5Submitted, setLevel5Submitted] = useState(false)

  const [level6Index, setLevel6Index] = useState(0)
  const [level6Answer, setLevel6Answer] = useState("")
  const [level6Submitted, setLevel6Submitted] = useState(false)

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
    if (currentLevel === 7) finishGame()
  }, [currentLevel, finishGame])

  useEffect(() => {
    const badges: string[] = []
    if (currentLevel >= 1) badges.push("plate_expert")
    if (currentLevel >= 4) badges.push("volcano_observer")
    if (currentLevel >= 6) badges.push("earthquake_analyst")
    setEarnedBadges(badges)
  }, [currentLevel])

  const progressPercent = (currentLevel / 7) * 100
  const stars = Math.min(5, Math.floor((totalScore / 100) * 5) + (currentLevel >= 6 ? 1 : 0))

  const level1Correct =
    level1Drops["zone_lithosphere"] === "lithosphere" &&
    level1Drops["zone_asthenosphere"] === "asthenosphere" &&
    level1Drops["zone_plate"] === "plate"
  const level1Score = level1Submitted ? (level1Correct ? 100 : 0) : 0

  const level2CorrectCount = PLATE_ITEMS.filter((p) => level2Answers[p.id] === p.type).length
  const level2Score = level2Submitted ? Math.round((level2CorrectCount / PLATE_ITEMS.length) * 100) : 0

  const scenario3 = BOUNDARY_SCENARIOS[level3Index]
  const level3Correct = scenario3 && level3Choice === scenario3.correct
  const level3Score = level3Submitted ? (level3Correct ? 100 : 0) : 0

  const level4CorrectCount = EVENT_ITEMS.filter((e) => level4Matches[e.id] === e.boundary).length
  const level4Score = level4Submitted ? Math.round((level4CorrectCount / EVENT_ITEMS.length) * 100) : 0

  const level5CorrectIds = useMemo(() => RIFT_EXAMPLES.filter((r) => r.correct).map((r) => r.id), [])
  const level5Correct =
    level5Selected.length === level5CorrectIds.length &&
    level5CorrectIds.every((id) => level5Selected.includes(id)) &&
    level5Selected.every((id) => level5CorrectIds.includes(id))
  const level5Score = level5Submitted ? (level5Correct ? 100 : 0) : 0

  const q6 = LEVEL6_QUESTIONS[level6Index]
  const level6Correct = q6 && level6Answer === q6.correct
  const level6Score = level6Submitted ? (level6Correct ? 100 : 0) : 0

  const labelsShuffled = useMemo(() => shuffleOptions(LABELS), [currentLevel])
  const level4BoundaryOptions = useMemo(
    () => shuffleOptions(["تقاربية", "تباعدية", "انزلاقية"]),
    [currentLevel]
  )
  const level6OptionsShuffled = useMemo(
    () => (q6 ? shuffleOptions(q6.options) : []),
    [level6Index]
  )

  return (
    <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 sm:p-6" dir="rtl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-sky-900">رحلة في الصفائح التكتونية</h2>
        <span className="text-sm font-semibold text-slate-500">المستوى {Math.min(currentLevel, 6)} من 6</span>
        <div className="flex items-center gap-2">
          <span className="text-sky-600">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">{totalScore} نقطة</span>
        </div>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {earnedBadges.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {BADGES.filter((b) => earnedBadges.includes(b.id)).map((b) => (
            <span key={b.id} className="inline-flex rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800">
              🏅 {b.name}
            </span>
          ))}
        </div>
      )}

      {/* المستوى 1: بنية الأرض – سحب التسميات */}
      {currentLevel === 1 && (
        <section className="space-y-4">
          <h3 className="font-bold text-sky-900">المستوى 1: بنية الأرض واستكشاف الطبقات</h3>
          <p className="text-sm text-slate-600">اسحبي كل تسمية إلى مكانها الصحيح في المقطع.</p>
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
            <p className="text-xs text-slate-600 mb-2">مقطع تخطيطي للأرض (من الأعلى للأسفل): صفيحة تكتونية ← غلاف صخري ← غلاف لدن.</p>
            <div className="flex flex-col gap-2">
              {(["zone_plate", "zone_lithosphere", "zone_asthenosphere"] as const).map((zoneId) => (
                <div
                  key={zoneId}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (level1Submitted || !level1SelectedLabel) return
                    const prevZone = Object.keys(level1Drops).find((z) => level1Drops[z] === level1SelectedLabel)
                    setLevel1Drops((d) => {
                      const next = { ...d }
                      if (prevZone) next[prevZone] = ""
                      next[zoneId] = level1SelectedLabel
                      return next
                    })
                  }}
                  className={`h-14 rounded-lg border-2 flex items-center justify-center text-sm cursor-pointer ${zoneId === "zone_plate" ? "border-amber-400 bg-amber-100" : zoneId === "zone_lithosphere" ? "border-stone-400 bg-stone-200" : "border-orange-300 bg-orange-100"}`}
                >
                  {level1Drops[zoneId] ? LABELS.find((l) => l.id === level1Drops[zoneId])?.text : "اختيري تسمية ثم انقري هنا"}
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">اختياري تسمية ثم انقري على منطقة في المقطع:</p>
          <div className="flex flex-wrap gap-2">
            {labelsShuffled.map((l) => (
              <button
                key={l.id}
                type="button"
                disabled={level1Submitted}
                onClick={() => setLevel1SelectedLabel(l.id)}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm ${level1SelectedLabel === l.id ? "border-sky-500 bg-sky-100" : "border-slate-200"}`}
              >
                {l.text}
              </button>
            ))}
          </div>
          {level1Submitted && (
            <p className={level1Correct ? "text-emerald-700 font-medium" : "text-amber-700"}>
              {level1Correct ? "✓ صحيح. الغلاف الصخري يعلو الغلاف اللدن، والصفائح التكتونية أجزاء من الغلاف الصخري." : "جرّبي مرة أخرى: الغلاف الصخري (صلب)، الغلاف اللدن (لزج)، الصفيحة التكتونية جزء من الغلاف الصخري."}
            </p>
          )}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            {currentLevel > 1 && (
              <button type="button" onClick={() => setCurrentLevel(0)} className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                ← السابق
              </button>
            )}
            {!level1Submitted ? (
              <button
                type="button"
                onClick={() => {
                  setLevel1Submitted(true)
                  const s = level1Correct ? 100 : 0
                  setLevelScores((x) => ({ ...x, 1: s }))
                  setTotalScore((t) => t + s)
                }}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              >
                تحقق
              </button>
            ) : (
              <button type="button" onClick={() => setCurrentLevel(2)} className="rounded-xl border-2 border-sky-500 bg-white px-5 py-2 text-sm font-semibold text-sky-700">
                التالي ←
              </button>
            )}
          </div>
        </section>
      )}

      {/* المستوى 2: أنواع الصفائح */}
      {currentLevel === 2 && (
        <section className="space-y-4">
          <h3 className="font-bold text-sky-900">المستوى 2: أنواع الصفائح</h3>
          <p className="text-sm text-slate-600">صنّفي كل صفيحة: قارية أو محيطية (وفق السمك والكثافة).</p>
          <div className="space-y-3">
            {PLATE_ITEMS.map((p) => (
              <div key={p.id} className="rounded-xl border-2 border-slate-200 p-3">
                <p className="font-medium text-slate-900">{p.name}</p>
                <p className="text-xs text-slate-600">السمك: {p.thickness} — الكثافة: {p.density}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={level2Submitted}
                    onClick={() => setLevel2Answers((a) => ({ ...a, [p.id]: "قارية" }))}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm ${level2Answers[p.id] === "قارية" ? "border-sky-500 bg-sky-100" : "border-slate-200"}`}
                  >
                    قارية
                  </button>
                  <button
                    type="button"
                    disabled={level2Submitted}
                    onClick={() => setLevel2Answers((a) => ({ ...a, [p.id]: "محيطية" }))}
                    className={`rounded-lg border-2 px-3 py-1.5 text-sm ${level2Answers[p.id] === "محيطية" ? "border-sky-500 bg-sky-100" : "border-slate-200"}`}
                  >
                    محيطية
                  </button>
                </div>
              </div>
            ))}
          </div>
          {level2Submitted && (
            <p className="text-sm text-slate-700">الإجابات الصحيحة: صفيحة المحيط الهادئ ونازكا محيطية؛ الأفريقية والأوراسية قارية.</p>
          )}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            <button type="button" onClick={() => setCurrentLevel(1)} className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">← السابق</button>
            {!level2Submitted ? (
              <button
                type="button"
                onClick={() => {
                  const correct = PLATE_ITEMS.filter((x) => level2Answers[x.id] === x.type).length
                  const score = Math.round((correct / PLATE_ITEMS.length) * 100)
                  setLevel2Submitted(true)
                  setLevelScores((x) => ({ ...x, 2: score }))
                  setTotalScore((t) => t + score)
                }}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              >
                تحقق
              </button>
            ) : (
              <button type="button" onClick={() => setCurrentLevel(3)} className="rounded-xl border-2 border-sky-500 bg-white px-5 py-2 text-sm font-semibold text-sky-700">التالي ←</button>
            )}
          </div>
        </section>
      )}

      {/* المستوى 3: حدود الصفائح */}
      {currentLevel === 3 && scenario3 && (
        <section className="space-y-4">
          <h3 className="font-bold text-sky-900">المستوى 3: حدود الصفائح المتحركة</h3>
          <p className="text-sm text-slate-600">حددي نوع الحد الذي يتوافق مع وصف الحركة.</p>
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-4">
            <p className="font-bold text-sky-900">الحركة: {scenario3.motion}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {shuffleOptions([...["تقاربية", "تباعدية", "انزلاقية"]]).map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={level3Submitted}
                onClick={() => setLevel3Choice(opt)}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-medium ${level3Choice === opt ? "border-sky-500 bg-sky-100" : "border-slate-200"}`}
              >
                {opt}
              </button>
            ))}
          </div>
          {level3Submitted && (
            <p className="text-sm text-slate-700">
              {level3Correct ? "✓ صحيح." : "الإجابة الصحيحة: " + scenario3.correct + ". "}
              الناتج: {scenario3.features}
            </p>
          )}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            <button type="button" onClick={() => setCurrentLevel(2)} className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">← السابق</button>
            {!level3Submitted ? (
              <button
                type="button"
                onClick={() => {
                  const correct = level3Choice === scenario3.correct
                  setLevel3Submitted(true)
                  const score = correct ? 100 : 0
                  setLevelScores((x) => ({ ...x, 3: score }))
                  setTotalScore((t) => t + score)
                }}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              >
                تحقق
              </button>
            ) : (
              <>
                {level3Index < BOUNDARY_SCENARIOS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLevel3Index((i) => i + 1)
                      setLevel3Choice("")
                      setLevel3Submitted(false)
                    }}
                    className="rounded-xl border-2 border-sky-500 bg-white px-5 py-2 text-sm font-semibold text-sky-700"
                  >
                    سيناريو التالي
                  </button>
                ) : (
                  <button type="button" onClick={() => setCurrentLevel(4)} className="rounded-xl border-2 border-sky-500 bg-white px-5 py-2 text-sm font-semibold text-sky-700">التالي ←</button>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* المستوى 4: خريطة الزلازل والبراكين */}
      {currentLevel === 4 && (
        <section className="space-y-4">
          <h3 className="font-bold text-sky-900">المستوى 4: الزلازل والبراكين وحدود الصفائح</h3>
          <p className="text-sm text-slate-600">اربطي كل ظاهرة بنوع الحد التكتوني المرتبط بها.</p>
          <div className="space-y-3">
            {EVENT_ITEMS.map((e) => (
              <div key={e.id} className="rounded-xl border-2 border-slate-200 p-3">
                <p className="font-medium text-slate-900">{e.icon} {e.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {level4BoundaryOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={level4Submitted}
                      onClick={() => setLevel4Matches((m) => ({ ...m, [e.id]: opt }))}
                      className={`rounded-lg border-2 px-3 py-1.5 text-sm ${level4Matches[e.id] === opt ? "border-sky-500 bg-sky-100" : "border-slate-200"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {level4Submitted && (
            <p className="text-sm text-slate-700">البراكين والزلازل تتركز عند حدود الصفائح (تقاربية، تباعدية، انزلاقية) بسبب حركة الصفائح والاحتكاك والانصهار.</p>
          )}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            <button type="button" onClick={() => setCurrentLevel(3)} className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">← السابق</button>
            {!level4Submitted ? (
              <button
                type="button"
                onClick={() => {
                  const correct = EVENT_ITEMS.filter((e) => level4Matches[e.id] === e.boundary).length
                  const score = Math.round((correct / EVENT_ITEMS.length) * 100)
                  setLevel4Submitted(true)
                  setLevelScores((x) => ({ ...x, 4: score }))
                  setTotalScore((t) => t + score)
                }}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              >
                تحقق
              </button>
            ) : (
              <button type="button" onClick={() => setCurrentLevel(5)} className="rounded-xl border-2 border-sky-500 bg-white px-5 py-2 text-sm font-semibold text-sky-700">التالي ←</button>
            )}
          </div>
        </section>
      )}

      {/* المستوى 5: الوديان المتصدعة */}
      {currentLevel === 5 && (
        <section className="space-y-4">
          <h3 className="font-bold text-sky-900">المستوى 5: الحدود التباعدية والوديان المتصدعة</h3>
          <p className="text-sm text-slate-600">عند تباعد صفيحتين قاريتين يتشكل وادي متصدع. اختاري الأمثلة الحقيقية للوديان المتصدعة.</p>
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-sm">
            الوادي المتصدع: انخفاض طويل ضيق يتكون عند تباعد الصفائح (حدود تباعدية على اليابسة).
          </div>
          <div className="space-y-2">
            {RIFT_EXAMPLES.map((r) => (
              <label key={r.id} className="flex items-center gap-3 rounded-xl border-2 border-slate-200 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={level5Selected.includes(r.id)}
                  onChange={() => {
                    if (level5Submitted) return
                    setLevel5Selected((prev) =>
                      prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]
                    )
                  }}
                  className="h-5 w-5"
                />
                <span>{r.name}</span>
              </label>
            ))}
          </div>
          {level5Submitted && (
            <p className="text-sm text-slate-700">أمثلة صحيحة: الوادي المتصدع الأفريقي، والبحر الأحمر (مناطق تباعد). خندق ماريانا والهيمالايا ليست ودياناً متصدعة.</p>
          )}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            <button type="button" onClick={() => setCurrentLevel(4)} className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">← السابق</button>
            {!level5Submitted ? (
              <button
                type="button"
                onClick={() => {
                  const correct = level5CorrectIds.length === level5Selected.length && level5CorrectIds.every((id) => level5Selected.includes(id))
                  setLevel5Submitted(true)
                  const score = correct ? 100 : 0
                  setLevelScores((x) => ({ ...x, 5: score }))
                  setTotalScore((t) => t + score)
                }}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              >
                تحقق
              </button>
            ) : (
              <button type="button" onClick={() => setCurrentLevel(6)} className="rounded-xl border-2 border-sky-500 bg-white px-5 py-2 text-sm font-semibold text-sky-700">التالي ←</button>
            )}
          </div>
        </section>
      )}

      {/* المستوى 6: لماذا تتحرك الصفائح؟ */}
      {currentLevel === 6 && q6 && (
        <section className="space-y-4">
          <h3 className="font-bold text-sky-900">المستوى 6: لماذا تتحرك الصفائح؟</h3>
          <p className="text-sm text-slate-600">{q6.question}</p>
          <div className="space-y-2">
            {level6OptionsShuffled.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={level6Submitted}
                onClick={() => setLevel6Answer(opt)}
                className={`block w-full rounded-xl border-2 p-3 text-right text-sm ${level6Answer === opt ? "border-sky-500 bg-sky-50" : "border-slate-200"}`}
              >
                {opt}
              </button>
            ))}
          </div>
          {level6Submitted && (
            <p className="text-sm text-slate-700">{level6Correct ? "✓ صحيح." : "الإجابة الصحيحة: " + q6.correct}</p>
          )}
          <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-3">
            <button type="button" onClick={() => setCurrentLevel(5)} className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">← السابق</button>
            {!level6Submitted ? (
              <button
                type="button"
                disabled={!level6Answer}
                onClick={() => {
                  const correct = level6Answer === q6.correct
                  setLevel6Submitted(true)
                  const score = correct ? 100 : 0
                  setLevelScores((x) => ({ ...x, 6: score }))
                  setTotalScore((t) => t + score)
                }}
                className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                تحقق
              </button>
            ) : (
              level6Index < LEVEL6_QUESTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setLevel6Index((i) => i + 1)
                    setLevel6Answer("")
                    setLevel6Submitted(false)
                  }}
                  className="rounded-xl border-2 border-sky-500 bg-white px-5 py-2 text-sm font-semibold text-sky-700"
                >
                  سؤال التالي
                </button>
              ) : (
                <button type="button" onClick={() => setCurrentLevel(7)} className="rounded-xl border-2 border-sky-500 bg-white px-5 py-2 text-sm font-semibold text-sky-700">إنهاء اللعبة</button>
              )
            )}
          </div>
        </section>
      )}

      {/* شاشة النهاية */}
      {currentLevel === 7 && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6" dir="rtl">
          <p className="text-2xl font-bold text-emerald-800">🎉 انتهيت من رحلة الصفائح التكتونية!</p>
          <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4">
            <h4 className="font-bold text-slate-800 mb-2">ملخص الأداء</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              {[1, 2, 3, 4, 5, 6].map((l) => (
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
