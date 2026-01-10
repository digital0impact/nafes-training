"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-client"
import { hasFeatureAccess, type SubscriptionPlan } from "@/lib/subscription"

interface PremiumGateProps {
  feature: keyof ReturnType<typeof import("@/lib/subscription").getPlanInfo>["limitations"]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PremiumGate({ feature, children, fallback }: PremiumGateProps) {
  const { user } = useAuth()
  const subscriptionPlan = (user?.subscriptionPlan || "free") as SubscriptionPlan

  if (hasFeatureAccess(subscriptionPlan, feature)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          هذه الميزة متاحة في الخطة المميزة
        </h3>
        <p className="text-slate-600 mb-6">
          قم بترقية حسابك للاستفادة من جميع المميزات
        </p>
        <Link
          href="/teacher/subscription"
          className="inline-block rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          ترقية إلى المميز
        </Link>
      </div>
    </div>
  )
}

















