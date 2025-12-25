"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { type SubscriptionPlan } from "@/lib/subscription"

interface FeatureBadgeProps {
  feature: "premium" | "free"
  className?: string
}

export function FeatureBadge({ feature, className = "" }: FeatureBadgeProps) {
  const { data: session } = useSession()
  const subscriptionPlan = (session?.user?.subscriptionPlan || "free") as SubscriptionPlan

  if (feature === "premium" && subscriptionPlan !== "premium") {
    return (
      <Link
        href="/teacher/subscription"
        className={`inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200 ${className}`}
      >
        <span>🔒</span>
        <span>مميز</span>
      </Link>
    )
  }

  return null
}









