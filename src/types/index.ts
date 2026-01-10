/**
 * أنواع TypeScript المشتركة
 */

export type UserRole = "teacher" | "admin" | "student"
export type SubscriptionPlan = "free" | "premium"

export type TestType = "normal" | "diagnostic"
export type ActivityType = "quiz" | "drag-drop" | "ordering" | "fill-blank"

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export type PaginationParams = {
  page?: number
  limit?: number
  offset?: number
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
