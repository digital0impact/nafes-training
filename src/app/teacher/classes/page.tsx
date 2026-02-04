"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PageBackground } from "@/components/layout/page-background"
import { createClassSchema, type CreateClassInput } from "@/lib/validations"
import { generateClassCode } from "@/lib/utils/class-code-generator"

type Class = {
  id: string
  code: string
  name: string
  grade: string
  createdAt: string
  _count: {
    students: number
  }
}

type StudentForPrint = {
  id: string
  studentId: string
  name: string
  grade: string
}

export default function ClassesPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    setError: setFormError,
  } = useForm<CreateClassInput>({
    resolver: zodResolver(createClassSchema),
  })

  // جلب الفصول
  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      if (response.ok) {
        const data = await response.json()
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CreateClassInput) => {
    try {
      const url = editingId ? `/api/classes/${editingId}` : "/api/classes"
      const method = editingId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setFormError("root", {
          message: result.error || "حدث خطأ أثناء حفظ الفصل",
        })
      } else {
        await fetchClasses()
        reset()
        setShowForm(false)
        setEditingId(null)
      }
    } catch (error) {
      setFormError("root", {
        message: "حدث خطأ أثناء حفظ الفصل",
      })
    }
  }

  const handleEdit = (classData: Class) => {
    setEditingId(classData.id)
    setValue("name", classData.name)
    setValue("grade", classData.grade)
    setValue("code", classData.code)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكدة من حذف هذا الفصل؟")) {
      return
    }

    try {
      const response = await fetch(`/api/classes/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchClasses()
      } else {
        const result = await response.json()
        alert(result.error || "حدث خطأ أثناء حذف الفصل")
      }
    } catch (error) {
      alert("حدث خطأ أثناء حذف الفصل")
    }
  }

  const handleCancel = () => {
    reset()
    setShowForm(false)
    setEditingId(null)
  }

  const handleGenerateCode = () => {
    const name = watch("name") || ""
    const grade = watch("grade") || ""
    
    if (name && grade) {
      const generatedCode = generateClassCode(name, grade)
      setValue("code", generatedCode)
    } else {
      alert("يرجى إدخال اسم الفصل والصف أولاً")
    }
  }

  const copyClassCode = (code: string) => {
    navigator.clipboard.writeText(code)
    alert(`تم نسخ رمز الفصل: ${code}`)
  }

  const handlePrintStudents = async (classData: Class) => {
    try {
      const response = await fetch(`/api/classes/${classData.id}`)
      if (!response.ok) return
      const { class: classDetail } = await response.json()
      const students: StudentForPrint[] = classDetail?.students ?? []
      const printWindow = window.open("", "_blank", "width=800,height=600")
      if (!printWindow) {
        alert("يرجى السماح بالنوافذ المنبثقة لاستخدام الطباعة")
        return
      }
      const tableRows = students
        .map(
          (s, i) =>
            `<tr><td>${i + 1}</td><td>${s.studentId}</td><td>${s.name}</td><td>${s.grade || ""}</td></tr>`
        )
        .join("")
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>قائمة الطلاب - ${classData.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 1.5rem; margin-bottom: 8px; }
            .meta { color: #64748b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: right; }
            th { background: #f1f5f9; font-weight: 600; }
          </style>
        </head>
        <body>
          <h1>قائمة الطلاب - ${classData.name}</h1>
          <p class="meta">الصف: ${classData.grade} | رمز الفصل: ${classData.code} | عدد الطلاب: ${students.length}</p>
          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>رقم الطالب</th>
                <th>اسم الطالب</th>
                <th>الصف</th>
              </tr>
            </thead>
            <tbody>${tableRows || "<tr><td colspan=\"4\">لا يوجد طلاب مسجلون في هذا الفصل</td></tr>"}</tbody>
          </table>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    } catch {
      alert("حدث خطأ أثناء جلب قائمة الطلاب")
    }
  }

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
        <PageBackground />
        <div className="relative z-10 p-4 py-8">
          <div className="card text-center py-12">
            <p className="text-slate-500">جاري تحميل الفصول...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
        <div className="card bg-white">
          <div className="mb-6 flex items-center justify-end">
            <button
              onClick={() => {
                reset()
                setEditingId(null)
                setShowForm(true)
              }}
              className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600"
            >
              + إضافة فصل جديد
            </button>
          </div>

          {/* نموذج إضافة/تعديل فصل */}
          {showForm && (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                {editingId ? "تعديل الفصل" : "إضافة فصل جديد"}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errors.root && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {errors.root.message}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      اسم الفصل
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      className={`w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.name
                          ? "border-red-300 focus:ring-red-500"
                          : "border-slate-300"
                      }`}
                      placeholder="مثال: علوم ثالث متوسط أ"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      الصف
                    </label>
                    <input
                      type="text"
                      {...register("grade")}
                      className={`w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.grade
                          ? "border-red-300 focus:ring-red-500"
                          : "border-slate-300"
                      }`}
                      placeholder="مثال: 3/1"
                    />
                    {errors.grade && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.grade.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700">
                        رمز الفصل
                      </label>
                      <button
                        type="button"
                        onClick={handleGenerateCode}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                        disabled={!watch("name") || !watch("grade")}
                      >
                        توليد تلقائي
                      </button>
                    </div>
                    <input
                      type="text"
                      {...register("code")}
                      className={`w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        errors.code
                          ? "border-red-300 focus:ring-red-500"
                          : "border-slate-300"
                      }`}
                      placeholder="اتركيه فارغاً للتوليد التلقائي أو أدخلي رمزاً مخصصاً"
                    />
                    {errors.code && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.code.message}
                      </p>
                    )}
                    {!watch("code") && watch("name") && watch("grade") && (
                      <p className="mt-1 text-xs text-slate-500">
                        سيتم توليد رمز تلقائياً عند الحفظ إذا لم تدخلي رمزاً
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-emerald-500 px-6 py-2.5 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "جاري الحفظ..."
                      : editingId
                        ? "تحديث"
                        : "إنشاء"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* قائمة الفصول */}
          {classes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
              <p className="text-slate-600">لا توجد فصول بعد</p>
              <p className="mt-2 text-sm text-slate-500">
                ابدأي بإنشاء فصل جديد
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((classData) => (
                <div
                  key={classData.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {classData.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        الصف: {classData.grade}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(classData)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(classData.id)}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        حذف
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3">
                      <div>
                        <p className="text-xs font-medium text-emerald-700">
                          رمز الفصل
                        </p>
                        <p className="mt-1 text-lg font-bold text-emerald-900">
                          {classData.code}
                        </p>
                      </div>
                      <button
                        onClick={() => copyClassCode(classData.code)}
                        className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                      >
                        نسخ
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">عدد الطالبات:</span>
                      <span className="font-semibold text-slate-900">
                        {classData._count.students}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePrintStudents(classData)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      title="طباعة قائمة الطلاب"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      طباعة قائمة الطلاب
                    </button>

                    <Link
                      href={`/teacher/classes/${classData.id}`}
                      className="block w-full rounded-lg bg-slate-100 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

