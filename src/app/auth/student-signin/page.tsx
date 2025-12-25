"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { PageBackground } from "@/components/layout/page-background"

export default function StudentSignInPage() {
  const router = useRouter()
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/student-signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "رقم الطالبة أو كلمة المرور غير صحيحة")
      } else {
        // حفظ معلومات الطالبة في localStorage
        localStorage.setItem("student", JSON.stringify(data.student))
        router.push("/student")
        router.refresh()
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf9f7]">
      <PageBackground />
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 sm:space-y-8 px-4 py-8 sm:py-12 w-full max-w-md">
        {/* Logo */}
        <div className="mb-0">
          <Image
            src="/images/logos/logo.png"
            alt="شعار نافس"
            width={200}
            height={200}
            className="object-contain w-[150px] h-[150px] sm:w-[200px] sm:h-[200px]"
            priority
          />
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              تسجيل دخول الطالبة
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              أدخلي رقم الطالبة وكلمة المرور للوصول إلى المنصة
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                رقم الطالبة
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-4 py-3 sm:py-3.5 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="مثال: STU-301"
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
                className="w-full px-4 py-3 sm:py-3.5 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3.5 sm:py-4 text-lg sm:text-base rounded-2xl font-semibold hover:bg-orange-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-slate-600">
              ليس لديك حساب؟{" "}
              <span className="text-slate-500 text-xs sm:text-sm">
                تواصلي مع معلمتك للحصول على رقم الطالبة وكلمة المرور
              </span>
            </p>
          </div>
        </div>

        {/* Credits */}
        <div className="mt-4 sm:mt-6 text-center px-4">
          <p className="text-xs sm:text-sm font-medium" style={{ color: '#4c3d8f' }}>
            إعداد وتصميم : أ. أمل علي الشامان
          </p>
        </div>
      </div>
    </main>
  )
}

