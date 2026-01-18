"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react"
import type { Activity } from "@/lib/activities"
import { SectionHeader } from "@/components/ui/section-header"
import { ActivityTemplateSelector, type ActivityTemplate } from "@/features/activities/components/activity-template-selector"
import { TemplateActivityForm } from "@/features/activities/components/template-activity-form"
import { PageBackground } from "@/components/layout/page-background"

const skillColors: Record<string, string> = {
  "علوم الحياة": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "العلوم الفيزيائية": "bg-blue-50 text-blue-700 border-blue-200",
  "علوم الأرض والفضاء": "bg-amber-50 text-amber-700 border-amber-200"
}

const levelColors: Record<string, string> = {
  "متقدمة": "bg-purple-50 text-purple-700",
  "متوسطة": "bg-blue-50 text-blue-700",
  "تحتاج دعم": "bg-rose-50 text-rose-700"
}

type TabType = "all" | "shared" | "unshared" | "create"

type Student = {
  id: string;
  nickname: string;
  classCode: string;
};

export default function ActivitiesManagementPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [sharedActivities, setSharedActivities] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [sendToAll, setSendToAll] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [cleaning, setCleaning] = useState(false)
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null)

  // Load activities and shared status
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/activities")
        const data = await response.json()
        setActivities(data.activities || [])

        // Load shared activities from localStorage
        const saved = localStorage.getItem("sharedActivities")
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            setSharedActivities(new Set(parsed))
          } catch (e) {
            console.error("Error loading shared activities", e)
          }
        }
      } catch (error) {
        console.error("Error loading activities", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // جلب قائمة الطلاب
  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      const response = await fetch("/api/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoadingStudents(false)
    }
  }

  // استيراد الأنشطة من ملف JSON
  const handleImportActivities = async () => {
    setImporting(true)
    setImportMessage(null)
    try {
      const response = await fetch("/api/activities/import", {
        method: "POST",
      })
      const data = await response.json()
      
      if (response.ok) {
        setImportMessage(`✅ ${data.message}`)
        // إعادة تحميل الأنشطة
        const activitiesResponse = await fetch("/api/activities")
        const activitiesData = await activitiesResponse.json()
        setActivities(activitiesData.activities || [])
      } else {
        setImportMessage(`❌ ${data.error || "حدث خطأ أثناء الاستيراد"}`)
      }
    } catch (error) {
      console.error("Error importing activities:", error)
      setImportMessage("❌ حدث خطأ أثناء استيراد الأنشطة")
    } finally {
      setImporting(false)
      setTimeout(() => setImportMessage(null), 5000)
    }
  }

  // حذف الأنشطة غير المدمجة
  const handleCleanupActivities = async () => {
    if (!confirm("هل أنت متأكد من حذف الأنشطة غير المدمجة؟ هذا الإجراء لا يمكن التراجع عنه.")) {
      return
    }

    setCleaning(true)
    setCleanupMessage(null)
    try {
      const response = await fetch("/api/activities/cleanup", {
        method: "POST",
      })
      const data = await response.json()
      
      if (response.ok) {
        setCleanupMessage(`✅ ${data.message}`)
        // إعادة تحميل الأنشطة
        const activitiesResponse = await fetch("/api/activities")
        const activitiesData = await activitiesResponse.json()
        setActivities(activitiesData.activities || [])
      } else {
        setCleanupMessage(`❌ ${data.error || "حدث خطأ أثناء الحذف"}`)
      }
    } catch (error) {
      console.error("Error cleaning up activities:", error)
      setCleanupMessage("❌ حدث خطأ أثناء حذف الأنشطة")
    } finally {
      setCleaning(false)
      setTimeout(() => setCleanupMessage(null), 5000)
    }
  }

  // فتح نافذة المعاينة
  const openPreviewModal = (activity: Activity) => {
    setSelectedActivity(activity)
    setShowPreviewModal(true)
  }

  // إغلاق نافذة المعاينة
  const closePreviewModal = () => {
    setShowPreviewModal(false)
    setSelectedActivity(null)
  }

  // فتح نافذة الإرسال
  const openSendModal = (activity: Activity) => {
    setSelectedActivity(activity)
    setShowSendModal(true)
    fetchStudents()
  }

  // إغلاق نافذة الإرسال
  const closeSendModal = () => {
    setShowSendModal(false)
    setSelectedActivity(null)
    setSelectedStudents(new Set())
    setSendToAll(false)
  }

  // تحديد/إلغاء تحديد طالبة
  const toggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents)
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId)
    } else {
      newSelected.add(studentId)
    }
    setSelectedStudents(newSelected)
  }

  // تحديد/إلغاء تحديد الكل
  const toggleSelectAll = () => {
    if (sendToAll) {
      setSendToAll(false)
      setSelectedStudents(new Set())
    } else {
      setSendToAll(true)
      setSelectedStudents(new Set(students.map(s => s.id)))
    }
  }

  // إرسال النشاط
  const handleSendActivity = async () => {
    if (!selectedActivity) return

    if (selectedStudents.size === 0 && !sendToAll) {
      alert("الرجاء اختيار طالبة واحدة على الأقل")
      return
    }

    try {
      // حفظ معلومات الإرسال
      const assignments = {
        activityId: selectedActivity.id,
        students: Array.from(selectedStudents),
        sentAt: new Date().toISOString()
      }

      const saved = localStorage.getItem("activityAssignments")
      const allAssignments = saved ? JSON.parse(saved) : []
      allAssignments.push(assignments)
      localStorage.setItem("activityAssignments", JSON.stringify(allAssignments))

      // مشاركة النشاط
      const newShared = new Set(sharedActivities)
      newShared.add(selectedActivity.id)
      setSharedActivities(newShared)
      localStorage.setItem("sharedActivities", JSON.stringify(Array.from(newShared)))

      alert(`تم إرسال النشاط إلى ${sendToAll ? 'جميع الطالبات' : selectedStudents.size + ' طالبة'}`)
      closeSendModal()
    } catch (error) {
      console.error("Error sending activity:", error)
      alert("حدث خطأ أثناء إرسال النشاط")
    }
  }

  const toggleShare = (activityId: string) => {
    const newShared = new Set(sharedActivities)
    if (newShared.has(activityId)) {
      newShared.delete(activityId)
    } else {
      newShared.add(activityId)
    }
    setSharedActivities(newShared)
    localStorage.setItem("sharedActivities", JSON.stringify(Array.from(newShared)))
  }

  // Filter activities based on active tab
  const getFilteredActivities = () => {
    switch (activeTab) {
      case "shared":
        return activities.filter((a) => sharedActivities.has(a.id))
      case "unshared":
        return activities.filter((a) => !sharedActivities.has(a.id))
      case "create":
        return []
      default:
        return activities
    }
  }

  const filteredActivities = getFilteredActivities()
  const sharedCount = activities.filter((a) => sharedActivities.has(a.id)).length
  const unsharedCount = activities.filter((a) => !sharedActivities.has(a.id)).length

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
        <PageBackground />
        <div className="relative z-10 space-y-6 p-4 py-8">
          <div className="card text-center py-12">
            <p className="text-slate-500">جاري تحميل الأنشطة...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-6 p-4 py-8">
        <header className="card bg-gradient-to-br from-white to-primary-50">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">إدارة الأنشطة</h1>
              <p className="mt-2 text-slate-600">
                قومي بإدارة الأنشطة المتاحة ومشاركتها مع الطالبات
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleImportActivities}
                disabled={importing}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {importing ? "جاري الاستيراد..." : "استيراد الأنشطة"}
              </button>
              <button
                onClick={handleCleanupActivities}
                disabled={cleaning}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {cleaning ? "جاري الحذف..." : "حذف الأنشطة غير المدمجة"}
              </button>
            </div>
          </div>
          {importMessage && (
            <div className={`mb-4 p-3 rounded-lg ${
              importMessage.includes("✅") 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
              {importMessage}
            </div>
          )}
          {cleanupMessage && (
            <div className={`mb-4 p-3 rounded-lg ${
              cleanupMessage.includes("✅") 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}>
              {cleanupMessage}
            </div>
          )}
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-primary-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "all"
                  ? "text-primary-700 border-primary-600"
                  : "text-slate-500 border-transparent hover:text-primary-600"
              }`}
            >
              جميع الأنشطة ({activities.length})
            </button>
            <button
              onClick={() => setActiveTab("shared")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "shared"
                  ? "text-emerald-700 border-emerald-600"
                  : "text-slate-500 border-transparent hover:text-emerald-600"
              }`}
            >
              الأنشطة المشتركة ({sharedCount})
            </button>
            <button
              onClick={() => setActiveTab("unshared")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "unshared"
                  ? "text-amber-700 border-amber-600"
                  : "text-slate-500 border-transparent hover:text-amber-600"
              }`}
            >
              غير المشتركة ({unsharedCount})
            </button>
            <button
              onClick={() => {
                setActiveTab("create")
                setShowTemplateSelector(true)
              }}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "create"
                  ? "text-blue-700 border-blue-600"
                  : "text-slate-500 border-transparent hover:text-blue-600"
              }`}
            >
              إنشاء نشاط جديد
            </button>
          </div>
        </header>

        {/* Create Activity Tab */}
        {activeTab === "create" && (
          <div className="space-y-6">
            {selectedTemplate ? (
              <div className="card">
                <TemplateActivityForm
                  template={selectedTemplate}
                  onCancel={() => {
                    setSelectedTemplate(null)
                    setShowTemplateSelector(false)
                    setActiveTab("all")
                  }}
                  onSuccess={() => {
                    setSelectedTemplate(null)
                    setShowTemplateSelector(false)
                    setActiveTab("all")
                    // Reload activities
                    async function reload() {
                      try {
                        const response = await fetch("/api/activities")
                        const data = await response.json()
                        setActivities(data.activities || [])
                      } catch (error) {
                        console.error("Error reloading activities", error)
                      }
                    }
                    reload()
                  }}
                />
              </div>
            ) : (
              <div className="card text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                  <svg className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">إنشاء نشاط جديد</h3>
                <p className="text-slate-600 mb-6">
                  اختري نوع النشاط الذي تريدين إنشاءه
                </p>
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="inline-block rounded-2xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
                >
                  اختيار قالب النشاط
                </button>
              </div>
            )}
          </div>
        )}

        {/* Activities List Tabs (All, Shared, Unshared) */}
        {(activeTab === "all" || activeTab === "shared" || activeTab === "unshared") && (
          <div className="space-y-6">
            <SectionHeader
              title={
                activeTab === "shared"
                  ? "الأنشطة المشتركة"
                  : activeTab === "unshared"
                  ? "الأنشطة غير المشتركة"
                  : "الأنشطة المتاحة"
              }
              subtitle={
                activeTab === "shared"
                  ? `${sharedCount} نشاط مشترك مع الطالبات`
                  : activeTab === "unshared"
                  ? `${unsharedCount} نشاط غير مشترك`
                  : `${activities.length} نشاط جاهز للاستخدام`
              }
            />

            {filteredActivities.length === 0 ? (
              <div className="card text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {activeTab === "shared"
                    ? "لا توجد أنشطة مشتركة"
                    : activeTab === "unshared"
                    ? "جميع الأنشطة مشتركة"
                    : "لا توجد أنشطة بعد"}
                </h3>
                <p className="mt-2 text-slate-600 mb-4">
                  {activeTab === "shared"
                    ? "قومي بمشاركة الأنشطة لتظهر هنا"
                    : activeTab === "unshared"
                    ? "جميع الأنشطة متاحة للطالبات"
                    : "ابدأي بإنشاء نشاط جديد للطالبات"}
                </p>
                {activeTab !== "shared" && (
                  <button
                    onClick={() => {
                      setActiveTab("create")
                      setShowTemplateSelector(true)
                    }}
                    className="inline-block rounded-2xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
                  >
                    إنشاء نشاط جديد
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredActivities.map((activity) => {
                  const isShared = sharedActivities.has(activity.id)
                  const skillColor = skillColors[activity.skill] || "bg-slate-50 text-slate-700 border-slate-200"
                  const levelColor = activity.targetLevel
                    ? levelColors[activity.targetLevel] || "bg-slate-50 text-slate-700"
                    : ""

                  return (
                    <div key={activity.id} className="card group space-y-4 transition-all hover:shadow-lg">
                      {/* Header */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="flex-1 text-lg font-bold text-slate-900">{activity.title}</h3>
                          <span className={`badge border ${skillColor}`}>{activity.skill}</span>
                        </div>
                        <p className="text-sm text-slate-600">{activity.description}</p>
                      </div>

                      {/* Content Preview */}
                      {activity.content && (
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                          {activity.type === "quiz" && (activity.content as any).fromBank && (activity.content as any).questions && (
                            <div>
                              <p className="text-xs font-semibold text-slate-600 mb-1">الأسئلة:</p>
                              <p className="text-sm text-slate-900">
                                {((activity.content as any).questions || []).length} سؤال متعدد
                              </p>
                              {((activity.content as any).questions || []).length > 0 && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                  {((activity.content as any).questions || [])[0].question}
                                </p>
                              )}
                            </div>
                          )}
                          {activity.type === "quiz" && !(activity.content as any).fromBank && (activity.content as any).question && (
                            <div>
                              <p className="text-xs font-semibold text-slate-600 mb-1">السؤال:</p>
                              <p className="text-sm text-slate-900 line-clamp-2">{(activity.content as any).question}</p>
                            </div>
                          )}
                          {activity.type === "drag-drop" && (activity.content as any).prompt && (
                            <div>
                              <p className="text-xs font-semibold text-slate-600 mb-1">التعليمات:</p>
                              <p className="text-sm text-slate-900 line-clamp-2">{(activity.content as any).prompt}</p>
                              {(activity.content as any).pairs && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {((activity.content as any).pairs || []).length} زوج للمطابقة
                                </p>
                              )}
                            </div>
                          )}
                          {activity.type === "ordering" && (activity.content as any).prompt && (
                            <div>
                              <p className="text-xs font-semibold text-slate-600 mb-1">التعليمات:</p>
                              <p className="text-sm text-slate-900 line-clamp-2">{(activity.content as any).prompt}</p>
                              {(activity.content as any).items && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {((activity.content as any).items || []).length} عنصر للترتيب
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Info */}
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-slate-500">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>المدة: {activity.duration}</span>
                          </div>
                          {activity.type && (
                            <span className="text-xs text-slate-500">
                              {activity.type === "quiz" ? "📝 اختبار" : "🔗 سحب وإفلات"}
                            </span>
                          )}
                        </div>
                        {activity.targetLevel && (
                          <div className="flex items-center gap-2">
                            <span className={`badge ${levelColor}`}>{activity.targetLevel}</span>
                          </div>
                        )}
                        {activity.outcomeLesson && (
                          <div className="text-xs text-slate-500">
                            <span className="font-semibold">ناتج التعلم:</span> {activity.outcomeLesson}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                        <button
                          onClick={() => openPreviewModal(activity)}
                          className="flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-2 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          معاينة
                        </button>
                        <button
                          onClick={() => window.location.href = `/teacher/activities/edit/${activity.id}`}
                          className="flex items-center justify-center gap-1 rounded-xl bg-amber-50 px-2 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          تعديل
                        </button>
                        <button
                          onClick={() => openSendModal(activity)}
                          className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          مشاركة
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Info Section - Only show on All tab */}
        {activeTab === "all" && (
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="mb-2 text-lg font-semibold text-blue-900">معلومات مهمة</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• قومي بمشاركة الأنشطة التي تريدين أن تراها الطالبات</li>
              <li>• الأنشطة المشتركة ستظهر للطالبات في صفحة الأنشطة</li>
              <li>• يمكنك حذف الأنشطة في أي وقت</li>
              <li>• يمكنك إنشاء أنشطة جديدة من نوع اختبار أو سحب وإفلات</li>
            </ul>
          </div>
        )}

        {/* Template Selector Modal */}
        {showTemplateSelector && !selectedTemplate && (
          <ActivityTemplateSelector
            onSelect={(template) => {
              setSelectedTemplate(template)
              setShowTemplateSelector(false)
            }}
            onClose={() => {
              setShowTemplateSelector(false)
              if (activeTab === "create") {
                setActiveTab("all")
              }
            }}
          />
        )}

        {/* Preview Modal */}
        {showPreviewModal && selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="border-b border-slate-200 p-6 bg-gradient-to-br from-white to-primary-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">معاينة النشاط</h2>
                    <p className="mt-1 text-sm text-slate-600">{selectedActivity.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {selectedActivity.type === "quiz" ? "📝 اختبار" : "🔗 سحب وإفلات"}
                      </span>
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        {selectedActivity.duration}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {selectedActivity.skill}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={closePreviewModal}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">الوصف</h3>
                    <p className="text-slate-900">{selectedActivity.description}</p>
                  </div>

                  {selectedActivity.outcomeLesson && (
                    <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">ناتج التعلم المرتبط</h3>
                      <p className="text-sm text-blue-800">{selectedActivity.outcomeLesson}</p>
                    </div>
                  )}

                  {selectedActivity.targetLevel && (
                    <div className="rounded-xl bg-purple-50 p-4 border border-purple-200">
                      <h3 className="text-sm font-semibold text-purple-900 mb-1">المستوى المستهدف</h3>
                      <p className="text-sm text-purple-800">{selectedActivity.targetLevel}</p>
                    </div>
                  )}

                  {/* Quiz Content - Multiple Questions */}
                  {selectedActivity.type === "quiz" && selectedActivity.content && (selectedActivity.content as any).fromBank && (selectedActivity.content as any).questions && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-3">
                        الأسئلة ({((selectedActivity.content as any).questions || []).length} سؤال)
                      </h3>
                      <div className="space-y-4">
                        {((selectedActivity.content as any).questions || []).map((q: any, qIndex: number) => (
                          <div key={q.id || qIndex} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                            <p className="font-semibold text-slate-900 mb-3">
                              {qIndex + 1}. {q.question}
                            </p>
                            {q.options && (
                              <div className="space-y-2">
                                {q.options.map((option: string, optIndex: number) => {
                                  const isCorrect = option === q.answer;
                                  return (
                                    <div
                                      key={optIndex}
                                      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                                        isCorrect ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-slate-200'
                                      }`}
                                    >
                                      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                      }`}>
                                        {String.fromCharCode(65 + optIndex)}
                                      </span>
                                      <span className={isCorrect ? 'font-semibold text-emerald-900' : 'text-slate-700'}>
                                        {option}
                                      </span>
                                      {isCorrect && (
                                        <span className="mr-auto text-xs text-emerald-700">✓</span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {q.reasonPrompt && (
                              <div className="mt-3 rounded-lg bg-purple-50 border border-purple-200 p-3">
                                <p className="text-xs font-semibold text-purple-900 mb-1">📝 طلب السبب:</p>
                                <p className="text-sm text-purple-800">{q.reasonPrompt}</p>
                                {q.expectedReasonKeywords && (
                                  <p className="text-xs text-purple-600 mt-1">
                                    الكلمات المفتاحية المتوقعة: {q.expectedReasonKeywords.join(", ")}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quiz Content - Single Question */}
                  {selectedActivity.type === "quiz" && selectedActivity.content && !(selectedActivity.content as any).fromBank && (selectedActivity.content as any).question && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-3">السؤال</h3>
                      <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900 mb-3">
                          {(selectedActivity.content as any).question}
                        </p>
                        {(selectedActivity.content as any).options && (
                          <div className="space-y-2">
                            {(selectedActivity.content as any).options.map((option: string, optIndex: number) => {
                              const isCorrect = option === (selectedActivity.content as any).answer;
                              return (
                                <div
                                  key={optIndex}
                                  className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                                    isCorrect ? 'bg-emerald-100 border border-emerald-300' : 'bg-white border border-slate-200'
                                  }`}
                                >
                                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                                    isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <span className={isCorrect ? 'font-semibold text-emerald-900' : 'text-slate-700'}>
                                    {option}
                                  </span>
                                  {isCorrect && (
                                    <span className="mr-auto text-xs text-emerald-700">✓</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {(selectedActivity.content as any).hint && (
                          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
                            <p className="text-xs font-semibold text-blue-900 mb-1">💡 تلميح:</p>
                            <p className="text-sm text-blue-800">{(selectedActivity.content as any).hint}</p>
                          </div>
                        )}
                        {(selectedActivity.content as any).reasonPrompt && (
                          <div className="mt-3 rounded-lg bg-purple-50 border border-purple-200 p-3">
                            <p className="text-xs font-semibold text-purple-900 mb-1">📝 طلب السبب:</p>
                            <p className="text-sm text-purple-800">{(selectedActivity.content as any).reasonPrompt}</p>
                            {(selectedActivity.content as any).expectedReasonKeywords && (
                              <p className="text-xs text-purple-600 mt-1">
                                الكلمات المفتاحية المتوقعة: {((selectedActivity.content as any).expectedReasonKeywords || []).join(", ")}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop Content */}
                  {selectedActivity.type === "drag-drop" && selectedActivity.content && (selectedActivity.content as any).pairs && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-3">
                        {(selectedActivity.content as any).prompt || "أزواج المطابقة"}
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        {((selectedActivity.content as any).pairs || []).map((pair: any, index: number) => (
                          <div key={index} className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-blue-900">{pair.label}</p>
                              </div>
                              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                              <div className="flex-1">
                                <p className="text-sm text-blue-800">{pair.target}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ordering Content */}
                  {selectedActivity.type === "ordering" && selectedActivity.content && (selectedActivity.content as any).items && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-600 mb-3">
                        {(selectedActivity.content as any).prompt || "ترتيب العناصر"}
                      </h3>
                      <div className="space-y-2">
                        {((selectedActivity.content as any).items || [])
                          .sort((a: any, b: any) => a.order - b.order)
                          .map((item: any, index: number) => (
                            <div key={item.id || index} className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4">
                              <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                                  {item.order}
                                </span>
                                <p className="text-sm font-semibold text-purple-900">{item.text}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 p-6 bg-slate-50">
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      closePreviewModal()
                      openSendModal(selectedActivity)
                    }}
                    className="flex-1 rounded-2xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
                  >
                    مشاركة هذا النشاط مع الطالبات
                  </button>
                  <button
                    onClick={closePreviewModal}
                    className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Modal */}
        {showSendModal && selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="border-b border-slate-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">مشاركة النشاط</h2>
                    <p className="mt-1 text-sm text-slate-600">{selectedActivity.title}</p>
                  </div>
                  <button
                    onClick={closeSendModal}
                    className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {loadingStudents ? (
                  <div className="py-8 text-center">
                    <p className="text-slate-600">جاري تحميل قائمة الطالبات...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-slate-600">لا توجد طالبات في الفصل</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Select All */}
                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendToAll}
                          onChange={toggleSelectAll}
                          className="h-5 w-5 rounded text-emerald-600"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">جميع الطالبات</p>
                          <p className="text-sm text-slate-600">
                            إرسال النشاط لجميع طالبات الفصل ({students.length} طالبة)
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Individual Students */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">أو اختاري طالبات محددات:</p>
                      <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                        {students.map((student) => (
                          <label
                            key={student.id}
                            className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 cursor-pointer hover:bg-slate-100 transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStudents.has(student.id)}
                              onChange={() => toggleStudent(student.id)}
                              disabled={sendToAll}
                              className="h-4 w-4 rounded text-emerald-600 disabled:opacity-50"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{student.nickname}</p>
                              <p className="text-xs text-slate-500">رمز الفصل: {student.classCode}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Selected Count */}
                    {selectedStudents.size > 0 && (
                      <div className="rounded-xl bg-emerald-50 p-3 text-center">
                        <p className="text-sm text-emerald-700">
                          تم اختيار {selectedStudents.size} {selectedStudents.size === 1 ? 'طالبة' : 'طالبات'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 p-6">
                <div className="flex gap-3">
                  <button
                    onClick={handleSendActivity}
                    disabled={selectedStudents.size === 0 && !sendToAll}
                    className="flex-1 rounded-2xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    إرسال النشاط
                  </button>
                  <button
                    onClick={closeSendModal}
                    className="rounded-2xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
