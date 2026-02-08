 "use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { SkillBadge } from "@/components/ui/skill-badge"
import { ProgressCard } from "@/components/ui/progress-card"
import { StudentAuthGuard, useStudentAuth } from "@/components/student"

const SKILL_DOMAINS_COUNT = 4

type SkillsTab = "skills" | "indicators"

type MasteryRow = {
  id: string
  key: string
  status: string
  score: number | null
  updatedAt: string
}

type TrainingAttempt = {
  id: string
  testModelId: string | null
  testModelTitle: string | null
  score: number
  totalQuestions: number
  percentage: number
  timeSpent: number
  completedAt: string
}

function formatIndicatorLabel(key: string): string {
  if (key.startsWith("skill:")) return key.replace(/^skill:/, "")
  if (key.startsWith("testModel:")) return `نموذج اختبار: ${key.replace(/^testModel:/, "")}`
  if (key.startsWith("game:")) return `لعبة: ${key.replace(/^game:/, "")}`
  return key
}

export default function SkillsPage() {
  const { student } = useStudentAuth()
  const [activeTab, setActiveTab] = useState<SkillsTab>("skills")
  const [mastery, setMastery] = useState<MasteryRow[]>([])
  const [attempts, setAttempts] = useState<TrainingAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAttempts, setLoadingAttempts] = useState(true)

  useEffect(() => {
    async function load() {
      if (!student) return
      try {
        const res = await fetch(`/api/student/mastery?studentId=${encodeURIComponent(student.id)}`)
        const data = await res.json()
        if (res.ok) {
          setMastery(data.mastery || [])
        } else {
          setMastery([])
        }
      } catch {
        setMastery([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [student])

  useEffect(() => {
    async function loadAttempts() {
      if (!student?.id) {
        setLoadingAttempts(false)
        return
      }
      try {
        const res = await fetch(
          `/api/student/training-attempts?studentId=${encodeURIComponent(student.id)}`,
          { cache: "no-store" }
        )
        const data = await res.json()
        if (res.ok) setAttempts(data.attempts || [])
        else setAttempts([])
      } catch {
        setAttempts([])
      } finally {
        setLoadingAttempts(false)
      }
    }
    loadAttempts()
  }, [student?.id])

  const masteryBySkill = useMemo(() => {
    const rows = mastery.filter((m) => m.key.startsWith("skill:"))
    const items = rows.map((m) => {
      const name = m.key.replace(/^skill:/, "")
      const score = typeof m.score === "number" ? Math.round(m.score) : 0
      const level =
        score >= 80 ? ("متقنة" as const) : score >= 60 ? ("متوسطة" as const) : ("ضعيفة" as const)
      return { name, score, level }
    })
    return [
      {
        title: "مهاراتي (حسب الاختبارات/الألعاب)",
        items,
      },
    ]
  }, [mastery])

  // مؤشرات تقدمك مستمدة من نتائج الطالبة (mastery من الاختبارات والألعاب)
  const progressStats = useMemo(() => {
    const items = masteryBySkill[0]?.items ?? []
    const skillsFollowedPercent =
      items.length > 0
        ? Math.min(100, Math.round((items.length / SKILL_DOMAINS_COUNT) * 100))
        : 0
    const avgMastery =
      items.length > 0
        ? Math.round(items.reduce((sum, i) => sum + i.score, 0) / items.length)
        : 0
    const masteredCount = items.filter((i) => i.level === "متقنة").length
    const masteredPercent =
      items.length > 0 ? Math.round((masteredCount / items.length) * 100) : 0
    return {
      skillsFollowedPercent,
      avgMastery,
      masteredPercent,
    }
  }, [masteryBySkill])

  return (
    <StudentAuthGuard>
      <main className="space-y-6 p-3 sm:space-y-8 sm:p-4">
      <header className="card bg-white p-4 sm:p-6">
        <p className="text-sm text-slate-500">مهاراتي</p>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">نظرة تفصيلية</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          تظهر هنا المهارات التي تم رصدها من نتائج الاختبارات/الألعاب.
        </p>
        {/* علامات التبويب */}
        <div className="mt-4 flex gap-1 overflow-x-auto pb-px border-b border-slate-200 sm:mt-6">
          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`min-h-[44px] flex-shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition touch-manipulation ${
              activeTab === "skills"
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            مهاراتي
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("indicators")}
            className={`min-h-[44px] flex-shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition touch-manipulation ${
              activeTab === "indicators"
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            مؤشرات نافس
          </button>
        </div>
      </header>

      {activeTab === "indicators" && (
        <section className="card bg-gradient-to-br from-white to-primary-50">
          <h2 className="mb-4 text-xl font-bold text-slate-900">مؤشرات نافس</h2>
          <p className="mb-4 text-sm text-slate-600">
            مؤشراتك حسب نتائج الاختبارات والألعاب. المتقن = نسبة 80% فأكثر.
          </p>
          {loading ? (
            <p className="text-slate-500">جاري تحميل المؤشرات...</p>
          ) : mastery.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-center">
              <p className="text-slate-600">لا توجد مؤشرات مسجّلة بعد.</p>
              <p className="mt-1 text-sm text-slate-500">
                ابدئي بالاختبارات والألعاب لرصد مؤشراتك.
              </p>
              <Link
                href="/student/simulation/select"
                className="mt-4 inline-block rounded-2xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
              >
                محاكاة اختبار نافس
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px] text-right text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">المؤشر</th>
                    <th className="px-4 py-3 font-semibold">الحالة</th>
                    <th className="px-4 py-3 font-semibold">النسبة %</th>
                  </tr>
                </thead>
                <tbody>
                  {mastery.map((m) => (
                    <tr key={m.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {formatIndicatorLabel(m.key)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            m.status === "mastered"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {m.status === "mastered" ? "متقن" : "غير متقن"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {m.score != null ? `${Math.round(m.score)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "skills" && (
        <>
      {/* تقدمك - مرتبط بنتائج الطالبة */}
      <section className="card bg-slate-50">
        <h2 className="mb-4 text-lg font-bold text-slate-900">تقدمك</h2>
        <p className="mb-4 text-sm text-slate-500">
          المتابعة ومتوسط الإتقان والمهارات المتقنة مستمدة من نتائج اختباراتك وألعابك.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <ProgressCard
            label="المهارات المُتابعة"
            value={progressStats.skillsFollowedPercent}
          />
          <ProgressCard
            label="متوسط الإتقان"
            value={progressStats.avgMastery}
            accent="bg-accent-500"
          />
          <ProgressCard
            label="المهارات المتقنة"
            value={progressStats.masteredPercent}
            accent="bg-emerald-500"
          />
        </div>
      </section>

      {/* تقدم الطالبة حسب الاختبارات */}
      <section className="card bg-gradient-to-br from-white to-primary-50">
        <h2 className="mb-4 text-xl font-bold text-slate-900">تقدمك حسب الاختبارات</h2>
        {loadingAttempts ? (
          <p className="text-slate-500">جاري تحميل النتائج...</p>
        ) : attempts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-center">
            <p className="text-slate-600">لم تُسجّلي أي اختبار محاكاة بعد.</p>
            <p className="mt-1 text-sm text-slate-500">
              ابدئي من محاكاة اختبار نافس لرصد تقدمك في المهارات.
            </p>
            <Link
              href="/student/simulation/select"
              className="mt-4 inline-block rounded-2xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              محاكاة اختبار نافس
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="rounded-2xl bg-white px-5 py-3 shadow-sm">
                <p className="text-xs text-slate-500">عدد الاختبارات</p>
                <p className="text-2xl font-bold text-primary-600">{attempts.length}</p>
              </div>
              <div className="rounded-2xl bg-white px-5 py-3 shadow-sm">
                <p className="text-xs text-slate-500">متوسط النسبة المئوية</p>
                <p className="text-2xl font-bold text-primary-600">
                  {Math.round(
                    attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
                  )}
                  %
                </p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">آخر الاختبارات</h3>
              <ul className="space-y-2">
                {attempts.slice(0, 10).map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3"
                  >
                    <span className="font-medium text-slate-800">
                      {a.testModelTitle || "اختبار محاكاة"}
                    </span>
                    <span className="text-sm text-slate-500">
                      {new Date(a.completedAt).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        a.percentage >= 80
                          ? "bg-emerald-100 text-emerald-700"
                          : a.percentage >= 60
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {a.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
              {attempts.length > 10 && (
                <p className="mt-2 text-xs text-slate-500">
                  عرض آخر 10 اختبارات من أصل {attempts.length}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {loading ? (
        <div className="card text-center py-10">
          <p className="text-slate-500">جاري تحميل المهارات...</p>
        </div>
      ) : (
        <section className="grid gap-6 md:grid-cols-3">
          {masteryBySkill.map((group) => (
            <div key={group.title} className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {group.title}
              </h3>
              <span className="text-sm text-slate-500">
                {group.items.length > 0
                  ? Math.round(
                      group.items.reduce((sum, item) => sum + item.score, 0) / group.items.length
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="space-y-3">
              {group.items.length === 0 ? (
                <p className="text-sm text-slate-500">لا توجد بيانات بعد.</p>
              ) : (
                group.items.map((skill) => (
                  <SkillBadge
                    key={skill.name}
                    label={skill.name}
                    value={skill.score}
                    level={skill.level}
                  />
                ))
              )}
            </div>
            <button className="w-full rounded-2xl border border-slate-200 py-2 text-sm font-semibold">
              أنشطة مقترحة
            </button>
          </div>
          ))}
        </section>
      )}
        </>
      )}
    </main>
    </StudentAuthGuard>
  )
}

