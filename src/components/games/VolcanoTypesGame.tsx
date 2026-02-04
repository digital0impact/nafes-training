"use client"

/**
 * لعبة بركانك الصحيح - أنواع البراكين (3 مستويات)
 * Level 1: مطابقة صورة البركان واسمه ومميزاته
 * Level 2: أمثلة حقيقية (يذكر مثالًا على كل نوع)
 * Level 3: تحدي زمني (10 ثوانٍ لكل سؤال)
 */
import { useState, useEffect, useCallback } from "react"
import type { VolcanoTypesGameData } from "@/types/games"

// أيقونة بركان SVG مبسطة (شكل مثلث مع فوهة)
const VolcanoSvg = () => (
  <svg
    viewBox="0 0 120 100"
    className="w-full max-w-[200px] mx-auto block"
    aria-hidden
  >
    <defs>
      <linearGradient id="volcanoGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#6b7280" />
        <stop offset="100%" stopColor="#9ca3af" />
      </linearGradient>
    </defs>
    {/* جسم البركان */}
    <path
      d="M 20 95 L 60 25 L 100 95 Z"
      fill="url(#volcanoGrad)"
      stroke="#4b5563"
      strokeWidth="1"
    />
    {/* فوهة */}
    <ellipse cx="60" cy="28" rx="12" ry="5" fill="#374151" />
    {/* دخان خفيف */}
    <path d="M 52 22 Q 60 12 68 22" stroke="#9ca3af" strokeWidth="2" fill="none" opacity="0.6" />
  </svg>
)

type EducationalGameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type VolcanoTypesGameProps = {
  gameData: VolcanoTypesGameData
  game: EducationalGameMeta
  onComplete: (result: { score: number; answers: Record<string, unknown>; timeSpent: number }) => void
}

const TYPE_NAMES = ["درعي", "مخروطي", "مركب", "ثوران الشقوق"] as const

// أمثلة حقيقية للمستوى 3: [اسم المثال، نوع البركان name_ar]
const LEVEL3_EXAMPLES: Array<{ exampleName: string; typeNameAr: string }> = [
  { exampleName: "ماونا لوا", typeNameAr: "درعي" },
  { exampleName: "جبل فيزوف", typeNameAr: "مركب" },
  { exampleName: "جبل سانت هيلين", typeNameAr: "مخروطي" },
  { exampleName: "شقوق آيسلندا", typeNameAr: "ثوران الشقوق" },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export default function VolcanoTypesGame({ gameData, game, onComplete }: VolcanoTypesGameProps) {
  const types = gameData.volcanoTypes
  const timePerQuestion = gameData.level4TimePerQuestion ?? 10

  const [currentLevel, setCurrentLevel] = useState(1)
  const [startTime] = useState(Date.now())

  // المستوى 1: مطابقة صورة + اسم + مميزات (4 صفوف، كل صف 3 خانات)
  const [level1ImagePlacements, setLevel1ImagePlacements] = useState<(string | null)[]>(() => [null, null, null, null])
  const [level1NamePlacements, setLevel1NamePlacements] = useState<(string | null)[]>(() => [null, null, null, null])
  const [level1FeaturePlacements, setLevel1FeaturePlacements] = useState<(string | null)[]>(() => [null, null, null, null])
  const [level1SelectedCard, setLevel1SelectedCard] = useState<{ kind: "image" | "name" | "feature"; typeId: string } | null>(null)

  // المستوى 2 (أمثلة حقيقية)
  const [level3Examples] = useState(() => shuffle(LEVEL3_EXAMPLES))
  const [level3TypeOptions] = useState(() => shuffle([...TYPE_NAMES]))
  const [level3SelectedExample, setLevel3SelectedExample] = useState<string | null>(null)
  const [level3Matches, setLevel3Matches] = useState<Record<string, string>>({}) // exampleName -> typeNameAr
  const [level3ShowExplanation, setLevel3ShowExplanation] = useState<string | null>(null)

  // المستوى 4: تحدي زمني
  const [level4QuestionIndex, setLevel4QuestionIndex] = useState(0)
  const [level4Questions] = useState(() => {
    const qs: Array<{ exampleName: string; correctType: string; options: string[] }> = []
    LEVEL3_EXAMPLES.forEach(({ exampleName, typeNameAr }) => {
      qs.push({
        exampleName,
        correctType: typeNameAr,
        options: shuffle([...TYPE_NAMES]),
      })
    })
    return qs
  })
  const [level4Selected, setLevel4Selected] = useState<string | null>(null)
  const [level4TimeLeft, setLevel4TimeLeft] = useState(timePerQuestion)
  const [level4Scores, setLevel4Scores] = useState<number[]>([])
  const [level4Answered, setLevel4Answered] = useState(false)
  const [level4CorrectCount, setLevel4CorrectCount] = useState(0)
  const [level4RetryUsed, setLevel4RetryUsed] = useState(false)

  // دقة حسب نوع البركان (للتكيف والتلميحات)
  const [accuracyPerType, setAccuracyPerType] = useState<Record<string, { correct: number; total: number }>>({})

  const finishGame = useCallback(
    (level4ScoresFinal: number[]) => {
      const level1Correct = [0, 1, 2, 3].filter(
        (r) =>
          level1ImagePlacements[r] &&
          level1ImagePlacements[r] === level1NamePlacements[r] &&
          level1NamePlacements[r] === level1FeaturePlacements[r]
      ).length
      const totalQuestions = 4 + level3Examples.length + level4Questions.length
      const level3Correct = level3Examples.filter((e) => level3Matches[e.exampleName] === e.typeNameAr).length
      const level4Correct = level4ScoresFinal.reduce((a, b) => a + b, 0)
      const totalCorrect = level1Correct + level3Correct + level4Correct
      const score = Math.round((totalCorrect / totalQuestions) * 100)
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      onComplete({
        score,
        answers: {
          level1: { image: level1ImagePlacements, name: level1NamePlacements, feature: level1FeaturePlacements },
          level2: level3Matches,
          level3: level4ScoresFinal,
          accuracyPerType,
        },
        timeSpent,
      })
    },
    [
      level1ImagePlacements,
      level1NamePlacements,
      level1FeaturePlacements,
      level3Examples.length,
      level3Matches,
      level4Questions.length,
      accuracyPerType,
      onComplete,
      startTime,
    ]
  )

  const advanceLevel4 = useCallback(
    (lastScore: number) => {
      const nextScores = [...level4Scores, lastScore]
      if (level4QuestionIndex + 1 >= level4Questions.length) {
        finishGame(nextScores)
        return
      }
      setLevel4Scores(nextScores)
      setLevel4QuestionIndex((i) => i + 1)
      setLevel4Selected(null)
      setLevel4TimeLeft(timePerQuestion)
      setLevel4Answered(false)
      setLevel4RetryUsed(false)
    },
    [level4QuestionIndex, level4Questions.length, level4Scores, finishGame, timePerQuestion]
  )

  const handleLevel4Timeout = useCallback(() => {
    if (level4Answered) return
    setLevel4Answered(true)
    setLevel4Scores((prev) => {
      const next = [...prev, 0]
      if (level4QuestionIndex + 1 >= level4Questions.length) {
        setTimeout(() => finishGame(next), 1500)
      } else {
        setTimeout(() => {
          setLevel4QuestionIndex((i) => i + 1)
          setLevel4Selected(null)
          setLevel4TimeLeft(timePerQuestion)
          setLevel4Answered(false)
          setLevel4RetryUsed(false)
        }, 1500)
      }
      return next
    })
  }, [level4Answered, level4QuestionIndex, level4Questions.length, finishGame, timePerQuestion])

  // مؤقت المستوى 3 (تحدي السرعة)
  useEffect(() => {
    if (currentLevel !== 3 || level4Answered) return
    const t = setInterval(() => {
      setLevel4TimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t)
          handleLevel4Timeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [currentLevel, level4QuestionIndex, level4Answered, handleLevel4Timeout])

  const updateAccuracy = useCallback((typeId: string, correct: boolean) => {
    setAccuracyPerType((prev) => {
      const next = { ...prev }
      next[typeId] = next[typeId] || { correct: 0, total: 0 }
      next[typeId].total++
      if (correct) next[typeId].correct++
      return next
    })
  }, [])

  const handleLevel1Place = (kind: "image" | "name" | "feature", rowIndex: number) => {
    if (!level1SelectedCard || level1SelectedCard.kind !== kind) return
    const current =
      kind === "image"
        ? level1ImagePlacements[rowIndex]
        : kind === "name"
          ? level1NamePlacements[rowIndex]
          : level1FeaturePlacements[rowIndex]
    const setter =
      kind === "image"
        ? setLevel1ImagePlacements
        : kind === "name"
          ? setLevel1NamePlacements
          : setLevel1FeaturePlacements
    setter((prev) => {
      const next = [...prev]
      next[rowIndex] = level1SelectedCard!.typeId
      return next
    })
    setLevel1SelectedCard(current ? { kind, typeId: current } : null)
  }

  const handleLevel3SelectExample = (exampleName: string) => {
    if (level3Matches[exampleName]) {
      setLevel3Matches((prev) => {
        const next = { ...prev }
        delete next[exampleName]
        return next
      })
      setLevel3SelectedExample(null)
      return
    }
    setLevel3SelectedExample(level3SelectedExample === exampleName ? null : exampleName)
  }

  const handleLevel3SelectType = (typeNameAr: string) => {
    if (!level3SelectedExample) return
    const ex = level3Examples.find((e) => e.exampleName === level3SelectedExample)
    if (!ex) return
    const correct = ex.typeNameAr === typeNameAr
    setLevel3Matches((prev) => ({ ...prev, [level3SelectedExample!]: typeNameAr }))
    setLevel3SelectedExample(null)
    if (correct) {
      const vol = types.find((t) => t.name_ar === typeNameAr)
      setLevel3ShowExplanation(vol ? `${vol.example_name} (${vol.example_location}): ${vol.definition}` : null)
      setTimeout(() => setLevel3ShowExplanation(null), 4000)
    }
  }

  const handleLevel4Choice = (option: string) => {
    if (level4Answered) return
    const q = level4Questions[level4QuestionIndex]
    const correct = option === q.correctType
    setLevel4Selected(option)
    setLevel4Answered(true)
    if (correct) {
      setLevel4CorrectCount((c) => c + 1)
      const vol = types.find((t) => t.name_ar === q.correctType)
      if (vol) updateAccuracy(vol.id, true)
      setTimeout(() => advanceLevel4(1), 1500)
      return
    }
    if (level4RetryUsed) {
      const vol = types.find((t) => t.name_ar === q.correctType)
      if (vol) updateAccuracy(vol.id, false)
      setTimeout(() => advanceLevel4(0), 1500)
      return
    }
    const vol = types.find((t) => t.name_ar === q.correctType)
    if (vol) updateAccuracy(vol.id, false)
  }

  const handleLevel4Retry = () => {
    setLevel4Answered(false)
    setLevel4Selected(null)
    setLevel4TimeLeft(timePerQuestion)
    setLevel4RetryUsed(true)
  }

  const level1Complete =
    level1ImagePlacements.every(Boolean) &&
    level1NamePlacements.every(Boolean) &&
    level1FeaturePlacements.every(Boolean)
  const level1AllCorrect =
    level1Complete &&
    [0, 1, 2, 3].every(
      (r) =>
        level1ImagePlacements[r] === level1NamePlacements[r] && level1NamePlacements[r] === level1FeaturePlacements[r]
    )
  const level3Complete = level3Examples.every((e) => level3Matches[e.exampleName])

  return (
    <div className="space-y-6" dir="rtl">
      {/* شريط المستويات */}
      <div className="flex gap-2 justify-center flex-wrap">
        {[1, 2, 3].map((l) => (
          <span
            key={l}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentLevel === l ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            المستوى {l}
          </span>
        ))}
      </div>

      {/* المستوى 1: مطابقة صورة البركان واسمه ومميزاته */}
      {currentLevel === 1 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">مطابقة البركان مع اسمه ومميزاته</h3>
          <p className="text-sm text-slate-600 mb-4">
            انقري على عنصر من الأسفل ثم انقري على الخانة المناسبة في الصف. ربطي كل صورة بركان مع اسمه ومميزاته. ✔ يعرف كل نوع
          </p>
          {level1SelectedCard && (
            <p className="text-sm text-purple-700 mb-2">
              محدَد: {level1SelectedCard.kind === "image" ? "صورة" : level1SelectedCard.kind === "name" ? "اسم" : "مميزات"} — انقري على خانة في الصف لوضعه.
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-2 text-right font-semibold text-slate-700 w-24">صورة</th>
                  <th className="p-2 text-right font-semibold text-slate-700 w-28">اسم النوع</th>
                  <th className="p-2 text-right font-semibold text-slate-700">المميزات</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2, 3].map((rowIndex) => {
                  const imageId = level1ImagePlacements[rowIndex]
                  const nameId = level1NamePlacements[rowIndex]
                  const featureId = level1FeaturePlacements[rowIndex]
                  const rowCorrect =
                    imageId && nameId && featureId && imageId === nameId && nameId === featureId
                  const imageType = imageId ? types.find((t) => t.id === imageId) : null
                  const nameType = nameId ? types.find((t) => t.id === nameId) : null
                  const featureType = featureId ? types.find((t) => t.id === featureId) : null
                  return (
                    <tr
                      key={rowIndex}
                      className={`border-b border-slate-100 ${rowCorrect ? "bg-emerald-50" : ""}`}
                    >
                      <td
                        className="p-2 align-middle min-h-[80px] cursor-pointer border border-dashed border-slate-200 rounded-lg hover:border-purple-400 min-w-[100px]"
                        onClick={() => handleLevel1Place("image", rowIndex)}
                      >
                        {imageType ? (
                          <div className="flex justify-center">
                            {imageType.imagePath ? (
                              <img
                                src={imageType.imagePath}
                                alt={`بركان ${imageType.name_ar}`}
                                className="max-h-[80px] w-auto object-contain"
                              />
                            ) : (
                              <VolcanoSvg />
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 block text-center py-4">صورة</span>
                        )}
                      </td>
                      <td
                        className="p-2 align-middle cursor-pointer border border-dashed border-slate-200 rounded-lg hover:border-purple-400"
                        onClick={() => handleLevel1Place("name", rowIndex)}
                      >
                        {nameType ? (
                          <span className="font-medium text-slate-800">بركان {nameType.name_ar}</span>
                        ) : (
                          <span className="text-slate-400">اسم</span>
                        )}
                      </td>
                      <td
                        className="p-2 align-middle cursor-pointer border border-dashed border-slate-200 rounded-lg hover:border-purple-400"
                        onClick={() => handleLevel1Place("feature", rowIndex)}
                      >
                        {featureType ? (
                          <ul className="text-slate-700 list-disc list-inside text-xs space-y-0.5">
                            {featureType.characteristics.slice(0, 2).map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-slate-400">مميزات</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">الصور (انقري لتحديد ثم انقري على خانة):</p>
              <div className="flex flex-wrap gap-2">
                {types
                  .filter((t) => !level1ImagePlacements.includes(t.id))
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setLevel1SelectedCard(
                          level1SelectedCard?.kind === "image" && level1SelectedCard?.typeId === t.id
                            ? null
                            : { kind: "image", typeId: t.id }
                        )
                      }
                      className={`rounded-lg border-2 p-1 ${
                        level1SelectedCard?.kind === "image" && level1SelectedCard?.typeId === t.id
                          ? "border-purple-500 bg-purple-100"
                          : "border-slate-200 hover:border-purple-300"
                      }`}
                    >
                      {t.imagePath ? (
                        <img src={t.imagePath} alt="" className="h-14 w-auto object-contain" />
                      ) : (
                        <VolcanoSvg />
                      )}
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">الأسماء:</p>
              <div className="flex flex-wrap gap-2">
                {types
                  .filter((t) => !level1NamePlacements.includes(t.id))
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setLevel1SelectedCard(
                          level1SelectedCard?.kind === "name" && level1SelectedCard?.typeId === t.id
                            ? null
                            : { kind: "name", typeId: t.id }
                        )
                      }
                      className={`rounded-lg border-2 px-3 py-2 text-sm ${
                        level1SelectedCard?.kind === "name" && level1SelectedCard?.typeId === t.id
                          ? "border-purple-500 bg-purple-100"
                          : "border-slate-200 hover:border-purple-300"
                      }`}
                    >
                      بركان {t.name_ar}
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">المميزات:</p>
              <div className="flex flex-wrap gap-2">
                {types
                  .filter((t) => !level1FeaturePlacements.includes(t.id))
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setLevel1SelectedCard(
                          level1SelectedCard?.kind === "feature" && level1SelectedCard?.typeId === t.id
                            ? null
                            : { kind: "feature", typeId: t.id }
                        )
                      }
                      className={`rounded-lg border-2 px-3 py-2 text-right text-xs max-w-[180px] ${
                        level1SelectedCard?.kind === "feature" && level1SelectedCard?.typeId === t.id
                          ? "border-purple-500 bg-purple-100"
                          : "border-slate-200 hover:border-purple-300"
                      }`}
                    >
                      {t.characteristics.slice(0, 2).join("، ")}
                    </button>
                  ))}
              </div>
            </div>
          </div>
          {level1Complete && (
            <p className={`mt-3 text-sm font-medium ${level1AllCorrect ? "text-emerald-700" : "text-amber-700"}`}>
              {level1AllCorrect
                ? "✓ كل المطابقات صحيحة! يمكنك الانتقال للمستوى التالي."
                : "راجعي الصفوف — بعض المطابقات غير صحيحة (اللون الأخضر = صف صحيح). يمكنك تصحيح أي صف بالنقر على عنصر من الأسفل ثم النقر على الخانة الخاطئة."}
            </p>
          )}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setCurrentLevel(2)}
              disabled={!level1Complete}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              التالي ← المستوى 2 (أمثلة حقيقية)
            </button>
          </div>
        </div>
      )}

      {/* المستوى 2: أمثلة حقيقية (Real-World Examples) */}
      {currentLevel === 2 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">أمثلة حقيقية</h3>
          <p className="text-sm text-slate-600 mb-4">
            اربطي كل مثال بنوع البركان. ماونا لوا→درعي، فيزوف→مركب، سانت هيلين→مخروطي، شقوق آيسلندا→ثوران الشقوق. ✔ يذكر مثالًا على كل نوع. يمكنك النقر على مثال مُجاب لإلغاء الإجابة وتصحيحها.
          </p>
          {level3ShowExplanation && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
              {level3ShowExplanation}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">أمثلة:</p>
              <div className="space-y-2">
                {level3Examples.map((e) => (
                  <button
                    key={e.exampleName}
                    onClick={() => handleLevel3SelectExample(e.exampleName)}
                    className={`w-full p-4 rounded-xl border-2 text-right font-medium transition ${
                      level3SelectedExample === e.exampleName
                        ? "bg-purple-200 border-purple-500"
                        : level3Matches[e.exampleName]
                          ? "bg-slate-100 border-slate-300 text-slate-500"
                          : "bg-white border-slate-200 hover:border-purple-400"
                    }`}
                  >
                    {e.exampleName} {level3Matches[e.exampleName] && `→ ${level3Matches[e.exampleName]}`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">أنواع البراكين:</p>
              <div className="space-y-2">
                {level3TypeOptions.map((name) => (
                  <button
                    key={name}
                    onClick={() => handleLevel3SelectType(name)}
                    disabled={!level3SelectedExample}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white text-right font-medium hover:border-purple-400 disabled:opacity-50"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentLevel(1)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              ← السابق
            </button>
            <button
              onClick={() => setCurrentLevel(3)}
              disabled={!level3Complete}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              التالي ← المستوى 3 (تحدي السرعة)
            </button>
          </div>
        </div>
      )}

      {/* المستوى 3: تحدي السرعة (Speed Challenge) */}
      {currentLevel === 3 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">تحدي السرعة (المستوى 3)</h3>
          <p className="text-sm text-slate-600 mb-2">أسئلة اختيار من متعدد ({timePerQuestion} ثوانٍ لكل سؤال). شريط التقدم والنقاط.</p>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                سؤال {level4QuestionIndex + 1} / {level4Questions.length}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-mono">
                ⏱ {level4TimeLeft}
              </span>
            </div>
            <div className="h-2 flex-1 max-w-[200px] bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${((level4QuestionIndex + (level4Answered ? 1 : 0)) / level4Questions.length) * 100}%` }}
              />
            </div>
          </div>
          {level4QuestionIndex < level4Questions.length && (
            <>
              <p className="text-lg font-medium text-slate-800 mb-4">
                ما نوع بركان &quot;{level4Questions[level4QuestionIndex].exampleName}&quot;؟
              </p>
              {level4Answered &&
                level4Selected !== level4Questions[level4QuestionIndex].correctType &&
                !level4RetryUsed && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex flex-wrap items-center gap-3">
                    <span>خطأ، جرّبي مرة أخرى.</span>
                    <button
                      type="button"
                      onClick={handleLevel4Retry}
                      className="px-4 py-2 rounded-lg bg-rose-200 text-rose-900 font-medium hover:bg-rose-300"
                    >
                      حاولي مرة أخرى
                    </button>
                  </div>
                )}
              <div className="grid grid-cols-2 gap-3">
                {level4Questions[level4QuestionIndex].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleLevel4Choice(opt)}
                    disabled={level4Answered}
                    className={`p-4 rounded-xl border-2 text-right font-medium transition ${
                      level4Answered
                        ? opt === level4Questions[level4QuestionIndex].correctType
                          ? "bg-emerald-100 border-emerald-500"
                          : level4Selected === opt
                            ? "bg-rose-100 border-rose-500"
                            : "bg-slate-50 border-slate-200"
                        : "bg-white border-slate-200 hover:border-purple-400"
                    } disabled:opacity-80`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
