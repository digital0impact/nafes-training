"use client"

export const dynamic = 'force-dynamic';

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PageBackground } from "@/components/layout/page-background"
import { studentSignInSchema, type StudentSignInInput } from "@/lib/validations"
import { useStudentStore } from "@/store/student-store"

export default function StudentSignInPage() {
  const router = useRouter()
  const setStudent = useStudentStore((state) => state.setStudent)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<StudentSignInInput>({
    resolver: zodResolver(studentSignInSchema),
  })

  const onSubmit = async (data: StudentSignInInput) => {
    try {
      const response = await fetch("/api/auth/student-signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setFormError("root", {
          message: result.error || "الاسم المستعار أو كود الفصل غير صحيح",
        })
      } else {
        // حفظ معلومات الطالبة في Zustand store
        setStudent(result.student)
        router.push("/student")
        router.refresh()
      }
    } catch (err) {
      setFormError("root", {
        message: "حدث خطأ أثناء تسجيل الدخول",
      })
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
              أدخلي رقم الطالبة وكلمة المرور للبدء
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base">
                {errors.root.message}
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
                {...register("studentId")}
                className={`w-full px-4 py-3 sm:py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.studentId
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300"
                }`}
                placeholder="مثال: STU-301"
              />
              {errors.studentId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.studentId.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                احصلي على رقم الطالبة من معلمتك
              </p>
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
                className={`w-full px-4 py-3 sm:py-3.5 text-base border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-slate-300"
                }`}
                placeholder="مثال: 1234"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                كلمة المرور الافتراضية غالباً: 1234
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white py-3.5 sm:py-4 text-lg sm:text-base rounded-2xl font-semibold hover:bg-orange-600 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-slate-600">
              لديك حساب طالبة.{" "}
              <span className="text-slate-500 text-xs sm:text-sm">
                استخدمي رقم الطالبة وكلمة المرور من معلمتك
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

