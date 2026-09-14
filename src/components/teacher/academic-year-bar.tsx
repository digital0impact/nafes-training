"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type AcademicYear = {
  id: string
  label: string
  isActive: boolean
  _count: { classes: number }
}

const STORAGE_KEY = "nafes:selectedAcademicYearId"

/**
 * شريط اختيار/بدء السنة الدراسية. يُعرض أعلى الشاشات الرئيسية
 * (الفصول، الطالبات، التقارير) ليتحكم بالسنة المعروضة في تلك الشاشة.
 *
 * - عند عدم اختيار سنة (viewingYearId = null): تُعرض بيانات "السنة الحالية"
 *   (نفس السلوك القديم قبل تفعيل الميزة، إن لم تُستخدم بعد).
 * - يحفظ آخر اختيار في localStorage حتى يبقى متسقاً بين الشاشات الثلاث.
 */
export function AcademicYearBar({
  onYearChange,
}: {
  onYearChange: (yearId: string | null) => void
}) {
  const [years, setYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fetchYears = async () => {
    try {
      const res = await fetch("/api/academic-years")
      if (res.ok) {
        const data = await res.json()
        setYears(data.academicYears || [])
      }
    } catch (err) {
      console.error("Error fetching academic years:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchYears()
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setSelected(saved)
        onYearChange(saved)
      }
    } catch {
      // localStorage قد يكون غير متاح (وضع خاص)، نتجاهل بأمان
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = (value: string) => {
    const yearId = value === "current" ? null : value
    setSelected(yearId)
    onYearChange(yearId)
    try {
      if (yearId) localStorage.setItem(STORAGE_KEY, yearId)
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      // نتجاهل بأمان
    }
  }

  const handleStartNewYear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/api/academic-years/start-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء بدء السنة الدراسية الجديدة")
        return
      }

      setShowForm(false)
      setLabel("")
      await fetchYears()
      handleSelect("current") // الرجوع لعرض السنة الحالية (الجديدة الآن)
    } catch (err) {
      console.error("Error starting new academic year:", err)
      setError("حدث خطأ أثناء الاتصال بالخادم")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-slate-700">📅 السنة الدراسية:</span>

        {years.length > 0 && (
          <select
            value={selected ?? "current"}
            onChange={(e) => handleSelect(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="current">السنة الحالية</option>
            {years.map((year) => (
              <option key={year.id} value={year.id}>
                {year.label} {year.isActive ? "(نشطة)" : `- أرشيف (${year._count.classes} فصل)`}
              </option>
            ))}
          </select>
        )}

        {!showForm && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            ➕ بدء سنة دراسية جديدة
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleStartNewYear} className="mt-3 flex flex-wrap items-start gap-2">
          <div className="w-56">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="مثال: 1447هـ"
              autoFocus
            />
          </div>
          <Button type="submit" size="sm" isLoading={submitting} disabled={!label.trim()}>
            بدء السنة
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowForm(false)
              setLabel("")
              setError("")
            }}
          >
            إلغاء
          </Button>
          {error && <p className="w-full text-sm text-red-600">{error}</p>}
        </form>
      )}

      {years.length > 0 && !showForm && (
        <p className="mt-2 text-xs text-slate-500">
          بدء سنة جديدة لا يحذف أي بيانات — فصول وطالبات السنوات السابقة تبقى محفوظة ويمكن مراجعتها من هذه القائمة.
        </p>
      )}
    </div>
  )
}
