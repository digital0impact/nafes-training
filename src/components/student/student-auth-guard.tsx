"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStudentStore } from "@/store/student-store"

export function useStudentAuth() {
  const router = useRouter()
  const student = useStudentStore((state) => state.student)
  const clearStudent = useStudentStore((state) => state.clearStudent)
  const [isHydrated, setIsHydrated] = useState(false)

  // انتظار التحميل من localStorage قبل عرض المحتوى (لتجنب عرض القيم الافتراضية أو إعادة التوجيه بالخطأ)
  useEffect(() => {
    useStudentStore.persist.rehydrate().then(() => setIsHydrated(true))
  }, [])

  const loading = !isHydrated

  useEffect(() => {
    if (!isHydrated) return
    if (!student) {
      router.push("/auth/student-signin")
      return
    }
    // بيانات قديمة قد تكون بدون id (معرف قاعدة البيانات) فتبقى القيم الافتراضية
    if (!student.id || typeof student.id !== "string" || student.id.length < 5) {
      clearStudent()
      router.push("/auth/student-signin")
    }
  }, [student, router, isHydrated, clearStudent])

  const signOut = () => {
    clearStudent()
    router.push("/auth/student-signin")
  }

  return { student, loading, signOut }
}

export function StudentAuthGuard({ children }: { children: React.ReactNode }) {
  const { student, loading } = useStudentAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    )
  }

  if (!student || !student.id) {
    return null // سيتم إعادة التوجيه تلقائياً أو تسجيل الدخول من جديد
  }

  return <>{children}</>
}
