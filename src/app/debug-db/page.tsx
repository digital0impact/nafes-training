"use client"

import { useState } from "react"
import Link from "next/link"
import { PageBackground } from "@/components/layout/page-background"

export default function DebugDbPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkDatabase = async () => {
    setLoading(true)
    setResults(null)

    try {
      const response = await fetch("/api/debug/db-check")
      const data = await response.json()
      setResults(data)
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message || "حدث خطأ أثناء فحص قاعدة البيانات",
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
            فحص اتصال قاعدة البيانات
          </h1>
          <p className="text-slate-600">
            التحقق من اتصال التطبيق بقاعدة البيانات Prisma
          </p>
        </div>

        <div className="card bg-white mb-6">
          <button
            onClick={checkDatabase}
            disabled={loading}
            className="w-full px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "جاري الفحص..." : "فحص الاتصال بقاعدة البيانات"}
          </button>
        </div>

        {results && (
          <div className="space-y-4">
            {/* حالة الاتصال */}
            <div className={`card ${results.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-2xl ${results.success ? "text-emerald-600" : "text-red-600"}`}>
                  {results.success ? "✓" : "✗"}
                </span>
                <h2 className="text-xl font-semibold">
                  {results.success ? "الاتصال ناجح" : "فشل الاتصال"}
                </h2>
              </div>
              {results.error && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
                  <p className="text-red-700 font-mono text-sm">{results.error}</p>
                </div>
              )}
            </div>

            {/* الإحصائيات */}
            {results.success && results.stats && (
              <div className="card bg-white">
                <h2 className="text-xl font-semibold mb-4">إحصائيات قاعدة البيانات</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">المستخدمين</p>
                    <p className="text-2xl font-bold text-slate-900">{results.stats.userCount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">الفصول</p>
                    <p className="text-2xl font-bold text-slate-900">{results.stats.classCount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">الطالبات</p>
                    <p className="text-2xl font-bold text-slate-900">{results.stats.studentCount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">الاختبارات</p>
                    <p className="text-2xl font-bold text-slate-900">{results.stats.testCount}</p>
                  </div>
                </div>
              </div>
            )}

            {/* معلومات DATABASE_URL */}
            <div className="card bg-white">
              <h2 className="text-xl font-semibold mb-4">معلومات الاتصال</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={results.envVars?.DATABASE_URL ? "text-emerald-600" : "text-red-600"}>
                    {results.envVars?.DATABASE_URL ? "✓" : "✗"}
                  </span>
                  <span className="font-mono text-sm">DATABASE_URL</span>
                  {results.envVars?.DATABASE_URL && (
                    <span className="text-xs text-slate-500">
                      ({results.envVars?.DATABASE_URL.length} حرف)
                    </span>
                  )}
                </div>
                {results.envVars?.DATABASE_URL && (
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 font-mono break-all">
                      {results.envVars.DATABASE_URL.substring(0, 50)}...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* نصائح لحل المشاكل */}
            {!results.success && (
              <div className="card bg-amber-50 border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2">💡 حلول مقترحة:</h3>
                <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
                  <li>تأكدي من وجود ملف .env في مجلد nafes-training</li>
                  <li>تأكدي من وجود DATABASE_URL في ملف .env</li>
                  <li>تأكدي من أن DATABASE_URL محاط بعلامات اقتباس</li>
                  <li>تأكدي من أن كلمة مرور قاعدة البيانات صحيحة</li>
                  <li>تأكدي من أن Supabase يعمل وأن قاعدة البيانات متاحة</li>
                  <li>راجعي ملف SETUP_DATABASE_URL.md للتعليمات التفصيلية</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
