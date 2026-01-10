"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-client"
import Link from "next/link"
import { TeacherHeader } from "@/features/classes/components/teacher-header"
import { subscriptionFeatures, getPlanInfo, type SubscriptionPlan } from "@/lib/subscription"
import { PageBackground } from "@/components/layout/page-background"

export default function SubscriptionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("free")

  useEffect(() => {
    if (user?.subscriptionPlan) {
      setCurrentPlan(user.subscriptionPlan as SubscriptionPlan)
    }
  }, [user])

  const handleUpgrade = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        // تحديث بيانات المستخدم
        router.refresh()
        setCurrentPlan("premium")
        alert("تم ترقية حسابك إلى الخطة المميزة بنجاح!")
      } else {
        const error = await response.json()
        alert(error.error || "حدث خطأ أثناء الترقية")
      }
    } catch (error) {
      alert("حدث خطأ أثناء الترقية")
    } finally {
      setLoading(false)
    }
  }

  const handleDowngrade = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const response = await fetch("/api/subscription/downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        // تحديث بيانات المستخدم
        router.refresh()
        setCurrentPlan("free")
        alert("تم تغيير حسابك إلى الخطة المجانية")
      } else {
        const error = await response.json()
        alert(error.error || "حدث خطأ أثناء التغيير")
      }
    } catch (error) {
      alert("حدث خطأ أثناء التغيير")
    } finally {
      setLoading(false)
    }
  }

  const currentPlanInfo = getPlanInfo(currentPlan)

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 space-y-10 p-4 py-8">
      <TeacherHeader />
      
      <div className="card bg-white">
        <div className="mb-6">
          <Link
            href="/teacher"
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
          >
            ← العودة للوحة التحكم
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          إدارة الاشتراك
        </h1>
        <p className="text-slate-600 mb-8">
          اختر الخطة المناسبة لك واستمتع بجميع المميزات
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* الخطة المجانية */}
          <div
            className={`rounded-3xl border-2 p-6 ${
              currentPlan === "free"
                ? "border-primary-500 bg-primary-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {subscriptionFeatures.free.name}
              </h2>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                مجاني
              </div>
              <p className="text-sm text-slate-500">للبدء</p>
            </div>

            <ul className="space-y-3 mb-6">
              {subscriptionFeatures.free.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            {currentPlan === "free" ? (
              <div className="rounded-2xl bg-primary-100 px-4 py-3 text-center font-semibold text-primary-700">
                خطتك الحالية
              </div>
            ) : (
              <button
                onClick={handleDowngrade}
                disabled={loading}
                className="w-full rounded-2xl border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? "جاري التحميل..." : "التبديل إلى هذه الخطة"}
              </button>
            )}
          </div>

          {/* الخطة المميزة */}
          <div
            className={`rounded-3xl border-2 p-6 ${
              currentPlan === "premium"
                ? "border-emerald-500 bg-emerald-50"
                : "border-emerald-200 bg-white"
            }`}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {subscriptionFeatures.premium.name}
                </h2>
                <span className="badge bg-emerald-100 text-emerald-700">
                  موصى به
                </span>
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-1">
                مدفوع
              </div>
              <p className="text-sm text-slate-500">جميع المميزات</p>
            </div>

            <ul className="space-y-3 mb-6">
              {subscriptionFeatures.premium.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            {currentPlan === "premium" ? (
              <div className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-semibold text-emerald-700">
                خطتك الحالية
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "جاري التحميل..." : "ترقية إلى المميز"}
              </button>
            )}
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 rounded-2xl bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            ملاحظات مهمة
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• جميع المعلمين يمكنهم الدخول إلى التطبيق مجاناً</li>
            <li>• الخطة المجانية تتيح إنشاء اختبار واحد ونشاط واحد</li>
            <li>• الخطة المميزة تتيح إنشاء عدد غير محدود من الاختبارات والأنشطة</li>
            <li>• يمكنك التبديل بين الخطط في أي وقت</li>
          </ul>
        </div>
      </div>
      </div>
    </main>
  )
}

