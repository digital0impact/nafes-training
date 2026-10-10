"use client"

/**
 * بطاقات مهارات العالمة الصغيرة - تمييز مهارات العلم
 *
 * لعبة مطابقة مخصصة (بدل واجهة matching العامة المشتركة مع عدة ألعاب
 * أخرى غير متعلقة): كل مهارة لها أيقونة ولون ثابت؛ انقري على مهارة ثم
 * على وصفها لتكوين زوج (يظهر الزوج بنفس لون المهارة قبل التحقق)، ثم
 * تحققي من كل الأزواج دفعة واحدة مع تغذية راجعة ملوّنة واحتفال عند
 * الإجابة الكاملة الصحيحة - بنفس روح لعبة "رحلة المحقق العلمي".
 */
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ScienceSkillsMatchGameData } from "@/types/games"

type EducationalGameMeta = {
  game_id: string
  title: string
  chapter: string
  objective: string
  points: number
}

type ScienceSkillsMatchProps = {
  gameData: ScienceSkillsMatchGameData
  game: EducationalGameMeta
  onComplete: (result: { score: number; answers: Record<string, unknown>; timeSpent: number }) => void
}

type SkillColor = {
  ring: string
  bg: string
  text: string
  chip: string
}

const SKILL_ICONS: Record<string, string> = {
  الملاحظة: "🔍",
  القياس: "📏",
  التصنيف: "🗂️",
  الاستدلال: "🧩",
  التنبؤ: "🔮",
}

const SKILL_COLORS: SkillColor[] = [
  { ring: "border-sky-400", bg: "bg-sky-50", text: "text-sky-700", chip: "bg-sky-500" },
  { ring: "border-amber-400", bg: "bg-amber-50", text: "text-amber-700", chip: "bg-amber-500" },
  { ring: "border-purple-400", bg: "bg-purple-50", text: "text-purple-700", chip: "bg-purple-500" },
  { ring: "border-teal-400", bg: "bg-teal-50", text: "text-teal-700", chip: "bg-teal-500" },
  { ring: "border-rose-400", bg: "bg-rose-50", text: "text-rose-700", chip: "bg-rose-500" },
]

type Skill = {
  id: string
  label: string
  target: string
  icon: string
  color: SkillColor
}

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

function resultMessage(correctCount: number, total: number) {
  if (correctCount === total) {
    return "🎉 رائعة! ربطتِ كل مهارة بوصفها الصحيح تماماً!"
  }
  if (correctCount >= total - 1) {
    return "👏 قريبة جداً من الإجابة الكاملة! راجعي الأزواج المحددة باللون الأحمر."
  }
  if (correctCount >= Math.ceil(total / 2)) {
    return "💪 بداية جيدة! فكّري في معنى كل مهارة وحاولي مرة أخرى."
  }
  return "🤔 لا بأس، حاولي مرة أخرى وراجعي وصف كل مهارة بعناية."
}

export default function ScienceSkillsMatch({ gameData, game, onComplete }: ScienceSkillsMatchProps) {
  const skills = useMemo<Skill[]>(
    () =>
      gameData.pairs.map((pair, idx) => ({
        id: pair.id,
        label: pair.label,
        target: pair.target,
        icon: SKILL_ICONS[pair.label] ?? "⭐",
        color: SKILL_COLORS[idx % SKILL_COLORS.length],
      })),
    [gameData.pairs]
  )

  const [startTime] = useState(() => Date.now())
  const [descriptions, setDescriptions] = useState<string[]>(() => shuffle(skills.map((s) => s.target)))
  const [matches, setMatches] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(skills.map((s) => [s.id, null]))
  )
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null)
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

  const matchedCount = Object.values(matches).filter(Boolean).length
  const allMatched = matchedCount === skills.length

  const correctCount = useMemo(
    () => skills.reduce((acc, s) => acc + (matches[s.id] === s.target ? 1 : 0), 0),
    [skills, matches]
  )
  const score = Math.round((correctCount / skills.length) * 100)
  const isPerfect = checked && correctCount === skills.length

  const skillBySkillId = useCallback((id: string) => skills.find((s) => s.id === id), [skills])

  const skillIdByTarget = useCallback(
    (target: string) => Object.entries(matches).find(([, v]) => v === target)?.[0] ?? null,
    [matches]
  )

  const selectSkill = useCallback(
    (id: string) => {
      if (checked) return
      if (activeSkillId === id) {
        setActiveSkillId(null)
        return
      }
      if (matches[id]) {
        // إعادة اختيار مهارة مرتبطة مسبقاً: تحرير وصفها ليصبح متاحاً من جديد
        setMatches((prev) => ({ ...prev, [id]: null }))
      }
      setActiveSkillId(id)
    },
    [checked, activeSkillId, matches]
  )

  const selectDescription = useCallback(
    (target: string) => {
      if (checked) return
      const ownerId = skillIdByTarget(target)
      if (ownerId) {
        // وصف مرتبط مسبقاً: فكّي ارتباطه وفعّليه لإعادة الربط
        setMatches((prev) => ({ ...prev, [ownerId]: null }))
        setActiveSkillId(ownerId)
        return
      }
      if (!activeSkillId) return
      setMatches((prev) => ({ ...prev, [activeSkillId]: target }))
      setActiveSkillId(null)
    },
    [checked, activeSkillId, skillIdByTarget]
  )

  const handleCheck = useCallback(() => {
    if (!allMatched) return
    setChecked(true)
    setAttempts((a) => a + 1)
  }, [allMatched])

  const handleRetry = useCallback(() => {
    setMatches(Object.fromEntries(skills.map((s) => [s.id, null])))
    setDescriptions(shuffle(skills.map((s) => s.target)))
    setActiveSkillId(null)
    setChecked(false)
  }, [skills])

  const handleFinish = useCallback(() => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)
    onComplete({
      score,
      answers: { matches, correctCount, attempts },
      timeSpent,
    })
  }, [score, matches, correctCount, attempts, startTime, onComplete])

  return (
    <div dir="rtl" className="space-y-6">
      {/* بطاقة المهمة */}
      <div className="card border border-primary-100 bg-gradient-to-br from-primary-50 to-white">
        <div className="flex items-start gap-3">
          <span className="text-3xl">👩‍🔬</span>
          <div>
            <h3 className="text-lg font-bold text-slate-900">بطاقات مهارات العالمة الصغيرة</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {game.objective || "اربطي كل مهارة علمية بوصفها الصحيح: انقري على المهارة، ثم انقري على الوصف المطابق لها."}
            </p>
          </div>
        </div>
      </div>

      {/* شريط الحالة */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge bg-primary-100 text-primary-800">
            {matchedCount} / {skills.length} أزواج
          </span>
          {attempts > 0 && (
            <span className="badge bg-accent-100 text-accent-700">المحاولة {attempts}</span>
          )}
        </div>
        <span className="badge bg-slate-100 text-slate-600">⏱ {formatTime(elapsed)}</span>
      </div>

      {/* لوحة المطابقة */}
      <div className="card relative overflow-hidden">
        {isPerfect && <Confetti />}
        <div className="grid gap-6 md:grid-cols-2">
          {/* المهارات */}
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">المهارات:</p>
            <div className="space-y-3">
              {skills.map((skill) => {
                const isActive = activeSkillId === skill.id
                const hasMatch = !!matches[skill.id]
                const isCorrect = checked && matches[skill.id] === skill.target
                const isWrong = checked && hasMatch && matches[skill.id] !== skill.target

                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => selectSkill(skill.id)}
                    disabled={checked}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-right transition-all duration-200 ${
                      isCorrect
                        ? "border-emerald-400 bg-emerald-50"
                        : isWrong
                          ? "border-rose-400 bg-rose-50 animate-shake"
                          : isActive
                            ? `${skill.color.ring} ${skill.color.bg} scale-[1.02] shadow-md`
                            : hasMatch
                              ? `${skill.color.ring} ${skill.color.bg}`
                              : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl ${skill.color.bg}`}>
                      {skill.icon}
                    </span>
                    <span className={`flex-1 font-semibold ${skill.color.text}`}>{skill.label}</span>
                    {checked && <span className="text-lg">{isCorrect ? "✅" : isWrong ? "❌" : ""}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* الأوصاف */}
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">الأوصاف:</p>
            <div className="space-y-3">
              {descriptions.map((target) => {
                const ownerId = skillIdByTarget(target)
                const owner = ownerId ? skillBySkillId(ownerId) : null
                const isCorrect = checked && owner && owner.target === target
                const isWrong = checked && owner && owner.target !== target

                return (
                  <button
                    key={target}
                    type="button"
                    onClick={() => selectDescription(target)}
                    disabled={checked || (!owner && !activeSkillId)}
                    className={`w-full rounded-xl border-2 p-3 text-right transition-all duration-200 ${
                      isCorrect
                        ? "border-emerald-400 bg-emerald-50"
                        : isWrong
                          ? "border-rose-400 bg-rose-50 animate-shake"
                          : owner
                            ? `${owner.color.ring} ${owner.color.bg} animate-pop-in`
                            : activeSkillId
                              ? "border-primary-300 bg-primary-50 hover:border-primary-500"
                              : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                  >
                    <span className={owner ? owner.color.text : "text-slate-700"}>{target}</span>
                    {checked && owner && (
                      <span className="mr-2 text-lg">{isCorrect ? "✅" : "❌"}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* نتيجة التحقق */}
      {checked && (
        <div
          className={`card border-2 ${isPerfect ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}
        >
          <p className={`font-semibold ${isPerfect ? "text-emerald-800" : "text-amber-800"}`}>
            {resultMessage(correctCount, skills.length)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            النتيجة: {correctCount} من {skills.length} أزواج صحيحة ({score}%)
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

      {!checked && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleCheck}
            disabled={!allMatched}
            className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🔎 تحقق من الأزواج
          </button>
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
        emoji: ["🎉", "✨", "⭐", "👩‍🔬"][i % 4],
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
