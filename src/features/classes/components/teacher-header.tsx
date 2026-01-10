"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-client"
import { type SubscriptionPlan } from "@/lib/subscription"

export function TeacherHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const subscriptionPlan = (user?.subscriptionPlan || "free") as SubscriptionPlan

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 rounded-2xl bg-white p-3 sm:p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <Link
          href="/teacher"
          className="text-base sm:text-lg font-bold text-slate-900"
        >
          لوحة المعلمة
        </Link>
        {user && (
          <span className="text-xs sm:text-sm text-slate-600">
            مرحباً، {user.name}
          </span>
        )}
        <Link
          href="/teacher/subscription"
          className={`text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-lg ${
            subscriptionPlan === "premium"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {subscriptionPlan === "premium" ? "مميز" : "مجاني"}
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        <Link
          href="/teacher/subscription"
          className="flex-1 sm:flex-initial text-center rounded-lg border border-purple-200 bg-purple-50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-purple-700 hover:bg-purple-100"
        >
          إدارة الاشتراك
        </Link>
        <button
          onClick={handleSignOut}
          className="flex-1 sm:flex-initial text-center rounded-lg border border-red-200 bg-red-50 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          تسجيل الخروج
        </button>
      </div>
    </div>
  )
}
