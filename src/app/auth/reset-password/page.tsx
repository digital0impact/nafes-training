"use client"

import React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations"

export default function ResetPasswordPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [tokenValid, setTokenValid] = React.useState<boolean | null>(null)

  // التحقق من وجود token في URL hash (Supabase يرسل token في hash fragment)
  React.useEffect(() => {
    const checkToken = async () => {
      try {
        const supabase = createClient()
        
        // التحقق من وجود session (Supabase يعالج hash fragment تلقائياً)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          // التحقق من hash fragment يدوياً
          const hash = window.location.hash
          if (hash && hash.includes("access_token") && hash.includes("type=recovery")) {
            // Token موجود في hash، Supabase سيعالجه تلقائياً عند تحديث كلمة المرور
            setTokenValid(true)
          } else {
            setTokenValid(false)
          }
        } else {
          setTokenValid(true)
        }
      } catch (err) {
        console.error("Error checking token:", err)
        setTokenValid(false)
      }
    }

    checkToken()
  }, [])

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      setIsLoading(true)
      setFormError("root", { message: "" })
      setSuccessMessage(null)

      const supabase = createClient()

      // التحقق من وجود session أولاً
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        // إذا لم تكن هناك session، نحاول استخراج token من hash
        const hash = window.location.hash
        if (!hash || !hash.includes("access_token") || !hash.includes("type=recovery")) {
          setFormError("root", {
            message: "رابط إعادة التعيين غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.",
          })
          return
        }
      }

      // تحديث كلمة المرور
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) {
        console.error("Password update error:", updateError)
        setFormError("root", {
          message: updateError.message || "حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة مرة أخرى أو طلب رابط جديد.",
        })
        return
      }

      setSuccessMessage("تم تحديث كلمة المرور بنجاح! سيتم توجيهك إلى صفحة تسجيل الدخول...")
      
      // إعادة التوجيه إلى صفحة تسجيل الدخول بعد 2 ثانية
      setTimeout(() => {
        router.push("/auth/signin?passwordReset=true")
      }, 2000)
    } catch (err: any) {
      console.error("Reset password error:", err)
      setFormError("root", {
        message: "حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة مرة أخرى.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenValid === false) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf9f7]">
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6 px-4 py-8 w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
              رابط غير صحيح
            </h1>
            <p className="text-slate-600 mb-6">
              رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية. يرجى طلب رابط جديد.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-block text-teal-600 hover:text-teal-700 font-medium"
            >
              طلب رابط جديد
            </Link>
          </div>
        </div>
      </main>
    )
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
              إعادة تعيين كلمة المرور
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              أدخلي كلمة المرور الجديدة
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
                {successMessage}
              </div>
            )}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
                {errors.root.message}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                كلمة المرور الجديدة
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className={`w-full px-4 py-3 sm:py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300"
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
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
                {...register("confirmPassword")}
                className={`w-full px-4 py-3 sm:py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300"
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full bg-emerald-500 text-white py-3.5 sm:py-4 text-lg sm:text-base rounded-2xl font-semibold hover:bg-emerald-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting || isLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-slate-600">
              <Link
                href="/auth/signin"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                العودة إلى تسجيل الدخول
              </Link>
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
