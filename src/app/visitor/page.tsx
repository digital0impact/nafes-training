"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-client"
import { KpiCard } from "@/components/ui/kpi-card"
import { VisitorComments } from "@/components/visitor/visitor-comments"

type TabType = "overview" | "nafes_plan" | "activities" | "results" | "indicators"
type VisitorProfile = {
  id: string
  teacherId: string
  teacherName: string
  scope: string[]
  isActive: boolean
}
type OutcomesData = { outcomes: Array<{ week: string; period?: string; lesson: string; domain: string; outcome: string; indicators: string[] }> }
type ActivitiesData = { activities: Array<{ id: string; title: string; description: string; duration: string; skill: string; targetLevel: string | null; type: string | null; createdAt: string }> }
type ResultsData = {
  classesCount: number
  studentsCount: number
  weeklyAttempts: number
  averageScore: number
  advancedStudents: number
  needSupportStudents: number
  weeklyActivities: number
}
type IndicatorsData = { indicators: Array<{ key: string; mastered: number; notMastered: number; total: number; averageScore: number | null }> }

const SCOPE_LABELS: Record<string, string> = {
  nafes_plan: "خطة نافس",
  activities: "الأنشطة",
  results: "النتائج",
  learning_indicators: "مؤشرات التعلم",
}

export default function VisitorDashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [profile, setProfile] = useState<VisitorProfile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [outcomes, setOutcomes] = useState<OutcomesData | null>(null)
  const [activities, setActivities] = useState<ActivitiesData | null>(null)
  const [results, setResults] = useState<ResultsData | null>(null)
  const [indicators, setIndicators] = useState<IndicatorsData | null>(null)
  const [loadingTab, setLoadingTab] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/visitor/profile")
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        } else {
          setProfile(null)
        }
      } catch {
        setProfile(null)
      } finally {
        setLoadingProfile(false)
      }
    }
    if (user?.role === "visitor_reviewer") fetchProfile()
  }, [user?.role])

  useEffect(() => {
    if (!profile || activeTab === "overview") return
    setLoadingTab(true)
    const urls: Record<TabType, string> = {
      overview: "",
      nafes_plan: "/api/visitor/outcomes",
      activities: "/api/visitor/activities",
      results: "/api/visitor/results",
      indicators: "/api/visitor/indicators",
    }
    const url = urls[activeTab]
    if (!url) {
      setLoadingTab(false)
      return
    }
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (activeTab === "nafes_plan") setOutcomes(data)
        else if (activeTab === "activities") setActivities(data)
        else if (activeTab === "results") setResults(data)
        else if (activeTab === "indicators") setIndicators(data)
      })
      .catch(() => {})
      .finally(() => setLoadingTab(false))
  }, [profile, activeTab])

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/signin")
    router.refresh()
  }

  if (authLoading || (user && user.role === "visitor_reviewer" && loadingProfile)) {
    return (
      <main className="space-y-6 p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          جاري التحميل...
        </div>
      </main>
    )
  }

  if (!user || user.role !== "visitor_reviewer") {
    return null
  }

  return (
    <main className="min-h-screen space-y-4 p-3 sm:space-y-6 sm:p-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">واجهة الزائر – مشاهدة وتعليق فقط</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl truncate">
              مرحباً، {user.name}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-[44px] self-start rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 touch-manipulation"
          >
            تسجيل الخروج
          </button>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-800 sm:px-4 sm:py-3">
          <strong>صلاحية مشاهدة وتعليق فقط.</strong> لا يمكنك تعديل أو حذف أو إضافة محتوى، أو رفع ملفات، أو الوصول إلى إعدادات الحساب أو إدارة الصفوف والطلاب.
        </div>
        {profile && (
          <p className="mt-3 text-xs text-slate-600 sm:text-sm line-clamp-2 sm:line-clamp-none">
            المعلم المرتبط: {profile.teacherName} • نطاق العرض: {profile.scope.map((s) => SCOPE_LABELS[s] || s).join("، ")}
          </p>
        )}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-4 -mx-1 px-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`min-h-[44px] flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold touch-manipulation ${
              activeTab === "overview"
                ? "bg-primary-100 text-primary-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            نظرة عامة
          </button>
          {profile?.scope.includes("nafes_plan") && (
            <button
              type="button"
              onClick={() => setActiveTab("nafes_plan")}
              className={`min-h-[44px] flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold touch-manipulation ${
                activeTab === "nafes_plan"
                  ? "bg-primary-100 text-primary-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              خطة نافس
            </button>
          )}
          {profile?.scope.includes("activities") && (
            <button
              type="button"
              onClick={() => setActiveTab("activities")}
              className={`min-h-[44px] flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold touch-manipulation ${
                activeTab === "activities"
                  ? "bg-primary-100 text-primary-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              الأنشطة
            </button>
          )}
          {profile?.scope.includes("results") && (
            <button
              type="button"
              onClick={() => setActiveTab("results")}
              className={`min-h-[44px] flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold touch-manipulation ${
                activeTab === "results"
                  ? "bg-primary-100 text-primary-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              النتائج
            </button>
          )}
          {profile?.scope.includes("learning_indicators") && (
            <button
              type="button"
              onClick={() => setActiveTab("indicators")}
              className={`min-h-[44px] flex-shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold touch-manipulation ${
                activeTab === "indicators"
                  ? "bg-primary-100 text-primary-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              مؤشرات التعلم
            </button>
          )}
        </div>
      </header>

      {activeTab === "overview" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">نظرة عامة</h2>
          <p className="text-slate-600">
            اختر أحد التبويبات أعلاه لعرض المحتوى المسموح لك بمشاهدته. يمكنك إضافة تعليقات نصية على العناصر المعروضة من خلال واجهة التعليقات عند فتح كل قسم.
          </p>
          {!profile && !loadingProfile && (
            <p className="mt-4 text-amber-700">
              لا توجد صلاحية زائر نشطة مرتبطة بحسابك. يرجى التواصل مع المعلم.
            </p>
          )}
        </section>
      )}

      {activeTab === "nafes_plan" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">خطة نافس (عرض فقط)</h2>
          {loadingTab ? (
            <p className="text-slate-500">جاري التحميل...</p>
          ) : outcomes?.outcomes?.length ? (
            <>
              <ul className="space-y-4">
                {outcomes.outcomes.slice(0, 30).map((o, i) => (
                  <li key={i} className="rounded-lg border border-slate-100 p-4">
                    <p className="font-semibold text-slate-800">{o.week} {o.period && `- ${o.period}`}</p>
                    <p className="text-slate-600">{o.lesson} • {o.domain}</p>
                    <p className="mt-1 text-sm text-slate-700">{o.outcome}</p>
                  </li>
                ))}
                {outcomes.outcomes.length > 30 && (
                  <li className="text-slate-500">... و {outcomes.outcomes.length - 30} عنصر آخر</li>
                )}
              </ul>
              <VisitorComments targetType="indicator" targetId="nafes_plan" targetLabel="خطة نافس" />
            </>
          ) : (
            <p className="text-slate-500">لا توجد بيانات.</p>
          )}
        </section>
      )}

      {activeTab === "activities" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">الأنشطة (عرض فقط)</h2>
          {loadingTab ? (
            <p className="text-slate-500">جاري التحميل...</p>
          ) : activities?.activities?.length ? (
            <ul className="space-y-3">
              {activities.activities.map((a) => (
                <li key={a.id} className="rounded-lg border border-slate-100 p-4">
                  <p className="font-semibold text-slate-800">{a.title}</p>
                  {a.description && <p className="text-sm text-slate-600">{a.description}</p>}
                  <p className="mt-1 text-xs text-slate-500">{a.skill} • {a.duration} • {a.type || "-"}</p>
                  <VisitorComments targetType="activity" targetId={a.id} targetLabel={a.title} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">لا توجد أنشطة.</p>
          )}
        </section>
      )}

      {activeTab === "results" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">النتائج المجمعة (بدون أسماء طلاب)</h2>
          {loadingTab ? (
            <p className="text-slate-500">جاري التحميل...</p>
          ) : results ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard label="عدد الفصول" value={String(results.classesCount)} hint="إجمالي الفصول" />
                <KpiCard label="عدد الطالبات" value={String(results.studentsCount)} hint="إجمالي الطالبات" />
                <KpiCard label="المحاولات الأسبوعية" value={String(results.weeklyAttempts)} hint="هذا الأسبوع" />
                <KpiCard label="متوسط الصف" value={`${results.averageScore}%`} hint="نسبة مئوية" />
                <KpiCard label="طالبات متقدمة" value={String(results.advancedStudents)} hint="درجة ≥ 80%" />
                <KpiCard label="بحاجة لدعم" value={String(results.needSupportStudents)} hint="درجة أقل من 60%" />
                <KpiCard label="ألعاب منجزة هذا الأسبوع" value={String(results.weeklyActivities)} hint="" />
              </div>
              <VisitorComments targetType="indicator" targetId="results" targetLabel="النتائج المجمعة" />
            </>
          ) : (
            <p className="text-slate-500">لا توجد بيانات.</p>
          )}
        </section>
      )}

      {activeTab === "indicators" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-900">مؤشرات التعلم (مجمعة)</h2>
          {loadingTab ? (
            <p className="text-slate-500">جاري التحميل...</p>
          ) : indicators?.indicators?.length ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-2 font-semibold">المؤشر</th>
                      <th className="px-4 py-2 font-semibold">متقن</th>
                      <th className="px-4 py-2 font-semibold">غير متقن</th>
                      <th className="px-4 py-2 font-semibold">المجموع</th>
                      <th className="px-4 py-2 font-semibold">متوسط النقاط</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indicators.indicators.map((ind) => (
                      <tr key={ind.key} className="border-t border-slate-100">
                        <td className="px-4 py-2 font-medium text-slate-800">{ind.key}</td>
                        <td className="px-4 py-2">{ind.mastered}</td>
                        <td className="px-4 py-2">{ind.notMastered}</td>
                        <td className="px-4 py-2">{ind.total}</td>
                        <td className="px-4 py-2">{ind.averageScore != null ? ind.averageScore : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <VisitorComments targetType="indicator" targetId="learning_indicators" targetLabel="مؤشرات التعلم" />
            </>
          ) : (
            <p className="text-slate-500">لا توجد مؤشرات.</p>
          )}
        </section>
      )}
    </main>
  )
}
