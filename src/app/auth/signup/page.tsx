"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة")
      return
    }

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return
    }

    setLoading(true)

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
        setError(data.error || "حدث خطأ أثناء إنشاء الحساب")
      } else {
        router.push("/auth/signin?registered=true")
      }
    } catch (err) {
      setError("حدث خطأ أثناء إنشاء الحساب")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf9f7]">
      {/* Decorative Elements - Top Left */}
      <div className="absolute left-0 top-0 flex items-start gap-2 opacity-30">
        <div className="flex flex-col gap-2">
          <div className="h-12 w-12 rounded-lg bg-teal-400 flex items-center justify-center">
            <svg className="h-6 w-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-400 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="h-12 w-12 rounded-lg bg-orange-400 flex items-center justify-center">
            <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="h-8 w-12 rounded-t-full bg-yellow-400"></div>
        </div>
        <div className="flex flex-col gap-2 mt-8">
          <div className="h-8 w-16 rounded-lg bg-orange-400"></div>
          <div className="h-8 w-12 rounded-lg bg-orange-400"></div>
        </div>
      </div>

      {/* Decorative Elements - Bottom Right */}
      <div className="absolute bottom-0 right-0 flex items-end gap-2 opacity-30">
        <div className="flex flex-col gap-2 mb-8">
          <div className="h-8 w-12 rounded-lg bg-blue-200"></div>
          <div className="h-8 w-16 rounded-lg bg-blue-200"></div>
          <div className="h-8 w-10 rounded-lg bg-blue-200"></div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            <div className="h-12 w-12 rounded-full bg-blue-400 border-4 border-white"></div>
            <div className="h-10 w-10 rounded-full bg-blue-300 border-4 border-white"></div>
            <div className="h-8 w-8 rounded-full bg-blue-200 border-4 border-white"></div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-teal-400 flex items-center justify-center">
            <svg className="h-6 w-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
            </svg>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-400 grid grid-cols-2 gap-1 p-1">
            <div className="rounded bg-white"></div>
            <div className="rounded bg-yellow-300"></div>
            <div className="rounded bg-yellow-300"></div>
            <div className="rounded bg-white"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-4 py-12 w-full max-w-md">
        {/* Logo */}
        <div className="mb-0">
          <Image
            src="/images/logos/logo.png"
            alt="شعار نافس"
            width={200}
            height={200}
            className="object-contain"
            priority
          />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              إنشاء حساب جديد
            </h1>
            <p className="text-slate-600">
              سجلي بياناتك للبدء في استخدام المنصة
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                الاسم الكامل
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="أدخلي اسمك الكامل"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                كلمة المرور
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                تأكيد كلمة المرور
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-3 rounded-2xl font-semibold hover:bg-emerald-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/auth/signin"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-6 text-center">
          <p className="text-sm font-medium" style={{ color: '#4c3d8f' }}>
            إعداد وتصميم : أ. أمل علي الشامان
          </p>
        </div>
      </div>
    </main>
  )
}


