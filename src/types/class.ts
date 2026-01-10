/**
 * أنواع الفصول
 */

export type Class = {
  id: string
  code: string
  name: string
  grade: string
  userId: string
  createdAt: Date | string
  updatedAt: Date | string
  _count?: {
    students: number
    trainingAttempts: number
  }
}

export type CreateClassInput = {
  name: string
  grade: string
  code: string
}

export type UpdateClassInput = Partial<CreateClassInput>
