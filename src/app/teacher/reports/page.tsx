"use client"

import { useState, useEffect } from "react"
import { PageBackground } from "@/components/layout/page-background"
import { TeacherHeader } from "@/features/classes/components/teacher-header"

type StudentReport = {
  nickname: string
  attempts: number
  averageScore: number
  bestScore: number
  lastAttempt: string | null
}

type ClassReport = {
  classId: string
  className: string
  classCode: string
  grade: string
  totalAttempts: number
  averageScore: number
  studentReports: StudentReport[]
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ClassReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports")
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "لا يوجد"
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const selectedClassReport = selectedClass
    ? reports.find((r) => r.classId === selectedClass)
    : null

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
        <PageBackground />
        <div className="relative z-10 p-4 py-8">
          <div className="card text-center py-12">
            <p className="text-slate-500">جاري تحميل التقارير...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
        <TeacherHeader />

        <header className="card bg-gradient-to-br from-white to-primary-50">
          <div className="mb-4">
            <p className="text-sm text-slate-500">تقارير مفصلة</p>
            <h1 className="text-3xl font-bold text-slate-900">
              تقارير الفصول والطلاب
            </h1>
            <p className="mt-2 text-slate-600">
              عرض عدد المحاولات ومتوسط الدرجات لكل فصل
            </p>
          </div>
        </header>

        {reports.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-600">لا توجد تقارير بعد</p>
            <p className="mt-2 text-sm text-slate-500">
              سيظهر هنا تقرير بعد أن يبدأ الطلاب في التدريب
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ملخص الفصول */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <div
                  key={report.classId}
                  className={`card cursor-pointer transition-all hover:shadow-lg ${
                    selectedClass === report.classId
                      ? "ring-2 ring-primary-500 bg-primary-50"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedClass(
                      selectedClass === report.classId ? null : report.classId
                    )
                  }
                >
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      {report.className}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {report.classCode} • الصف: {report.grade}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                      <span className="text-sm font-medium text-slate-700">
                        إجمالي المحاولات
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {report.totalAttempts}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3">
                      <span className="text-sm font-medium text-emerald-700">
                        متوسط الدرجات
                      </span>
                      <span className="text-lg font-bold text-emerald-900">
                        {report.averageScore.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
                      <span className="text-sm font-medium text-blue-700">
                        عدد الطلاب
                      </span>
                      <span className="text-lg font-bold text-blue-900">
                        {report.studentReports.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* تفاصيل الفصل المحدد */}
            {selectedClassReport && (
              <div className="card">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      تفاصيل الفصل: {selectedClassReport.className}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      كود الفصل: {selectedClassReport.classCode}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    إغلاق
                  </button>
                </div>

                {selectedClassReport.studentReports.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600">
                      لا توجد محاولات تدريب لهذا الفصل بعد
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                            الاسم المستعار
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                            عدد المحاولات
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                            متوسط الدرجات
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                            أفضل درجة
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                            آخر محاولة
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedClassReport.studentReports.map((student) => (
                          <tr
                            key={student.nickname}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 text-right font-medium text-slate-900">
                              {student.nickname}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-700">
                              {student.attempts}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`font-semibold ${
                                  student.averageScore >= 80
                                    ? "text-emerald-600"
                                    : student.averageScore >= 60
                                    ? "text-blue-600"
                                    : "text-rose-600"
                                }`}
                              >
                                {student.averageScore.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-semibold text-emerald-600">
                                {student.bestScore.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-slate-600">
                              {formatDate(student.lastAttempt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
