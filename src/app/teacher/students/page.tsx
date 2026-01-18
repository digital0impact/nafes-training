"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react"
import Link from "next/link"
import { SectionHeader } from "@/components/ui/section-header"
import { PageBackground } from "@/components/layout/page-background"

type Student = {
  id: string
  name: string
  grade: string
  classCode: string
}

type Class = {
  id: string
  code: string
  name: string
  grade: string
}

type TabType = "all" | "add" | "import" | "reports"

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [formData, setFormData] = useState<Student & { password?: string; classId?: string }>({
    id: "",
    name: "",
    grade: "",
    classCode: "",
    password: "",
    classId: ""
  })

  // جلب الفصول والطالبات
  useEffect(() => {
    fetchClasses()
    fetchStudents()
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
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  function handleEdit(student: Student) {
    setEditingId(student.id)
    setFormData(student)
    setActiveTab("add")
  }

  function handleCancel() {
    setEditingId(null)
    setFormData({ id: "", name: "", grade: "", classCode: "", password: "" })
    if (activeTab === "add" && !editingId) {
      setActiveTab("all")
    }
  }

  async function handleSave() {
    if (!formData.name || !formData.grade || !formData.classCode) {
      alert("الرجاء إدخال جميع الحقول المطلوبة")
      return
    }

    if (!editingId) {
      // إضافة جديدة
      if (!formData.password || formData.password.length < 4) {
        alert("كلمة المرور مطلوبة ويجب أن تكون 4 أحرف على الأقل")
        return
      }

      const newId = `STU-${String(students.length + 301).padStart(3, "0")}`
      
      try {
        const response = await fetch("/api/students/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId: newId,
            name: formData.name,
            grade: formData.grade,
            classCode: formData.classCode,
            classId: formData.classId || undefined,
            password: formData.password,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          alert(data.error || "حدث خطأ أثناء إنشاء حساب الطالبة")
          return
        }

        await fetchStudents()
        alert(`تم إنشاء حساب الطالبة بنجاح!\nرقم الطالبة: ${newId}\nكلمة المرور: ${formData.password}`)
        handleCancel()
        setActiveTab("all")
      } catch (error) {
        console.error("Error creating student:", error)
        alert("حدث خطأ أثناء إنشاء حساب الطالبة")
      }
    } else {
      // تحديث بيانات الطالبة
      await fetchStudents()
      handleCancel()
      setActiveTab("all")
    }
  }

  async function handleDelete(id: string) {
    if (confirm("هل أنت متأكدة من حذف هذه الطالبة؟")) {
      try {
        const response = await fetch(`/api/students/${id}`, {
          method: "DELETE"
        })
        
        if (response.ok) {
          await fetchStudents()
        } else {
          alert("حدث خطأ أثناء حذف الطالبة")
        }
      } catch (error) {
        console.error("Error deleting student:", error)
        alert("حدث خطأ أثناء حذف الطالبة")
      }
    }
  }

  function handleFileImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        const dataLines = lines[0]?.includes('اسم') || lines[0]?.includes('الصف') 
          ? lines.slice(1) 
          : lines

        const importedStudents: Student[] = []
        let nextId = students.length + 301
        const defaultPassword = "1234"

        for (const line of dataLines) {
          const parts = line.split(',').map(p => p.trim())
          
          if (parts.length >= 2) {
            const name = parts[0]
            const grade = parts[1] || ''
            const classCode = parts[2] || `SCI${grade.replace('/', '')}`
            const studentId = `STU-${String(nextId++).padStart(3, "0")}`
            
            if (name) {
              try {
                const response = await fetch("/api/students/create", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    studentId,
                    name,
                    grade,
                    classCode,
                    password: defaultPassword,
                    classId: undefined, // سيتم البحث عن الفصل باستخدام classCode
                  }),
                })

                if (response.ok) {
                  importedStudents.push({
                    id: studentId,
                    name,
                    grade,
                    classCode
                  })
                }
              } catch (error) {
                console.error(`Error creating student ${name}:`, error)
              }
            }
          }
        }

        if (importedStudents.length > 0) {
          await fetchStudents()
          alert(`تم استيراد ${importedStudents.length} طالبة بنجاح!\nكلمة المرور الافتراضية للجميع: ${defaultPassword}`)
          setActiveTab("all")
        } else {
          alert('لم يتم العثور على بيانات صحيحة في الملف أو حدث خطأ في إنشاء الحسابات')
        }
      } catch (error) {
        console.error('خطأ في استيراد الملف:', error)
        alert('حدث خطأ أثناء استيراد الملف. تأكدي من تنسيق الملف')
      } finally {
        setIsImporting(false)
        event.target.value = ''
      }
    }

    reader.readAsText(file, 'UTF-8')
  }

  function handleExportTemplate() {
    const template = 'اسم الطالبة,الصف,رمز الفصل\nسارة محمد,3/1,SCI3A\nنورة عبدالله,3/2,SCI3B'
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'نموذج_استيراد_الطالبات.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // تجميع الطالبات حسب الصف
  const studentsByGrade = students.reduce((acc, student) => {
    const grade = student.grade || "غير محدد"
    if (!acc[grade]) {
      acc[grade] = []
    }
    acc[grade].push(student)
    return acc
  }, {} as Record<string, Student[]>)

  const sortedGrades = Object.keys(studentsByGrade).sort()

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
        <div className="card bg-gradient-to-br from-white to-primary-50">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-primary-200 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab("all")
                handleCancel()
              }}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "all"
                  ? "text-primary-700 border-primary-600"
                  : "text-slate-500 border-transparent hover:text-primary-600"
              }`}
            >
              جميع الطالبات ({students.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("add")
                handleCancel()
              }}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "add"
                  ? "text-emerald-700 border-emerald-600"
                  : "text-slate-500 border-transparent hover:text-emerald-600"
              }`}
            >
              {editingId ? "تعديل طالبة" : "إضافة طالبة جديدة"}
            </button>
            <button
              onClick={() => setActiveTab("import")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "import"
                  ? "text-blue-700 border-blue-600"
                  : "text-slate-500 border-transparent hover:text-blue-600"
              }`}
            >
              استيراد طالبات
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "reports"
                  ? "text-slate-700 border-slate-600"
                  : "text-slate-500 border-transparent hover:text-slate-600"
              }`}
            >
              تقارير الطالبات
            </button>
          </div>
        </div>

        {/* All Students Tab */}
        {activeTab === "all" && (
          <div className="space-y-6">
            <SectionHeader
              title="قائمة الطالبات المسجلات"
              subtitle={`إجمالي ${students.length} طالبة مسجلة`}
            />

            {students.length === 0 ? (
              <div className="card text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">لا توجد طالبات مسجلة</h3>
                <p className="text-slate-600 mb-6">
                  ابدأي بإضافة طالبة جديدة أو استيراد طالبات من ملف
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setActiveTab("add")}
                    className="rounded-2xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
                  >
                    إضافة طالبة جديدة
                  </button>
                  <button
                    onClick={() => setActiveTab("import")}
                    className="rounded-2xl border border-primary-200 bg-primary-50 px-6 py-3 font-semibold text-primary-700 transition hover:bg-primary-100"
                  >
                    استيراد طالبات
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedGrades.map((grade) => (
                  <div key={grade} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-900">الصف: {grade}</h3>
                      <span className="badge bg-primary-100 text-primary-700">
                        {studentsByGrade[grade].length} طالبة
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
                      <table className="w-full text-right text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-6 py-3 font-semibold">رقم الطالبة</th>
                            <th className="px-6 py-3 font-semibold">اسم الطالبة</th>
                            <th className="px-6 py-3 font-semibold">رمز الفصل</th>
                            <th className="px-6 py-3 font-semibold">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentsByGrade[grade].map((student) => (
                            <tr key={student.id} className="border-t border-slate-100">
                              <td className="px-6 py-4 font-semibold text-slate-900">{student.id}</td>
                              <td className="px-6 py-4 font-semibold text-slate-900">
                                {student.name}
                              </td>
                              <td className="px-6 py-4">
                                <span className="badge bg-slate-100 text-slate-600">
                                  {student.classCode}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(student)}
                                    className="text-primary-600 underline hover:text-primary-700"
                                  >
                                    تعديل
                                  </button>
                                  <button
                                    onClick={() => handleDelete(student.id)}
                                    className="text-rose-600 underline hover:text-rose-700"
                                  >
                                    حذف
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Student Tab */}
        {activeTab === "add" && (
          <div className="space-y-6">
            <SectionHeader
              title={editingId ? "تعديل بيانات الطالبة" : "إضافة طالبة جديدة"}
              subtitle={editingId ? "عدّلي بيانات الطالبة" : "أضيفي طالبة جديدة إلى النظام"}
            />

            <div className="card space-y-4 bg-primary-50">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-600">اسم الطالبة</label>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                    placeholder="مثال: سارة محمد"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">الصف</label>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                    placeholder="مثال: 3/1"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-600">الفصل</label>
                  {classes.length > 0 ? (
                    <select
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                      value={formData.classId || ""}
                      onChange={(e) => {
                        const selectedClass = classes.find(c => c.id === e.target.value)
                        setFormData({ 
                          ...formData, 
                          classId: e.target.value,
                          classCode: selectedClass?.code || "",
                          grade: selectedClass?.grade || formData.grade
                        })
                      }}
                    >
                      <option value="">اختر الفصل</option>
                      {classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name} ({classItem.code})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                        placeholder="مثال: SCI3A"
                        value={formData.classCode}
                        onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                      />
                      <Link
                        href="/teacher/classes"
                        className="block text-xs text-primary-600 hover:text-primary-700"
                      >
                        + إنشاء فصل جديد
                      </Link>
                    </div>
                  )}
                </div>
                {!editingId && (
                  <div>
                    <label className="text-sm font-semibold text-slate-600">كلمة المرور</label>
                    <input
                      type="text"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary-300 focus:outline-none"
                      placeholder="مثال: 1234"
                      value={formData.password || ""}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      minLength={4}
                    />
                    <p className="mt-1 text-xs text-slate-500">سيتم عرض كلمة المرور بعد الإنشاء</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="rounded-2xl bg-primary-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  حفظ
                </button>
                <button
                  onClick={() => {
                    handleCancel()
                    setActiveTab("all")
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Students Tab */}
        {activeTab === "import" && (
          <div className="space-y-6">
            <SectionHeader
              title="استيراد طالبات من ملف"
              subtitle="استوردي قائمة الطالبات من ملف CSV أو Excel"
            />

            <div className="card space-y-6">
              <div className="rounded-2xl border-2 border-dashed border-primary-300 bg-primary-50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">رفع ملف الطالبات</h3>
                <p className="mb-4 text-slate-600">
                  قومي برفع ملف CSV أو Excel يحتوي على بيانات الطالبات
                </p>
                <label className="inline-block rounded-2xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 cursor-pointer">
                  {isImporting ? 'جاري الاستيراد...' : '📥 اختيار ملف'}
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileImport}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h4 className="mb-3 text-sm font-semibold text-slate-900">تنسيق الملف المطلوب:</h4>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <code className="text-xs text-slate-700">
                    اسم الطالبة,الصف,رمز الفصل<br />
                    سارة محمد,3/1,SCI3A<br />
                    نورة عبدالله,3/2,SCI3B
                  </code>
                </div>
                <button
                  onClick={handleExportTemplate}
                  className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  📄 تحميل نموذج CSV
                </button>
              </div>

              <div className="rounded-2xl bg-blue-50 border-blue-200 p-4">
                <h4 className="mb-2 text-sm font-semibold text-blue-900">ملاحظات مهمة:</h4>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li>• يجب أن يكون الملف بصيغة CSV أو Excel</li>
                  <li>• السطر الأول يمكن أن يحتوي على العناوين (سيتم تجاهله)</li>
                  <li>• كلمة المرور الافتراضية للطالبات المستوردة: 1234</li>
                  <li>• سيتم إنشاء رقم طالبة تلقائياً لكل طالبة</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="card p-0 overflow-hidden">
            <iframe
              src="/teacher/reports"
              className="w-full h-[800px] border-0"
              title="تقارير الطالبات"
            />
          </div>
        )}
      </div>
    </main>
  )
}
