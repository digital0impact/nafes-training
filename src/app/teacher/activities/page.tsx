"use client"

import { useState, useEffect } from "react"
import type { Activity } from "@/lib/activities"
import { SectionHeader } from "@/components/ui/section-header"
import { ActivityTemplateSelector, type ActivityTemplate } from "@/components/activities/activity-template-selector"
import { TemplateActivityForm } from "@/components/activities/template-activity-form"
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

export default function ActivitiesManagementPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [sharedActivities, setSharedActivities] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null)

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

  const deleteActivity = async (activityId: string) => {
    if (!confirm("هل أنت متأكدة من حذف هذا النشاط؟")) {
      return
    }

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        // Remove from local state
        setActivities(activities.filter((a) => a.id !== activityId))
        
        // Remove from shared if it was shared
        const newShared = new Set(sharedActivities)
        newShared.delete(activityId)
        setSharedActivities(newShared)
        localStorage.setItem("sharedActivities", JSON.stringify(Array.from(newShared)))
      } else {
        alert("حدث خطأ أثناء حذف النشاط")
      }
    } catch (error) {
      console.error("Error deleting activity", error)
      alert("حدث خطأ أثناء حذف النشاط")
    }
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
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-slate-900">إدارة الأنشطة</h1>
            <p className="mt-2 text-slate-600">
              قومي بإدارة الأنشطة المتاحة ومشاركتها مع الطالبات
            </p>
          </div>
          
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

                      {/* Share Status */}
                      <div className="border-t border-slate-100 pt-3">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">حالة المشاركة</span>
                          <span
                            className={`badge ${
                              isShared
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isShared ? "✓ مشترك" : "غير مشترك"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleShare(activity.id)}
                            className={`flex-1 rounded-2xl py-2 text-sm font-semibold transition ${
                              isShared
                                ? "border-2 border-rose-500 bg-white text-rose-600 hover:bg-rose-50"
                                : "bg-primary-600 text-white hover:bg-primary-700"
                            }`}
                          >
                            {isShared ? "إلغاء المشاركة" : "مشاركة مع الطالبات"}
                          </button>
                          <button
                            onClick={() => deleteActivity(activity.id)}
                            className="rounded-2xl border-2 border-rose-500 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                            title="حذف النشاط"
                          >
                            🗑️
                          </button>
                        </div>
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
      </div>
    </main>
  )
}
