"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-client"

export default function VisitorJoinPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")?.trim() || ""
  const { user, loading: authLoading } = useAuth()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token || !user || joining || done) return
    setError(null)
    setJoining(true)
    fetch("/api/visitor/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.redirect) {
          setDone(true)
          window.location.href = data.redirect
          return
        }
        if (data.error) setError(data.error)
      })
      .catch(() => setError("حدث خطأ في الاتصال"))
      .finally(() => setJoining(false))
  }, [token, user, done])

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="card max-w-md w-full p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">رابط الدعوة غير مكتمل</h1>
          <p className="mt-2 text-slate-600">
            يرجى استخدام الرابط الذي أرسله المعلم كاملاً.
          </p>
          <Link href="/auth/signin" className="mt-4 inline-block text-primary-600 hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </main>
    )
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="card max-w-md w-full p-8 text-center text-slate-600">
          جاري التحميل...
        </div>
      </main>
    )
  }

  if (!user) {
    const joinUrl = `/visitor/join?token=${encodeURIComponent(token)}`
    const signinNext = `/auth/signin?next=${encodeURIComponent(joinUrl)}`
    const signupNext = `/auth/signup?next=${encodeURIComponent(joinUrl)}`
    return (
      <main className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="card max-w-md w-full p-6">
          <h1 className="text-xl font-bold text-slate-900 text-center">دعوة للزيارة والمعاينة</h1>
          <p className="mt-3 text-slate-600 text-center text-sm">
            للدخول والمعاينة والتعليق، سجّلي الدخول أو أنشئي حساباً <strong>ببريدك الإلكتروني الخاص</strong>.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href={signinNext}
              className="rounded-lg bg-primary-600 px-4 py-3 text-center font-semibold text-white hover:bg-primary-700"
            >
              تسجيل الدخول
            </Link>
            <Link
              href={signupNext}
              className="rounded-lg border-2 border-primary-600 px-4 py-3 text-center font-semibold text-primary-600 hover:bg-primary-50"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <div className="card max-w-md w-full p-6 text-center">
        {joining && !error && (
          <p className="text-slate-600">جاري تفعيل صلاحية الزيارة...</p>
        )}
        {done && (
          <p className="text-emerald-600">تم! جاري تحويلك...</p>
        )}
        {error && (
          <>
            <p className="text-red-600">{error}</p>
            <Link href="/visitor" className="mt-4 inline-block text-primary-600 hover:underline">
              الذهاب إلى لوحة الزائر
            </Link>
          </>
        )}
        {!joining && !error && !done && (
          <p className="text-slate-600">جاري التحقق...</p>
        )}
      </div>
    </main>
  )
}
