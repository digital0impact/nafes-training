"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { TeacherHeader } from "@/features/classes/components/teacher-header"
import { PageBackground } from "@/components/layout/page-background"

type Class = {
  id: string
  code: string
  name: string
  grade: string
  createdAt: string
  students: Array<{
    id: string
    studentId: string
    name: string
    grade: string
  }>
  _count: {
    students: number
  }
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [classData, setClassData] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchClass()
    }
  }, [params.id])

  const fetchClass = async () => {
    try {
      const response = await fetch(`/api/classes/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setClassData(data.class)
      } else {
        router.push("/teacher/classes")
      }
    } catch (error) {
      console.error("Error fetching class:", error)
      router.push("/teacher/classes")
    } finally {
      setLoading(false)
    }
  }

  const copyClassCode = () => {
    if (classData) {
      navigator.clipboard.writeText(classData.code)
      alert(`تم نسخ رمز الفصل: ${classData.code}`)
    }
  }

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
        <PageBackground />
        <div className="relative z-10 p-4 py-8">
          <div className="card text-center py-12">
            <p className="text-slate-500">جاري تحميل بيانات الفصل...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!classData) {
    return null
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
        <TeacherHeader />

        <div className="card bg-white">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Link
                href="/teacher/classes"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                ← العودة إلى الفصول
              </Link>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">
                {classData.name}
              </h1>
              <p className="mt-1 text-sm text-slate-600">الصف: {classData.grade}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyClassCode}
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                نسخ رمز الفصل
              </button>
            </div>
          </div>

          {/* رمز الفصل */}
          <div className="mb-6 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-emerald-700">
                رمز الفصل (شاركيه مع الطالبات)
              </p>
              <p className="mt-2 text-4xl font-bold text-emerald-900">
                {classData.code}
              </p>
              <button
                onClick={copyClassCode}
                className="mt-4 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                نسخ الرمز
              </button>
            </div>
          </div>

          {/* قائمة الطالبات */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                الطالبات ({classData.students.length})
              </h2>
              <Link
                href="/teacher/students"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                إضافة طالبة
              </Link>
            </div>

            {classData.students.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-600">لا توجد طالبات في هذا الفصل</p>
                <Link
                  href="/teacher/students"
                  className="mt-4 inline-block rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  إضافة طالبة
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {classData.students.map((student) => (
                  <div
                    key={student.id}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <p className="font-semibold text-slate-900">{student.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {student.studentId}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

