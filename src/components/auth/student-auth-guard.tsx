"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStudentStore } from "@/store/student-store"

export function useStudentAuth() {
  const router = useRouter()
  const student = useStudentStore((state) => state.student)
  const clearStudent = useStudentStore((state) => state.clearStudent)
  const loading = !student

  useEffect(() => {
    if (!student) {
      router.push("/auth/student-signin")
    }
  }, [student, router])

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

  if (!student) {
    return null // سيتم إعادة التوجيه تلقائياً
  }

  return <>{children}</>
}
