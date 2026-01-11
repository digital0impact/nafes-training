"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function DebugAuthPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkConfig = async () => {
    setLoading(true)
    const checks: any = {
      envVars: {},
      supabaseClient: null,
      database: null,
    }

    // فحص متغيرات البيئة
    checks.envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
    }

    // فحص Supabase Client
    try {
      const supabase = createClient()
      checks.supabaseClient = { success: true, message: "تم إنشاء Supabase Client بنجاح" }
    } catch (error: any) {
      checks.supabaseClient = { success: false, message: error.message }
    }

    // فحص الاتصال بقاعدة البيانات
    try {
      const response = await fetch("/api/auth/user")
      if (response.ok) {
        checks.database = { success: true, message: "الاتصال بقاعدة البيانات يعمل" }
      } else {
        checks.database = { success: false, message: "فشل الاتصال بقاعدة البيانات" }
      }
    } catch (error: any) {
      checks.database = { success: false, message: error.message }
    }

    setResults(checks)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link
            href="/debug-db"
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            → فحص قاعدة البيانات
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-6">فحص إعدادات المصادقة</h1>
        
        <button
          onClick={checkConfig}
          disabled={loading}
          className="mb-6 px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? "جاري الفحص..." : "فحص الإعدادات"}
        </button>

        {results && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">متغيرات البيئة</h2>
              <div className="space-y-2">
                {Object.entries(results.envVars).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={value ? "text-emerald-600" : "text-red-600"}>
                      {value ? "✓" : "✗"}
                    </span>
                    <span className="font-mono text-sm">{key}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Supabase Client</h2>
              <div className={results.supabaseClient.success ? "text-emerald-600" : "text-red-600"}>
                {results.supabaseClient.success ? "✓" : "✗"} {results.supabaseClient.message}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">قاعدة البيانات</h2>
              <div className={results.database.success ? "text-emerald-600" : "text-red-600"}>
                {results.database.success ? "✓" : "✗"} {results.database.message}
              </div>
            </div>

            {!results.envVars.NEXT_PUBLIC_SUPABASE_URL || 
             !results.envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
                <h3 className="font-semibold text-amber-900 mb-2">⚠️ إعدادات Supabase مفقودة</h3>
                <p className="text-amber-800 mb-4">
                  يرجى التحقق من ملف .env والتأكد من وجود:
                </p>
                <ul className="list-disc list-inside space-y-1 text-amber-800">
                  <li>NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY</li>
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </main>
  )
}
