"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

type Student = {
  id: string
  nickname: string
  classCode: string
  className?: string
  grade?: string
  classId?: string
}

type StudentStore = {
  student: Student | null
  setStudent: (student: Student) => void
  clearStudent: () => void
}

export const useStudentStore = create<StudentStore>()(
  persist(
    (set) => ({
      student: null,
      setStudent: (student) => set({ student }),
      clearStudent: () => set({ student: null }),
    }),
    {
      name: "student-storage",
      storage: createJSONStorage(() => {
        // التحقق من وجود localStorage (لتجنب أخطاء SSR)
        if (typeof window !== 'undefined') {
          return localStorage
        }
        // إرجاع storage وهمي للـ SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      skipHydration: true, // تأخير التحميل حتى يكون العميل جاهزاً
    }
  )
)
