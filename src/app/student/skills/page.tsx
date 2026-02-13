 "use client"

import { useEffect, useMemo, useState } from "react"
import { LearningOutcomeCard } from "@/components/ui/learning-outcome-card"
import { StudentAuthGuard, useStudentAuth } from "@/components/student"
import { learningOutcomes } from "@/lib/data"

type MasteryRow = {
  id: string
  key: string
  status: string
  score: number | null
  updatedAt: string
}

type SkillsTab = "skills" | "progress"

export default function SkillsPage() {
  const { student } = useStudentAuth()
  const [activeTab, setActiveTab] = useState<SkillsTab>("skills")
  const [mastery, setMastery] = useState<MasteryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!student?.id) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(
          `/api/student/mastery?studentId=${encodeURIComponent(student.id)}`
        )
        const data = await res.json()
        if (res.ok) setMastery(data.mastery || [])
        else setMastery([])
      } catch {
        setMastery([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [student?.id])

  // إتقان حسب المجال (مفتاح skill:المجال)
  const masteryByDomain = useMemo(() => {
    const map: Record<string, { status: "mastered" | "not_mastered"; score: number }> = {}
    mastery
      .filter((m) => m.key.startsWith("skill:"))
      .forEach((m) => {
        const domain = m.key.replace(/^skill:/, "")
        const score = typeof m.score === "number" ? m.score : 0
        const status =
          m.status === "mastered" || score >= 80 ? "mastered" : "not_mastered"
        if (!map[domain] || (m.score != null && (map[domain].score ?? 0) < score)) {
          map[domain] = { status, score }
        }
      })
    return map
  }, [mastery])

  // تجميع حسب الناتج: كل مجموعة = مجال + ناتج تعلم + مؤشراته (لعرض المجال والناتج مرة واحدة فقط)
  const indicatorGroups = useMemo(() => {
    return learningOutcomes.map((item) => {
      const domainMastery = masteryByDomain[item.domain]
      const isMastered =
        domainMastery?.status === "mastered" || (domainMastery?.score ?? 0) >= 80
      const score = domainMastery?.score ?? null
      return {
        domain: item.domain,
        lesson: item.lesson,
        outcome: item.outcome,
        indicators: item.indicators,
        isMastered,
        score,
      }
    })
  }, [masteryByDomain])

  const totalIndicators = indicatorGroups.reduce((s, g) => s + g.indicators.length, 0)
  const masteredIndicators = indicatorGroups
    .filter((g) => g.isMastered)
    .reduce((s, g) => s + g.indicators.length, 0)
  const remainingIndicators = totalIndicators - masteredIndicators

  // تجميع حسب المجال: لعرض اسم المجال مرة واحدة فقط (rowSpan على كل صفوف المجال)
  const byDomain = useMemo(() => {
    const map = new Map<string, typeof indicatorGroups>()
    indicatorGroups.forEach((g) => {
      const list = map.get(g.domain) ?? []
      list.push(g)
      map.set(g.domain, list)
    })
    return Array.from(map.entries()).map(([domain, groups]) => ({
      domain,
      groups,
      domainRowSpan: groups.reduce((s, g) => s + g.indicators.length, 0),
    }))
  }, [indicatorGroups])

  return (
    <StudentAuthGuard>
      <main className="space-y-6 p-3 sm:space-y-8 sm:p-4">
        <header className="card bg-white p-4 sm:p-6">
          <p className="text-sm text-slate-500">مهاراتي</p>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">مهاراتي</h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            المهارات المتقنة والمتبقية مرتبطة بإنجازك من الاختبارات والألعاب.
          </p>
          {/* علامات التبويب */}
          <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200 pb-px sm:mt-6">
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
              onClick={() => setActiveTab("progress")}
              className={`min-h-[44px] flex-shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition touch-manipulation ${
                activeTab === "progress"
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              تقدمي
            </button>
          </div>
        </header>

        {/* تبويب تقدمي: جدول مؤشرات نواتج التعلم ومدى إتقانها */}
        {activeTab === "progress" && (
          <section className="card overflow-hidden p-0">
            <h2 className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-base font-bold text-slate-900">
              مؤشرات نواتج التعلم ومدى إتقانها
            </h2>
            {loading ? (
              <div className="p-4 text-center text-sm text-slate-500">
                جاري تحميل الإنجاز...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full max-w-full min-w-0 text-right text-[11px]">
                  <thead className="bg-slate-100 text-slate-600">
                    <tr>
                      <th className="w-[70px] px-1.5 py-1 font-semibold">المجال</th>
                      <th className="w-[22%] max-w-[140px] px-1.5 py-1 font-semibold">الدرس / الناتج</th>
                      <th className="w-[38%] max-w-[220px] px-1.5 py-1 font-semibold">المؤشر</th>
                      <th className="w-[58px] px-1.5 py-1 font-semibold">الإتقان</th>
                      <th className="w-[44px] px-1.5 py-1 font-semibold">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byDomain.map(({ domain, groups, domainRowSpan }) =>
                      groups.map((group, groupIndex) =>
                        group.indicators.map((indicator, indIndex) => (
                          <tr
                            key={`${domain}-${group.lesson}-${indIndex}-${groupIndex}`}
                            className="border-t border-slate-100"
                          >
                            {groupIndex === 0 && indIndex === 0 && (
                              <td
                                rowSpan={domainRowSpan}
                                className="w-[70px] px-1.5 py-1 font-medium text-slate-800 align-top border-l border-slate-100"
                              >
                                {domain}
                              </td>
                            )}
                            {indIndex === 0 && (
                              <td
                                rowSpan={group.indicators.length}
                                className="w-[22%] max-w-[140px] px-1.5 py-1 align-top border-l border-slate-100"
                              >
                                <span className="block font-medium text-slate-800 line-clamp-1 text-[11px]">
                                  {group.lesson}
                                </span>
                                <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-600">
                                  {group.outcome}
                                </p>
                              </td>
                            )}
                            <td className="w-[38%] max-w-[220px] px-1.5 py-1 text-slate-700">
                              {indicator}
                            </td>
                            <td className="w-[58px] px-1.5 py-1">
                              <span
                                className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  group.isMastered
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {group.isMastered ? "متقن" : "متبقي"}
                              </span>
                            </td>
                            <td className="w-[44px] px-1.5 py-1">
                              {group.score != null ? `${Math.round(group.score)}%` : "—"}
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && totalIndicators > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold text-emerald-700">
                  مؤشرات متقنة: {masteredIndicators}
                </span>
                <span className="mx-2">|</span>
                <span className="font-semibold text-amber-700">
                  مؤشرات متبقية: {remainingIndicators}
                </span>
                <span className="mx-2">|</span>
                <span className="text-slate-600">
                  الإجمالي: {totalIndicators} مؤشر
                </span>
              </div>
            )}
          </section>
        )}

        {/* تبويب مهاراتي: نواتج التعلم */}
        {activeTab === "skills" && (
        <section className="space-y-8">
          <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4">
            <h2 className="text-lg font-bold text-violet-900">جميع نواتج التعلم</h2>
            <p className="mt-1 text-sm text-violet-700">
              استعراض كامل لنواتج التعلم والمؤشرات حسب المجال والفترة والأسبوع
            </p>
          </div>

          {[
            { domain: "علوم الحياة", color: "emerald" },
            { domain: "العلوم الفيزيائية", color: "blue" },
            { domain: "علوم الأرض والفضاء", color: "amber" },
          ].map(({ domain, color }) => {
            const items = learningOutcomes.filter((item) => item.domain === domain)
            if (items.length === 0) return null
            return (
              <div key={domain} className="space-y-3">
                <div
                  className={`rounded-2xl border p-4 ${
                    color === "emerald"
                      ? "bg-emerald-50 border-emerald-200"
                      : color === "blue"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <h3
                    className={`text-lg font-bold ${
                      color === "emerald"
                        ? "text-emerald-900"
                        : color === "blue"
                          ? "text-blue-900"
                          : "text-amber-900"
                    }`}
                  >
                    {domain}
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      color === "emerald"
                        ? "text-emerald-700"
                        : color === "blue"
                          ? "text-blue-700"
                          : "text-amber-700"
                    }`}
                  >
                    {items.length} ناتج تعلم
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item, index) => (
                    <LearningOutcomeCard
                      key={`${item.domain}-${item.lesson}-${index}`}
                      item={item}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </section>
        )}
      </main>
    </StudentAuthGuard>
  )
}

