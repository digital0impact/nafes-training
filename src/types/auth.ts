/**
 * أنواع المصادقة
 */

export type User = {
  id: string
  email: string
  name: string
  role: string
  subscriptionPlan?: string
  isDisabled?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type Student = {
  id: string
  nickname: string
  classCode: string
  className?: string
  grade?: string
  classId?: string
}

export type SignInInput = {
  email: string
  password: string
}

export type SignUpInput = {
  email: string
  password: string
  name: string
}

export type StudentSignInInput = {
  nickname: string
  classCode: string
}
