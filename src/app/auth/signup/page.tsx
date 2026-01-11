"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema, type SignUpInput } from "@/lib/validations"

export default function SignUpPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpInput) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Signup error:", result)
        let errorMessage = result.error || "حدث خطأ أثناء إنشاء الحساب"
        
        // إذا كان هناك تفاصيل إضافية، أضفها
        if (result.details && Array.isArray(result.details) && result.details.length > 0) {
          const detailsMessages = result.details.map((d: any) => d.message).join("، ")
          if (detailsMessages) {
            errorMessage = `${errorMessage}: ${detailsMessages}`
          }
        }
        
        // إذا كان هناك userId في الخطأ، أضيفه للرسالة
        if (result.userId) {
          errorMessage += ` (User ID: ${result.userId})`
        }
        
        setFormError("root", {
          message: errorMessage,
        })
      } else {
        // إذا كان يحتاج تأكيد البريد
        if (result.needsEmailConfirmation) {
          setFormError("root", {
            message: "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني وتأكيد الحساب قبل تسجيل الدخول.",
          })
          // الانتظار قليلاً ثم التوجيه
          setTimeout(() => {
            router.push("/auth/signin?registered=true&needsConfirmation=true")
          }, 3000)
        } else {
          router.push("/auth/signin?registered=true")
        }
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      let errorMessage = "حدث خطأ أثناء إنشاء الحساب"
      
      if (err.message) {
        errorMessage = err.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      setFormError("root", {
        message: errorMessage,
      })
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.root.message}
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
                {...register("name")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.name
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300"
                }`}
                placeholder="أدخلي اسمك الكامل"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
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
                {...register("email")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300"
                }`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
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
                {...register("password")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.confirmPassword
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300"
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 text-white py-3 rounded-2xl font-semibold hover:bg-emerald-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
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


