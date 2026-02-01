"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { LearningOutcomeCard } from "@/components/ui/learning-outcome-card"
import { PageBackground } from "@/components/layout/page-background"
import { learningOutcomes } from "@/lib/data"
import { TeacherHeader } from "@/features/classes/components/teacher-header"

type TabType = "view" | "edit"

export default function TeacherOutcomesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")
  const [selectedWeek, setSelectedWeek] = useState<string>("all")
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [weekOrder, setWeekOrder] = useState<Record<string, string[]>>({})
  const [topicOrder, setTopicOrder] = useState<Record<string, string[]>>({})
  const [periodChanges, setPeriodChanges] = useState<Record<string, string>>({})
  const [weekCounts, setWeekCounts] = useState<Record<string, number>>({
    "الفترة الأولى": 8,
    "الفترة الثانية": 8,
  })
  const [weekAssignments, setWeekAssignments] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<TabType>("view")
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverWeek, setDragOverWeek] = useState<string | null>(null)

  // مزامنة وضع التحرير مع التبويب النشط
  useEffect(() => {
    setIsEditMode(activeTab === "edit")
  }, [activeTab])

  // تحميل الترتيب المحفوظ من localStorage
  useEffect(() => {
    const savedWeekOrder = localStorage.getItem("weekOrder")
    if (savedWeekOrder) {
      try {
        setWeekOrder(JSON.parse(savedWeekOrder))
      } catch (e) {
        console.error("خطأ في تحميل ترتيب الأسابيع", e)
      }
    }

    const savedTopicOrder = localStorage.getItem("topicOrder")
    if (savedTopicOrder) {
      try {
        setTopicOrder(JSON.parse(savedTopicOrder))
      } catch (e) {
        console.error("خطأ في تحميل ترتيب الموضوعات", e)
      }
    }

    const savedPeriodChanges = localStorage.getItem("periodChanges")
    if (savedPeriodChanges) {
      try {
        setPeriodChanges(JSON.parse(savedPeriodChanges))
      } catch (e) {
        console.error("خطأ في تحميل تغييرات الفترات", e)
      }
    }

    const savedWeekCounts = localStorage.getItem("weekCounts")
    if (savedWeekCounts) {
      try {
        setWeekCounts(JSON.parse(savedWeekCounts))
      } catch (e) {
        console.error("خطأ في تحميل عدد الأسابيع", e)
      }
    }

    const savedWeekAssignments = localStorage.getItem("weekAssignments")
    if (savedWeekAssignments) {
      try {
        setWeekAssignments(JSON.parse(savedWeekAssignments))
      } catch (e) {
        console.error("خطأ في تحميل توزيع الأسابيع", e)
      }
    }
  }, [])

  // دالة مساعدة للحصول على مفتاح فريد للموضوع
  const getTopicKey = (item: (typeof learningOutcomes)[0]): string => {
    return `${item.domain}-${item.lesson}-${item.outcome.substring(0, 30)}`
  }

  // دالة لتوليد أسماء الأسابيع بناءً على العدد
  const generateWeekNames = (period: string, count: number): string[] => {
    return Array.from({ length: count }, (_, i) => `${period} - الأسبوع ${i + 1}`)
  }

  // دالة لتطبيق التغييرات على البيانات
  const getModifiedOutcomes = () => {
    return learningOutcomes.map((item) => {
      const topicKey = getTopicKey(item)
      const newPeriod = periodChanges[topicKey]
      const assignedWeek = weekAssignments[topicKey]

      const modifiedItem = { ...item }

      if (newPeriod) {
        modifiedItem.period = newPeriod
      }

      if (assignedWeek) {
        modifiedItem.week = assignedWeek
      }

      return modifiedItem
    })
  }

  const modifiedOutcomes = getModifiedOutcomes()

  // دالة لتحديث عدد الأسابيع لفترة معينة
  const updateWeekCount = (period: string, count: number) => {
    const newCounts = {
      ...weekCounts,
      [period]: count,
    }
    setWeekCounts(newCounts)
    localStorage.setItem("weekCounts", JSON.stringify(newCounts))

    const periodTopics = modifiedOutcomes.filter((item) => {
      const topicKey = getTopicKey(item)
      const itemPeriod = periodChanges[topicKey] || item.period
      return itemPeriod === period
    })

    const weekNames = generateWeekNames(period, count)
    const topicsPerWeek = Math.ceil(periodTopics.length / count)

    const newAssignments = { ...weekAssignments }
    periodTopics.forEach((topic, index) => {
      const topicKey = getTopicKey(topic)
      const weekIndex = Math.floor(index / topicsPerWeek)
      if (weekIndex < weekNames.length) {
        newAssignments[topicKey] = weekNames[weekIndex]
      }
    })

    setWeekAssignments(newAssignments)
    localStorage.setItem("weekAssignments", JSON.stringify(newAssignments))
  }

  const periods = Array.from(
    new Set(modifiedOutcomes.map((item) => item.period).filter(Boolean))
  ) as string[]

  const allWeeks: string[] = []
  periods.forEach((period) => {
    if (period) {
      const count = weekCounts[period] || 8
      const weekNames = generateWeekNames(period, count)
      allWeeks.push(...weekNames)
    }
  })

  const weeks = Array.from(
    new Set([...allWeeks, ...modifiedOutcomes.map((item) => item.week).filter(Boolean)])
  ).sort()

  const filteredOutcomes = modifiedOutcomes.filter((item) => {
    const periodMatch = selectedPeriod === "all" || item.period === selectedPeriod
    const weekMatch = selectedWeek === "all" || item.week === selectedWeek
    return periodMatch && weekMatch
  })

  const groupedOutcomes = filteredOutcomes.reduce((acc, item) => {
    const period = item.period || "غير محدد"
    const week = item.week || "غير محدد"
    if (!acc[period]) acc[period] = {}
    if (!acc[period][week]) acc[period][week] = []
    acc[period][week].push(item)
    return acc
  }, {} as Record<string, Record<string, typeof learningOutcomes>>)

  const moveWeek = (period: string, week: string, direction: "up" | "down") => {
    if (!period) return
    const periodWeeks = Object.keys(groupedOutcomes[period] || {})
    const currentIndex = periodWeeks.indexOf(week)

    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= periodWeeks.length) return

    const newOrder = [...periodWeeks]
    ;[newOrder[currentIndex], newOrder[newIndex]] = [
      newOrder[newIndex],
      newOrder[currentIndex],
    ]

    const updatedOrder = {
      ...weekOrder,
      [period]: newOrder,
    }

    setWeekOrder(updatedOrder)
    localStorage.setItem("weekOrder", JSON.stringify(updatedOrder))
  }

  const getOrderedWeeks = (period: string, weeks: string[]) => {
    if (!period) return weeks.sort()
    if (!isEditMode || !weekOrder[period]) {
      return weeks.sort((weekA, weekB) => {
        const numA = parseInt(weekA.replace(/\D/g, "")) || 0
        const numB = parseInt(weekB.replace(/\D/g, "")) || 0
        return numA - numB
      })
    }

    const customOrder = weekOrder[period]
    const ordered = [...customOrder]
    weeks.forEach((week) => {
      if (!ordered.includes(week)) {
        ordered.push(week)
      }
    })
    return ordered.filter((week) => weeks.includes(week))
  }

  const moveTopic = (
    period: string,
    week: string,
    topicKey: string,
    direction: "up" | "down"
  ) => {
    if (!period || !week) return
    const weekKey = `${period}-${week}`
    const items = groupedOutcomes[period]?.[week] || []
    const currentOrder = topicOrder[weekKey] || items.map((item) => getTopicKey(item))

    const currentIndex = currentOrder.indexOf(topicKey)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= currentOrder.length) return

    const newOrder = [...currentOrder]
    ;[newOrder[currentIndex], newOrder[newIndex]] = [
      newOrder[newIndex],
      newOrder[currentIndex],
    ]

    const updatedOrder = {
      ...topicOrder,
      [weekKey]: newOrder,
    }

    setTopicOrder(updatedOrder)
    localStorage.setItem("topicOrder", JSON.stringify(updatedOrder))
  }

  const getOrderedTopics = (
    period: string,
    week: string,
    items: typeof learningOutcomes
  ) => {
    if (!period || !week) return items
    const weekKey = `${period}-${week}`

    if (!isEditMode || !topicOrder[weekKey]) {
      return items
    }

    const customOrder = topicOrder[weekKey]
    const ordered: typeof learningOutcomes = []
    const itemMap = new Map(items.map((item) => [getTopicKey(item), item]))

    customOrder.forEach((key) => {
      const item = itemMap.get(key)
      if (item) {
        ordered.push(item)
        itemMap.delete(key)
      }
    })

    itemMap.forEach((item) => ordered.push(item))

    return ordered
  }

  const changeTopicPeriod = (topicKey: string, newPeriod: string) => {
    const updatedChanges = {
      ...periodChanges,
      [topicKey]: newPeriod,
    }

    setPeriodChanges(updatedChanges)
    localStorage.setItem("periodChanges", JSON.stringify(updatedChanges))
    
    // إعادة تعيين الأسبوع عند تغيير الفترة
    const newAssignments = { ...weekAssignments }
    delete newAssignments[topicKey]
    setWeekAssignments(newAssignments)
    localStorage.setItem("weekAssignments", JSON.stringify(newAssignments))
  }

  const changeTopicWeek = (topicKey: string, newWeek: string) => {
    const newAssignments = {
      ...weekAssignments,
      [topicKey]: newWeek,
    }

    setWeekAssignments(newAssignments)
    localStorage.setItem("weekAssignments", JSON.stringify(newAssignments))
  }

  // دوال السحب والإفلات
  const handleDragStart = (e: React.DragEvent, topicKey: string) => {
    setDraggedItem(topicKey)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", topicKey)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5"
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
    setDraggedItem(null)
    setDragOverWeek(null)
  }

  const handleDragOver = (e: React.DragEvent, week: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverWeek(week)
  }

  const handleDragLeave = () => {
    setDragOverWeek(null)
  }

  const handleDrop = (e: React.DragEvent, targetWeek: string, targetPeriod: string) => {
    e.preventDefault()
    setDragOverWeek(null)

    if (!draggedItem) return

    const topicKey = draggedItem
    const item = modifiedOutcomes.find((i) => getTopicKey(i) === topicKey)
    if (!item) return

    // تحديث الفترة إذا لزم الأمر
    const currentPeriod = getTopicPeriod(item)
    if (currentPeriod !== targetPeriod) {
      changeTopicPeriod(topicKey, targetPeriod)
    }

    // تحديث الأسبوع
    changeTopicWeek(topicKey, targetWeek)
    setDraggedItem(null)
  }

  const getTopicWeek = (item: (typeof learningOutcomes)[0], period: string) => {
    const topicKey = getTopicKey(item)
    const assignedWeek = weekAssignments[topicKey]
    if (assignedWeek) return assignedWeek
    
    // إذا لم يكن هناك تعيين، نعيد الأسبوع الأصلي أو نولد واحداً
    return item.week || ""
  }

  const getTopicPeriod = (item: (typeof learningOutcomes)[0]) => {
    const topicKey = getTopicKey(item)
    return periodChanges[topicKey] || item.period || "غير محدد"
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-8 p-4 py-8">
        <header className="card bg-gradient-to-br from-white to-primary-50">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-slate-900">
              خطة نافس
            </h1>
            <p className="mt-2 text-slate-600">
              إدارة وتخطيط نواتج التعلم على الاسابيع الدراسية
            </p>
          </div>

          {/* Tabs in header */}
          <div className="flex gap-2 border-b border-primary-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("view")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "view"
                  ? "text-primary-700 border-primary-600"
                  : "text-slate-500 border-transparent hover:text-primary-600"
              }`}
            >
              عرض الخطة
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "edit"
                  ? "text-amber-700 border-amber-600"
                  : "text-slate-500 border-transparent hover:text-amber-600"
              }`}
            >
              تصميم الخطة
            </button>
          </div>
        </header>

        {/* فلاتر البحث + التحكم في الأسابيع */}
        {activeTab === "edit" && (
          <section className="card space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="تعديل وتخصيص الخطة"
                subtitle="أعيدي ترتيب الفترات والأسابيع ونواتج التعلم حسب احتياج صفك"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (confirm("هل أنت متأكدة من إعادة تعيين جميع التغييرات؟")) {
                      setPeriodChanges({})
                      setWeekOrder({})
                      setTopicOrder({})
                      localStorage.removeItem("periodChanges")
                      localStorage.removeItem("weekOrder")
                      localStorage.removeItem("topicOrder")
                    }
                  }}
                  className="rounded-2xl bg-rose-100 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-200"
                  title="إعادة تعيين جميع التغييرات"
                >
                  ↺ إعادة تعيين
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  الفترة
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="all">جميع الفترات</option>
                  {periods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  الأسبوع
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-primary-300 focus:bg-white focus:outline-none"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                >
                  <option value="all">جميع الأسابيع</option>
                  {weeks.map((week) => (
                    <option key={week} value={week}>
                      {week}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* التحكم في عدد الأسابيع */}
            <div className="rounded-2xl bg-primary-50 p-4 space-y-3">
              <p className="text-sm font-semibold text-primary-700">
                عدد الأسابيع لكل فترة
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {periods
                  .filter((p) => p)
                  .map((period) => (
                    <div key={period} className="flex items-center gap-3">
                      <label className="text-sm font-medium text-slate-700 min-w-[120px]">
                        {period}:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={weekCounts[period] || 8}
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 8
                          if (period) updateWeekCount(period, count)
                        }}
                        className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-center focus:border-primary-300 focus:outline-none"
                      />
                      <span className="text-xs text-slate-500">أسبوع</span>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-primary-600">
                سيتم إعادة توزيع نواتج التعلم تلقائياً على الأسابيع الجديدة
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <span className="font-semibold">وضع التحرير:</span> استخدمي الأزرار ↑ ↓ لإعادة
              ترتيب الأسابيع والموضوعات، واختيار الفترة من القائمة المنسدلة لنقل
              الموضوعات بين الفترات
            </div>
            <div className="rounded-2xl bg-primary-50 px-4 py-2 text-sm text-primary-700">
              <span className="font-semibold">عدد النتائج:</span> {filteredOutcomes.length} ناتج تعلم
            </div>
          </section>
        )}

        {/* عرض الخطة */}
        {activeTab === "view" ? (
          // عرض جدولي للخطة
          <section className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                    <th className="border border-primary-500 px-4 py-3 text-center font-bold text-sm">
                      الفترة
                    </th>
                    <th className="border border-primary-500 px-4 py-3 text-center font-bold text-sm">
                      عدد الأسابيع
                    </th>
                    <th className="border border-primary-500 px-4 py-3 text-right font-bold text-sm min-w-[200px]">
                      الأسبوع
                    </th>
                    <th className="border border-primary-500 px-4 py-3 text-right font-bold text-sm min-w-[500px]">
                      نواتج التعلم
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => {
                    if (!period) return null
                    const weekCount = weekCounts[period] || 8
                    const generatedWeeks = generateWeekNames(period, weekCount)
                    const weeksData = groupedOutcomes[period] || {}
                    const allWeeksForPeriod = Array.from(
                      new Set([...generatedWeeks, ...Object.keys(weeksData)])
                    )
                    const orderedWeeks = getOrderedWeeks(period, allWeeksForPeriod)

                    return orderedWeeks.map((week, weekIndex) => {
                      const items = weeksData[week] || []
                      const orderedItems = getOrderedTopics(period, week, items)
                      const isFirstWeekInPeriod = weekIndex === 0

                      return (
                        <tr
                          key={`${period}-${week}`}
                          className={`hover:bg-slate-50 transition-colors ${
                            weekIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          }`}
                        >
                          {isFirstWeekInPeriod && (
                            <td
                              rowSpan={orderedWeeks.length}
                              className="border border-slate-200 px-4 py-3 text-center align-top bg-primary-50 font-bold text-primary-900"
                            >
                              <div className="flex flex-col items-center justify-center min-h-[60px]">
                                <span className="text-lg">{period}</span>
                              </div>
                            </td>
                          )}
                          {isFirstWeekInPeriod && (
                            <td
                              rowSpan={orderedWeeks.length}
                              className="border border-slate-200 px-4 py-3 text-center align-top bg-primary-50 font-bold text-primary-900"
                            >
                              <div className="flex flex-col items-center justify-center min-h-[60px]">
                                <span className="text-2xl">{weekCount}</span>
                                <span className="text-sm">أسبوع</span>
                              </div>
                            </td>
                          )}
                          <td className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-700">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-base">{week}</span>
                            </div>
                          </td>
                          <td className="border border-slate-200 px-4 py-3">
                            {orderedItems.length > 0 ? (
                              <div className="space-y-3">
                                {orderedItems.map((item, itemIndex) => {
                                  const currentPeriod = getTopicPeriod(item)
                                  return (
                                    <div
                                      key={getTopicKey(item)}
                                      className="rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md transition-all"
                                    >
                                      <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                                          {itemIndex + 1}
                                        </span>
                                        <div className="flex-1 space-y-2">
                                          <div>
                                            <p className="text-sm font-bold text-slate-900 mb-1">
                                              {item.domain}
                                            </p>
                                            <p className="text-xs font-semibold text-primary-700">
                                              {item.lesson}
                                            </p>
                                          </div>
                                          <p className="text-xs text-slate-700 leading-relaxed">
                                            {item.outcome}
                                          </p>
                                          {item.indicators && item.indicators.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                                              <p className="text-xs font-semibold text-primary-700 mb-1">المؤشرات:</p>
                                              {item.indicators.map((indicator, idx) => (
                                                <p key={idx} className="text-xs text-primary-600 leading-relaxed pr-2">
                                                  • {indicator}
                                                </p>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-slate-400 text-sm italic">
                                لا توجد نواتج تعلم لهذا الأسبوع
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          // عرض جدولي لوضع التحرير مع السحب والإفلات
          <section className="card overflow-hidden p-0">
            <div className="p-4 bg-amber-50 border-b border-amber-200">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">💡 تلميح:</span> اسحبي نواتج التعلم وأفلتيها في الأسبوع المناسب. يمكنك أيضاً استخدام القوائم المنسدلة لتغيير الفترة والأسبوع.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
                    <th className="border border-amber-500 px-4 py-3 text-center font-bold text-sm">
                      الفترة
                    </th>
                    <th className="border border-amber-500 px-4 py-3 text-center font-bold text-sm">
                      عدد الأسابيع
                    </th>
                    <th className="border border-amber-500 px-4 py-3 text-right font-bold text-sm min-w-[200px]">
                      الأسبوع
                    </th>
                    <th className="border border-amber-500 px-4 py-3 text-right font-bold text-sm min-w-[500px]">
                      نواتج التعلم (اسحبي وأفلتي)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((period) => {
                    if (!period) return null
                    const weekCount = weekCounts[period] || 8
                    const generatedWeeks = generateWeekNames(period, weekCount)
                    const weeksData = groupedOutcomes[period] || {}
                    const allWeeksForPeriod = Array.from(
                      new Set([...generatedWeeks, ...Object.keys(weeksData)])
                    )
                    const orderedWeeks = getOrderedWeeks(period, allWeeksForPeriod)

                    return orderedWeeks.map((week, weekIndex) => {
                      const items = weeksData[week] || []
                      const orderedItems = getOrderedTopics(period, week, items)
                      const isFirstWeekInPeriod = weekIndex === 0
                      const isDragOver = dragOverWeek === week

                      return (
                        <tr
                          key={`${period}-${week}`}
                          className={`hover:bg-slate-50 transition-colors ${
                            weekIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                          } ${isDragOver ? "bg-blue-100" : ""}`}
                          onDragOver={(e) => handleDragOver(e, week)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, week, period)}
                        >
                          {isFirstWeekInPeriod && (
                            <td
                              rowSpan={orderedWeeks.length}
                              className="border border-slate-200 px-4 py-3 text-center align-top bg-amber-50 font-bold text-amber-900"
                            >
                              <div className="flex flex-col items-center justify-center min-h-[60px]">
                                <span className="text-lg">{period}</span>
                              </div>
                            </td>
                          )}
                          {isFirstWeekInPeriod && (
                            <td
                              rowSpan={orderedWeeks.length}
                              className="border border-slate-200 px-4 py-3 text-center align-top bg-amber-50 font-bold text-amber-900"
                            >
                              <div className="flex flex-col items-center justify-center min-h-[60px]">
                                <span className="text-2xl">{weekCount}</span>
                                <span className="text-sm">أسبوع</span>
                              </div>
                            </td>
                          )}
                          <td className="border border-slate-200 px-4 py-3 text-right font-semibold text-slate-700">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-base">{week}</span>
                            </div>
                          </td>
                          <td 
                            className={`border border-slate-200 px-4 py-3 min-h-[100px] ${
                              isDragOver ? "bg-blue-100 border-blue-400 border-dashed border-4" : ""
                            }`}
                          >
                            {orderedItems.length > 0 ? (
                              <div className="space-y-3">
                                {orderedItems.map((item, itemIndex) => {
                                  const topicKey = getTopicKey(item)
                                  const currentPeriod = getTopicPeriod(item)
                                  const currentWeek = getTopicWeek(item, currentPeriod)
                                  const availableWeeks = currentPeriod 
                                    ? generateWeekNames(currentPeriod, weekCounts[currentPeriod] || 8)
                                    : []
                                  const isDragging = draggedItem === topicKey

                                  return (
                                    <div
                                      key={topicKey}
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, topicKey)}
                                      onDragEnd={handleDragEnd}
                                      className={`rounded-lg border-2 p-3 bg-white hover:shadow-lg transition-all cursor-move ${
                                        isDragging 
                                          ? "opacity-50 border-primary-400 bg-primary-50" 
                                          : "border-slate-200 hover:border-primary-300"
                                      }`}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 flex flex-col gap-1">
                                          <span className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                                            {itemIndex + 1}
                                          </span>
                                          <span className="text-xs text-slate-400 text-center">اسحب</span>
                                        </div>
                                        <div className="flex-1 space-y-2">
                                          <div>
                                            <p className="text-sm font-bold text-slate-900 mb-1">
                                              {item.domain}
                                            </p>
                                            <p className="text-xs font-semibold text-primary-700">
                                              {item.lesson}
                                            </p>
                                          </div>
                                          <p className="text-xs text-slate-700 leading-relaxed">
                                            {item.outcome}
                                          </p>
                                          {item.indicators && item.indicators.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                                              <p className="text-xs font-semibold text-primary-700 mb-1">المؤشرات:</p>
                                              {item.indicators.map((indicator, idx) => (
                                                <p key={idx} className="text-xs text-primary-600 leading-relaxed pr-2">
                                                  • {indicator}
                                                </p>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-shrink-0 flex flex-col gap-2">
                                          <select
                                            value={currentPeriod}
                                            onChange={(e) => {
                                              changeTopicPeriod(topicKey, e.target.value)
                                            }}
                                            className="text-xs rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-700 focus:border-primary-500 focus:outline-none"
                                            title="تغيير الفترة"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <option value="الفترة الأولى">الفترة الأولى</option>
                                            <option value="الفترة الثانية">الفترة الثانية</option>
                                          </select>
                                          {currentPeriod && (
                                            <select
                                              value={currentWeek}
                                              onChange={(e) => {
                                                changeTopicWeek(topicKey, e.target.value)
                                              }}
                                              className="text-xs rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-700 focus:border-primary-500 focus:outline-none"
                                              title="تغيير الأسبوع"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <option value="">اختر الأسبوع</option>
                                              {availableWeeks.map((weekName) => (
                                                <option key={weekName} value={weekName}>
                                                  {weekName.replace(`${currentPeriod} - `, "")}
                                                </option>
                                              ))}
                                            </select>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div 
                                className={`text-center py-8 text-slate-400 text-sm italic rounded-lg border-2 border-dashed ${
                                  isDragOver ? "border-blue-400 bg-blue-50" : "border-slate-300"
                                }`}
                              >
                                {isDragOver ? "أفلت هنا" : "اسحبي ناتج تعلم هنا"}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
