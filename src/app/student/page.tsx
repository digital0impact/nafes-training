"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { StudentAuthGuard, useStudentAuth } from "@/components/student"
import {
  TOTAL_LEARNING_INDICATORS,
  INDICATOR_COUNTS_BY_DOMAIN,
} from "@/lib/data"

type MasteryRow = {
  id: string
  key: string
  status: string
  score: number | null
  updatedAt: string
}

const DOMAINS = ["علوم الحياة", "العلوم الفيزيائية", "علوم الأرض والفضاء"] as const

const tiles = [
  {
    label: "الاختبارات",
    href: "/student/simulation/select",
    description: "محاكاة اختبار نافس والاختبارات المعينة",
    icon: "📋",
    accent: "from-primary-600 to-primary-700",
    border: "border-primary-200",
    disabled: false,
  },
  {
    label: "مهاراتي",
    href: "/student/skills",
    description: "نواتج التعلم وتقدمك",
    icon: "📊",
    accent: "from-emerald-600 to-emerald-700",
    border: "border-emerald-200",
    disabled: false,
  },
  {
    label: "التدريب السريع",
    href: "/student/games",
    description: "ألعاب تعليمية مشتركة من المعلم — الجديدة والمنجزة",
    icon: "⚡",
    accent: "from-amber-500 to-amber-600",
    border: "border-amber-200",
    disabled: false,
  },
]

function StudentHomeContent() {
  const { student } = useStudentAuth()
  const [mastery, setMastery] = useState<MasteryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!student?.id) {
      setLoading(false)
      return
    }
    fetch(`/api/student/mastery?studentId=${encodeURIComponent(student.id)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => setMastery(data.mastery || []))
      .catch(() => setMastery([]))
      .finally(() => setLoading(false))
  }, [student?.id])

  // إتقان المجالات الثلاثة (مفتاح skill:المجال) — مرتبط بمؤشرات نواتج التعلم الـ 166
  const progressStats = useMemo(() => {
    const totalIndicators = TOTAL_LEARNING_INDICATORS
    const domainMastery = DOMAINS.reduce<Record<string, { status: string; score: number }>>(
      (acc, domain) => {
        const key = `skill:${domain}`
        const row = mastery.find((m) => m.key === key)
        const status = row?.status ?? "not_mastered"
        const score = typeof row?.score === "number" ? row.score : 0
        const isMastered = status === "mastered" || score >= 80
        acc[domain] = { status: isMastered ? "mastered" : "not_mastered", score }
        return acc
      },
      {}
    )
    let masteredIndicators = 0
    DOMAINS.forEach((domain) => {
      if (domainMastery[domain]?.status === "mastered") {
        masteredIndicators += INDICATOR_COUNTS_BY_DOMAIN[domain] ?? 0
      }
    })
    const avgScore =
      DOMAINS.length > 0
        ? Math.round(
            DOMAINS.reduce((s, d) => s + (domainMastery[d]?.score ?? 0), 0) / DOMAINS.length
          )
        : 0
    const masteredPercent =
      totalIndicators > 0
        ? Math.round((masteredIndicators / totalIndicators) * 100)
        : 0
    return {
      totalIndicators,
      masteredIndicators,
      avgScore,
      masteredPercent,
    }
  }, [mastery])

  return (
    <main className="min-h-screen space-y-6 p-3 sm:space-y-8 sm:p-4">
      {/* الشريط العلوي */}
      <header className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 shadow-lg sm:p-6">
        <p className="text-sm opacity-90">
          {student?.name?.trim() ? `مرحبا، ${student.name.trim()}` : "مرحبا، أهلاً بكِ"}
        </p>
        <h1 className="mt-1 text-xl font-bold sm:text-2xl">
          منصة تدريب نافس — علوم ثالث متوسط
        </h1>
        <p className="mt-2 text-sm text-white/85">
          اختاري من الخيارات أدناه لبدء التدريب أو متابعة تقدمك.
        </p>
      </header>

      {/* تقدمك — مرتبط بتحقيق مؤشرات نواتج التعلم (166 مؤشرًا في ثلاثة مجالات) */}
      <section className="card border-primary-100 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">تقدمك</h2>
        <p className="mt-1 text-sm text-slate-500">
          مؤشرات نواتج التعلم: علوم الحياة، العلوم الفيزيائية، علوم الأرض والفضاء
        </p>
        {loading ? (
          <p className="mt-2 text-sm text-slate-500">جاري تحميل التقدم...</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-primary-50 p-4 text-center">
              <p className="text-2xl font-bold text-primary-700 sm:text-3xl">
                {progressStats.totalIndicators}
              </p>
              <p className="mt-1 text-xs font-medium text-primary-600 sm:text-sm">
                إجمالي المؤشرات
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-800 sm:text-3xl">
                {progressStats.avgScore}%
              </p>
              <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
                متوسط الإتقان
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700 sm:text-3xl">
                {progressStats.masteredIndicators}
              </p>
              <p className="mt-1 text-xs font-medium text-emerald-600 sm:text-sm">
                مؤشرات متقنة
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 text-center">
              <p className="text-2xl font-bold text-amber-700 sm:text-3xl">
                {progressStats.masteredPercent}%
              </p>
              <p className="mt-1 text-xs font-medium text-amber-600 sm:text-sm">
                نسبة الإنجاز
              </p>
            </div>
          </div>
        )}
        {!loading && progressStats.masteredIndicators === 0 && (
          <p className="mt-2 text-sm text-slate-500">
            ابدئي بالاختبارات أو التدريب السريع لرصد تقدمك في مؤشرات نواتج التعلم.
          </p>
        )}
      </section>

      {/* أربع مربعات */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {tiles.map((tile) =>
          tile.disabled ? (
            <div
              key={tile.label}
              className={`flex flex-col rounded-2xl border-2 border-slate-200 bg-slate-100 p-6 text-center opacity-75 sm:rounded-3xl sm:p-8 cursor-not-allowed`}
            >
              <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-300 text-2xl sm:h-16 sm:w-16 sm:text-3xl">
                {tile.icon}
              </span>
              <h2 className="text-lg font-bold text-slate-500 sm:text-xl">
                {tile.label}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {tile.description}
              </p>
              <p className="mt-2 text-xs font-semibold text-amber-600">
                معطلة مؤقتاً
              </p>
            </div>
          ) : (
            <Link
              key={tile.label}
              href={tile.href}
              className={`group flex flex-col rounded-2xl border-2 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-8 ${tile.border}`}
            >
              <span
                className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-inner sm:h-16 sm:w-16 sm:text-3xl ${tile.accent}`}
                style={{ filter: "brightness(1.05)" }}
              >
                {tile.icon}
              </span>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                {tile.label}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {tile.description}
              </p>
            </Link>
          )
        )}
      </section>
    </main>
  )
}

export default function StudentHome() {
  return (
    <StudentAuthGuard>
      <StudentHomeContent />
    </StudentAuthGuard>
  )
}
