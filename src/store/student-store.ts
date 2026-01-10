"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

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
    }
  )
)
