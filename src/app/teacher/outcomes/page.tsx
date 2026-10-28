"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from "react"
import { SectionHeader } from "@/components/ui/section-header"
import { LearningOutcomeCard } from "@/components/ui/learning-outcome-card"
import { PageBackground } from "@/components/layout/page-background"
import { learningOutcomes, LEGACY_LESSON_NAMES } from "@/lib/data"
import { TeacherHeader } from "@/features/classes/components/teacher-header"

type TabType = "view" | "edit" | "outcomes"

// يحوّل مفتاحًا محفوظًا بصيغة قديمة (كانت تتضمن نص الناتج أو اسم درس قديم) إلى المفتاح الحالي
function migrateTopicKey(key: string): string | null {
  for (const item of learningOutcomes) {
    const names = [item.lesson, ...Object.keys(LEGACY_LESSON_NAMES).filter((old) => LEGACY_LESSON_NAMES[old] === item.lesson)]
    for (const name of names) {
      const base = `${item.domain}-${name}`
      if (key === base || key.startsWith(`${base}-`)) return `${item.domain}-${item.lesson}`
    }
  }
  return null
}

function migrateKeyedRecord(saved: Record<string, string>): { result: Record<string, string>; changed: boolean } {
  const result: Record<string, string> = {}
  let changed = false
  for (const [key, value] of Object.entries(saved)) {
    const next = migrateTopicKey(key)
    if (next === null) {
      result[key] = value // نُبقي ما لم نتعرف عليه بدل حذفه
      continue
    }
    if (next !== key) changed = true
    result[next] = value
  }
  return { result, changed }
}

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
  const [activeTab, setActiveTab] = useState<TabType>("outcomes")
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
        const parsed = JSON.parse(savedTopicOrder) as Record<string, string[]>
        const migrated: Record<string, string[]> = {}
        let changed = false
        for (const [week, keys] of Object.entries(parsed)) {
          const next = keys.map((k) => migrateTopicKey(k) ?? k)
          if (next.some((k, i) => k !== keys[i])) changed = true
          migrated[week] = next.filter((k, i) => next.indexOf(k) === i)
        }
        setTopicOrder(migrated)
        if (changed) localStorage.setItem("topicOrder", JSON.stringify(migrated))
      } catch (e) {
        console.error("خطأ في تحميل ترتيب الموضوعات", e)
      }
    }

    const savedPeriodChanges = localStorage.getItem("periodChanges")
    if (savedPeriodChanges) {
      try {
        const { result, changed } = migrateKeyedRecord(JSON.parse(savedPeriodChanges) as Record<string, string>)
        setPeriodChanges(result)
        if (changed) localStorage.setItem("periodChanges", JSON.stringify(result))
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
        const { result, changed } = migrateKeyedRecord(JSON.parse(savedWeekAssignments) as Record<string, string>)
        setWeekAssignments(result)
        if (changed) localStorage.setItem("weekAssignments", JSON.stringify(result))
      } catch (e) {
        console.error("خطأ في تحميل توزيع الأسابيع", e)
      }
    }
  }, [])

  // مفتاح ثابت للموضوع: المجال واسم الدرس فقط، حتى لا يضيع الترتيب المحفوظ إذا تغيّر نص الناتج
  const getTopicKey = (item: (typeof learningOutcomes)[0]): string => {
    return `${item.domain}-${item.lesson}`
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

  // هل الناتج موضوع في أحد أسابيع فترته (بالتوزيع الافتراضي أو بتعيين المعلمة)؟
  const isPlacedInWeek = (item: (typeof learningOutcomes)[0]) => {
    const period = item.period || ""
    if (!period || !item.week) return false
    const slots = generateWeekNames(period, weekCounts[period] || 8)
    return slots.includes(item.week) || slots.includes(`${period} - ${item.week}`)
  }
  const unplacedOutcomes = modifiedOutcomes.filter((item) => !isPlacedInWeek(item))

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

  // عناصر أسبوع معين — دمج من كلا التنسيقين لظهور أكثر من بطاقة في الأسبوع الواحد
  const getItemsForWeekSlot = (period: string, weekKey: string) => {
    const weeksData = groupedOutcomes[period] || {}
    const shortLabel = weekKey.replace(`${period} - `, "")
    const fromFull = weeksData[weekKey] || []
    const fromShort = weeksData[shortLabel] || []
    const seen = new Set<string>()
    const merged: typeof learningOutcomes = []
    for (const item of [...fromFull, ...fromShort]) {
      const key = getTopicKey(item)
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(item)
    }
    return getOrderedTopics(period, weekKey, merged)
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-4 p-3 py-6 sm:space-y-8 sm:p-4 sm:py-8">
        <header className="card bg-gradient-to-br from-white to-primary-50 p-4 sm:p-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              خطة نافس
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              إدارة وتخطيط نواتج التعلم على الاسابيع الدراسية
            </p>
          </div>

          {/* Tabs in header - scroll on mobile */}
          <div className="flex gap-1 border-b border-primary-200 overflow-x-auto pb-px -mx-1 px-1">
            <button
              onClick={() => setActiveTab("view")}
              className={`min-h-[48px] flex-shrink-0 px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap touch-manipulation sm:px-6 ${
                activeTab === "view"
                  ? "text-primary-700 border-primary-600"
                  : "text-slate-500 border-transparent hover:text-primary-600"
              }`}
            >
              عرض الخطة
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`min-h-[48px] flex-shrink-0 px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap touch-manipulation sm:px-6 ${
                activeTab === "edit"
                  ? "text-amber-700 border-amber-600"
                  : "text-slate-500 border-transparent hover:text-amber-600"
              }`}
            >
              تصميم الخطة
            </button>
            <button
              onClick={() => setActiveTab("outcomes")}
              className={`min-h-[48px] flex-shrink-0 px-4 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap touch-manipulation sm:px-6 ${
                activeTab === "outcomes"
                  ? "text-violet-700 border-violet-600"
                  : "text-slate-500 border-transparent hover:text-violet-600"
              }`}
            >
              نواتج التعلم
            </button>
          </div>
        </header>

        {/* تبويب نواتج التعلم — مقسّم إلى ثلاثة أقسام حسب المجال */}
        {activeTab === "outcomes" && (
          <section className="space-y-8">
            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-4">
              <h2 className="text-lg font-bold text-violet-900">جميع نواتج التعلم</h2>
              <p className="mt-1 text-sm text-violet-700">
                استعراض كامل لنواتج التعلم والمؤشرات حسب المجال والفترة والأسبوع
              </p>
            </div>

            {[
              { domain: "علوم الحياة", color: "emerald" },
              { domain: "العلوم الفيزيائية", color: "blue" },
              { domain: "علوم الأرض والفضاء", color: "amber" },
            ].map(({ domain, color }) => {
              const items = modifiedOutcomes.filter((item) => item.domain === domain);
              if (items.length === 0) return null;
              return (
                <div key={domain} className="space-y-3">
                  <div
                    className={`rounded-2xl border p-4 ${
                      color === "emerald"
                        ? "bg-emerald-50 border-emerald-200"
                        : color === "blue"
                          ? "bg-blue-50 border-blue-200"
                          : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <h3
                      className={`text-lg font-bold ${
                        color === "emerald"
                          ? "text-emerald-900"
                          : color === "blue"
                            ? "text-blue-900"
                            : "text-amber-900"
                      }`}
                    >
                      {domain}
                    </h3>
                    <p
                      className={`mt-1 text-sm ${
                        color === "emerald"
                          ? "text-emerald-700"
                          : color === "blue"
                            ? "text-blue-700"
                            : "text-amber-700"
                      }`}
                    >
                      {items.length} ناتج تعلم
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, index) => {
                      const topicKey = getTopicKey(item);
                      return (
                        <LearningOutcomeCard
                          key={`${topicKey}-${index}`}
                          item={item}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* فلاتر البحث + التحكم في الأسابيع */}
        {activeTab === "edit" && (
          <section className="card space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeader
                title="تعديل وتخصيص الخطة"
                subtitle="أعيدي ترتيب الفترات والأسابيع ونواتج التعلم حسب احتياج صفك"
              />
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    if (confirm("هل أنت متأكدة من إعادة تعيين جميع التغييرات؟")) {
                      setPeriodChanges({})
                      setWeekOrder({})
                      setTopicOrder({})
                      setWeekAssignments({})
                      localStorage.removeItem("periodChanges")
                      localStorage.removeItem("weekOrder")
                      localStorage.removeItem("topicOrder")
                      localStorage.removeItem("weekAssignments")
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

        {/* عرض الخطة — جدول أسابيع للعرض فقط */}
        {activeTab === "view" && (
          <section className="card overflow-hidden p-0" dir="rtl">
            <div className="rounded-t-2xl bg-amber-100 border-b border-amber-200 px-4 py-3">
              <h2 className="text-center text-lg font-bold text-amber-900">الأسابيع</h2>
            </div>
            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              {periods.filter(Boolean).map((period) => {
                const weekCount = weekCounts[period] || 8
                const generatedWeeks = generateWeekNames(period, weekCount)
                return (
                  <div
                    key={period}
                    className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch"
                  >
                    <div className="flex md:flex-col md:w-24 flex-shrink-0 rounded-xl bg-amber-100 border border-amber-200 px-4 py-3 md:py-6 flex items-center justify-center min-h-[48px] md:min-h-[140px]">
                      <span className="text-base font-bold text-amber-900 text-center">
                        {period}
                      </span>
                    </div>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
                      {generatedWeeks.map((weekKey, weekIndex) => {
                        const itemsInSlot = getItemsForWeekSlot(period, weekKey)
                        const weekLabel = weekIndex === 0 ? "الأسبوع الأول" : `الأسبوع ${weekIndex + 1}`
                        return (
                          <div
                            key={weekKey}
                            className="rounded-xl border-2 min-h-[120px] p-3 flex flex-col bg-violet-50 border-violet-200"
                          >
                            <p className="text-xs font-semibold text-violet-800 mb-2 pb-1 border-b border-violet-200">
                              {weekLabel}
                            </p>
                            <div className="flex-1 space-y-2 overflow-y-auto">
                              {itemsInSlot.map((item) => {
                                const topicKey = getTopicKey(item)
                                return (
                                  <div
                                    key={topicKey}
                                    className="rounded-lg border border-slate-200 p-2 bg-white shadow-sm"
                                  >
                                    <p className="text-xs font-semibold text-slate-900 truncate" title={item.lesson}>
                                      {item.lesson}
                                    </p>
                                    <p className="text-[10px] text-slate-500 truncate" title={item.domain}>
                                      {item.domain}
                                    </p>
                                    {item.indicators?.length > 0 && (
                                      <p className="text-[10px] text-primary-600 mt-0.5">
                                        {item.indicators.length} مؤشر
                                      </p>
                                    )}
                                    <p className="text-[10px] text-slate-600 mt-1 line-clamp-2" title={item.outcome}>
                                      {item.outcome}
                                    </p>
                                  </div>
                                )
                              })}
                              {itemsInSlot.length === 0 && (
                                <p className="text-[10px] text-violet-500/80 italic py-2">
                                  لا توجد نواتج لهذا الأسبوع
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* تصميم الخطة: شبكة أسابيع مع سحب وإفلات */}
        {activeTab === "edit" && (
          <section className="card overflow-hidden p-0" dir="rtl">
            {/* تلميح */}
            <div className="p-3 bg-amber-50 border-b border-amber-200">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">💡</span> النواتج موزعة افتراضيًا على الأسابيع. لتغيير موقع ناتج اسحبي بطاقته من أسبوعه وأفلتيها في أسبوع آخر، ويُحفظ اختيارك تلقائيًا. كل بطاقة تظهر في أسبوع واحد فقط، ويمكنك العودة إلى التوزيع الافتراضي بزر إعادة التعيين.
              </p>
            </div>

            {/* بطاقات نواتج التعلم — تظهر هنا لسحبها وإفلاتها (فقط غير المعيّنة لأسبوع حتى لا تُكرَّر في أكثر من أسبوع) */}
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-3">نواتج غير موزعة — اسحبيها إلى الأسبوع المناسب</h3>
              <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 min-h-[88px]">
                {unplacedOutcomes.length === 0 && (
                  <p className="text-xs text-slate-500 self-center">
                    جميع النواتج موزعة على الأسابيع. لتغيير موقع ناتج اسحبي بطاقته من أسبوعه وأفلتيها في الأسبوع الذي تريدين.
                  </p>
                )}
                {unplacedOutcomes
                  .map((item) => {
                  const topicKey = getTopicKey(item)
                  const isDragging = draggedItem === topicKey
                  return (
                    <div
                      key={topicKey}
                      draggable
                      onDragStart={(e) => handleDragStart(e, topicKey)}
                      onDragEnd={handleDragEnd}
                      className={`flex-shrink-0 w-[160px] min-w-[140px] sm:w-[180px] rounded-xl border-2 p-3 bg-white shadow-md cursor-grab active:cursor-grabbing transition-all hover:shadow-lg hover:border-primary-300 touch-manipulation ${
                        isDragging
                          ? "opacity-50 border-primary-400 bg-primary-50"
                          : "border-slate-200"
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 line-clamp-2" title={item.lesson}>
                        {item.lesson}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5" title={item.domain}>
                        {item.domain}
                      </p>
                      {item.indicators && item.indicators.length > 0 && (
                        <p className="text-[10px] text-primary-600 mt-1 font-medium">
                          {item.indicators.length} مؤشر
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* رأس: الأسابيع */}
            <div className="rounded-none md:rounded-t-2xl bg-amber-100 border-b border-amber-200 px-4 py-3">
              <h2 className="text-center text-lg font-bold text-amber-900">الأسابيع</h2>
            </div>

            <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              {periods.filter(Boolean).map((period) => {
                const weekCount = weekCounts[period] || 8
                const generatedWeeks = generateWeekNames(period, weekCount)

                return (
                  <div
                    key={period}
                    className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch"
                  >
                    {/* تسمية الفترة (عمودية / على اليمين) */}
                    <div className="flex md:flex-col md:w-24 flex-shrink-0 rounded-xl bg-amber-100 border border-amber-200 px-4 py-3 md:py-6 flex items-center justify-center min-h-[48px] md:min-h-[140px]">
                      <span className="text-base font-bold text-amber-900 text-center">
                        {period}
                      </span>
                    </div>

                    {/* صف صناديق الأسابيع */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
                      {generatedWeeks.map((weekKey, weekIndex) => {
                        const isDragOver = dragOverWeek === weekKey
                        const itemsInSlot = getItemsForWeekSlot(period, weekKey)
                        const weekLabel = weekIndex === 0 ? "الأسبوع الأول" : `الأسبوع ${weekIndex + 1}`

                        return (
                          <div
                            key={weekKey}
                            onDragOver={(e) => {
                              e.preventDefault()
                              handleDragOver(e, weekKey)
                            }}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, weekKey, period)}
                            className={`rounded-xl border-2 min-h-[100px] sm:min-h-[120px] p-2 sm:p-3 flex flex-col transition-colors ${
                              isDragOver
                                ? "bg-violet-200 border-violet-400 border-dashed"
                                : "bg-violet-50 border-violet-200"
                            }`}
                          >
                            <p className="text-xs font-semibold text-violet-800 mb-2 pb-1 border-b border-violet-200">
                              {weekLabel}
                            </p>
                            <div className="flex-1 space-y-2 overflow-y-auto">
                              {itemsInSlot.map((item, itemIndex) => {
                                const topicKey = getTopicKey(item)
                                const isDragging = draggedItem === topicKey

                                return (
                                  <div
                                    key={topicKey}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, topicKey)}
                                    onDragEnd={handleDragEnd}
                                    className={`rounded-lg border p-2 bg-white shadow-sm cursor-move transition-all ${
                                      isDragging
                                        ? "opacity-50 border-primary-400 bg-primary-50"
                                        : "border-slate-200 hover:border-primary-300 hover:shadow"
                                    }`}
                                  >
                                    <p className="text-xs font-semibold text-slate-900 truncate" title={item.lesson}>
                                      {item.lesson}
                                    </p>
                                    <p className="text-[10px] text-slate-500 truncate" title={item.domain}>
                                      {item.domain}
                                    </p>
                                    {item.indicators && item.indicators.length > 0 && (
                                      <p className="text-[10px] text-primary-600 mt-0.5">
                                        {item.indicators.length} مؤشر
                                      </p>
                                    )}
                                  </div>
                                )
                              })}
                              {itemsInSlot.length === 0 && !isDragOver && (
                                <p className="text-[10px] text-violet-500/80 italic py-2">
                                  اسحب بطاقة هنا
                                </p>
                              )}
                              {isDragOver && (
                                <p className="text-xs font-medium text-violet-700 py-1">أفلت هنا</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
