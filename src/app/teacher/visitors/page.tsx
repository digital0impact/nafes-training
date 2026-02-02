"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type VisitorItem = {
  id: string
  visitorId: string
  email: string
  name: string
  isDisabled: boolean
  isActive: boolean
  scope: string[]
  createdAt: string
}

const SCOPE_LABELS: Record<string, string> = {
  nafes_plan: "خطة نافس",
  activities: "الأنشطة",
  results: "النتائج",
  learning_indicators: "مؤشرات التعلم",
}

export default function TeacherVisitorsPage() {
  const [visitors, setVisitors] = useState<VisitorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState("")
  const [addEmail, setAddEmail] = useState("")
  const [addPassword, setAddPassword] = useState("")
  const [addScope, setAddScope] = useState<string[]>(["nafes_plan", "activities", "results", "learning_indicators"])
  const [addSubmitting, setAddSubmitting] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchVisitors = () => {
    setLoading(true)
    fetch("/api/teacher/visitors")
      .then((r) => r.json())
      .then((data) => {
        setVisitors(data.visitors ?? [])
      })
      .catch(() => setVisitors([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchVisitors()
  }, [])

  const toggleScope = (key: string) => {
    setAddScope((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    )
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName.trim() || !addEmail.trim() || !addPassword) {
      setAddError("الاسم، البريد الإلكتروني، وكلمة المرور مطلوبة")
      return
    }
    setAddSubmitting(true)
    setAddError(null)
    setSuccessMessage(null)
    fetch("/api/teacher/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addName.trim(),
        email: addEmail.trim().toLowerCase(),
        password: addPassword,
        scope: addScope,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setSuccessMessage(data.message ?? "تم إضافة الزائر")
        setShowAdd(false)
        setAddName("")
        setAddEmail("")
        setAddPassword("")
        fetchVisitors()
      })
      .catch((err) => setAddError(err.message || "حدث خطأ"))
      .finally(() => setAddSubmitting(false))
  }

  const handleDisable = (profileId: string, isDisabled: boolean) => {
    fetch(`/api/teacher/visitors/${profileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDisabled }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        fetchVisitors()
      })
      .catch(console.error)
  }

  const handleRemove = (profileId: string) => {
    if (!confirm("إزالة صلاحية هذا الزائر؟ لن يتمكن من الوصول لمحتواك.")) return
    fetch(`/api/teacher/visitors/${profileId}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        fetchVisitors()
      })
      .catch(console.error)
  }

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/teacher"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            ← العودة للوحة التحكم
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">إدارة الزوار</h1>
          <p className="mt-1 text-sm text-slate-600">
            إضافة أو إزالة صلاحية الزائر، تعطيل حسابه، وتحديد نطاق ما يمكنه مشاهدته.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          {showAdd ? "إلغاء" : "إضافة زائر"}
        </button>
      </header>

      {successMessage && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {showAdd && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">إضافة زائر جديد</h2>
          <form onSubmit={handleAdd} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-700">الاسم</label>
              <input
                type="text"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">كلمة المرور (يشاركها المعلم مع الزائر)</label>
              <input
                type="password"
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                required
                minLength={6}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">نطاق العرض (ما يمكن للزائر مشاهدته)</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {Object.entries(SCOPE_LABELS).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={addScope.includes(key)}
                      onChange={() => toggleScope(key)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            {addError && <p className="text-sm text-red-600">{addError}</p>}
            <button
              type="submit"
              disabled={addSubmitting}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {addSubmitting ? "جاري الإضافة..." : "إضافة الزائر"}
            </button>
          </form>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">قائمة الزوار</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">جاري التحميل...</div>
        ) : visitors.length === 0 ? (
          <div className="p-8 text-center text-slate-500">لا يوجد زوار مضافون بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">الاسم</th>
                  <th className="px-6 py-3 font-semibold">البريد</th>
                  <th className="px-6 py-3 font-semibold">نطاق العرض</th>
                  <th className="px-6 py-3 font-semibold">الحالة</th>
                  <th className="px-6 py-3 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-medium text-slate-800">{v.name}</td>
                    <td className="px-6 py-4 text-slate-600">{v.email}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {v.scope.map((s) => SCOPE_LABELS[s] || s).join("، ")}
                    </td>
                    <td className="px-6 py-4">
                      {v.isDisabled ? (
                        <span className="rounded bg-red-100 px-2 py-0.5 text-red-700">معطّل</span>
                      ) : v.isActive ? (
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700">نشط</span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">تمت إزالته</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {v.isActive && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDisable(v.id, !v.isDisabled)}
                            className="ml-2 text-amber-600 hover:underline"
                          >
                            {v.isDisabled ? "تفعيل" : "تعطيل"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(v.id)}
                            className="ml-2 text-red-600 hover:underline"
                          >
                            إزالة الصلاحية
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
