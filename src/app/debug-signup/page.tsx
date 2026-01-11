"use client"

import { useState } from "react"
import Link from "next/link"
import { PageBackground } from "@/components/layout/page-background"

export default function DebugSignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSignup = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResult({
          success: false,
          error: data.error || "حدث خطأ أثناء إنشاء الحساب",
          status: response.status,
        })
        setLoading(false)
        return
      }

      setResult({
        success: true,
        message: data.message,
        user: data.user,
        needsEmailConfirmation: data.needsEmailConfirmation,
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "حدث خطأ غير متوقع",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
        <div className="mb-6">
          <Link
            href="/debug-auth"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 mb-4 inline-block"
          >
            ← العودة لفحص المصادقة
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            فحص إنشاء حساب جديد
          </h1>
          <p className="text-slate-600">
            اختبار إنشاء حساب جديد مع عرض معلومات تفصيلية
          </p>
        </div>

        <div className="card bg-white mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الاسم الكامل
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="أدخلي اسمك الكامل"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                تأكيد كلمة المرور
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick={testSignup}
              disabled={loading || !name || !email || !password || password !== confirmPassword}
              className="w-full px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "جاري الاختبار..." : "اختبار إنشاء الحساب"}
            </button>
          </div>
        </div>

        {result && (
          <div className={`card ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-2xl ${result.success ? "text-emerald-600" : "text-red-600"}`}>
                {result.success ? "✓" : "✗"}
              </span>
              <h2 className="text-xl font-semibold">
                {result.success ? "نجح إنشاء الحساب" : "فشل إنشاء الحساب"}
              </h2>
            </div>

            {result.error && (
              <div className="mb-4 p-4 bg-white rounded-lg border border-red-200">
                <p className="text-red-700 font-semibold mb-2">الخطأ:</p>
                <p className="text-red-600 text-sm">{result.error}</p>
                {result.status && (
                  <p className="text-red-500 text-xs mt-1">كود الخطأ: {result.status}</p>
                )}
              </div>
            )}

            {result.success && (
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg">
                  <p className="font-semibold mb-2 text-emerald-700">{result.message}</p>
                </div>
                {result.user && (
                  <div className="p-4 bg-white rounded-lg">
                    <p className="font-semibold mb-2">معلومات المستخدم:</p>
                    <ul className="text-sm space-y-1">
                      <li>ID: <span className="font-mono">{result.user.id}</span></li>
                      <li>الاسم: {result.user.name}</li>
                      <li>البريد: {result.user.email}</li>
                    </ul>
                  </div>
                )}
                {result.needsEmailConfirmation && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 font-semibold mb-2">⚠️ يحتاج تأكيد البريد:</p>
                    <p className="text-amber-700 text-sm mb-2">
                      تم إرسال رسالة تأكيد إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد وتأكيد الحساب قبل تسجيل الدخول.
                    </p>
                    <p className="text-amber-700 text-sm">
                      أو يمكنك تعطيل تأكيد البريد في Supabase Dashboard:
                    </p>
                    <ul className="text-amber-700 text-sm mt-2 list-disc list-inside">
                      <li>Settings &gt; Authentication &gt; Email Auth</li>
                      <li>عطّلي &quot;Enable email confirmations&quot;</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="card bg-blue-50 border-blue-200 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 نصائح:</h3>
          <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
            <li>تأكدي من أن البريد الإلكتروني غير مستخدم مسبقاً</li>
            <li>كلمة المرور يجب أن تكون 6 أحرف على الأقل</li>
            <li>إذا ظهر "Email not confirmed"، فعّلي البريد أو عطّلي تأكيد البريد في Supabase</li>
            <li>تحققي من Console في المتصفح (F12) لرؤية الأخطاء التفصيلية</li>
            <li>تأكدي من أن Supabase Auth مفعّل في Supabase Dashboard</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
