import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const user = await requireAuth()

    // تحديث الاشتراك إلى premium
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionPlan: "premium" },
    })

    return NextResponse.json({
      message: "تم ترقية حسابك بنجاح",
      subscriptionPlan: updatedUser.subscriptionPlan,
    })
  } catch (error) {
    console.error("Error upgrading subscription:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء ترقية الحساب" },
      { status: 500 }
    )
  }
}

















