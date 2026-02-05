"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { SectionHeader } from "@/components/ui/section-header"
import { SkillBadge } from "@/components/ui/skill-badge"
import { ProgressCard } from "@/components/ui/progress-card"
import { StudentAuthGuard, useStudentAuth } from "@/components/student"
import { useStudentStore } from "@/store/student-store"

const quickActions = [
  { label: "محاكاة اختبار نافس", href: "/student/simulation/select", accent: "bg-primary-600" },
  { label: "التدريب السريع", href: "/student/skills", accent: "bg-accent-500" },
  { label: "مهاراتي", href: "/student/skills", accent: "bg-emerald-500" },
  { label: "الألعاب التعليمية", href: "/student/games", accent: "bg-purple-500" },
]

type SkillItem = { name: string; score: number; level: "متقنة" | "متوسطة" | "ضعيفة" }

function StudentHomeContent() {
  const { student } = useStudentAuth()
  const setStudent = useStudentStore((s) => s.setStudent)
  const [mastery, setMastery] = useState<{ key: string; score: number | null; status: string }[]>([])
  const [assignedTestsCount, setAssignedTestsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!student?.id) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/api/student/mastery?studentId=${encodeURIComponent(student.id)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        setMastery(data.mastery || [])
        if (data.student?.name?.trim() && (!student.name || !student.name.trim()) && student.id) {
          setStudent({ ...student, name: data.student.name.trim() })
        }
      })
      .catch(() => setMastery([]))
      .finally(() => setLoading(false))
  }, [student?.id, setStudent])

  // جلب عدد الاختبارات المعينة من المعلمة (بدون كاش لظهور الاختبارات الجديدة)
  useEffect(() => {
    if (!student?.id) return
    fetch(`/api/student/assigned-tests?studentId=${encodeURIComponent(student.id)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        const ids = data.modelIds ?? []
        setAssignedTestsCount(ids.length)
      })
      .catch(() => setAssignedTestsCount(0))
  }, [student?.id])

  const quickSkills = useMemo((): SkillItem[] => {
    const rows = mastery.filter((m) => m.key.startsWith("skill:"))
    return rows.slice(0, 6).map((m) => {
      const name = m.key.replace(/^skill:/, "")
      const score = typeof m.score === "number" ? Math.round(m.score) : 0
      const level: SkillItem["level"] =
        score >= 80 ? "متقنة" : score >= 60 ? "متوسطة" : "ضعيفة"
      return { name, score, level }
    })
  }, [mastery])

  const avgScore = useMemo(() => {
    if (quickSkills.length === 0) return null
    const sum = quickSkills.reduce((a, s) => a + s.score, 0)
    return Math.round(sum / quickSkills.length)
  }, [quickSkills])

  const readinessLabel =
    avgScore === null
      ? "ابدئي التدريب"
      : avgScore >= 80
        ? "متقدمة"
        : avgScore >= 60
          ? "متوسطة"
          : "تحتاج دعم"

  return (
    <main className="space-y-10">
      <header className="card bg-primary-600 text-white">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm opacity-80">
              {student?.name?.trim() ? `مرحبا ${student.name.trim()}` : "مرحبا، أهلاً بكِ"}
            </p>
            <h1 className="text-3xl font-bold">جاهزتك الحالية: {readinessLabel}</h1>
            <p className="mt-2 text-white/80">
              {quickSkills.length > 0
                ? "استمري في التدريب عبر الألعاب التعليمية لتحسين مهاراتك."
                : "ابدئي بالاختبارات والألعاب لرصد مهاراتك وتتبع تقدمك."}
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 px-6 py-4 text-center">
            <p className="text-sm">متوسط المهارات المُسجّلة</p>
            <p className="text-4xl font-bold">
              {avgScore !== null ? `${avgScore}%` : "0%"}
            </p>
            <p className="text-emerald-200">
              {quickSkills.length > 0
                ? `${quickSkills.length} مهارة مُتابعة`
                : "لا توجد مهارات مُسجّلة بعد"}
            </p>
          </div>
        </div>
      </header>

      {assignedTestsCount > 0 && (
        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4 text-primary-800">
          <p className="font-semibold">
            لديك {assignedTestsCount} اختبار{assignedTestsCount > 1 ? "ات" : ""} معين من معلمتك.
          </p>
          <p className="mt-1 text-sm opacity-90">
            ادخلي من &quot;محاكاة اختبار نافس&quot; أدناه لبدء الاختبار.
          </p>
        </div>
      )}

      <section>
        <SectionHeader title="إجراءات سريعة" subtitle="اختاري ما يناسبك لبدء التدريب الآن" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`rounded-3xl border bg-white p-6 text-center font-semibold text-slate-900 shadow-soft transition hover:-translate-y-1 ${
                assignedTestsCount > 0 && action.href === "/student/simulation/select"
                  ? "border-primary-300 ring-2 ring-primary-200"
                  : "border-slate-100"
              }`}
              style={{ boxShadow: "0 12px 20px rgba(15, 23, 42, 0.05)" }}
            >
              <span className={`badge mb-3 text-white ${action.accent}`}>
                {assignedTestsCount > 0 && action.href === "/student/simulation/select" ? "اختبارات معينة" : "جاهزة"}
              </span>
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="ملف مهاراتي"
          subtitle="تابعي مستوى كل مهارة ومعرفة الأنشطة المقترحة"
          action={
            <Link href="/student/skills" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold">
              عرض جميع المهارات
            </Link>
          }
        />
        {loading ? (
          <div className="card py-8 text-center text-slate-500">جاري تحميل المهارات...</div>
        ) : quickSkills.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {quickSkills.map((skill) => (
              <SkillBadge
                key={skill.name}
                label={skill.name}
                value={skill.score}
                level={skill.level}
              />
            ))}
          </div>
        ) : (
          <div className="card rounded-2xl border border-slate-200 bg-slate-50/50 py-8 text-center">
            <p className="text-slate-600">لا توجد مهارات مسجّلة بعد.</p>
            <p className="mt-1 text-sm text-slate-500">
              ابدئي بالاختبارات أو الألعاب لرصد مستوى مهاراتك.
            </p>
            <Link
              href="/student/simulation/select"
              className="mt-4 inline-block rounded-2xl bg-primary-600 px-6 py-2 text-sm font-semibold text-white"
            >
              محاكاة اختبار نافس
            </Link>
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <SectionHeader
            title="الألعاب التعليمية"
            subtitle="ابدئي من هنا واستمتعي بالتعلم"
            action={
              <Link href="/student/games" className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold">
                عرض جميع الألعاب
              </Link>
            }
          />
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-start gap-3">
              <span className="text-3xl">🎮</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">جاهزة للبدء</h3>
                <p className="mt-1 text-sm text-slate-700">
                  اختاري فصلًا ثم ابدئي اللعب. كل لعبة قصيرة وتساعدك على فهم الدرس بسرعة.
                </p>
                <Link
                  href="/student/games"
                  className="mt-4 inline-block rounded-2xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  ابدئي اللعب الآن
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <SectionHeader title="تقدمك" />
          <ProgressCard
            label="المهارات المُتابعة"
            value={quickSkills.length > 0 ? Math.min(100, quickSkills.length * 15) : 0}
          />
          <ProgressCard
            label="متوسط الإتقان"
            value={avgScore !== null ? avgScore : 0}
            accent="bg-accent-500"
          />
          <ProgressCard
            label="المهارات المتقنة"
            value={
              quickSkills.length > 0
                ? Math.round(
                    (quickSkills.filter((s) => s.level === "متقنة").length / quickSkills.length) * 100
                  )
                : 0
            }
            accent="bg-emerald-500"
          />
        </div>
      </section>
    </main>
  )
}

export default function StudentHome() {
  return (
    <StudentAuthGuard>
      <StudentHomeContent />
    </StudentAuthGuard>
  );
}
