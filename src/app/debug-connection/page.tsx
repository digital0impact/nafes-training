"use client"

import { useState } from "react"
import Link from "next/link"
import { PageBackground } from "@/components/layout/page-background"

type ConnectionResult = {
  success: boolean
  supabase: {
    ok: boolean
    message: string
    envOk: boolean
    reachable: boolean
    health?: { name?: string; version?: string }
  }
  database: {
    ok: boolean
    message: string
    envOk: boolean
    reachable: boolean
    stats?: {
      userCount: number
      classCount: number
      studentCount: number
      testCount: number
      activityCount: number
    }
  }
}

export default function DebugConnectionPage() {
  const [results, setResults] = useState<ConnectionResult | null>(null)
  const [loading, setLoading] = useState(false)

  const checkConnection = async () => {
    setLoading(true)
    setResults(null)
    try {
      const res = await fetch("/api/debug/connection-check")
      const data = await res.json()
      setResults(data)
    } catch (err: unknown) {
      setResults({
        success: false,
        supabase: {
          ok: false,
          message: err instanceof Error ? err.message : "خطأ في الطلب",
          envOk: false,
          reachable: false,
        },
        database: {
          ok: false,
          message: "-",
          envOk: false,
          reachable: false,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-12">
        <div className="mb-6">
          <Link
            href="/debug-auth"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 mb-4 inline-block"
          >
            ← العودة لفحص المصادقة
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            فحص اتصال التطبيق بـ Supabase
          </h1>
          <p className="text-slate-600">
            التحقق من اتصال Supabase (Auth/API) وقاعدة البيانات (Prisma/Postgres)
          </p>
        </div>

        <div className="card bg-white mb-6">
          <button
            onClick={checkConnection}
            disabled={loading}
            className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "جاري الفحص..." : "فحص الاتصال بـ Supabase وقاعدة البيانات"}
          </button>
        </div>

        {results && (
          <div className="space-y-4">
            {/* النتيجة العامة */}
            <div
              className={`card ${
                results.success
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-2xl ${
                    results.success ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {results.success ? "✓" : "✗"}
                </span>
                <h2 className="text-xl font-semibold">
                  {results.success
                    ? "الاتصال يعمل بشكل صحيح"
                    : "هناك مشكلة في الاتصال"}
                </h2>
              </div>
            </div>

            {/* Supabase */}
            <div
              className={`card ${
                results.supabase.ok
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span
                  className={
                    results.supabase.ok ? "text-emerald-600" : "text-amber-600"
                  }
                >
                  {results.supabase.ok ? "✓" : "✗"}
                </span>
                Supabase (Auth / API)
              </h2>
              <p className="text-sm text-slate-700 mb-2">
                {results.supabase.message}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span
                  className={
                    results.supabase.envOk
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                >
                  متغيرات البيئة: {results.supabase.envOk ? "✓" : "✗"}
                </span>
                <span
                  className={
                    results.supabase.reachable
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                >
                  الوصول للخادم: {results.supabase.reachable ? "✓" : "✗"}
                </span>
                {results.supabase.health?.version && (
                  <span className="text-slate-500">
                    الإصدار: {results.supabase.health.version}
                  </span>
                )}
              </div>
            </div>

            {/* قاعدة البيانات (Prisma) */}
            <div
              className={`card ${
                results.database.ok
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <span
                  className={
                    results.database.ok ? "text-emerald-600" : "text-amber-600"
                  }
                >
                  {results.database.ok ? "✓" : "✗"}
                </span>
                قاعدة البيانات (Prisma / Postgres)
              </h2>
              <p className="text-sm text-slate-700 mb-2">
                {results.database.message}
              </p>
              <div className="flex flex-wrap gap-2 text-xs mb-2">
                <span
                  className={
                    results.database.envOk
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                >
                  DATABASE_URL: {results.database.envOk ? "✓" : "✗"}
                </span>
                <span
                  className={
                    results.database.reachable
                      ? "text-emerald-600"
                      : "text-red-600"
                  }
                >
                  الاتصال: {results.database.reachable ? "✓" : "✗"}
                </span>
              </div>
              {results.database.stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-slate-500">المستخدمين</p>
                    <p className="font-semibold">{results.database.stats.userCount}</p>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-slate-500">الفصول</p>
                    <p className="font-semibold">{results.database.stats.classCount}</p>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-slate-500">الطالبات</p>
                    <p className="font-semibold">{results.database.stats.studentCount}</p>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-slate-500">الاختبارات</p>
                    <p className="font-semibold">{results.database.stats.testCount}</p>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <p className="text-xs text-slate-500">الأنشطة</p>
                    <p className="font-semibold">{results.database.stats.activityCount}</p>
                  </div>
                </div>
              )}
            </div>

            {/* نصائح عند الفشل */}
            {!results.success && (
              <div className="card bg-amber-50 border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2">💡 حلول مقترحة:</h3>
                <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
                  {!results.supabase.ok && (
                    <>
                      <li>تأكدي من NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY في Vercel و .env</li>
                      <li>تأكدي أن مشروع Supabase غير متوقف (Paused)</li>
                    </>
                  )}
                  {!results.database.ok && (
                    <>
                      <li>تأكدي من DATABASE_URL في Vercel (بدون علامات اقتباس في القيمة)</li>
                      <li>أضيفي ?sslmode=require في نهاية الرابط أو استخدمي Connection Pooling من Supabase</li>
                      <li>راجعي FIX_DATABASE_URL.md للتفاصيل</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
