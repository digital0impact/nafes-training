 "use client"

import { useEffect, useMemo, useState } from "react"
import { SkillBadge } from "@/components/ui/skill-badge"
import { StudentAuthGuard, useStudentAuth } from "@/components/student"

type MasteryRow = {
  id: string
  key: string
  status: string
  score: number | null
  updatedAt: string
}

export default function SkillsPage() {
  const { student } = useStudentAuth()
  const [mastery, setMastery] = useState<MasteryRow[]>([])
  const [loading, setLoading] = useState(true)

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

  const masteryBySkill = useMemo(() => {
    const rows = mastery.filter((m) => m.key.startsWith("skill:"))
    const items = rows.map((m) => {
      const name = m.key.replace(/^skill:/, "")
      const score = typeof m.score === "number" ? Math.round(m.score) : 0
      const level =
        score >= 80 ? ("متقنة" as const) : score >= 60 ? ("متوسطة" as const) : ("ضعيفة" as const)
      return { name, score, level }
    })
    // تجميع بسيط: كل المهارات في مجموعة واحدة حالياً
    return [
      {
        title: "مهاراتي (حسب الاختبارات/الألعاب)",
        items,
      },
    ]
  }, [mastery])

  return (
    <StudentAuthGuard>
      <main className="space-y-8">
      <header className="card bg-white">
        <p className="text-sm text-slate-500">مهاراتي</p>
        <h1 className="text-3xl font-bold text-slate-900">نظرة تفصيلية</h1>
        <p className="mt-2 text-slate-600">
          تظهر هنا المهارات التي تم رصدها من نتائج الاختبارات/الألعاب.
        </p>
      </header>

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
    </main>
    </StudentAuthGuard>
  )
}

