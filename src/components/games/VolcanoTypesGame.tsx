"use client"

/**
 * لعبة بركانك الصحيح - أنواع البراكين (4 مستويات)
 * Level 1: بطاقات التعريف والتعرف (يعرف كل نوع)
 * Level 2: مطابقة الخصائص (يميز بين أنواع البراكين)
 * Level 3: أمثلة حقيقية (يذكر مثالًا على كل نوع)
 * Level 4: تحدي زمني (10 ثوانٍ لكل سؤال)
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

  // المستوى 2: مطابقة الخصائص (سحب وإفلات أو نقر)
  const [level2Characteristics, setLevel2Characteristics] = useState<Array<{ id: string; text: string; typeId: string }>>([])
  const [level2Placements, setLevel2Placements] = useState<Record<string, string>>({}) // charId -> typeId
  const [level2WrongHint, setLevel2WrongHint] = useState<string | null>(null)

  // المستوى 3: أمثلة حقيقية
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

  // دقة حسب نوع البركان (للتكيف والتلميحات)
  const [accuracyPerType, setAccuracyPerType] = useState<Record<string, { correct: number; total: number }>>({})

  // تهيئة المستوى 2: قائمة خصائص (من matchCharacteristic لكل نوع)
  useEffect(() => {
    const chars = types
      .filter((t) => t.matchCharacteristic)
      .map((t) => ({ id: t.id, text: t.matchCharacteristic!, typeId: t.id }))
    setLevel2Characteristics(shuffle(chars))
  }, [types])

  const finishGame = useCallback(
    (level4ScoresFinal: number[]) => {
      const totalQuestions = level2Characteristics.length + level3Examples.length + level4Questions.length
      const level2Correct = level2Characteristics.filter((c) => level2Placements[c.id] === c.typeId).length
      const level3Correct = level3Examples.filter((e) => level3Matches[e.exampleName] === e.typeNameAr).length
      const level4Correct = level4ScoresFinal.reduce((a, b) => a + b, 0)
      const totalCorrect = level2Correct + level3Correct + level4Correct
      const score = Math.round((totalCorrect / totalQuestions) * 100)
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      onComplete({
        score,
        answers: {
          level1: "cards_viewed",
          level2: level2Placements,
          level3: level3Matches,
          level4: level4ScoresFinal,
          accuracyPerType,
        },
        timeSpent,
      })
    },
    [
      level2Characteristics.length,
      level2Placements,
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
        }, 1500)
      }
      return next
    })
  }, [level4Answered, level4QuestionIndex, level4Questions.length, finishGame, timePerQuestion])

  // مؤقت المستوى 4
  useEffect(() => {
    if (currentLevel !== 4 || level4Answered) return
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

  const handleLevel2Drop = (charId: string, typeId: string) => {
    const char = level2Characteristics.find((c) => c.id === charId)
    if (!char) return
    const correct = char.typeId === typeId
    if (!correct) {
      const correctType = types.find((t) => t.id === char.typeId)
      setLevel2WrongHint(
        correctType
          ? `هذه الخصيصة تنتمي إلى بركان ${correctType.name_ar}. جرّبي النوع الصحيح.`
          : "هذه الخصيصة لا تنتمي لهذا النوع. جرّبي نوعاً آخر."
      )
      setTimeout(() => setLevel2WrongHint(null), 3000)
      return
    }
    setLevel2Placements((prev) => ({ ...prev, [charId]: typeId }))
    updateAccuracy(typeId, true)
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
    setLevel4Answered(true)
    const q = level4Questions[level4QuestionIndex]
    const correct = option === q.correctType
    if (correct) setLevel4CorrectCount((c) => c + 1)
    setLevel4Selected(option)
    const vol = types.find((t) => t.name_ar === q.correctType)
    if (vol) updateAccuracy(vol.id, correct)
    setTimeout(() => advanceLevel4(correct ? 1 : 0), 1500)
  }

  const level2Complete = Object.keys(level2Placements).length === level2Characteristics.length
  const level3Complete = level3Examples.every((e) => level3Matches[e.exampleName])

  return (
    <div className="space-y-6" dir="rtl">
      {/* شريط المستويات */}
      <div className="flex gap-2 justify-center flex-wrap">
        {[1, 2, 3, 4].map((l) => (
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

      {/* المستوى 1: بطاقات التعريف والتعرف (Definition & Recognition) */}
      {currentLevel === 1 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">بطاقات أنواع البراكين</h3>
          <p className="text-sm text-slate-600 mb-4">تعرفي على كل نوع: تعريف مختصر، شكل توضيحي، وأهم خاصيتين. ✔ يعرف كل نوع</p>
          <div className="grid md:grid-cols-2 gap-4">
            {types.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border-2 border-slate-200 bg-white overflow-hidden hover:border-purple-300 transition"
              >
                <p className="font-bold text-slate-900 p-3 border-b border-slate-100 bg-slate-50">
                  بركان {t.name_ar}
                </p>
                <div className="p-3">
                  <p className="text-sm text-slate-700 mb-3">{t.definition}</p>
                  <div className="flex justify-center mb-3 min-h-[120px] bg-slate-50 rounded-lg">
                    {t.imagePath ? (
                      <img
                        src={t.imagePath}
                        alt={`بركان ${t.name_ar}`}
                        className="max-h-[140px] w-auto object-contain"
                      />
                    ) : (
                      <VolcanoSvg />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">أهم خاصيتين:</p>
                  <ul className="text-sm text-slate-700 list-disc list-inside space-y-0.5">
                    {(t.characteristics.slice(0, 2)).map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setCurrentLevel(2)}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700"
            >
              التالي ← المستوى 2 (مطابقة الخصائص)
            </button>
          </div>
        </div>
      )}

      {/* المستوى 2: مطابقة الخصائص (Characteristics Matching) */}
      {currentLevel === 2 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">مطابقة الخصائص</h3>
          <p className="text-sm text-slate-600 mb-4">اسحبي أو انقري لوضع كل خاصية تحت نوع البركان المناسب. ✔ يميز بين أنواع البراكين</p>
          {level2WrongHint && (
            <div className="mb-4 p-3 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 text-sm">
              {level2WrongHint}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">الخصائص:</p>
              <div className="space-y-2">
                {level2Characteristics
                  .filter((c) => !level2Placements[c.id])
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:border-purple-300"
                      onClick={() => {}}
                    >
                      {c.text}
                    </div>
                  ))}
              </div>
            </div>
            <div className="space-y-4">
              {types.map((t) => (
                <div key={t.id} className="rounded-xl border-2 border-dashed border-slate-300 p-4 min-h-[80px]">
                  <p className="font-semibold text-slate-800 mb-2">{t.name_ar}</p>
                  <div className="space-y-2">
                    {level2Characteristics
                      .filter((c) => level2Placements[c.id] === t.id)
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-2 rounded bg-white border border-slate-200 text-sm"
                        >
                          {c.text}
                        </div>
                      ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {level2Characteristics
                      .filter((c) => !level2Placements[c.id])
                      .map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleLevel2Drop(c.id, t.id)}
                          className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800 text-sm hover:bg-purple-200"
                        >
                          + {c.text.slice(0, 20)}…
                        </button>
                      ))}
                  </div>
                </div>
              ))}
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
              disabled={!level2Complete}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              التالي ← المستوى 3 (أمثلة حقيقية)
            </button>
          </div>
        </div>
      )}

      {/* المستوى 3: أمثلة حقيقية (Real-World Examples) */}
      {currentLevel === 3 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">أمثلة حقيقية</h3>
          <p className="text-sm text-slate-600 mb-4">اربطي كل مثال بنوع البركان. ماونا لوا→درعي، فيزوف→مركب، سانت هيلين→مخروطي، شقوق آيسلندا→ثوران الشقوق. ✔ يذكر مثالًا على كل نوع</p>
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
                    onClick={() => setLevel3SelectedExample(level3Matches[e.exampleName] ? null : e.exampleName)}
                    disabled={!!level3Matches[e.exampleName]}
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
              onClick={() => setCurrentLevel(2)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              ← السابق
            </button>
            <button
              onClick={() => setCurrentLevel(4)}
              disabled={!level3Complete}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              التالي ← المستوى 4 (تحدي السرعة)
            </button>
          </div>
        </div>
      )}

      {/* المستوى 4: تحدي السرعة (Speed Challenge) */}
      {currentLevel === 4 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">تحدي السرعة</h3>
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
