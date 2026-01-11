"use client"

import { useState } from "react"
import Link from "next/link"
import { PageBackground } from "@/components/layout/page-background"
import { createClient } from "@/lib/supabase/client"

export default function DebugLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult(null)

    try {
      const supabase = createClient()
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setResult({
          success: false,
          error: authError.message,
          code: authError.status,
        })
        setLoading(false)
        return
      }

      if (!authData.user) {
        setResult({
          success: false,
          error: "لم يتم إرجاع بيانات المستخدم",
        })
        setLoading(false)
        return
      }

      // التحقق من الجلسة
      const { data: { session } } = await supabase.auth.getSession()
      
      // التحقق من المستخدم
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      setResult({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          emailConfirmed: authData.user.email_confirmed_at ? "نعم" : "لا",
        },
        session: session ? "موجودة" : "غير موجودة",
        currentUser: currentUser ? "موجود" : "غير موجود",
        cookies: document.cookie.split(";").filter(c => c.includes("sb-") || c.includes("supabase")).length,
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
            فحص تسجيل الدخول
          </h1>
          <p className="text-slate-600">
            اختبار تسجيل الدخول مع عرض معلومات تفصيلية
          </p>
        </div>

        <div className="card bg-white mb-6">
          <div className="space-y-4">
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
            <button
              onClick={testLogin}
              disabled={loading || !email || !password}
              className="w-full px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "جاري الاختبار..." : "اختبار تسجيل الدخول"}
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
                {result.success ? "نجح تسجيل الدخول" : "فشل تسجيل الدخول"}
              </h2>
            </div>

            {result.error && (
              <div className="mb-4 p-4 bg-white rounded-lg border border-red-200">
                <p className="text-red-700 font-semibold mb-2">الخطأ:</p>
                <p className="text-red-600 text-sm">{result.error}</p>
                {result.code && (
                  <p className="text-red-500 text-xs mt-1">كود الخطأ: {result.code}</p>
                )}
              </div>
            )}

            {result.success && (
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg">
                  <p className="font-semibold mb-2">معلومات المستخدم:</p>
                  <ul className="text-sm space-y-1">
                    <li>ID: <span className="font-mono">{result.user.id}</span></li>
                    <li>البريد: {result.user.email}</li>
                    <li>البريد مؤكد: {result.user.emailConfirmed}</li>
                  </ul>
                </div>
                <div className="p-4 bg-white rounded-lg">
                  <p className="font-semibold mb-2">حالة الجلسة:</p>
                  <ul className="text-sm space-y-1">
                    <li>الجلسة: {result.session}</li>
                    <li>المستخدم الحالي: {result.currentUser}</li>
                    <li>عدد الـ Cookies: {result.cookies}</li>
                  </ul>
                </div>
                {result.user.emailConfirmed === "لا" && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 font-semibold mb-2">⚠️ ملاحظة مهمة:</p>
                    <p className="text-amber-700 text-sm">
                      البريد الإلكتروني غير مؤكد. قد تحتاجين إلى تفعيل تأكيد البريد في Supabase Dashboard:
                    </p>
                    <ul className="text-amber-700 text-sm mt-2 list-disc list-inside">
                      <li>Settings > Authentication > Email Auth</li>
                      <li>عطّلي "Enable email confirmations" للاختبار</li>
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
            <li>تأكدي من أن البريد الإلكتروني وكلمة المرور صحيحة</li>
            <li>إذا ظهر "Email not confirmed"، فعّلي البريد أو عطّلي تأكيد البريد في Supabase</li>
            <li>تحققي من Console في المتصفح (F12) لرؤية الأخطاء التفصيلية</li>
            <li>تأكدي من أن Supabase Auth مفعّل في Supabase Dashboard</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
